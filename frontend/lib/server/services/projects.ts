import { prisma } from '@/lib/server/prisma';
import type { Prisma, Project } from '@prisma/client';

export const projectsService = {
  project(where: Prisma.ProjectWhereUniqueInput): Promise<Project | null> {
    return prisma.project.findUnique({ where });
  },

  projects(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
    include?: Prisma.ProjectInclude;
  }) {
    return prisma.project.findMany(params);
  },

  createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  },

  updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    return prisma.project.update(params);
  },

  deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return prisma.project.delete({ where });
  },

  getProjectWithDeveloper(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        developer: {
          select: { id: true, username: true, fullName: true, tier: true },
        },
      },
    });
  },

  searchProjects(params: {
    technologies?: string[];
    isVerified?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { technologies, isVerified, skip, take } = params;
    return prisma.project.findMany({
      where: {
        ...(technologies && {
          technologies: { hasSome: technologies },
        }),
        ...(isVerified !== undefined && { isVerified }),
      },
      include: {
        developer: { select: { username: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: take || 20,
    });
  },

  countProjects(where?: Prisma.ProjectWhereInput): Promise<number> {
    return prisma.project.count({ where });
  },

  findProjectById(projectId: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id: projectId } });
  },

  findProjectsByDeveloper(developerId: string) {
    return prisma.project.findMany({
      where: { developerId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
