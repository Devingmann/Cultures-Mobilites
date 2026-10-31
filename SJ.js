// Script de nettoyage de la table FileItem pour repartir sur un mini-drive propre avec Vercel Blob
// Nom suggéré : clean-files.js (à la racine)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Nettoyage des anciennes références de fichiers locaux...");
  
  // Supprime uniquement les enregistrements de fichiers dont le nom/chemin ne vient pas du cloud
  const deleted = await prisma.fileItem.deleteMany({
    where: {
      NOT: {
        fileName: {
          startsWith: "http",
        },
      },
    },
  });

  console.log(`✅ ${deleted.count} anciens fichiers locaux nettoyés de la base de données.`);
  console.log("🎉 Votre base de données est prête pour Vercel Blob ! Les comptes et admins n'ont pas été touchés.");
}

main()
  .catch((e) => {
    console.error("Erreur lors du nettoyage :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });