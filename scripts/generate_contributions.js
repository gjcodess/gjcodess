const fs = require('fs');
const path = require('path');

const USERNAME = 'gjcodess';

// Fallback & live statistics for Glenn
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

async function fetchContributions(username) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch from API:', err);
    return null;
  }
}

function getColor(count) {
  if (count === 0) return '#161b22';
  if (count <= 3) return '#0e4429';
  if (count <= 9) return '#006d32';
  if (count <= 19) return '#26a641';
  if (count <= 34) return '#39d353';
  return '#69f0a0';
}

const MONTH_NAMES = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

function generateAllInOneSvg(data, username = USERNAME) {
  const contribMap = new Map();
  if (data && data.contributions) {
    for (const item of data.contributions) {
      contribMap.set(item.date, item);
    }
  }

  const now = new Date();
  const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayOfWeek = nowUtc.getUTCDay(); // 0: Sun, 6: Sat
  
  const endSaturday = new Date(nowUtc);
  if (dayOfWeek < 6) {
    endSaturday.setUTCDate(nowUtc.getUTCDate() + (6 - dayOfWeek));
  }

  const startSunday = new Date(endSaturday);
  startSunday.setUTCDate(endSaturday.getUTCDate() - 370);

  const startDateStr = startSunday.toISOString().split('T')[0];
  const endDateStr = endSaturday.toISOString().split('T')[0];

  let totalYearContributions = 0;
  let bestDay = { count: 0, date: startDateStr };

  let cellsSvg = '';
  const monthLabels = [];
  let lastMonthSeen = -1;

  for (let w = 0; w < 53; w++) {
    const colX = 52 + w * 15;

    for (let d = 0; d < 7; d++) {
      const curDate = new Date(startSunday);
      curDate.setUTCDate(startSunday.getUTCDate() + (w * 7 + d));
      const dateStr = curDate.toISOString().split('T')[0];
      const month = curDate.getUTCMonth();
      const dayOfMonth = curDate.getUTCDate();

      if (dayOfMonth <= 7 && month !== lastMonthSeen && d === 0) {
        monthLabels.push({ x: colX, text: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month] });
        lastMonthSeen = month;
      } else if (dayOfMonth === 1 && month !== lastMonthSeen) {
        monthLabels.push({ x: colX, text: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month] });
        lastMonthSeen = month;
      }

      const item = contribMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      const count = item.count;
      totalYearContributions += count;

      if (count > bestDay.count) {
        bestDay = { count, date: dateStr };
      }

      // Graph row base Y is 254
      const rowY = 254 + d * 15;
      const delay = (w * 0.015 + d * 0.04 + 0.35).toFixed(3);
      const color = getColor(count);
      const tooltip = `${dateStr}: ${count} contribution${count === 1 ? '' : 's'}`;

      cellsSvg += `<rect class="c" x="${colX}" y="${rowY}" width="11" height="11" rx="2.2" fill="${color}" style="animation-delay:${delay}s"><title>${tooltip}</title></rect>`;
    }
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (data && data.contributions && data.contributions.length > 0) {
    const sorted = [...data.contributions].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    const todayStr = nowUtc.toISOString().split('T')[0];
    const yesterdayDate = new Date(nowUtc);
    yesterdayDate.setUTCDate(nowUtc.getUTCDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    let checkIdx = sorted.findIndex(s => s.date === todayStr);
    if (checkIdx === -1) checkIdx = sorted.length - 1;

    if (checkIdx >= 0 && sorted[checkIdx].count === 0) {
      if (checkIdx > 0 && sorted[checkIdx - 1].date === yesterdayStr && sorted[checkIdx - 1].count > 0) {
        checkIdx--;
      }
    }

    if (checkIdx >= 0 && sorted[checkIdx].count > 0) {
      while (checkIdx >= 0 && sorted[checkIdx].count > 0) {
        currentStreak++;
        checkIdx--;
      }
    }
  }

  const formattedTotal = totalYearContributions.toLocaleString();

  const monthLabelsSvg = monthLabels
    .map(m => `<text x="${m.x}" y="244" fill="#7d8590" font-size="10">${m.text}</text>`)
    .join('');

  // Language bar segments
  const barWidth = 385;
  let currentX = 0;
  const barSegments = LANGUAGES.map(l => {
    const w = ((l.percent / 100) * barWidth).toFixed(2);
    const x = currentX.toFixed(2);
    currentX += parseFloat(w);
    return `<rect x="${x}" y="0" width="${w}" height="9" fill="${l.color}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="442" viewBox="0 0 869 442" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <style>
    @keyframes cell {
      0%   { opacity: 0; transform: translateY(-6px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .c { opacity: 0; animation: cell 0.42s cubic-bezier(.2,.8,.2,1) both; }
  </style>

  <defs>
    <linearGradient id="main-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    <mask id="bar-mask">
      <rect x="0" y="0" width="385" height="9" rx="4.5" fill="white"/>
    </mask>
  </defs>

  <!-- Background & Outer Solid White Border -->
  <rect width="869" height="442" rx="12" fill="url(#main-bg)"/>
  <rect x="0.5" y="0.5" width="868" height="441" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  
  <!-- Header Bar -->
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">${username}@github: ~/profile --stats --contributions</text>

  <!-- ════════════════════ TOP SECTION: STATS & LANGUAGES ════════════════════ -->
  <!-- LEFT PANE: GITHUB STATS -->
  <g opacity="0" transform="translate(0,5)">
    <text x="24" y="55" fill="#00FF99" font-size="13.5" font-weight="700">Glenn Joshua Corpus' GitHub Stats</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.12s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.12s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Stat Items with Standardized 16x16 Octicons -->
  <g opacity="0" transform="translate(0,5)">
    <!-- Star Icon -->
    <svg x="24" y="71" width="16" height="16" viewBox="0 0 16 16" fill="#ffa657">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
    </svg>
    <text x="48" y="84" fill="#c9d1d9" font-size="12.5">Total Stars Earned:</text>
    <text x="235" y="84" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalStars}</text>

    <!-- Commit Icon -->
    <svg x="24" y="95" width="16" height="16" viewBox="0 0 16 16" fill="#22d3ee">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.947-.75a3.996 3.996 0 0 0-6.894 0H0v1.5h4.553a3.996 3.996 0 0 0 6.894 0H16v-1.5h-4.553Z"/>
    </svg>
    <text x="48" y="108" fill="#c9d1d9" font-size="12.5">Total Commits:</text>
    <text x="235" y="108" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalCommits.toLocaleString()}</text>

    <!-- PR Icon -->
    <svg x="24" y="119" width="16" height="16" viewBox="0 0 16 16" fill="#a855f7">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677 5.2a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H6.75a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h1.64l-1.22-1.22a.75.75 0 0 1 0-1.06Z M13 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
    </svg>
    <text x="48" y="132" fill="#c9d1d9" font-size="12.5">Total PRs:</text>
    <text x="235" y="132" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalPRs}</text>

    <!-- Issue Icon -->
    <svg x="24" y="143" width="16" height="16" viewBox="0 0 16 16" fill="#f43f5e">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
    </svg>
    <text x="48" y="156" fill="#c9d1d9" font-size="12.5">Total Issues:</text>
    <text x="235" y="156" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.totalIssues}</text>

    <!-- Contributed To Icon -->
    <svg x="24" y="167" width="16" height="16" viewBox="0 0 16 16" fill="#38bdf8">
      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.218.585L8 11.834l-3.782 2.999A.75.75 0 0 1 3 14.25V2.75Z"/>
    </svg>
    <text x="48" y="180" fill="#c9d1d9" font-size="12.5">Contributed to (yr):</text>
    <text x="235" y="180" fill="#ffffff" font-weight="700" font-size="12.5">${STATS.contributedTo}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.2s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.2s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Rank Ring Badge -->
  <g opacity="0" transform="translate(348, 126)">
    <circle cx="0" cy="0" r="38" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#00FF99" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="238" stroke-dashoffset="55" transform="rotate(-90)"/>
    <text x="0" y="-2" fill="#00FF99" font-size="18" font-weight="800" text-anchor="middle">${STATS.rank}</text>
    <text x="0" y="13" fill="#7d8590" font-size="9.5" text-anchor="middle">${STATS.rankPercentile}</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.3s" dur="0.5s" fill="freeze"/>
  </g>

  <!-- Vertical Divider Between Stats & Languages -->
  <line x1="434" y1="38" x2="434" y2="192" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- RIGHT PANE: MOST USED LANGUAGES -->
  <g opacity="0" transform="translate(0,5)">
    <text x="460" y="55" fill="#00FF99" font-size="13.5" font-weight="700">Most Used Languages</text>
    
    <!-- Progress Bar -->
    <g transform="translate(460, 68)" mask="url(#bar-mask)">
      ${barSegments}
    </g>

    <!-- Language Grid Col 1 -->
    <circle cx="466" cy="99" r="4" fill="#f1e05a"/>
    <text x="478" y="103" fill="#c9d1d9" font-size="12">JavaScript</text>
    <text x="590" y="103" fill="#7d8590" font-size="11.5">65.68%</text>

    <circle cx="466" cy="123" r="4" fill="#3178c6"/>
    <text x="478" y="127" fill="#c9d1d9" font-size="12">TypeScript</text>
    <text x="590" y="127" fill="#7d8590" font-size="11.5">15.28%</text>

    <circle cx="466" cy="147" r="4" fill="#563d7c"/>
    <text x="478" y="151" fill="#c9d1d9" font-size="12">CSS</text>
    <text x="590" y="151" fill="#7d8590" font-size="11.5">13.11%</text>

    <circle cx="466" cy="171" r="4" fill="#4F5D95"/>
    <text x="478" y="175" fill="#c9d1d9" font-size="12">PHP</text>
    <text x="590" y="175" fill="#7d8590" font-size="11.5">5.12%</text>

    <!-- Language Grid Col 2 -->
    <circle cx="666" cy="99" r="4" fill="#e34c26"/>
    <text x="678" y="103" fill="#c9d1d9" font-size="12">HTML</text>
    <text x="785" y="103" fill="#7d8590" font-size="11.5">0.38%</text>

    <circle cx="666" cy="123" r="4" fill="#336790"/>
    <text x="678" y="127" fill="#c9d1d9" font-size="12">PLpgSQL</text>
    <text x="785" y="127" fill="#7d8590" font-size="11.5">0.22%</text>

    <circle cx="666" cy="147" r="4" fill="#3572A5"/>
    <text x="678" y="151" fill="#c9d1d9" font-size="12">Python</text>
    <text x="785" y="151" fill="#7d8590" font-size="11.5">0.15%</text>

    <circle cx="666" cy="171" r="4" fill="#89e051"/>
    <text x="678" y="175" fill="#c9d1d9" font-size="12">Shell</text>
    <text x="785" y="175" fill="#7d8590" font-size="11.5">0.06%</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ═══════════════════ MIDDLE HORIZONTAL DIVIDER ═══════════════════ -->
  <line x1="0" y1="202" x2="869" y2="202" stroke="#ffffff" stroke-opacity="0.3"/>

  <!-- ═══════════════════ BOTTOM SECTION: CONTRIBUTIONS ═══════════════════ -->
  <g opacity="0" transform="translate(0,5)">
    <text x="24" y="224" fill="#00FF99" font-size="13.5" font-weight="700">Contribution Activity (Last 12 Months)</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.32s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.32s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  ${monthLabelsSvg}
  <text x="22" y="278.4" fill="#7d8590" font-size="9">Mon</text>
  <text x="22" y="308.4" fill="#7d8590" font-size="9">Wed</text>
  <text x="22" y="338.4" fill="#7d8590" font-size="9">Fri</text>

  <!-- Contribution Cells -->
  ${cellsSvg}

  <!-- Less / More Legend -->
  <text x="711" y="374.6" fill="#7d8590" font-size="10" text-anchor="end">Less</text>
  <rect x="719" y="365" width="11" height="11" rx="2.2" fill="#161b22"/>
  <rect x="731" y="365" width="11" height="11" rx="2.2" fill="#0e4429"/>
  <rect x="743" y="365" width="11" height="11" rx="2.2" fill="#006d32"/>
  <rect x="755" y="365" width="11" height="11" rx="2.2" fill="#26a641"/>
  <rect x="767" y="365" width="11" height="11" rx="2.2" fill="#39d353"/>
  <rect x="779" y="365" width="11" height="11" rx="2.2" fill="#69f0a0"/>
  <text x="795" y="374.6" fill="#7d8590" font-size="10">More</text>

  <!-- Bottom Divider Line -->
  <line x1="0" y1="390" x2="869" y2="390" stroke="#ffffff" stroke-opacity="0.3"/>

  <!-- Footer Metrics -->
  <text x="22" y="412" font-size="12.5" fill="#39d353"><tspan font-weight="700">${formattedTotal}</tspan><tspan fill="#7d8590"> contributions in the last year</tspan></text>
  <text x="847" y="412" font-size="11.5" fill="#7d8590" text-anchor="end">${startDateStr} &#8594; ${endDateStr}</text>
  
  <text x="22" y="430" font-size="12.5" fill="#7d8590">current streak <tspan fill="#22d3ee" font-weight="700">${currentStreak} days</tspan><tspan fill="#7d8590">   &#183;   longest </tspan><tspan fill="#22d3ee" font-weight="700">${longestStreak} days</tspan></text>
  <text x="847" y="430" font-size="11.5" fill="#7d8590" text-anchor="end">best day <tspan fill="#f2cc60" font-weight="700">${bestDay.count}</tspan> on ${bestDay.date}</text>
</svg>`;
}

async function main() {
  console.log(`Fetching contributions for ${USERNAME}...`);
  const data = await fetchContributions(USERNAME);

  const svgContent = generateAllInOneSvg(data, USERNAME);
  const outPath = path.join(__dirname, '..', 'contributions.svg');
  fs.writeFileSync(outPath, svgContent, 'utf8');

  console.log(`Successfully generated master all-in-one SVG at ${outPath}`);
}

main();
