import { opportunitiesService } from '@/lib/server/services/opportunities';
import { requireRole } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';
import { CreateHackathonSchema } from '@/lib/server/validation/opportunity';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await requireRole('ADMIN');
    const dto = CreateHackathonSchema.parse(await req.json());
    const created = await opportunitiesService.createHackathon(dto);
    return Response.json(created, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
