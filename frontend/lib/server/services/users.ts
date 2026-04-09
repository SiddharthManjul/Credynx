import { prisma } from '@/lib/server/prisma';
import type { Prisma, User } from '@prisma/client';

export const usersService = {
  user(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return prisma.user.findUnique({ where });
  },

  users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return prisma.user.findMany(params);
  },

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    return prisma.user.update(params);
  },

  deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return prisma.user.delete({ where });
  },

  getUserWithProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        developer: true,
        founder: true,
        notificationPreferences: true,
      },
    });
  },

  getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  countUsers(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  },

  findByEmail(email: string): Promise<User | null> {
    return this.getUserByEmail(email);
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { developer: true, founder: true },
    });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.createUser(data);
  },
};
