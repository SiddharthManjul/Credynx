import { vouchingService } from '@/lib/server/services/vouching';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import { CreateVouchSchema } from '@/lib/server/validation/vouch';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const isFounder = user.role === 'FOUNDER' && !!user.founder;
    const voucherId = isFounder ? user.founder!.id : user.developer?.id;

    if (!voucherId) {
      throw new HttpError(400, 'User must be a developer or founder to vouch');
    }

    const dto = CreateVouchSchema.parse(await req.json());
    const result = await vouchingService.createVouch(voucherId, dto, isFounder);
    return Response.json(result, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
