const fs = require('fs');
const path = require('path');

const userAscii = [
  "                             ----------                                                             ",
  "                          =========-------=-                                                        ",
  "                       +==+******+======--===-                                                      ",
  "                      +**####%%##**++++=======--                                                    ",
  "                     ###%%%@@%%%%%##*++++++++==--                                                   ",
  "                     #%%@@@@%%@%%%##*++++++**+=--=                                                  ",
  "                    *%%@@@@@@@@%%%%#*++=---=*+=-:-                                                  ",
  "                    #%%@@@@%%%%%%%#*++===--=**+=---                                                 ",
  "                     %%%%%%%%%%%##*++==-----=+*=--=                                                 ",
  "                     #%%%%%%%%%%##*++++===----=+===                                                 ",
  "                     ##%##%%#######*******+=--=--=                                                  ",
  "                     #%%############*+###*+=-=+-=                                                   ",
  "                     *#######****##*==+++=-----=-                                                   ",
  "                      *######**+*##*=-====-----=                                                    ",
  "                       *#####**+*##*++=+++=----                                                     ",
  "                        *###***####*+===+==---=                                                     ",
  "                        **##***#%%##*++*+==---                                                      ",
  "                       +##########*+=========                                                       ",
  "                      +*%%#######**+========                                                        ",
  "                     #*%@%########*++=======-                                                       ",
  "                   ++%%##%######**+++===-========-                                                  ",
  "                ++*#%%%%%%####****++====++===============-                                          ",
  "           ++++***#%%%%%%%###****+++===**+==================-=                                      ",
  "        **+#%*+*#*#%%%%%%####****+++++*#*+========++++++++++=====                                   ",
  "    ====+++*#%%####%%%%%%#*****+++++++*#*+========++++++++++===+*+                                  ",
  "  =+++***+**##%%%##%%%%%%##*+++++++++##***#%%##*++=++++++**+++==**+                                 ",
  "+*#+*####%#**#%%%%%%%%@%####*++++==+###*****###**++++++++**++++=+##=                                ",
  "##%%#*####%%###%%%%%%%%%%%#***+===+*#**##*******+++++++****+*++++*%*+                               ",
  "%%%%%#*###%%%%%#%%%%%%%%%%%%%#*+=+***%%#**+*****+++++++***+**+*++*##*=                              ",
  "%%%%%%**##%%%%%%%%%#%%%%%%%%%%%%%##%%%#**++****++**++*****+****++*##*+=                             ",
  "%%%%%%#**##%%%%%%%%%%%######%%%%#*%%##**++*****++**+******+#**+++*##*++==                           ",
  "%%%%%%%#####%%%%%%####%########%**####**++*****+**********+##*+++**#*+++==                          ",
  "%%%%%%%%#####%%%%%%#*-#%######%#***###****************++***%#++++*##*++++++                         ",
  "%%%%%@@%%######%%%%##=##########***#########***+*******+*+*#**+++*##*++++++=                        ",
  "%%%%%%@%%%%######%##+*########%#**##########*****##***+*+**##*+++*##*++++++++                       ",
  "%%%%%%@%%%%%%######*+#####**#%%#**#########************+++*##*+++**#*+++++++++                      ",
  "%%%%%%%%%%%%%%####*=====-:::=#%#**######****************++*##*+++****+++++++++==                    ",
  "%%%%%%@@%%%%%%%####***#*=-::-+%#*%%##*******************+*#%#**+********+++*+++==                   ",
  "%%%%%%%@%%%%%%%%########+-::-+%#*###********************+*#%%#**********++++++*#*                   ",
  "#%%%%%%@@%%%%%###########*=-:-*#**###****************#**+*#%%#*************####                     ",
  "%%%%%%%@@@%%###**########+---+***###****************##**+*#%%%%###*****######                       ",
  "%%%%%%@@@%#####****######*=--+****##****************#******#%%%%%###*+==*##                         ",
  "%%%%%@%#*#####%#*****#****++***#*###*******##******##******##%%%%#*+==----                          ",
  "#*******######%#****####*****###**#*****########***##****** ##%#**+++==--:::                        ",
  "******########*+###%%%%%#######%*##****##*****#%***********  ***#*++++==--:::                       ",
  "########*******#%%%%%%%%#######%*************##%#%#********   +*******+==--:::                      ",
  "######********%@%%%%%%%%%######%*************######********    ++*####*++=--::                      ",
  "##**********#%%%%%%%%%%%%##%###%*****#*******####**********     ++**###*++=--::                     ",
  "##**#######%%%%%%%%%%%%%%%%%%##%*****#****#***#*#**********       ++*###*+==--:::                   ",
  "########%%%%%%%%%%%%%%%%%%%%###%**######******#************        =+*###*++=--:::                  ",
  "#####%%%%%%%%%%%%%%%%%%#######%%**#####********************         =++*****+==-:::                 ",
  "##*#%%%%%%%%%%%%%%%%%%####%%%%%@*##***********************+           =++****+==-:::                ",
  "   %%%%%%%%%%%%%%%%%%%%#######%%************#***###*******+             =++***+==-:::               ",
  "   %%%%%%%%%%%%%%%%%%%%#######%%#*****************##******+              ==++***+=-::::             ",
  "  %%%%%%%%%%%%%%%%%%%%%#####%%%%%*#*********###*###*******+                ==++**+=---==-           ",
  "  #%%%%%%%%%%%%%%%%%%%%##%%%%%%%%*#*********#########*****+                  ==+++****++==          ",
  "  #%%%%%%%%%%%%%%%%%%%%%%%%%%#%%%**#*********##**#####***++                    ==+###*++=+=         ",
  "  ##%%%%%%%%%%%%%%%%%%%%%%%%%%%%@**##*********##**#####***+=                    +*##*++=---:---:--  "
];

function generateHeaderSvg() {
  const rowHeight = 9.2;
  const startY = 46;
  const startX = 18;
  const lineWidth = 430;
  const durPerLine = 0.045;

  let clipPaths = '';
  let textRows = '';
  let cursorRects = '';

  userAscii.forEach((line, idx) => {
    const beginTime = (idx * durPerLine).toFixed(3);
    const yPos = startY + idx * rowHeight;
    const clipId = `hr${idx}`;

    clipPaths += `
    <clipPath id="${clipId}">
      <rect x="${startX}" y="${(yPos - 7.5).toFixed(1)}" height="${(rowHeight + 1).toFixed(1)}" width="0">
        <animate attributeName="width" from="0" to="${lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      </rect>
    </clipPath>`;

    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    textRows += `
    <g clip-path="url(#${clipId})">
      <text xml:space="preserve" x="${startX}" y="${yPos.toFixed(1)}" fill="#00FF99" font-size="7.6" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" textLength="${lineWidth}" lengthAdjust="spacing">${escaped}</text>
    </g>`;

    cursorRects += `
    <rect y="${(yPos - 7.5).toFixed(1)}" width="5" height="9" fill="#00FF99" opacity="0">
      <animate attributeName="x" from="${startX}" to="${startX + lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      <set attributeName="opacity" to="0.9" begin="${beginTime}s"/>
      <set attributeName="opacity" to="0" begin="${((idx + 1) * durPerLine).toFixed(3)}s"/>
    </rect>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="625" viewBox="0 0 869 625" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    ${clipPaths}
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="625" rx="12" fill="url(#hbg)"/>
  <rect x="0.5" y="0.5" width="868" height="624" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~$ ./whoami.sh</text>

  <!-- Vertical Divider Between ASCII Portrait & Right Banner Pane -->
  <line x1="458" y1="38" x2="458" y2="580" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- ════════════════════ LEFT PANE: SCANNING ASCII PORTRAIT ════════════════════ -->
  <g>
    ${textRows}
    ${cursorRects}
  </g>

  <!-- ════════════════════ RIGHT PANE: BANNER TYPOGRAPHY & BRAND ════════════════════ -->
  <!-- Top Right Brand matching profile banner 2.png -->
  <g opacity="0">
    <text x="845" y="68" text-anchor="end" font-size="24" font-weight="900" fill="#ffffff">gjcodes<tspan fill="#00FF99">.</tspan></text>
    <animate attributeName="opacity" from="0" to="1" begin="0.3s" dur="0.5s" fill="freeze"/>
  </g>

  <!-- Main Identity Headers -->
  <g opacity="0" transform="translate(0,6)">
    <text x="480" y="135" font-size="28" font-weight="900" fill="#ffffff" letter-spacing="0.5">Glenn Joshua Corpus</text>
    
    <!-- Subtitle Roles matching Profile Banner -->
    <text x="480" y="165" font-size="15" font-weight="800" fill="#00FF99" letter-spacing="3.5">SOFTWARE DEVELOPER</text>
    <text x="480" y="188" font-size="12.5" font-weight="700" fill="#22d3ee" letter-spacing="2">UI/UX DESIGNER · FULL-STACK</text>

    <!-- Horizontal Divider -->
    <line x1="480" y1="210" x2="845" y2="210" stroke="#ffffff" stroke-opacity="0.2"/>

    <!-- Key Highlights / Bio Points -->
    <text x="480" y="240" font-size="12.5" fill="#ffa657" font-weight="700">✦ Academic Distinction</text>
    <text x="480" y="258" font-size="12" fill="#c9d1d9">BSIT Salutatorian · Magna Cum Laude</text>
    <text x="480" y="274" font-size="11" fill="#7d8590">Technological University of the Philippines</text>

    <text x="480" y="310" font-size="12.5" fill="#22d3ee" font-weight="700">✦ Hackathons &amp; Capstone</text>
    <text x="480" y="328" font-size="12" fill="#c9d1d9">🏆 2nd Place · Best Capstone Project 2026</text>
    <text x="480" y="346" font-size="12" fill="#c9d1d9">🏆 4th Place · University Hackathon 2025</text>

    <text x="480" y="382" font-size="12.5" fill="#00FF99" font-weight="700">✦ Technical Focus</text>
    <text x="480" y="400" font-size="12" fill="#c9d1d9">Full-Stack Web, Mobile &amp; Desktop Architecture</text>
    <text x="480" y="418" font-size="12" fill="#c9d1d9">Automation &amp; Orchestration (n8n, CI/CD)</text>

    <!-- Horizontal Divider -->
    <line x1="480" y1="440" x2="845" y2="440" stroke="#ffffff" stroke-opacity="0.2"/>

    <!-- Status Badges -->
    <g transform="translate(480, 460)">
      <rect width="210" height="24" rx="5" fill="#161b22" stroke="#00FF99" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="#00FF99"/>
      <text x="24" y="16.5" fill="#e6edf3" font-size="11" font-weight="600">Available for Roles &amp; Projects</text>
    </g>

    <g transform="translate(480, 494)">
      <rect width="180" height="24" rx="5" fill="#161b22" stroke="#22d3ee" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="#22d3ee"/>
      <text x="24" y="16.5" fill="#e6edf3" font-size="11" font-weight="600">Metro Manila, Philippines</text>
    </g>

    <g transform="translate(480, 528)">
      <rect width="160" height="24" rx="5" fill="#161b22" stroke="#ffa657" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="#ffa657"/>
      <text x="24" y="16.5" fill="#e6edf3" font-size="11" font-weight="600">https://www.gjcodes.me</text>
    </g>

    <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="0.5s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 6" to="0 0" begin="0.5s" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ════════════════════ FOOTER COMMAND BAR ════════════════════ -->
  <line x1="0" y1="588" x2="869" y2="588" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="24" y="608" fill="#7d8590" font-size="13">gjcodess@github:~$ whoami <tspan fill="#00FF99" font-weight="700">Glenn Joshua Corpus</tspan></text>
  <rect x="325" y="596" width="8" height="15" fill="#00FF99">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.51;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

function main() {
  const svg = generateHeaderSvg();
  const outPath = path.join(__dirname, '..', 'header.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated updated header.svg with exact user ASCII portrait at ${outPath}`);
}

main();
