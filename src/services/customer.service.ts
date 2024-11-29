import prisma from '../../prisma/client';

async function getCustomerData(customerId: string) {
  return await prisma.customers.findUnique({
    where: {
      id: customerId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });
}

export { getCustomerData };
