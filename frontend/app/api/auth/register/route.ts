import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/server/prisma';
import { HttpError, jsonError } from '@/lib/server/http';
import { RegisterSchema } from '@/lib/server/validation/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = RegisterSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new HttpError(409, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        role: body.role,
      },
    });

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return jsonError(err);
  }
}
