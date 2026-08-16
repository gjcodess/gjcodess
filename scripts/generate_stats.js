const fs = require('fs');
const path = require('path');

const USERNAME = 'gjcodess';

// Live & verified stats
const STATS = {
  name: "Glenn Joshua Corpus' GitHub Stats",
  totalStars: 24,
  totalCommits: 796,
  totalPRs: 244,
  totalIssues: 0,
  contributedTo: 0,
  rank: 'A+',
  rankPercentile: 'Top 15%'
};

const LANGUAGES = [
  { name: 'JavaScript', percent: 65.68, color: '#f1e05a' },
  { name: 'TypeScript', percent: 15.28, color: '#3178c6' },
  { name: 'CSS', percent: 13.11, color: '#563d7c' },
  { name: 'PHP', percent: 5.12, color: '#4F5D95' },
  { name: 'HTML', percent: 0.38, color: '#e34c26' },
  { name: 'PLpgSQL', percent: 0.22, color: '#336790' },
  { name: 'Python', percent: 0.15, color: '#3572A5' },
  { name: 'Shell', percent: 0.06, color: '#89e051' }
];

function generateUnifiedStatsSvg() {
  const barWidth = 385;
  let currentX = 0;
  
  const barSegments = LANGUAGES.map(l => {
    const w = ((l.percent / 100) * barWidth).toFixed(2);
    const x = currentX.toFixed(2);
    currentX += parseFloat(w);
    return `<rect x="${x}" y="0" width="${w}" height="9" fill="${l.color}"/>`;
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
    <text x="235" y="89" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalStars}</text>

    <!-- Commit Icon -->
    <svg x="24" y="102" width="16" height="16" viewBox="0 0 16 16" fill="#22d3ee">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.947-.75a3.996 3.996 0 0 0-6.894 0H0v1.5h4.553a3.996 3.996 0 0 0 6.894 0H16v-1.5h-4.553Z"/>
    </svg>
    <text x="48" y="115" fill="#c9d1d9" font-size="13">Total Commits:</text>
    <text x="235" y="115" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalCommits.toLocaleString()}</text>

    <!-- PR Icon -->
    <svg x="24" y="128" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 5.2a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H6.75a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h1.64l-1.22-1.22a.75.75 0 0 1 0-1.06Z M13 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    <text x="48" y="141" fill="#c9d1d9" font-size="13">Total PRs:</text>
    <text x="235" y="141" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalPRs}</text>

    <!-- Issue Icon -->
    <svg x="24" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#f43f5e">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
    </svg>
    <text x="48" y="167" fill="#c9d1d9" font-size="13">Total Issues:</text>
    <text x="235" y="167" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalIssues}</text>

    <!-- Contributed To Icon -->
    <svg x="24" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#38bdf8">
      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.218.585L8 11.834l-3.782 2.999A.75.75 0 0 1 3 14.25V2.75Z"/>
    </svg>
    <text x="48" y="193" fill="#c9d1d9" font-size="13">Contributed to (yr):</text>
    <text x="235" y="193" fill="#ffffff" font-weight="700" font-size="13">${STATS.contributedTo}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Rank Ring Badge -->
  <g opacity="0" transform="translate(348, 138)">
    <circle cx="0" cy="0" r="42" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="5"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#00FF99" stroke-width="5" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="65" transform="rotate(-90)"/>
    <text x="0" y="-3" fill="#00FF99" font-size="20" font-weight="800" text-anchor="middle">${STATS.rank}</text>
    <text x="0" y="14" fill="#7d8590" font-size="10" text-anchor="middle">${STATS.rankPercentile}</text>
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
    <circle cx="466" cy="107" r="4.5" fill="#f1e05a"/>
    <text x="478" y="111" fill="#c9d1d9" font-size="12.5">JavaScript</text>
    <text x="590" y="111" fill="#7d8590" font-size="12">65.68%</text>

    <circle cx="466" cy="133" r="4.5" fill="#3178c6"/>
    <text x="478" y="137" fill="#c9d1d9" font-size="12.5">TypeScript</text>
    <text x="590" y="137" fill="#7d8590" font-size="12">15.28%</text>

    <circle cx="466" cy="159" r="4.5" fill="#563d7c"/>
    <text x="478" y="163" fill="#c9d1d9" font-size="12.5">CSS</text>
    <text x="590" y="163" fill="#7d8590" font-size="12">13.11%</text>

    <circle cx="466" cy="185" r="4.5" fill="#4F5D95"/>
    <text x="478" y="189" fill="#c9d1d9" font-size="12.5">PHP</text>
    <text x="590" y="189" fill="#7d8590" font-size="12">5.12%</text>

    <!-- Language Grid Col 2 -->
    <circle cx="666" cy="107" r="4.5" fill="#e34c26"/>
    <text x="678" y="111" fill="#c9d1d9" font-size="12.5">HTML</text>
    <text x="785" y="111" fill="#7d8590" font-size="12">0.38%</text>

    <circle cx="666" cy="133" r="4.5" fill="#336790"/>
    <text x="678" y="137" fill="#c9d1d9" font-size="12.5">PLpgSQL</text>
    <text x="785" y="137" fill="#7d8590" font-size="12">0.22%</text>

    <circle cx="666" cy="159" r="4.5" fill="#3572A5"/>
    <text x="678" y="163" fill="#c9d1d9" font-size="12.5">Python</text>
    <text x="785" y="163" fill="#7d8590" font-size="12">0.15%</text>

    <circle cx="666" cy="185" r="4.5" fill="#89e051"/>
    <text x="678" y="189" fill="#c9d1d9" font-size="12.5">Shell</text>
    <text x="785" y="189" fill="#7d8590" font-size="12">0.06%</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.35s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.35s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>
</svg>`;
}

// Separate card 1: Stats
function generateStatsCardSvg() {
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
    <text x="230" y="89" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalStars}</text>

    <svg x="22" y="102" width="16" height="16" viewBox="0 0 16 16" fill="#22d3ee">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.947-.75a3.996 3.996 0 0 0-6.894 0H0v1.5h4.553a3.996 3.996 0 0 0 6.894 0H16v-1.5h-4.553Z"/>
    </svg>
    <text x="46" y="115" fill="#c9d1d9" font-size="12.5">Total Commits:</text>
    <text x="230" y="115" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalCommits.toLocaleString()}</text>

    <svg x="22" y="128" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 5.2a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H6.75a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h1.64l-1.22-1.22a.75.75 0 0 1 0-1.06Z M13 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    <text x="46" y="141" fill="#c9d1d9" font-size="12.5">Total PRs:</text>
    <text x="230" y="141" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalPRs}</text>

    <svg x="22" y="154" width="16" height="16" viewBox="0 0 16 16" fill="#f43f5e">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
    </svg>
    <text x="46" y="167" fill="#c9d1d9" font-size="12.5">Total Issues:</text>
    <text x="230" y="167" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalIssues}</text>

    <svg x="22" y="180" width="16" height="16" viewBox="0 0 16 16" fill="#38bdf8">
      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.218.585L8 11.834l-3.782 2.999A.75.75 0 0 1 3 14.25V2.75Z"/>
    </svg>
    <text x="46" y="193" fill="#c9d1d9" font-size="12.5">Contributed to (yr):</text>
    <text x="230" y="193" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.contributedTo}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <g opacity="0" transform="translate(340, 138)">
    <circle cx="0" cy="0" r="38" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#00FF99" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="238" stroke-dashoffset="55" transform="rotate(-90)"/>
    <text x="0" y="-2" fill="#00FF99" font-size="18" font-weight="800" text-anchor="middle">${STATS.rank}</text>
    <text x="0" y="13" fill="#7d8590" font-size="9.5" text-anchor="middle">${STATS.rankPercentile}</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.4s" dur="0.5s" fill="freeze"/>
  </g>
</svg>`;
}

// Separate card 2: Languages
function generateLanguagesCardSvg() {
  const barWidth = 380;
  let currentX = 0;
  
  const barSegments = LANGUAGES.map(l => {
    const w = ((l.percent / 100) * barWidth).toFixed(2);
    const x = currentX.toFixed(2);
    currentX += parseFloat(w);
    return `<rect x="${x}" y="0" width="${w}" height="9" fill="${l.color}"/>`;
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
    <circle cx="28" cy="107" r="4.5" fill="#f1e05a"/>
    <text x="40" y="111" fill="#c9d1d9" font-size="12">JavaScript</text>
    <text x="145" y="111" fill="#7d8590" font-size="11.5">65.68%</text>

    <circle cx="28" cy="133" r="4.5" fill="#3178c6"/>
    <text x="40" y="137" fill="#c9d1d9" font-size="12">TypeScript</text>
    <text x="145" y="137" fill="#7d8590" font-size="11.5">15.28%</text>

    <circle cx="28" cy="159" r="4.5" fill="#563d7c"/>
    <text x="40" y="163" fill="#c9d1d9" font-size="12">CSS</text>
    <text x="145" y="163" fill="#7d8590" font-size="11.5">13.11%</text>

    <circle cx="28" cy="185" r="4.5" fill="#4F5D95"/>
    <text x="40" y="189" fill="#c9d1d9" font-size="12">PHP</text>
    <text x="145" y="189" fill="#7d8590" font-size="11.5">5.12%</text>

    <!-- Column 2 -->
    <circle cx="225" cy="107" r="4.5" fill="#e34c26"/>
    <text x="237" y="111" fill="#c9d1d9" font-size="12">HTML</text>
    <text x="340" y="111" fill="#7d8590" font-size="11.5">0.38%</text>

    <circle cx="225" cy="133" r="4.5" fill="#336790"/>
    <text x="237" y="137" fill="#c9d1d9" font-size="12">PLpgSQL</text>
    <text x="340" y="137" fill="#7d8590" font-size="11.5">0.22%</text>

    <circle cx="225" cy="159" r="4.5" fill="#3572A5"/>
    <text x="237" y="163" fill="#c9d1d9" font-size="12">Python</text>
    <text x="340" y="163" fill="#7d8590" font-size="11.5">0.15%</text>

    <circle cx="225" cy="185" r="4.5" fill="#89e051"/>
    <text x="237" y="189" fill="#c9d1d9" font-size="12">Shell</text>
    <text x="340" y="189" fill="#7d8590" font-size="11.5">0.06%</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>
</svg>`;
}

function main() {
  const unifiedPath = path.join(__dirname, '..', 'github_stats.svg');
  const statsPath = path.join(__dirname, '..', 'stats.svg');
  const langsPath = path.join(__dirname, '..', 'languages.svg');

  fs.writeFileSync(unifiedPath, generateUnifiedStatsSvg(), 'utf8');
  fs.writeFileSync(statsPath, generateStatsCardSvg(), 'utf8');
  fs.writeFileSync(langsPath, generateLanguagesCardSvg(), 'utf8');

  console.log('Successfully regenerated github_stats.svg, stats.svg, and languages.svg with aligned icons!');
}

main();
