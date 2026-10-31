import { storeFile, /* ... autres imports */ } from "@/lib/files";

// dans le for (const file of uploads) :
const mime = file.type || "application/octet-stream";
const fileUrlOrName = await storeFile(file, file.name, mime);

const item = await db.fileItem.create({
  data: {
    title: title || sanitizeName(file.name),
    description,
    category: categoryRaw,
    fileName: fileUrlOrName, // URL Blob ou nom local
    originalName: sanitizeName(file.name),
    mimeType: mime,
    size: file.size,
    uploaderId: user.id,
  },
});

created.push({
  id: item.id,
  title: item.title,
  kind: kindFromMime(item.mimeType),
  url: fileUrlOrName.startsWith("http") ? fileUrlOrName : `/api/files/${item.id}/raw`,
});