import { auth } from '@/auth';
import { prisma } from '@/lib/server/prisma';
import { HttpError } from '@/lib/server/http';
import type { UserRole } from '@prisma/client';

/**
 * Require a signed-in user. Returns the user with developer/founder loaded.
 * Throws HttpError(401) if unauthenticated.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new HttpError(401, 'Unauthenticated');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      developer: true,
      founder: true,
    },
  });

  if (!user) {
    throw new HttpError(401, 'User not found');
  }

  return user;
}

/**
 * Require the signed-in user to have one of the given roles.
 * Throws HttpError(401) if unauthenticated, HttpError(403) if wrong role.
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new HttpError(403, 'Forbidden');
  }
  return user;
}

/**
 * Returns the user or null — does not throw. Useful for optional auth.
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { developer: true, founder: true },
  });
}
