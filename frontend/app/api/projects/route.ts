import { projectsService } from '@/lib/server/services/projects';
import { jsonError, searchParamsOf } from '@/lib/server/http';
import { ProjectFilterSchema } from '@/lib/server/validation/developer';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { technologies, search, isVerified, limit, skip } = ProjectFilterSchema.parse(
      searchParamsOf(req),
    );

    const where: Prisma.ProjectWhereInput = {};

    if (technologies) {
      where.technologies = { hasSome: technologies.split(',').map((t) => t.trim()) };
    }

    if (isVerified === 'true') {
      where.isVerified = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      projectsService.projects({
        where,
        include: {
          developer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              tier: true,
              reputationScore: true,
            },
          },
        },
        orderBy: { githubStars: 'desc' },
        take: limit,
        skip,
      }),
      projectsService.countProjects(where),
    ]);

    return Response.json({ projects, total, limit, skip });
  } catch (err) {
    return jsonError(err);
  }
}
