import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function makeUserAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (Role: ${user.role})`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Successfully updated ${updatedUser.email} to ADMIN role`);
    console.log(`New role: ${updatedUser.role}`);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'manjulsiddharth09@gmail.com';
makeUserAdmin(email);
