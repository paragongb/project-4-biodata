export type GithubStats = { source: 'unavailable' } | {
  source: 'live';
  /** last N weeks, oldest first; each week = 7 daily counts (Sun→Sat), -1 = day in the future */
  weeks: number[][];
  totalLastYear: number;
};
