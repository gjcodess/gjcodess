const fs = require('fs');
const path = require('path');

function generateAbonoBannerSvg() {
  const rootDir = path.join(__dirname, '..');
  
  // Prefer optimized 2x image for fast load & Camo 5MB limits, fallback to original AbonoApp.png
  let imgPath = path.join(rootDir, 'AbonoApp_opt.png');
  let mimeType = 'image/png';
  if (!fs.existsSync(imgPath)) {
    imgPath = path.join(rootDir, 'AbonoApp.png');
  }

  const imgBuffer = fs.readFileSync(imgPath);
  const base64Data = imgBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const width = 869;
  const height = 489;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <clipPath id="card-clip">
      <path d="M 0,0 L ${width},0 L ${width},${height - 12} A 12,12 0 0 1 ${width - 12},${height} L 12,${height} A 12,12 0 0 1 0,${height - 12} Z"/>
    </clipPath>
  </defs>

  <!-- Banner Poster Image with Bottom Rounded Corners (Top flat to connect with projects.svg) -->
  <image href="${dataUri}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#card-clip)"/>

  <!-- Outer Solid White Border (Top flat 0px, Bottom rounded 12px) -->
  <path d="M 0.5,0.5 L ${width - 0.5},0.5 L ${width - 0.5},${height - 12.5} A 12,12 0 0 1 ${width - 12.5},${height - 0.5} L 12.5,${height - 0.5} A 12,12 0 0 1 0.5,${height - 12.5} Z" fill="none" stroke="#ffffff" stroke-width="1.2"/>
</svg>`;

  const outPath = path.join(rootDir, 'abono_banner.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated abono_banner.svg at ${outPath}`);
}

generateAbonoBannerSvg();
