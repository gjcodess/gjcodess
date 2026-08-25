const fs = require('fs');
const path = require('path');

const USERNAME = 'gjcodess';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Python: '#3572A5',
  PHP: '#4F5D95',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  PLpgSQL: '#336790',
  SQL: '#e38c00',
  Vue: '#41b883',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB'
};

const DEFAULT_LANGUAGES = [
  { name: 'JavaScript', percent: 65.68, color: '#f1e05a' },
  { name: 'TypeScript', percent: 15.28, color: '#3178c6' },
  { name: 'CSS', percent: 13.11, color: '#563d7c' },
  { name: 'PHP', percent: 5.12, color: '#4F5D95' },
  { name: 'HTML', percent: 0.38, color: '#e34c26' },
  { name: 'PLpgSQL', percent: 0.22, color: '#336790' },
  { name: 'Python', percent: 0.15, color: '#3572A5' },
  { name: 'Shell', percent: 0.06, color: '#89e051' }
];

function calculateRank({ totalCommits, totalRepos, totalStars, contributionsYear = 1164, currentStreak = 98 }) {
  const COMMITS_WEIGHT = 1.5;
  const REPOS_WEIGHT = 4;
  const STARS_WEIGHT = 5;
  const CONTRIB_WEIGHT = 1.2;
  const STREAK_WEIGHT = 3;

  const score =
    (totalCommits || 0) * COMMITS_WEIGHT +
    (totalRepos || 0) * REPOS_WEIGHT +
    (totalStars || 0) * STARS_WEIGHT +
    (contributionsYear || 0) * CONTRIB_WEIGHT +
    (currentStreak || 0) * STREAK_WEIGHT;

  let rank = 'A';
  let rankPercentile = 'Top 25%';
  let strokeDashoffset = 75;

  if (score >= 3000) {
    rank = 'S';
    rankPercentile = 'Top 1%';
    strokeDashoffset = 20;
  } else if (score >= 1500) {
    rank = 'A++';
    rankPercentile = 'Top 5%';
    strokeDashoffset = 35;
  } else if (score >= 750) {
    rank = 'A+';
    rankPercentile = 'Top 15%';
    strokeDashoffset = 55;
  } else if (score >= 350) {
    rank = 'A';
    rankPercentile = 'Top 25%';
    strokeDashoffset = 75;
  } else if (score >= 150) {
    rank = 'B+';
    rankPercentile = 'Top 35%';
    strokeDashoffset = 95;
  } else {
    rank = 'B';
    rankPercentile = 'Top 50%';
    strokeDashoffset = 120;
  }

  return { rank, rankPercentile, strokeDashoffset };
}

async function fetchGraphQL(query, variables = {}) {
  if (!GITHUB_TOKEN) return null;
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'NodeJS-Profile-Updater',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.errors) return null;
    return json.data;
  } catch (err) {
    return null;
  }
}

async function fetchGitHubStats(username) {
  let totalStars = 16;
  let totalCommits = 796;
  let totalRepos = 5;
  let languages = DEFAULT_LANGUAGES;

  if (GITHUB_TOKEN) {
    try {
      const mainQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionYears
              totalCommitContributions
              restrictedContributionsCount
            }
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
              totalCount
              nodes {
                stargazerCount
                languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                  edges {
                    size
                    node {
                      name
                      color
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const gqlData = await fetchGraphQL(mainQuery, { username });
      if (gqlData && gqlData.user) {
        const u = gqlData.user;
        if (typeof u.repositories?.totalCount === 'number') totalRepos = u.repositories.totalCount;

        let starCount = 0;
        const langBytes = {};
        if (u.repositories && Array.isArray(u.repositories.nodes)) {
          if (!totalRepos) totalRepos = u.repositories.nodes.length;
          for (const repo of u.repositories.nodes) {
            starCount += repo.stargazerCount || 0;
            if (repo.languages && Array.isArray(repo.languages.edges)) {
              for (const edge of repo.languages.edges) {
                const name = edge.node?.name;
                const color = edge.node?.color;
                if (name) {
                  if (!LANG_COLORS[name] && color) {
                    LANG_COLORS[name] = color;
                  }
                  langBytes[name] = (langBytes[name] || 0) + (edge.size || 0);
                }
              }
            }
          }
        }
        if (starCount > 0) totalStars = starCount;

        let totalBytes = 0;
        for (const b of Object.values(langBytes)) totalBytes += b;
        if (totalBytes > 0) {
          const sortedLangs = Object.entries(langBytes)
            .map(([name, bytes]) => ({
              name,
              percent: parseFloat(((bytes / totalBytes) * 100).toFixed(2)),
              color: LANG_COLORS[name] || '#58a6ff'
            }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 8);

          if (sortedLangs.length > 0) languages = sortedLangs;
        }

        const years = u.contributionsCollection?.contributionYears || [];
        let lifetimeCommits = (u.contributionsCollection?.totalCommitContributions || 0) + (u.contributionsCollection?.restrictedContributionsCount || 0);

        if (years.length > 1) {
          const yearFields = years.map(y => `
            year_${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
              totalCommitContributions
              restrictedContributionsCount
            }
          `).join('\n');

          const yearsQuery = `
            query($username: String!) {
              user(login: $username) {
                ${yearFields}
              }
            }
          `;

          const yearsData = await fetchGraphQL(yearsQuery, { username });
          if (yearsData && yearsData.user) {
            let sum = 0;
            for (const [key, val] of Object.entries(yearsData.user)) {
              if (val) {
                sum += (val.totalCommitContributions || 0) + (val.restrictedContributionsCount || 0);
              }
            }
            if (sum > 0) lifetimeCommits = sum;
          }
        }

        if (lifetimeCommits > 0) totalCommits = lifetimeCommits;

        return {
          totalStars,
          totalCommits,
          totalRepos,
          languages
        };
      }
    } catch (err) {}
  }

  // REST fallback
  try {
    const headers = { 'User-Agent': 'NodeJS-Profile-Updater' };
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { 
      headers, 
      signal: AbortSignal.timeout(4000) 
    });
    if (repoRes.ok) {
      const repos = await repoRes.json();
      if (Array.isArray(repos) && repos.length > 0) totalRepos = repos.length;
      let starCount = 0;
      const langBytes = {};

      for (const r of repos) {
        starCount += r.stargazers_count || 0;
      }
      if (starCount > 0) totalStars = starCount;

      const langPromises = repos
        .filter(r => r.languages_url)
        .map(async r => {
          try {
            const lRes = await fetch(r.languages_url, { headers, signal: AbortSignal.timeout(3000) });
            if (lRes.ok) return await lRes.json();
          } catch (e) {}
          return {};
        });

      const langResults = await Promise.all(langPromises);
      for (const lData of langResults) {
        for (const [lang, bytes] of Object.entries(lData)) {
          langBytes[lang] = (langBytes[lang] || 0) + bytes;
        }
      }

      let totalBytes = 0;
      for (const b of Object.values(langBytes)) totalBytes += b;
      if (totalBytes > 0) {
        const sortedLangs = Object.entries(langBytes)
          .map(([name, bytes]) => ({
            name,
            percent: parseFloat(((bytes / totalBytes) * 100).toFixed(2)),
            color: LANG_COLORS[name] || '#58a6ff'
          }))
          .sort((a, b) => b.percent - a.percent)
          .slice(0, 8);

        if (sortedLangs.length > 0) languages = sortedLangs;
      }
    }
  } catch (err) {}

  return {
    totalStars,
    totalCommits,
    totalRepos,
    languages
  };
}

function generateUnifiedStatsSvg(statsData) {
  const languages = statsData.languages || DEFAULT_LANGUAGES;
  const barWidth = 385;
  let currentX = 0;
  
  const barSegments = languages.map(l => {
    const w = ((l.percent / 100) * barWidth).toFixed(2);
    const x = currentX.toFixed(2);
    currentX += parseFloat(w);
    return `<rect x="${x}" y="0" width="${w}" height="9" fill="${l.color}"/>`;
  }).join('');

  const col1Langs = languages.slice(0, 4);
  const col2Langs = languages.slice(4, 8);

  const col1Svg = col1Langs.map((l, i) => {
    const y = 107 + i * 26;
    return `
    <circle cx="466" cy="${y}" r="4.5" fill="${l.color}"/>
    <text x="478" y="${y + 4}" fill="#c9d1d9" font-size="12.5">${l.name}</text>
    <text x="590" y="${y + 4}" fill="#7d8590" font-size="12">${l.percent}%</text>`;
  }).join('');

  const col2Svg = col2Langs.map((l, i) => {
    const y = 107 + i * 26;
    return `
    <circle cx="666" cy="${y}" r="4.5" fill="${l.color}"/>
    <text x="678" y="${y + 4}" fill="#c9d1d9" font-size="12.5">${l.name}</text>
    <text x="785" y="${y + 4}" fill="#7d8590" font-size="12">${l.percent}%</text>`;
  }).join('');

  const rankInfo = calculateRank(statsData);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="235" viewBox="0 0 869 235" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    <mask id="bar-mask">
      <rect x="0" y="0" width="385" height="9" rx="4.5" fill="white"/>
    </mask>
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="235" rx="12" fill="url(#sbg)"/>
  <rect x="0.5" y="0.5" width="868" height="234" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~/stats --overview</text>

  <!-- LEFT PANE: GITHUB STATS -->
  <g opacity="0" transform="translate(0,5)">
    <text x="24" y="58" fill="#00FF99" font-size="14" font-weight="700">Glenn Joshua Corpus' GitHub Stats</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.15s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.15s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Stat Items -->
  <g opacity="0" transform="translate(0,5)">
    <!-- Star Icon -->
    <svg x="24" y="76" width="16" height="16" viewBox="0 0 16 16" fill="#ffa657">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
    </svg>
    <text x="48" y="89" fill="#c9d1d9" font-size="13">Total Stars Earned:</text>
    <text x="235" y="89" fill="#ffffff" font-weight="700" font-size="13">${statsData.totalStars.toLocaleString()}</text>

    <!-- Commit Icon -->
    <svg x="24" y="102" width="16" height="16" viewBox="0 0 16 16" fill="#22d3ee">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.947-.75a3.996 3.996 0 0 0-6.894 0H0v1.5h4.553a3.996 3.996 0 0 0 6.894 0H16v-1.5h-4.553Z"/>
    </svg>
    <text x="48" y="115" fill="#c9d1d9" font-size="13">Total Commits:</text>
    <text x="235" y="115" fill="#ffffff" font-weight="700" font-size="13">${statsData.totalCommits.toLocaleString()}</text>

    <!-- Repository Icon -->
    <svg x="24" y="128" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.6-1.2-1.6 1.2a.25.25 0 0 1-.4-.2Z"/>
    </svg>
    <text x="48" y="141" fill="#c9d1d9" font-size="13">Total Repositories:</text>
    <text x="235" y="141" fill="#ffffff" font-weight="700" font-size="13">${statsData.totalRepos.toLocaleString()}</text>

    <!-- Contributions (yr) Icon -->
    <svg x="24" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#39d353">
      <path d="M1.5 1.75a.75.75 0 0 0-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 0-1.5H1.5V1.75Zm14.28 2.53a.75.75 0 0 0-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 0 0-1.06 0L3.22 8.72a.75.75 0 0 0 1.06 1.06L6.75 7.31l2.47 2.47a.75.75 0 0 0 1.06 0l5.5-5.5Z"/>
    </svg>
    <text x="48" y="167" fill="#c9d1d9" font-size="13">Contributions (yr):</text>
    <text x="235" y="167" fill="#ffffff" font-weight="700" font-size="13">1,164</text>

    <!-- Current Streak Icon -->
    <svg x="24" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#ff5f56">
      <path d="M9.504.43a1.5 1.5 0 0 1 .568 1.447l-.462 2.774h3.64a1.5 1.5 0 0 1 1.258 2.316l-6.5 9.75A1.5 1.5 0 0 1 5.44 15.19l.524-3.142H2.25a1.5 1.5 0 0 1-1.258-2.316l6.5-9.75a1.5 1.5 0 0 1 2.012-.554Z"/>
    </svg>
    <text x="48" y="193" fill="#c9d1d9" font-size="13">Current Streak:</text>
    <text x="235" y="193" fill="#ffffff" font-weight="700" font-size="13">98 days</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Rank Ring Badge -->
  <g opacity="0" transform="translate(348, 138)">
    <circle cx="0" cy="0" r="42" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="5"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#00FF99" stroke-width="5" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="${rankInfo.strokeDashoffset || 35}" transform="rotate(-90)"/>
    <text x="0" y="-3" fill="#00FF99" font-size="20" font-weight="800" text-anchor="middle">${rankInfo.rank || 'A++'}</text>
    <text x="0" y="14" fill="#7d8590" font-size="10" text-anchor="middle">${rankInfo.rankPercentile || 'Top 5%'}</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.4s" dur="0.5s" fill="freeze"/>
  </g>

  <!-- VERTICAL DIVIDER -->
  <line x1="434" y1="42" x2="434" y2="215" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- RIGHT PANE: MOST USED LANGUAGES -->
  <g opacity="0" transform="translate(0,5)">
    <text x="460" y="58" fill="#00FF99" font-size="14" font-weight="700">Most Used Languages</text>
    
    <!-- Progress Bar -->
    <g transform="translate(460, 74)" mask="url(#bar-mask)">
      ${barSegments}
    </g>

    <!-- Language Grid Col 1 -->
    ${col1Svg}

    <!-- Language Grid Col 2 -->
    ${col2Svg}

    <animate attributeName="opacity" from="0" to="1" begin="0.35s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.35s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>
</svg>`;
}

// Separate card 1: Stats
function generateStatsCardSvg(statsData) {
  const rankInfo = calculateRank(statsData);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="425" height="235" viewBox="0 0 425 235" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="sbg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <rect width="425" height="235" rx="12" fill="url(#sbg1)"/>
  <rect x="0.5" y="0.5" width="424" height="234" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="425" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="212.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~$ gh stats</text>

  <g opacity="0" transform="translate(0,5)">
    <text x="22" y="58" fill="#00FF99" font-size="13.5" font-weight="700">Glenn Joshua Corpus' GitHub Stats</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.15s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.15s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <g opacity="0" transform="translate(0,5)">
    <svg x="22" y="76" width="16" height="16" viewBox="0 0 16 16" fill="#ffa657">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
    </svg>
    <text x="46" y="89" fill="#c9d1d9" font-size="12.5">Total Stars Earned:</text>
    <text x="230" y="89" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.totalStars.toLocaleString()}</text>

    <svg x="22" y="102" width="16" height="16" viewBox="0 0 16 16" fill="#22d3ee">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.947-.75a3.996 3.996 0 0 0-6.894 0H0v1.5h4.553a3.996 3.996 0 0 0 6.894 0H16v-1.5h-4.553Z"/>
    </svg>
    <text x="46" y="115" fill="#c9d1d9" font-size="12.5">Total Commits:</text>
    <text x="230" y="115" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.totalCommits.toLocaleString()}</text>

    <svg x="22" y="128" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.6-1.2-1.6 1.2a.25.25 0 0 1-.4-.2Z"/>
    </svg>
    <text x="46" y="141" fill="#c9d1d9" font-size="12.5">Total Repositories:</text>
    <text x="230" y="141" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.totalRepos.toLocaleString()}</text>

    <svg x="22" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#39d353">
      <path d="M1.5 1.75a.75.75 0 0 0-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 0-1.5H1.5V1.75Zm14.28 2.53a.75.75 0 0 0-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 0 0-1.06 0L3.22 8.72a.75.75 0 0 0 1.06 1.06L6.75 7.31l2.47 2.47a.75.75 0 0 0 1.06 0l5.5-5.5Z"/>
    </svg>
    <text x="46" y="167" fill="#c9d1d9" font-size="12.5">Contributions (yr):</text>
    <text x="230" y="167" fill="#ffffff" font-weight="700" font-size="12.5">1,164</text>

    <svg x="22" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#ff5f56">
      <path d="M9.504.43a1.5 1.5 0 0 1 .568 1.447l-.462 2.774h3.64a1.5 1.5 0 0 1 1.258 2.316l-6.5 9.75A1.5 1.5 0 0 1 5.44 15.19l.524-3.142H2.25a1.5 1.5 0 0 1-1.258-2.316l6.5-9.75a1.5 1.5 0 0 1 2.012-.554Z"/>
    </svg>
    <text x="46" y="193" fill="#c9d1d9" font-size="12.5">Current Streak:</text>
    <text x="230" y="193" fill="#ffffff" font-weight="700" font-size="12.5">98 days</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <g opacity="0" transform="translate(340, 138)">
    <circle cx="0" cy="0" r="38" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#00FF99" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="238" stroke-dashoffset="${rankInfo.strokeDashoffset || 35}" transform="rotate(-90)"/>
    <text x="0" y="-2" fill="#00FF99" font-size="18" font-weight="800" text-anchor="middle">${rankInfo.rank || 'A++'}</text>
    <text x="0" y="13" fill="#7d8590" font-size="9.5" text-anchor="middle">${rankInfo.rankPercentile || 'Top 5%'}</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.4s" dur="0.5s" fill="freeze"/>
  </g>
</svg>`;
}

// Separate card 2: Languages
function generateLanguagesCardSvg(statsData) {
  const languages = statsData.languages || DEFAULT_LANGUAGES;
  const barWidth = 380;
  let currentX = 0;
  
  const barSegments = languages.map(l => {
    const w = ((l.percent / 100) * barWidth).toFixed(2);
    const x = currentX.toFixed(2);
    currentX += parseFloat(w);
    return `<rect x="${x}" y="0" width="${w}" height="9" fill="${l.color}"/>`;
  }).join('');

  const col1Langs = languages.slice(0, 4);
  const col2Langs = languages.slice(4, 8);

  const col1Svg = col1Langs.map((l, i) => {
    const y = 107 + i * 26;
    return `
    <circle cx="28" cy="${y}" r="4.5" fill="${l.color}"/>
    <text x="40" y="${y + 4}" fill="#c9d1d9" font-size="12">${l.name}</text>
    <text x="145" y="${y + 4}" fill="#7d8590" font-size="11.5">${l.percent}%</text>`;
  }).join('');

  const col2Svg = col2Langs.map((l, i) => {
    const y = 107 + i * 26;
    return `
    <circle cx="225" cy="${y}" r="4.5" fill="${l.color}"/>
    <text x="237" y="${y + 4}" fill="#c9d1d9" font-size="12">${l.name}</text>
    <text x="340" y="${y + 4}" fill="#7d8590" font-size="11.5">${l.percent}%</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="425" height="235" viewBox="0 0 425 235" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="sbg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    <mask id="bar-mask2">
      <rect x="0" y="0" width="380" height="9" rx="4.5" fill="white"/>
    </mask>
  </defs>

  <rect width="425" height="235" rx="12" fill="url(#sbg2)"/>
  <rect x="0.5" y="0.5" width="424" height="234" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="425" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="212.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~$ gh languages</text>

  <g opacity="0" transform="translate(0,5)">
    <text x="22" y="58" fill="#00FF99" font-size="13.5" font-weight="700">Most Used Languages</text>
    
    <g transform="translate(22, 74)" mask="url(#bar-mask2)">
      ${barSegments}
    </g>

    <!-- Column 1 -->
    ${col1Svg}

    <!-- Column 2 -->
    ${col2Svg}

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>
</svg>`;
}

async function main() {
  console.log(`Fetching profile stats for ${USERNAME}...`);
  const statsData = await fetchGitHubStats(USERNAME);

  const unifiedPath = path.join(__dirname, '..', 'github_stats.svg');
  const statsPath = path.join(__dirname, '..', 'stats.svg');
  const langsPath = path.join(__dirname, '..', 'languages.svg');

  fs.writeFileSync(unifiedPath, generateUnifiedStatsSvg(statsData), 'utf8');
  fs.writeFileSync(statsPath, generateStatsCardSvg(statsData), 'utf8');
  fs.writeFileSync(langsPath, generateLanguagesCardSvg(statsData), 'utf8');

  console.log('✅ Successfully regenerated github_stats.svg, stats.svg, and languages.svg with dynamic data!');
}

main();
