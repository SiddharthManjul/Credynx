import { foundersService } from '@/lib/server/services/founders';
import { jsonError, searchParamsOf } from '@/lib/server/http';
import { FounderFilterSchema } from '@/lib/server/validation/developer';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { page, limit, search } = FounderFilterSchema.parse(searchParamsOf(req));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.FounderWhereInput | undefined = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [founders, total] = await Promise.all([
      foundersService.founders({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
      foundersService.countFounders(whereClause),
    ]);

    return Response.json({
      data: founders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
