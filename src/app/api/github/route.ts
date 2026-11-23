import { getGithubStats } from '@/lib/github';

export const revalidate = 3600; // cached for an hour, then refreshed in the background

export async function GET() {
  return Response.json(await getGithubStats());
}
