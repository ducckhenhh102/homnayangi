import prisma from '../config/db.js';

export const restaurantRepository = {
  async findMany({ page = 1, limit = 20, status = 'PUBLISHED', diningType, companionType }) {
    const take = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const where = {};
    if (status) {
      where.status = status;
    }

    if (diningType) {
      where.diningTypes = {
        some: {
          diningTypeId: diningType,
        },
      };
    }

    if (companionType) {
      where.companionTypes = {
        some: {
          companionTypeId: companionType,
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          diningTypes: { include: { diningType: true } },
          companionTypes: { include: { companionType: true } },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          foods: {
            take: 5,
            include: { food: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return { items, total, page, limit: take };
  },

  async findById(id) {
    return prisma.restaurant.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        diningTypes: { include: { diningType: true } },
        companionTypes: { include: { companionType: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        foods: {
          include: { food: true },
        },
      },
    });
  },
};

export default restaurantRepository;
