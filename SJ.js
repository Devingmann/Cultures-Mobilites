// Script de purge totale des fichiers (purge-all-files.js)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Suppression de TOUS les anciens fichiers en base de données...");
  const deleted = await prisma.fileItem.deleteMany({});
  console.log(`✅ ${deleted.count} fichiers supprimés. La table FileItem est désormais totalement vide et propre.`);
}

main()
  .catch((e) => {
    console.error("Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });