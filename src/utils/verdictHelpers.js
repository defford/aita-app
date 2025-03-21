export const extractVerdict = (response) => {
  // First check for explicit verdict
  const verdictRegex = /^Verdict:\s*(YTA|NTA|ESH|NAH)/i;
  const verdictMatch = response.match(verdictRegex);
  if (verdictMatch) return verdictMatch[1].toUpperCase();

  // Look for explicit "not the asshole" statements
  const notAsshole = /you('re| are) not the asshole/i;
  if (notAsshole.test(response)) return 'NTA';

  // Look for explicit "you're the asshole" statements
  const isAsshole = /you('re| are) the asshole/i;
  if (isAsshole.test(response)) return 'YTA';

  // Check for abbreviated forms only if no explicit statements were found
  const keywords = {
    YTA: /\bYTA\b/i,
    NTA: /\bNTA\b/i,
    ESH: /\bESH\b|everyone sucks here/i,
    NAH: /\bNAH\b|no assholes here/i,
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
