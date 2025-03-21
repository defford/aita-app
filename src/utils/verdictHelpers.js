export const extractVerdict = (response) => {
  const regex = /^Verdict:\s*(YTA|NTA|ESH|NAH)/i;
  const match = response.match(regex);
  if (match) return match[1].toUpperCase();

  const keywords = {
    YTA: /YTA|You're the Asshole/i,
    NTA: /NTA|Not the Asshole/i,
    ESH: /ESH|Everyone Sucks Here/i,
    NAH: /NAH|No Assholes Here/i,
  };
  for (const [verdict, pattern] of Object.entries(keywords)) {
    if (pattern.test(response)) return verdict;
  }
  return 'Undecided';
};

export const getOverallEvaluation = (verdictCounts) => {
  const definedVerdicts = ['YTA', 'NTA', 'ESH', 'NAH'];
  const counts = definedVerdicts.map((v) => verdictCounts[v] || 0);
  const maxCount = Math.max(...counts);
  if (maxCount === 0) return 'Undecided';

  const topVerdicts = definedVerdicts.filter((v) => (verdictCounts[v] || 0) === maxCount);
  return topVerdicts.length === 1 ? topVerdicts[0] : `Tie between ${topVerdicts.join(' and ')}`;
};
