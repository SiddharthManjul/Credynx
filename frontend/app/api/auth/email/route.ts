import { prisma } from '@/lib/server/prisma';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import { UpdateEmailSchema } from '@/lib/server/validation/auth';

export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const { email } = UpdateEmailSchema.parse(await req.json());

    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        throw new HttpError(409, 'Email already in use');
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });

    return Response.json({ email: updated.email });
  } catch (err) {
    return jsonError(err);
  }
}
