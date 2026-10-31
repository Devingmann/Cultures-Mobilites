import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { readStoredFile, sanitizeName } from "@/lib/files";

/* GET : stream du fichier — membres uniquement.
   Si fileName est une URL Cloudinary → redirection. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    const file = await db.fileItem.findUnique({ where: { id } });
    if (!file) throw new HttpError(404, "Fichier introuvable.");

    // Cloudinary / URL distante
    if (
      file.fileName.startsWith("http://") ||
      file.fileName.startsWith("https://")
    ) {
      return NextResponse.redirect(file.fileName, 302);
    }

    const buffer = await readStoredFile(file.fileName);
    const download = req.nextUrl.searchParams.get("dl") === "1";
    const disposition = download ? "attachment" : "inline";

    const range = req.headers.get("range");
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : buffer.length - 1;
        const safeEnd = Math.min(end, buffer.length - 1);
        if (start <= safeEnd) {
          const chunk = buffer.subarray(start, safeEnd + 1);
          return new NextResponse(new Uint8Array(chunk), {
            status: 206,
            headers: {
              "Content-Type": file.mimeType,
              "Content-Length": String(chunk.length),
              "Content-Range": `bytes ${start}-${safeEnd}/${buffer.length}`,
              "Accept-Ranges": "bytes",
              "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
                sanitizeName(file.originalName)
              )}"`,
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(buffer.length),
        "Accept-Ranges": "bytes",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
          sanitizeName(file.originalName)
        )}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("file raw error", err);
    return NextResponse.json(
      { error: "Lecture du fichier impossible." },
      { status: 500 }
    );
  }
}