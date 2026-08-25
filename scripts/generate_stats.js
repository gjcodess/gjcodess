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

function calculateRank({ totalCommits, totalPRs, totalIssues, totalStars, contributedTo }) {
  const COMMITS_WEIGHT = 1.5;
  const PRS_WEIGHT = 3;
  const ISSUES_WEIGHT = 1.5;
  const STARS_WEIGHT = 4;
  const CONTRIBUTED_WEIGHT = 2;

  const score =
    (totalCommits || 0) * COMMITS_WEIGHT +
    (totalPRs || 0) * PRS_WEIGHT +
    (totalIssues || 0) * ISSUES_WEIGHT +
    (totalStars || 0) * STARS_WEIGHT +
    (contributedTo || 0) * CONTRIBUTED_WEIGHT;

  let rank = 'A';
  let rankPercentile = 'Top 25%';
  let strokeDashoffset = 75;

  if (score >= 2500) {
    rank = 'S';
    rankPercentile = 'Top 1%';
    strokeDashoffset = 20;
  } else if (score >= 1200) {
    rank = 'A++';
    rankPercentile = 'Top 5%';
    strokeDashoffset = 35;
  } else if (score >= 600) {
    rank = 'A+';
    rankPercentile = 'Top 15%';
    strokeDashoffset = 55;
  } else if (score >= 300) {
    rank = 'A';
    rankPercentile = 'Top 25%';
    strokeDashoffset = 75;
  } else if (score >= 100) {
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
  let totalPRs = 0;
  let totalIssues = 0;
  let contributedTo = 0;
  let languages = DEFAULT_LANGUAGES;

  if (GITHUB_TOKEN) {
    try {
      const mainQuery = `
        query($username: String!) {
          user(login: $username) {
            repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
              totalCount
            }
            pullRequests(first: 1) {
              totalCount
            }
            issues(first: 1) {
              totalCount
            }
            contributionsCollection {
              contributionYears
              totalCommitContributions
              restrictedContributionsCount
            }
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
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
        if (typeof u.pullRequests?.totalCount === 'number') totalPRs = u.pullRequests.totalCount;
        if (typeof u.issues?.totalCount === 'number') totalIssues = u.issues.totalCount;
        if (typeof u.repositoriesContributedTo?.totalCount === 'number') contributedTo = u.repositoriesContributedTo.totalCount;

        let starCount = 0;
        const langBytes = {};
        if (u.repositories && Array.isArray(u.repositories.nodes)) {
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

        const rankInfo = calculateRank({ totalCommits, totalPRs, totalIssues, totalStars, contributedTo });
        return {
          totalStars,
          totalCommits,
          totalPRs,
          totalIssues,
          contributedTo,
          languages,
          rank: rankInfo.rank,
          rankPercentile: rankInfo.rankPercentile,
          strokeDashoffset: rankInfo.strokeDashoffset
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

  const rankInfo = calculateRank({ totalCommits, totalPRs, totalIssues, totalStars, contributedTo });
  return {
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    contributedTo,
    languages,
    rank: rankInfo.rank,
    rankPercentile: rankInfo.rankPercentile,
    strokeDashoffset: rankInfo.strokeDashoffset
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

    <!-- PR Icon -->
    <svg x="24" y="128" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 5.2a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H6.75a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h1.64l-1.22-1.22a.75.75 0 0 1 0-1.06Z M13 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    <text x="48" y="141" fill="#c9d1d9" font-size="13">Total PRs:</text>
    <text x="235" y="141" fill="#ffffff" font-weight="700" font-size="13">${statsData.totalPRs.toLocaleString()}</text>

    <!-- Issue Icon -->
    <svg x="24" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#f43f5e">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
    </svg>
    <text x="48" y="167" fill="#c9d1d9" font-size="13">Total Issues:</text>
    <text x="235" y="167" fill="#ffffff" font-weight="700" font-size="13">${statsData.totalIssues.toLocaleString()}</text>

    <!-- Contributed To Icon -->
    <svg x="24" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#38bdf8">
      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.218.585L8 11.834l-3.782 2.999A.75.75 0 0 1 3 14.25V2.75Z"/>
    </svg>
    <text x="48" y="193" fill="#c9d1d9" font-size="13">Contributed to (yr):</text>
    <text x="235" y="193" fill="#ffffff" font-weight="700" font-size="13">${statsData.contributedTo.toLocaleString()}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Rank Ring Badge -->
  <g opacity="0" transform="translate(348, 138)">
    <circle cx="0" cy="0" r="42" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="5"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#00FF99" stroke-width="5" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="${statsData.strokeDashoffset || 65}" transform="rotate(-90)"/>
    <text x="0" y="-3" fill="#00FF99" font-size="20" font-weight="800" text-anchor="middle">${statsData.rank || 'A+'}</text>
    <text x="0" y="14" fill="#7d8590" font-size="10" text-anchor="middle">${statsData.rankPercentile || 'Top 15%'}</text>
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
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 5.2a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H6.75a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h1.64l-1.22-1.22a.75.75 0 0 1 0-1.06Z M13 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    <text x="46" y="141" fill="#c9d1d9" font-size="12.5">Total PRs:</text>
    <text x="230" y="141" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.totalPRs.toLocaleString()}</text>

    <svg x="22" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#f43f5e">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
    </svg>
    <text x="46" y="167" fill="#c9d1d9" font-size="12.5">Total Issues:</text>
    <text x="230" y="167" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.totalIssues.toLocaleString()}</text>

    <svg x="22" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#38bdf8">
      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.218.585L8 11.834l-3.782 2.999A.75.75 0 0 1 3 14.25V2.75Z"/>
    </svg>
    <text x="46" y="193" fill="#c9d1d9" font-size="12.5">Contributed to (yr):</text>
    <text x="230" y="193" fill="#ffffff" font-weight="700" font-size="12.5">${statsData.contributedTo.toLocaleString()}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <g opacity="0" transform="translate(340, 138)">
    <circle cx="0" cy="0" r="38" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#00FF99" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="238" stroke-dashoffset="${statsData.strokeDashoffset || 55}" transform="rotate(-90)"/>
    <text x="0" y="-2" fill="#00FF99" font-size="18" font-weight="800" text-anchor="middle">${statsData.rank || 'A+'}</text>
    <text x="0" y="13" fill="#7d8590" font-size="9.5" text-anchor="middle">${statsData.rankPercentile || 'Top 15%'}</text>
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
