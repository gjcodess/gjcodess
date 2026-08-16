const fs = require('fs');
const path = require('path');

function generateHeaderSvg() {
  // 26 calibrated ASCII rows representing Glenn (head, glasses, hair, smile, thumbs up hand, shirt)
  const asciiLines = [
    "             :+c#%%%c*+=              ",
    "           =*%@@@@@@@@%%*=            ",
    "          +#%@@@@@@@@@@@@#+           ",
    "         -#%@@@@@@@@@@@@@@%-          ",
    "         *#@@@@@@@@@@@@@@@@#          ",
    "         *#@@%#%@%#%@%#%@@@#          ",
    "         +##%+-=c%:-=c+-+%#+          ",
    "         =##c:.:==:.:==.:c#=          ",
    "         :##=...:=...:=..=#:          ",
    "          *#+....-:-.-...+#*          ",
    "          -##-....=-=...-##-          ",
    "           +#*=..:===:..=*#           ",
    "            =**+:-===-:+**=           ",
    "       :=+*##%##s+===+s##%##*+=:      ",
    "     -#@@@@@@@@@@#===#@@@@@@@@@@#-    ",
    "    *@@@@@@@@@@@@@c=c@@@@@@@@@@@@@*   ",
    "   *@@@@@@@@@@@@@@s=s@@@@@@@@@@@@@@*  ",
    "  +@@@@@@@@@@@@@@@c=c@@@@@@@@@@@@@@@+ ",
    " -@@@#++%@@@@@@@@#===#@@@@@@@@%++#@@@-",
    " %@@*   +@@@@@@@@c===c@@@@@@@@+   *@@%",
    " @@@-   =@@@@@@@@s===s@@@@@@@@=   -@@@",
    " @@@*   *@@@@@@@@#===#@@@@@@@@*   *@@@",
    " #@@#==+#@@@@@@@@c===c@@@@@@@@#+==#@@#",
    " -%@@@@@@@@@@@@@@s===s@@@@@@@@@@@@@@%-",
    "  -*%@@@@@@@@@@@@#===#@@@@@@@@@@@@%*- ",
    "    :=+*#%%%@@@@@c===c@@@@@%%%#*+=:   "
  ];

  const rowHeight = 10.5;
  const startY = 46;
  const startX = 24;
  const lineWidth = 360;
  const durPerLine = 0.08;

  let clipPaths = '';
  let textRows = '';
  let cursorRects = '';

  asciiLines.forEach((line, idx) => {
    const beginTime = (idx * durPerLine).toFixed(3);
    const yPos = startY + idx * rowHeight;
    const clipId = `hr${idx}`;

    // Clip path that expands from width 0 to lineWidth
    clipPaths += `
    <clipPath id="${clipId}">
      <rect x="${startX}" y="${yPos - 8.5}" height="${rowHeight + 1}" width="0">
        <animate attributeName="width" from="0" to="${lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      </rect>
    </clipPath>`;

    // Text element clipped by clipPath
    textRows += `
    <g clip-path="url(#${clipId})">
      <text xml:space="preserve" x="${startX}" y="${yPos}" fill="#00FF99" font-size="10.5" font-family="ui-monospace, monospace" textLength="${lineWidth}" lengthAdjust="spacing">${line.replace(/&/g, '&amp;')}</text>
    </g>`;

    // Moving typewriter cursor for each line
    cursorRects += `
    <rect y="${yPos - 8}" width="6" height="10" fill="#00FF99" opacity="0">
      <animate attributeName="x" from="${startX}" to="${startX + lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      <set attributeName="opacity" to="0.9" begin="${beginTime}s"/>
      <set attributeName="opacity" to="0" begin="${((idx + 1) * durPerLine).toFixed(3)}s"/>
    </rect>`;
  });

  const totalScanTime = (asciiLines.length * durPerLine).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="360" viewBox="0 0 869 360" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00FF99"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    ${clipPaths}
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="360" rx="12" fill="url(#hbg)"/>
  <rect x="0.5" y="0.5" width="868" height="359" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~$ ./whoami.sh</text>

  <!-- Vertical Divider Between Portrait & Banner Content -->
  <line x1="410" y1="38" x2="410" y2="315" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- ════════════════════ LEFT PANE: SCANNING ASCII PORTRAIT ════════════════════ -->
  <g>
    ${textRows}
    ${cursorRects}
  </g>

  <!-- ════════════════════ RIGHT PANE: BANNER TYPOGRAPHY ════════════════════ -->
  <!-- Top Right Brand -->
  <g opacity="0">
    <text x="845" y="65" text-anchor="end" font-size="22" font-weight="900" fill="#ffffff">gjcodes<tspan fill="#00FF99">.</tspan></text>
    <animate attributeName="opacity" from="0" to="1" begin="0.3s" dur="0.5s" fill="freeze"/>
  </g>

  <!-- Main Name Header -->
  <g opacity="0" transform="translate(0,6)">
    <text x="440" y="125" font-size="26" font-weight="900" fill="#ffffff" letter-spacing="0.5">Glenn Joshua Corpus</text>
    
    <!-- Subtitle Roles matching Profile Banner -->
    <text x="440" y="152" font-size="13" font-weight="700" fill="#00FF99" letter-spacing="3.5">SOFTWARE DEVELOPER</text>
    <text x="440" y="172" font-size="11.5" font-weight="600" fill="#22d3ee" letter-spacing="2">UI/UX DESIGNER · FULL-STACK</text>

    <!-- Bio Summary -->
    <text x="440" y="204" font-size="11.5" fill="#c9d1d9">
      <tspan x="440" dy="0">✦ BSIT Salutatorian · Magna Cum Laude @ TUP Manila</tspan>
      <tspan x="440" dy="19">✦ Crafting high-performance web, mobile &amp; desktop apps</tspan>
      <tspan x="440" dy="19">✦ Specializing in React, Next.js, Node.js &amp; UI/UX Systems</tspan>
    </text>

    <!-- Status Badges -->
    <g transform="translate(440, 264)">
      <rect width="180" height="22" rx="5" fill="#161b22" stroke="#00FF99" stroke-opacity="0.4" stroke-width="1"/>
      <circle cx="10" cy="11" r="3.5" fill="#00FF99"/>
      <text x="20" y="15" fill="#e6edf3" font-size="10.5" font-weight="600">Available for Roles / Contracts</text>
    </g>

    <g transform="translate(630, 264)">
      <rect width="130" height="22" rx="5" fill="#161b22" stroke="#22d3ee" stroke-opacity="0.4" stroke-width="1"/>
      <circle cx="10" cy="11" r="3.5" fill="#22d3ee"/>
      <text x="20" y="15" fill="#e6edf3" font-size="10.5" font-weight="600">Manila, Philippines</text>
    </g>

    <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="0.5s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 6" to="0 0" begin="0.5s" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ════════════════════ FOOTER COMMAND BAR ════════════════════ -->
  <line x1="0" y1="322" x2="869" y2="322" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="24" y="343" fill="#7d8590" font-size="12.5">gjcodess@github:~$ whoami <tspan fill="#00FF99" font-weight="700">Glenn Joshua Corpus</tspan></text>
  <rect x="315" y="331" width="8" height="15" fill="#00FF99">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.51;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

function main() {
  const svg = generateHeaderSvg();
  const outPath = path.join(__dirname, '..', 'header.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated header.svg at ${outPath}`);
}

main();
