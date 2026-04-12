import { opportunitiesService } from '@/lib/server/services/opportunities';
import { jsonError, searchParamsOf } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const params = searchParamsOf(req);
    const result = await opportunitiesService.getAllOpportunities({
      ecosystem: params.ecosystem,
      type: params.type as 'hackathon' | 'grant' | 'all' | undefined,
      skip: params.skip ? parseInt(params.skip, 10) : undefined,
      take: params.take ? parseInt(params.take, 10) : undefined,
    });
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
