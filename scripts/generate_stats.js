const fs = require('fs');
const path = require('path');

const USERNAME = 'gjcodess';

// Fallback / verified live data
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
    <text x="25" y="58" fill="#00FF99" font-size="14" font-weight="700">Glenn Joshua Corpus' GitHub Stats</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.15s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.15s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Stat Items -->
  <g opacity="0" transform="translate(0,5)">
    <!-- Stars -->
    <path d="M 27 82 L 29 88 L 35 88 L 30 92 L 32 98 L 27 94 L 22 98 L 24 92 L 19 88 L 25 88 Z" fill="#ffa657" transform="scale(0.8) translate(8, 18)"/>
    <text x="46" y="90" fill="#c9d1d9" font-size="13">Total Stars Earned:</text>
    <text x="240" y="90" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalStars}</text>

    <!-- Commits -->
    <path d="M26 109 A 5 5 0 1 0 26 119 A 5 5 0 1 0 26 109 M 21 114 L 16 114 M 31 114 L 36 114" stroke="#22d3ee" stroke-width="1.5" fill="none"/>
    <text x="46" y="116" fill="#c9d1d9" font-size="13">Total Commits:</text>
    <text x="240" y="116" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalCommits.toLocaleString()}</text>

    <!-- PRs -->
    <path d="M19 135 A 2.5 2.5 0 1 0 19 140 A 2.5 2.5 0 1 0 19 135 M 33 145 A 2.5 2.5 0 1 0 33 150 A 2.5 2.5 0 1 0 33 145 M 19 140 L 19 148 C 19 151 22 153 25 153 L 33 153" stroke="#a855f7" stroke-width="1.5" fill="none"/>
    <text x="46" y="142" fill="#c9d1d9" font-size="13">Total PRs:</text>
    <text x="240" y="142" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalPRs}</text>

    <!-- Issues -->
    <circle cx="26" cy="164" r="5" stroke="#f43f5e" stroke-width="1.5" fill="none"/>
    <circle cx="26" cy="164" r="1.5" fill="#f43f5e"/>
    <text x="46" y="168" fill="#c9d1d9" font-size="13">Total Issues:</text>
    <text x="240" y="168" fill="#ffffff" font-weight="700" font-size="13">${STATS.totalIssues}</text>

    <!-- Contributed to -->
    <path d="M21 189 L 31 189 L 31 199 L 26 196 L 21 199 Z" stroke="#38bdf8" stroke-width="1.3" fill="none"/>
    <text x="46" y="194" fill="#c9d1d9" font-size="13">Contributed to (last year):</text>
    <text x="240" y="194" fill="#ffffff" font-weight="700" font-size="13">${STATS.contributedTo}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Rank Ring Badge -->
  <g opacity="0" transform="translate(355, 138)">
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
    <!-- JS -->
    <circle cx="466" cy="107" r="4.5" fill="#f1e05a"/>
    <text x="478" y="111" fill="#c9d1d9" font-size="12.5">JavaScript</text>
    <text x="590" y="111" fill="#7d8590" font-size="12">65.68%</text>

    <!-- TS -->
    <circle cx="466" cy="133" r="4.5" fill="#3178c6"/>
    <text x="478" y="137" fill="#c9d1d9" font-size="12.5">TypeScript</text>
    <text x="590" y="137" fill="#7d8590" font-size="12">15.28%</text>

    <!-- CSS -->
    <circle cx="466" cy="159" r="4.5" fill="#563d7c"/>
    <text x="478" y="163" fill="#c9d1d9" font-size="12.5">CSS</text>
    <text x="590" y="163" fill="#7d8590" font-size="12">13.11%</text>

    <!-- PHP -->
    <circle cx="466" cy="185" r="4.5" fill="#4F5D95"/>
    <text x="478" y="189" fill="#c9d1d9" font-size="12.5">PHP</text>
    <text x="590" y="189" fill="#7d8590" font-size="12">5.12%</text>

    <!-- Language Grid Col 2 -->
    <!-- HTML -->
    <circle cx="666" cy="107" r="4.5" fill="#e34c26"/>
    <text x="678" y="111" fill="#c9d1d9" font-size="12.5">HTML</text>
    <text x="785" y="111" fill="#7d8590" font-size="12">0.38%</text>

    <!-- PLpgSQL -->
    <circle cx="666" cy="133" r="4.5" fill="#336790"/>
    <text x="678" y="137" fill="#c9d1d9" font-size="12.5">PLpgSQL</text>
    <text x="785" y="137" fill="#7d8590" font-size="12">0.22%</text>

    <!-- Python -->
    <circle cx="666" cy="159" r="4.5" fill="#3572A5"/>
    <text x="678" y="163" fill="#c9d1d9" font-size="12.5">Python</text>
    <text x="785" y="163" fill="#7d8590" font-size="12">0.15%</text>

    <!-- Shell -->
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
    <path d="M 25 82 L 27 88 L 33 88 L 28 92 L 30 98 L 25 94 L 20 98 L 22 92 L 17 88 L 23 88 Z" fill="#ffa657" transform="scale(0.8) translate(8, 18)"/>
    <text x="44" y="90" fill="#c9d1d9" font-size="12.5">Total Stars Earned:</text>
    <text x="235" y="90" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalStars}</text>

    <path d="M26 109 A 5 5 0 1 0 26 119 A 5 5 0 1 0 26 109 M 21 114 L 16 114 M 31 114 L 36 114" stroke="#22d3ee" stroke-width="1.5" fill="none"/>
    <text x="44" y="116" fill="#c9d1d9" font-size="12.5">Total Commits:</text>
    <text x="235" y="116" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalCommits.toLocaleString()}</text>

    <path d="M19 135 A 2.5 2.5 0 1 0 19 140 A 2.5 2.5 0 1 0 19 135 M 33 145 A 2.5 2.5 0 1 0 33 150 A 2.5 2.5 0 1 0 33 145 M 19 140 L 19 148 C 19 151 22 153 25 153 L 33 153" stroke="#a855f7" stroke-width="1.5" fill="none"/>
    <text x="44" y="142" fill="#c9d1d9" font-size="12.5">Total PRs:</text>
    <text x="235" y="142" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalPRs}</text>

    <circle cx="26" cy="164" r="5" stroke="#f43f5e" stroke-width="1.5" fill="none"/>
    <circle cx="26" cy="164" r="1.5" fill="#f43f5e"/>
    <text x="44" y="168" fill="#c9d1d9" font-size="12.5">Total Issues:</text>
    <text x="235" y="168" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalIssues}</text>

    <path d="M21 189 L 31 189 L 31 199 L 26 196 L 21 199 Z" stroke="#38bdf8" stroke-width="1.3" fill="none"/>
    <text x="44" y="194" fill="#c9d1d9" font-size="12.5">Contributed to (last yr):</text>
    <text x="235" y="194" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.contributedTo}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <g opacity="0" transform="translate(345, 138)">
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

  console.log('Successfully generated github_stats.svg, stats.svg, and languages.svg!');
}

main();
