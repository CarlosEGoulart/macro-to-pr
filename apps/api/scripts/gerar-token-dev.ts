const { PrismaClient } = require('@prisma/client');
import * as jwt from 'jsonwebtoken';

async function main() {
  const prisma = new PrismaClient();

  // 1. Criar ou buscar Desenvolvedor
  let dev = await prisma.developer.findUnique({
    where: { email: 'dev@test.com' }
  });

  if (!dev) {
    dev = await prisma.developer.create({
      data: {
        email: 'dev@test.com',
        name: 'Dev Teste',
        role: 'Developer',
        githubAccountId: 'gh-dev-test'
      }
    });
    console.log('✅ Desenvolvedor criado:', dev.email);
  } else {
    console.log('✅ Desenvolvedor já existe:', dev.email);
  }

  // 2. Gerar token JWT
  const secret = process.env.JWT_SECRET || 'super-secret-change-in-production';

  const token = jwt.sign(
    { userId: dev.id, email: dev.email, role: dev.role },
    secret,
    { expiresIn: '15m' }
  );

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  TOKEN DE DESENVOLVEDOR GERADO                               ║');
  console.log('╠═══════════════════════════════════════════════════════════════════════════════════╣');
  console.log(`║  ${token}`);
  console.log('╚═══════════════════════════════════════════════════════════════════════════════════╝\n');
  console.log('📋 Use este token:');
  console.log(`   Authorization: Bearer ${token}\n`);

  await prisma.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
