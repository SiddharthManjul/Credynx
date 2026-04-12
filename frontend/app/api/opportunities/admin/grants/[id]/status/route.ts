import { opportunitiesService } from '@/lib/server/services/opportunities';
import { requireRole } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';
import { GrantStatusSchema } from '@/lib/server/validation/opportunity';

export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole('ADMIN');
    const { id } = await params;
    const { status } = GrantStatusSchema.parse(await req.json());
    const updated = await opportunitiesService.updateGrantStatus(id, status);
    return Response.json(updated);
  } catch (err) {
    return jsonError(err);
  }
}
