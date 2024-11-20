import prisma from '../../prisma/client';

export async function getRestaurantData(restaurantId: string) {
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
