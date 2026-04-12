import { githubService } from '@/lib/server/services/github';
import { jsonError } from '@/lib/server/http';
import { ValidateRepositorySchema } from '@/lib/server/validation/github';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { repositoryUrl } = ValidateRepositorySchema.parse(await req.json());
    const result = await githubService.validateRepository(repositoryUrl);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
