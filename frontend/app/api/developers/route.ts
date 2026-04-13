import { developersService } from '@/lib/server/services/developers';
import { jsonError, searchParamsOf } from '@/lib/server/http';
import { DeveloperFilterSchema } from '@/lib/server/validation/developer';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const filters = DeveloperFilterSchema.parse(searchParamsOf(req));
    const { tier, availability, minReputation, location, search, limit, skip, orderBy } = filters;

    let orderByClause: Prisma.DeveloperOrderByWithRelationInput;
    switch (orderBy) {
      case 'recent':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'alphabetical':
        orderByClause = { username: 'asc' };
        break;
      case 'reputation':
      default:
        orderByClause = { reputationScore: 'desc' };
    }

    const baseWhere: Prisma.DeveloperWhereInput = {
      ...(tier && { tier }),
      ...(availability && { availability }),
      ...(minReputation !== undefined && { reputationScore: { gte: minReputation } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
    };

    if (search) {
      const where: Prisma.DeveloperWhereInput = {
        ...baseWhere,
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ],
      };

      const [developers, total] = await Promise.all([
        developersService.developers({ where, orderBy: orderByClause, skip, take: limit }),
        developersService.countDevelopers(where),
      ]);

      return Response.json({ developers, total, limit, skip });
    }

    const [developers, total] = await Promise.all([
      developersService.searchDevelopers({
        tier,
        availability,
        minReputation,
        location,
        skip,
        take: limit,
      }),
      developersService.countDevelopers(baseWhere),
    ]);

    return Response.json({ developers, total, limit, skip });
  } catch (err) {
    return jsonError(err);
  }
}
