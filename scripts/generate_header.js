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
  const totalHeight = 390;
  const rowHeight = 5.35;
  const startY = 44;
  const startX = 20;
  const lineWidth = 390;
  const durPerLine = 0.035;

  let clipPaths = '';
  let textRows = '';
  let cursorRects = '';

  userAscii.forEach((line, idx) => {
    const beginTime = (idx * durPerLine).toFixed(3);
    const yPos = startY + idx * rowHeight;
    const clipId = `hr${idx}`;

    clipPaths += `
    <clipPath id="${clipId}">
      <rect x="${startX}" y="${(yPos - 4.4).toFixed(2)}" height="${(rowHeight + 0.8).toFixed(2)}" width="0">
        <animate attributeName="width" from="0" to="${lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      </rect>
    </clipPath>`;

    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    textRows += `
    <g clip-path="url(#${clipId})">
      <text xml:space="preserve" x="${startX}" y="${yPos.toFixed(2)}" fill="#ffffff" font-size="4.9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" textLength="${lineWidth}" lengthAdjust="spacing">${escaped}</text>
    </g>`;

    cursorRects += `
    <rect y="${(yPos - 4.4).toFixed(2)}" width="4" height="5.6" fill="#ffffff" opacity="0">
      <animate attributeName="x" from="${startX}" to="${startX + lineWidth}" begin="${beginTime}s" dur="${durPerLine}s" fill="freeze"/>
      <set attributeName="opacity" to="0.9" begin="${beginTime}s"/>
      <set attributeName="opacity" to="0" begin="${((idx + 1) * durPerLine).toFixed(3)}s"/>
    </rect>`;
  });

  // Read and base64-encode title-logo.png
  const logoPath = path.join(__dirname, '..', 'title-logo.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="${totalHeight}" viewBox="0 0 869 ${totalHeight}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
    ${clipPaths}
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="${totalHeight}" rx="12" fill="url(#hbg)"/>
  <rect x="0.5" y="0.5" width="868" height="${totalHeight - 1}" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">gjcodess@github: ~$ ./whoami.sh</text>

  <!-- ════════════════════ LEFT PANE: SCANNING WHITE ASCII PORTRAIT ════════════════════ -->
  <g>
    ${textRows}
    ${cursorRects}
  </g>

  <!-- ════════════════════ RIGHT PANE: BANNER DESIGN ════════════════════ -->
  <!-- Top Right Brand: title-logo.png direct asset -->
  <g opacity="0">
    <image href="${logoDataUri}" x="705" y="50" width="134" height="45" preserveAspectRatio="xMidYMid meet"/>
    <animate attributeName="opacity" from="0" to="1" begin="0.2s" dur="0.4s" fill="freeze"/>
  </g>

  <!-- Bottom Right: Right-Aligned Name & Role (original monospace styling) -->
  <g opacity="0" transform="translate(0,6)">
    <text x="835" y="285" text-anchor="end" font-size="32" font-weight="900" fill="#ffffff" letter-spacing="0.5">Glenn Joshua Corpus</text>
    <text x="835" y="318" text-anchor="end" font-size="16" font-weight="700" fill="#00FF99" letter-spacing="4.5">SOFTWARE DEVELOPER</text>
    <animate attributeName="opacity" from="0" to="1" begin="0.4s" dur="0.5s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 6" to="0 0" begin="0.4s" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ════════════════════ FOOTER COMMAND BAR ════════════════════ -->
  <line x1="0" y1="${totalHeight - 35}" x2="869" y2="${totalHeight - 35}" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="24" y="${totalHeight - 12}" fill="#7d8590" font-size="12.5" xml:space="preserve">gjcodess@github:~$ whoami <tspan fill="#00FF99" font-weight="700">Glenn Joshua Corpus</tspan> <tspan fill="#00FF99" font-weight="900">█<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.51;1" dur="1s" repeatCount="indefinite"/></tspan></text>
</svg>`;
}

function main() {
  const svg = generateHeaderSvg();
  const outPath = path.join(__dirname, '..', 'header.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated valid header.svg at ${outPath}`);
}

main();
