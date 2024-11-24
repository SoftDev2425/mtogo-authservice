import prisma from '../../prisma/client';

async function getRestaurantData(restaurantId: string) {
  return await prisma.restaurants.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  });
}

async function getRestaurants(zip: string) {
  return await prisma.restaurants.findMany({
    where: {
      address: {
        zip: zip,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

export { getRestaurantData, getRestaurants };
