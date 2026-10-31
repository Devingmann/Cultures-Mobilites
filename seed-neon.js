const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Début de l'injection des données sur Neon ---");

  // 1. Compte Administrateur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cultures-mobilites.fr' },
    update: {},
    create: {
      id: 'cmvtq7jvm0000qu05ztm6wsgi',
      name: 'Équipe Animation',
      email: 'admin@cultures-mobilites.fr',
      passwordHash: 'scrypt$d359267f1f2df027ca8821b1e552fc86$d560bb7e0270ede4948ec45d47b17f396ee58ee9e3cb8e46616671b61b47db7d630aba8f7fe45bd5012c1662dfa42399a77332f4b566c58463faadbf18d50ee4',
      role: 'ADMIN',
    },
  });
  console.log('✓ Administrateur créé :', admin.email);

  // 2. Compte Membre de test
  const membre = await prisma.user.upsert({
    where: { email: 'test.membre@example.fr' },
    update: {},
    create: {
      id: 'cmvtqae9d0000quzazice69tz',
      name: 'Test Membre',
      email: 'test.membre@example.fr',
      passwordHash: 'scrypt$8d40a9fb1c57bb3d2050363c4ac48b66$75709ec1182d14f9de6348aa01c893e531b838d8ed375943e4467c04b956eb34604ffe28e4532b125d096e5abd3506491afdec4e558c51c5abf8959df479978e',
      role: 'MEMBER',
    },
  });
  console.log('✓ Membre créé :', membre.email);

  // 3. Paramètres globaux (Code d'invitation & Sondage)
  await prisma.setting.upsert({
    where: { key: 'inviteCode' },
    update: { value: 'CULTURE34' },
    create: { key: 'inviteCode', value: 'CULTURE34' },
  });
  await prisma.setting.upsert({
    where: { key: 'pollTitle' },
    update: { value: 'Prochaine sortie de groupe : quelle(s) activité(s) vous tente(nt) le plus ?' },
    create: { key: 'pollTitle', value: 'Prochaine sortie de groupe : quelle(s) activité(s) vous tente(nt) le plus ?' },
  });
  await prisma.setting.upsert({
    where: { key: 'pollOpen' },
    update: { value: 'true' },
    create: { key: 'pollOpen', value: 'true' },
  });
  console.log("✓ Paramètres et code d'invitation configurés");

  // 4. Options du sondage
  const pollOptions = [
    { id: 'cmvtq7jvs0001qu05xxf7nb4v', emoji: '🖼️', label: 'Musée Fabre', description: 'Visite guidée & atelier', order: 1 },
    { id: 'cmvtq7jvs0002qu05m0mxpmic', emoji: '🎨', label: 'MO.CO. Panacée', description: 'Art contemporain', order: 2 },
    { id: 'cmvtq7jvs0003qu051ag8h9pz', emoji: '🎭', label: "Coulisses de l'Opéra", description: 'Visite guidée', order: 3 },
    { id: 'cmvtq7jvs0004qu0526g4jnof', emoji: '📷', label: 'Pavillon Populaire / St-Ravy', description: 'Expos photo & peinture', order: 4 },
    { id: 'cmvtq7jvs0005qu05wyrtmmx4', emoji: '🏛️', label: 'FRAC', description: 'Expo « Déséquilibre » & architecture', order: 5 },
    { id: 'cmvtq7jvs0006qu05es5rv0wj', emoji: '🌿', label: 'Jardin des Plantes', description: 'Balade flore & nature', order: 6 },
    { id: 'cmvtq7jvs0007qu051kpv11m0', emoji: '🏛️', label: 'Pierresvives', description: 'Visite guidée / expos', order: 7 },
    { id: 'cmvtq7jvs0008qu05mojupkuq', emoji: '🎬', label: 'Cinéma Utopia', description: 'Film + visite de la salle de projection', order: 8 },
    { id: 'cmvtq7jvs0009qu052sknu4nj', emoji: '🚌', label: 'Excursion à Lodève', description: 'Musée & Manufacture de la Savonnerie', order: 9 },
    { id: 'cmvtq7jvs000aqu058yn5xb00', emoji: '🖥️', label: 'Micro-Folie Mosson', description: 'Musée numérique & réalité virtuelle', order: 10 },
    { id: 'cmvtq7jvs000bqu05ref3t30u', emoji: '⛪', label: 'Carré Sainte-Anne', description: "Art contemporain dans l'ancienne église néogothique", order: 11 },
  ];

  for (const option of pollOptions) {
    await prisma.pollOption.upsert({
      where: { id: option.id },
      update: option,
      create: option,
    });
  }
  console.log('✓ Options de sondage insérées');

  console.log("--- Injection terminée avec succès ! ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });