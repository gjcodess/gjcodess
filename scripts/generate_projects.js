const fs = require('fs');
const path = require('path');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapText(text, maxChars = 52) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function generateProjectsSvg() {
  const cardWidth = 403;
  const cardHeight = 150;
  const gap = 15;

  const leftX = 24;
  const rightX = leftX + cardWidth + gap; // 24 + 403 + 15 = 442 (right reaches 845)

  const row1Y = 56;
  const row2Y = row1Y + cardHeight + gap; // 56 + 150 + 15 = 221
  const row3Y = row2Y + cardHeight + gap; // 221 + 150 + 15 = 386

  const projects = [
    {
      title: "📱 Abono App",
      badge: "⭐ Production",
      badgeColor: "#00FF99",
      desc: "Mobile-first, offline-first shared expense tracker & debt simplifier for friend groups with real-time syncing.",
      tech: ["React Native", "Expo", "Supabase", "Zustand"],
      links: "🌐 abono.website",
      x: leftX,
      y: row1Y,
      w: cardWidth,
      h: cardHeight
    },
    {
      title: "🏢 LaborConnect",
      badge: "🏆 2nd Place Capstone",
      badgeColor: "#ffa657",
      desc: "Labor union system with member portal, department ticketing, AI features, Stripe payments & n8n automation.",
      tech: ["React", "Node.js", "MySQL", "n8n", "Stripe"],
      links: "🌐 laborconnect.app · 💻 Repo",
      x: rightX,
      y: row1Y,
      w: cardWidth,
      h: cardHeight
    },
    {
      title: "💻 RDS AutoBill",
      badge: "⚡ Client Project",
      badgeColor: "#22d3ee",
      desc: "Offline-first desktop billing & sales invoicing software for a pharmaceutical distributor with cloud sync.",
      tech: ["Electron", "React", "Tailwind", "Supabase"],
      links: "💼 Client Production",
      x: leftX,
      y: row2Y,
      w: cardWidth,
      h: cardHeight
    },
    {
      title: "🛒 Gcorp. Store",
      badge: "🔐 JWT + 2FA",
      badgeColor: "#a855f7",
      desc: "Full-stack e-commerce marketplace featuring 2FA auth, voucher discounts, reviews, and automated inventory.",
      tech: ["React", "Express.js", "MySQL", "JWT"],
      links: "💻 WebDev_Project",
      x: rightX,
      y: row2Y,
      w: cardWidth,
      h: cardHeight
    },
    {
      title: "🍜 kAIn Mobile UI/UX",
      badge: "🏆 4th Place Hackathon",
      badgeColor: "#ffa657",
      desc: "AI-powered smart food discovery and gamified recommendation mobile app design with interactive user flows.",
      tech: ["Figma", "Design Systems", "Prototyping"],
      links: "🎨 Figma Prototype",
      x: leftX,
      y: row3Y,
      w: cardWidth,
      h: cardHeight
    },
    {
      title: "📚 MangaVerse UI/UX",
      badge: "🎨 Comics Concept",
      badgeColor: "#a855f7",
      desc: "Anime-inspired manga discovery and reading application concept featuring immersive dark-mode ergonomics.",
      tech: ["Figma", "UI/UX Design", "Wireframes"],
      links: "🎨 Figma Prototype",
      x: rightX,
      y: row3Y,
      w: cardWidth,
      h: cardHeight
    }
  ];

  const TECH_COLORS = {
    "React Native": "#61DAFB",
    "Expo": "#ffffff",
    "Supabase": "#3FCF8E",
    "Zustand": "#764ABC",
    "React": "#61DAFB",
    "Node.js": "#339933",
    "MySQL": "#4479A1",
    "n8n": "#EA4B71",
    "Stripe": "#635BFF",
    "Electron": "#9FEAF9",
    "Tailwind": "#38B2AC",
    "Express.js": "#ffffff",
    "JWT": "#D63AFF",
    "Figma": "#F24E1E",
    "Design Systems": "#00FF99",
    "Prototyping": "#22d3ee",
    "UI/UX Design": "#a855f7",
    "Wireframes": "#ffa657"
  };

  const cardsSvg = projects.map((p, idx) => {
    const delay = (0.15 + idx * 0.08).toFixed(2);
    
    // Wrap description text properly without cutting words
    const descLines = wrapText(p.desc, 54);
    const descTspans = descLines.map((line, i) => 
      `<tspan x="${p.x + 16}" dy="${i === 0 ? 0 : 16}">${escapeXml(line)}</tspan>`
    ).join('');

    // Tech pills
    let pillX = p.x + 16;
    const pillY = p.y + 88;
    const pills = p.tech.map(t => {
      const w = t.length * 6.8 + 18;
      const curX = pillX;
      pillX += w + 6;
      const color = TECH_COLORS[t] || "#58a6ff";
      return `
        <rect x="${curX}" y="${pillY}" width="${w.toFixed(1)}" height="19" rx="4.5" fill="#21262d" stroke="#30363d" stroke-width="0.8"/>
        <circle cx="${curX + 7}" cy="${pillY + 9.5}" r="2.5" fill="${color}"/>
        <text x="${curX + 13}" y="${pillY + 13.5}" fill="#e6edf3" font-size="10" font-weight="500">${escapeXml(t)}</text>
      `;
    }).join('');

    const badgeWidth = p.badge.length * 6.6 + 16;

    return `
    <g opacity="0" transform="translate(0,5)">
      <!-- Card Container -->
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="#161b22" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1"/>
      
      <!-- Card Header -->
      <text x="${p.x + 16}" y="${p.y + 26}" fill="#00FF99" font-size="14" font-weight="700">${escapeXml(p.title)}</text>
      
      <!-- Badge -->
      <rect x="${(p.x + p.w - 16 - badgeWidth).toFixed(1)}" y="${p.y + 13}" width="${badgeWidth.toFixed(1)}" height="18" rx="4" fill="#0d1117" stroke="${p.badgeColor}" stroke-opacity="0.6" stroke-width="1"/>
      <text x="${(p.x + p.w - 16 - badgeWidth / 2).toFixed(1)}" y="${p.y + 25.5}" fill="${p.badgeColor}" font-size="10" font-weight="700" text-anchor="middle">${escapeXml(p.badge)}</text>

      <!-- Description -->
      <text x="${p.x + 16}" y="${p.y + 48}" fill="#c9d1d9" font-size="11.5">
        ${descTspans}
      </text>

      <!-- Tech Stack Pills -->
      ${pills}

      <!-- Links / Status Bar -->
      <line x1="${p.x + 16}" y1="${p.y + 118}" x2="${p.x + p.w - 16}" y2="${p.y + 118}" stroke="#30363d" stroke-width="0.8"/>
      <text x="${p.x + 16}" y="${p.y + 136}" fill="#22d3ee" font-size="11" font-weight="600">🔗 ${escapeXml(p.links)}</text>

      <animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.4s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="${delay}s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="588" viewBox="0 0 869 588" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <!-- Background & Window Border (Top rounded 12px, Bottom flat 0px to connect with banner) -->
  <path d="M 0,12 A 12,12 0 0 1 12,0 L 857,0 A 12,12 0 0 1 869,12 L 869,588 L 0,588 Z" fill="url(#pbg)"/>
  <path d="M 0.5,12 A 11.5,11.5 0 0 1 12,0.5 L 857,0.5 A 11.5,11.5 0 0 1 868.5,12 L 868.5,587.5 L 0.5,587.5 Z" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~/featured-projects --grid</text>

  <!-- Project Cards Grid -->
  ${cardsSvg}

  <!-- Footer Divider Line -->
  <line x1="0" y1="550" x2="869" y2="550" stroke="#ffffff" stroke-opacity="0.3"/>

  <!-- Footer Metrics -->
  <text x="24" y="570" font-size="12" fill="#00FF99">✦ <tspan fill="#7d8590">Featured Projects: </tspan><tspan fill="#c9d1d9" font-weight="700">Full-Stack Apps · Mobile · Desktop · UI/UX</tspan></text>
  <text x="845" y="570" font-size="12" fill="#7d8590" text-anchor="end">status: <tspan fill="#22d3ee" font-weight="700">active development</tspan></text>
</svg>`;
}

function main() {
  const svg = generateProjectsSvg();
  const outPath = path.join(__dirname, '..', 'projects.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully regenerated projects.svg at ${outPath}`);
}

main();
