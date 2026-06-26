import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MySQL database via Prisma...');
    await prisma.$connect();
    console.log('MySQL successfully connected via Prisma!');
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
    process.exit(1);
  }
};
