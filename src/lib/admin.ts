import { prisma } from "@/lib/prisma";
import { serializeProducts } from "@/lib/serialize-product";

export async function getAdminStats() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      productsCount,
      ordersCount,
      pendingOrdersCount,
      customersCount,
      todayRevenue,
      weekRevenue,
      recentOrders,
    ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startOfToday },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startOfWeek },
      },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 2 },
      },
    }),
  ]);

  return {
      productsCount,
      ordersCount,
      pendingOrdersCount,
      customersCount,
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      weekRevenue: Number(weekRevenue._sum.total ?? 0),
      recentOrders,
    };
  } catch {
    return {
      productsCount: 0,
      ordersCount: 0,
      pendingOrdersCount: 0,
      customersCount: 0,
      todayRevenue: 0,
      weekRevenue: 0,
      recentOrders: [],
    };
  }
}

export async function getAdminProducts(page = 1, limit = 20, search?: string) {
  try {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        category: { select: { name: true } },
        provider: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { products: serializeProducts(products), total, page, totalPages: Math.ceil(total / limit) };
  } catch {
    return { products: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getAdminOrders(page = 1, limit = 20, status?: string) {
  try {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
  } catch {
    return { orders: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getAdminCustomers(page = 1, limit = 20, search?: string) {
  try {
    const skip = (page - 1) * limit;
    const where = search
    ? {
        role: "CUSTOMER",
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { role: "CUSTOMER" };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  const userIds = users.map((u) => u.id);
  const orderTotals = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const totalByUser: Record<string, number> = {};
  orderTotals.forEach((o) => {
    if (o.userId) totalByUser[o.userId] = Number(o._sum.total ?? 0);
  });
  return {
    users: users.map((u) => ({
      ...u,
      ordersCount: u._count.orders,
      totalSpent: totalByUser[u.id] ?? 0,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
  } catch {
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getAdminCoupons(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({ orderBy: { id: "desc" }, skip, take: limit }),
      prisma.coupon.count(),
    ]);
    return { coupons, total, page, totalPages: Math.ceil(total / limit) };
  } catch {
    return { coupons: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getAdminSubscribers(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const [subscribers, total] = await Promise.all([
      prisma.emailSubscriber.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emailSubscriber.count({ where: { isActive: true } }),
    ]);
    return { subscribers, total, page, totalPages: Math.ceil(total / limit) };
  } catch {
    return { subscribers: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getAdminProviders() {
  try {
    return prisma.dropshippingProvider.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}
