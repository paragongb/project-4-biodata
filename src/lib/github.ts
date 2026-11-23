import 'server-only';
import { site } from '@/content/site';
import type { GithubStats } from './types';

const WEEKS = 20;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

type Day = { date: string; contributionCount: number };

type LiveStats = Extract<GithubStats, { source: 'live' }>;

export async function getGithubStats(): Promise<GithubStats> {
  const token = process.env.GITHUB_TOKEN;
  const login = site.githubUsername;

  if (token) {
    try {
      return await fetchGraphqlCalendar(login, token);
    } catch (err) {
      console.error('[github] GraphQL unavailable, trying the public calendar:', err);
    }
  }

  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions`, {
      headers: { 'Accept-Language': 'en-US' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`GitHub calendar ${res.status}`);
    const days = parsePublicCalendar(await res.text());
    return { source: 'live', ...summarise(days), totalLastYear: days.reduce((total, day) => total + day.contributionCount, 0) };
  } catch (err) {
    console.error('[github] public calendar unavailable:', err);
    return { source: 'unavailable' };
  }
}

async function fetchGraphqlCalendar(login: string, token: string): Promise<LiveStats> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-site' },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error('Unexpected GitHub response');
  const days: Day[] = cal.weeks.flatMap((week: { contributionDays: Day[] }) => week.contributionDays);
  return { source: 'live', ...summarise(days), totalLastYear: cal.totalContributions };
}

function parsePublicCalendar(html: string): Day[] {
  // GitHub lists days by weekday in the HTML and gives exact counts in the tooltips.
  const counts = new Map<string, number>();
  for (const [, id, count] of html.matchAll(/<tool-tip\b[^>]*\sfor="([^"]+)"[^>]*>\s*(No|[\d,]+)\s+contributions?\b/gi)) {
    counts.set(id, count.toLowerCase() === 'no' ? 0 : Number(count.replaceAll(',', '')));
  }

  const days: Day[] = [];
  for (const [cell] of html.matchAll(/<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g)) {
    const date = cell.match(/\sdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = cell.match(/\sid="([^"]+)"/)?.[1];
    if (!date) continue;
    const tooltipCount = id ? counts.get(id) : undefined;
    const contributionCount = tooltipCount ?? (/\sdata-level="0"/.test(cell) ? 0 : undefined);
    if (contributionCount === undefined) throw new Error('Missing GitHub contribution count');
    days.push({ date, contributionCount });
  }
  if (!days.length) throw new Error('GitHub contribution calendar is missing');
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function summarise(days: Day[]): Omit<LiveStats, 'source' | 'totalLastYear'> {
  const today = new Date().toISOString().slice(0, 10);
  // last WEEKS calendar weeks (Sun→Sat), future days = -1
  const weeks: number[][] = [];
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (weekday === 0 || !weeks.length) weeks.push(Array<number>(7).fill(-1));
    if (day.date <= today) weeks[weeks.length - 1][weekday] = day.contributionCount;
  }
  return { weeks: weeks.slice(-WEEKS) };
}
