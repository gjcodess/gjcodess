const fs = require('fs');
const path = require('path');

const USERNAME = 'gjcodess';

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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateSvg(data, username = USERNAME) {
  const contribMap = new Map();
  if (data && data.contributions) {
    for (const item of data.contributions) {
      contribMap.set(item.date, item);
    }
  }

  // Determine end date: most recent Saturday (or today if today is Saturday)
  const now = new Date();
  // Adjust to UTC midnight
  const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayOfWeek = nowUtc.getUTCDay(); // 0: Sun, 6: Sat
  
  // Last completed / current week's Saturday
  const endSaturday = new Date(nowUtc);
  if (dayOfWeek < 6) {
    // If today is Sunday..Friday, the week's Saturday was either yesterday or next Saturday
    // In GitHub graphs, Saturday is the end of the last column.
    // If today is Sunday (0), yesterday was Saturday.
    // Otherwise, we can end on the Saturday of the current week or the previous Saturday.
    // Let's end on the Saturday of the current week so today's contributions are included!
    endSaturday.setUTCDate(nowUtc.getUTCDate() + (6 - dayOfWeek));
  }

  // 53 weeks = 53 * 7 = 371 days
  const startSunday = new Date(endSaturday);
  startSunday.setUTCDate(endSaturday.getUTCDate() - 370);

  const startDateStr = startSunday.toISOString().split('T')[0];
  const endDateStr = endSaturday.toISOString().split('T')[0];

  let totalYearContributions = 0;
  let bestDay = { count: 0, date: startDateStr };

  // Generate grid weeks
  const weeks = [];
  const monthLabels = [];
  let lastMonthSeen = -1;

  for (let w = 0; w < 53; w++) {
    const colX = 52 + w * 15;
    const weekDays = [];

    for (let d = 0; d < 7; d++) {
      const curDate = new Date(startSunday);
      curDate.setUTCDate(startSunday.getUTCDate() + (w * 7 + d));
      const dateStr = curDate.toISOString().split('T')[0];
      const month = curDate.getUTCMonth();
      const dayOfMonth = curDate.getUTCDate();

      // Check for month label: if 1st of month falls in this week (or week 0)
      if (dayOfMonth <= 7 && month !== lastMonthSeen && d === 0) {
        monthLabels.push({ x: colX, text: MONTH_NAMES[month] });
        lastMonthSeen = month;
      } else if (dayOfMonth === 1 && month !== lastMonthSeen) {
        monthLabels.push({ x: colX, text: MONTH_NAMES[month] });
        lastMonthSeen = month;
      }

      const item = contribMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      const count = item.count;
      totalYearContributions += count;

      if (count > bestDay.count) {
        bestDay = { count, date: dateStr };
      }

      const rowY = 50 + d * 15;
      const delay = (w * 0.018 + d * 0.045).toFixed(3);
      const color = getColor(count);
      const tooltip = `${dateStr}: ${count} contribution${count === 1 ? '' : 's'}`;

      weekDays.push({
        x: colX,
        y: rowY,
        color,
        delay,
        tooltip
      });
    }
    weeks.push(weekDays);
  }

  // Calculate streaks across all available historical data up to today
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  if (data && data.contributions) {
    const sorted = data.contributions
      .filter(c => c.date <= nowUtc.toISOString().split('T')[0])
      .sort((a, b) => a.date.localeCompare(b.date));

    for (const c of sorted) {
      if (c.count > 0) {
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
    }

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].count > 0) {
        currentStreak++;
      } else {
        // If today has 0 count yet, check if yesterday had streak
        if (i === sorted.length - 1 && sorted[i].date === nowUtc.toISOString().split('T')[0]) {
          continue;
        }
        break;
      }
    }
  }

  // Format month labels SVG
  const monthLabelsSvg = monthLabels
    .map(m => `<text x="${m.x}" y="44" fill="#7d8590" font-size="10">${m.text}</text>`)
    .join('');

  // Format grid cells SVG
  const cellsSvg = weeks
    .flat()
    .map(c => `<rect class="c" x="${c.x}" y="${c.y}" width="12" height="12" rx="2.5" fill="${c.color}" style="animation-delay:${c.delay}s"><title>${c.tooltip}</title></rect>`)
    .join('');

  const formattedTotal = totalYearContributions.toLocaleString();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="265" viewBox="0 0 869 265" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"><style>@keyframes cell {
  0%   { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}
.c { opacity: 0; animation: cell 0.42s cubic-bezier(.2,.8,.2,1) both; }</style><defs><linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F0E1A"/><stop offset="1" stop-color="#090812"/></linearGradient></defs><rect width="869" height="265" rx="12" fill="url(#hbg)"/><rect x="0.5" y="0.5" width="868" height="264" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/><line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/><circle cx="22" cy="15.0" r="5" fill="#ff5f56"/><circle cx="38" cy="15.0" r="5" fill="#ffbd2e"/><circle cx="54" cy="15.0" r="5" fill="#27c93f"/><text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">${username}@github: ~/contributions --graph</text>${monthLabelsSvg}<text x="22" y="74.4" fill="#7d8590" font-size="9">Mon</text><text x="22" y="104.4" fill="#7d8590" font-size="9">Wed</text><text x="22" y="134.4" fill="#7d8590" font-size="9">Fri</text>${cellsSvg}<text x="711" y="170.6" fill="#7d8590" font-size="10" text-anchor="end">Less</text><rect x="719" y="161" width="11" height="11" rx="2.2" fill="#161b22"/><rect x="731" y="161" width="11" height="11" rx="2.2" fill="#0e4429"/><rect x="743" y="161" width="11" height="11" rx="2.2" fill="#006d32"/><rect x="755" y="161" width="11" height="11" rx="2.2" fill="#26a641"/><rect x="767" y="161" width="11" height="11" rx="2.2" fill="#39d353"/><rect x="779" y="161" width="11" height="11" rx="2.2" fill="#69f0a0"/><text x="795" y="170.6" fill="#7d8590" font-size="10">More</text><line x1="0" y1="187" x2="869" y2="187" stroke="#ffffff" stroke-opacity="0.35"/><text x="22" y="211" font-size="13" fill="#39d353"><tspan font-weight="700">${formattedTotal}</tspan><tspan fill="#7d8590"> contributions in the last year</tspan></text><text x="847" y="211" font-size="12" fill="#7d8590" text-anchor="end">${startDateStr} &#8594; ${endDateStr}</text><text x="22" y="235" font-size="13" fill="#7d8590">current streak <tspan fill="#22d3ee" font-weight="700">${currentStreak} days</tspan><tspan fill="#7d8590">   &#183;   longest </tspan><tspan fill="#22d3ee" font-weight="700">${longestStreak} days</tspan></text><text x="847" y="235" font-size="12" fill="#7d8590" text-anchor="end">best day <tspan fill="#f2cc60" font-weight="700">${bestDay.count}</tspan> on ${bestDay.date}</text></svg>`;
}

async function main() {
  console.log(`Fetching contributions for ${USERNAME}...`);
  const data = await fetchContributions(USERNAME);
  if (!data) {
    console.error('No data available. Aborting.');
    process.exit(1);
  }

  const svgContent = generateSvg(data, USERNAME);
  const outputPath = path.join(__dirname, '..', 'contributions.svg');
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated contributions.svg at ${outputPath}`);
}

main();
