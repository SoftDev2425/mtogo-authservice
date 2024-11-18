import prisma from '../../prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function populateAdminToDB(email: string, password: string) {
  try {
    await prisma.admins.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log('Admin added successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');

    await populateAdminToDB(email, password);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

main();
