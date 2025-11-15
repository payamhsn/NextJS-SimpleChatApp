const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const a = await prisma.user.create({ data: { email: 'alice@example.com', username: 'alice', displayName: 'Alice', passwordHash: await bcrypt.hash('Password123', 10), emailVerifiedAt: new Date() } });
  const b = await prisma.user.create({ data: { email: 'bob@example.com', username: 'bob', displayName: 'Bob', passwordHash: await bcrypt.hash('Password123', 10), emailVerifiedAt: new Date() } });
  await prisma.friendship.create({ data: { userId: a.id, friendId: b.id, status: 'accepted', actionUserId: a.id } });
  const conv = await prisma.conversation.create({ data: { participants: { create: [{ userId: a.id }, { userId: b.id }] } } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: a.id, content: 'Hello Bob!', type: 'text' } });
}

main().finally(() => prisma.$disconnect());