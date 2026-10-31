import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Envoi direct et sécurisé vers le stockage cloud Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Retourne l'URL publique et permanente du fichier hébergé
    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      name: file.name 
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload :', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du fichier' }, { status: 500 });
  }
}