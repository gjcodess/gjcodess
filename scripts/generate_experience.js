const fs = require('fs');
const path = require('path');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapText(text, maxChars = 110) {
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

const TECH_COLORS = {
  'Electron': '#9FEAF9',
  'React': '#61DAFB',
  'Supabase': '#3FCF8E',
  'TailwindCSS': '#38B2AC',
  'Node.js': '#339933',
  'CSS': '#563d7c',
  'MySQL': '#4479A1',
  'n8n': '#EA4B71',
  'Vercel': '#ffffff',
  'Railway': '#a855f7',
  'IT Support': '#00FF99',
  'Computer Assembly': '#ffa657',
  'Troubleshooting': '#22d3ee',
  'Video Editing': '#a855f7',
  'Graphic Design': '#f43f5e',
  'Figma': '#F24E1E'
};

const workExperience = [
  {
    title: "Application Developer (Contract)",
    org: "Rameson Distribution Inc.",
    badge: "JUN 2026 — PRESENT",
    badgeColor: "#00FF99",
    bullets: [
      "Contracted Application Developer responsible for developing and maintaining a custom business management system.",
      "Developed a centralized application supporting sales, invoicing, inventory, customer management, and business operations.",
      "Implemented a cloud-based database using Supabase with multi-user access and Role-Based Access Control (RBAC).",
      "Continuously enhance, maintain, and troubleshoot the system based on business requirements and operational needs.",
      "Provide ongoing development and technical support under a monthly contract."
    ],
    tech: ["Electron", "React", "Supabase", "TailwindCSS"],
    footer: "💼 Contract Production System · Custom Business Suite"
  },
  {
    title: "Junior IT Specialist & Web Developer (Internship)",
    org: "Associated Labor Unions — Luzon",
    badge: "FEB 2026 — APR 2026",
    badgeColor: "#ffa657",
    bullets: [
      "Developed LaborConnect, a full-stack labor union management system featuring membership management, venue booking, ticketing, and workflow automation modules.",
      "Resolved hardware, software, and network issues for employees, improving operational continuity and reducing technical downtime.",
      "Collaborated with senior IT personnel on troubleshooting, system maintenance, and web application development initiatives."
    ],
    tech: ["React", "Node.js", "CSS", "MySQL", "n8n", "Vercel", "Railway", "IT Support"],
    footer: "💼 486-Hour Internship · LaborConnect Enterprise System"
  },
  {
    title: "Technical Support & Designer (Freelance)",
    org: "Self-Employed",
    badge: "2019 — 2026",
    badgeColor: "#22d3ee",
    bullets: [
      "Executed computer building commissions, complete Windows/Ubuntu operating system configurations, and routine hardware troubleshooting.",
      "Designed compelling marketing materials, including digital assets and physical prints for local businesses and clothing brands.",
      "Edited multimedia projects and short films, achieving the \"Best Video Edit\" award in 2024 for exceptional post-production quality."
    ],
    tech: ["Computer Assembly", "Troubleshooting", "Video Editing", "Graphic Design", "Figma"],
    footer: "🏆 Awarded \"Best Video Edit\" (2024) · Hardware & UI/UX"
  }
];

const education = [
  {
    title: "Bachelor of Science in Information Technology",
    org: "Technological University of the Philippines, Manila",
    badge: "EXPECTED AUG 2026",
    badgeColor: "#00FF99",
    bullets: [
      "TUP-Manila Class of 2026 Salutatorian",
      "Ranked 2nd in Overall Batch Ranking",
      "Ranked 2nd in College of Science Department",
      "Ranked 1st in BS Information Technology Program",
      "Magna Cum Laude",
      "Consistent President's Lister"
    ],
    tech: [],
    footer: "🎓 Salutatorian · Magna Cum Laude · Rank 1 BSIT Program"
  },
  {
    title: "Senior High School — Science, Technology, Engineering, & Math (STEM)",
    org: "San Juan de Dios Educational Foundation Inc., Pasay",
    badge: "2020 — 2022",
    badgeColor: "#ffa657",
    bullets: [
      "Graduated with High Honors",
      "Ranked 1st in Batch and Strand Ranking (A.Y. 2020-2021)"
    ],
    tech: [],
    footer: "🎓 High Honors · Ranked 1st in Batch & STEM Strand"
  },
  {
    title: "Junior High School",
    org: "Parañaque National High School — Baclaran, Parañaque",
    badge: "2016 — 2020",
    badgeColor: "#22d3ee",
    bullets: [
      "Completed with High Honors (Valedictorian)",
      "Ranked 1st among Grade 10 students (A.Y. 2020)"
    ],
    tech: [],
    footer: "🎓 Valedictorian · High Honors · Ranked 1st in Grade 10"
  }
];

function generateExperienceSvg() {
  const cardX = 24;
  const cardWidth = 821;
  let currentY = 54;

  let elementsSvg = '';
  let animIndex = 0;

  function renderSection(sectionTitle, sectionIcon, titleColor, items) {
    const titleText = `${sectionIcon} ${sectionTitle}`;
    const textWidthEstimate = sectionTitle.length * 8.8 + 42;
    const lineStartX = Math.min(845, Math.round(24 + textWidthEstimate + 16));

    // Section Header
    elementsSvg += `
    <g opacity="0" transform="translate(0,5)">
      <text x="24" y="${currentY + 16}" fill="${titleColor}" font-size="14" font-weight="700">${escapeXml(titleText)}</text>
      <line x1="${lineStartX}" y1="${currentY + 11}" x2="845" y2="${currentY + 11}" stroke="#ffffff" stroke-opacity="0.2"/>
      <animate attributeName="opacity" from="0" to="1" begin="${(0.1 + animIndex * 0.05).toFixed(2)}s" dur="0.4s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="${(0.1 + animIndex * 0.05).toFixed(2)}s" dur="0.4s" fill="freeze"/>
    </g>`;
    animIndex++;

    currentY += 32;

    items.forEach((item) => {
      const itemTopY = currentY;
      const innerPaddingX = 20;
      const textStartX = cardX + innerPaddingX;

      // Wrap bullets
      const bulletBlocks = item.bullets.map(b => wrapText(b, 110));
      let totalBulletLines = 0;
      bulletBlocks.forEach(lines => totalBulletLines += lines.length);

      const headerHeight = 56; // title + org + gaps
      const bulletsHeight = totalBulletLines * 17.5 + (bulletBlocks.length - 1) * 3;
      const pillsHeight = item.tech && item.tech.length > 0 ? 32 : 0;
      const footerBarHeight = 28;
      const cardHeight = headerHeight + bulletsHeight + pillsHeight + footerBarHeight + 20;

      // Badge calculation (top-right of card)
      const badgeWidth = item.badge.length * 6.8 + 18;
      const badgeX = cardX + cardWidth - innerPaddingX - badgeWidth;
      const badgeY = itemTopY + 14;

      // Tech Pills rendering
      let pillsSvg = '';
      if (item.tech && item.tech.length > 0) {
        let pillX = textStartX;
        const pillY = itemTopY + headerHeight + bulletsHeight + 10;
        
        pillsSvg = item.tech.map(t => {
          const w = t.length * 6.8 + 18;
          const curX = pillX;
          pillX += w + 6;
          const dotColor = TECH_COLORS[t] || '#58a6ff';
          return `
            <rect x="${curX.toFixed(1)}" y="${pillY}" width="${w.toFixed(1)}" height="19" rx="4.5" fill="#21262d" stroke="#30363d" stroke-width="0.8"/>
            <circle cx="${(curX + 7).toFixed(1)}" cy="${pillY + 9.5}" r="2.5" fill="${dotColor}"/>
            <text x="${(curX + 13).toFixed(1)}" y="${pillY + 13.5}" fill="#e6edf3" font-size="10" font-weight="500">${escapeXml(t)}</text>
          `;
        }).join('');
      }

      // Bullets rendering (All lines consistently colored #c9d1d9)
      let bulletContentY = itemTopY + headerHeight + 8;
      let bulletsSvg = '';
      bulletBlocks.forEach(lines => {
        lines.forEach((line, lineIdx) => {
          if (lineIdx === 0) {
            bulletsSvg += `
              <text x="${textStartX}" y="${bulletContentY}" fill="#22d3ee" font-size="11.5" font-weight="700">▸</text>
              <text x="${textStartX + 14}" y="${bulletContentY}" fill="#c9d1d9" font-size="11.5">${escapeXml(line)}</text>
            `;
          } else {
            bulletsSvg += `
              <text x="${textStartX + 14}" y="${bulletContentY}" fill="#c9d1d9" font-size="11.5">${escapeXml(line)}</text>
            `;
          }
          bulletContentY += 17.5;
        });
        bulletContentY += 3;
      });

      const lineY = itemTopY + cardHeight - 28;
      const footerTextY = itemTopY + cardHeight - 11;

      const delay = (0.15 + animIndex * 0.06).toFixed(2);
      animIndex++;

      elementsSvg += `
      <g opacity="0" transform="translate(0,5)">
        <!-- Card Container (Matching Featured Projects cards exactly) -->
        <rect x="${cardX}" y="${itemTopY}" width="${cardWidth}" height="${cardHeight}" rx="8" fill="#161b22" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1"/>

        <!-- Role / Title -->
        <text x="${textStartX}" y="${itemTopY + 28}" fill="#00FF99" font-size="14" font-weight="700">${escapeXml(item.title)}</text>

        <!-- Organization / Institution Subtitle -->
        <text x="${textStartX}" y="${itemTopY + 48}" fill="#ffa657" font-size="12" font-weight="600">${escapeXml(item.org)}</text>

        <!-- Date Badge (Top-Right) -->
        <rect x="${badgeX.toFixed(1)}" y="${badgeY}" width="${badgeWidth.toFixed(1)}" height="19" rx="4.5" fill="#0d1117" stroke="${item.badgeColor}" stroke-opacity="0.6" stroke-width="1"/>
        <text x="${(badgeX + badgeWidth / 2).toFixed(1)}" y="${badgeY + 13}" fill="${item.badgeColor}" font-size="10" font-weight="700" text-anchor="middle">${escapeXml(item.badge)}</text>

        <!-- Bullets -->
        ${bulletsSvg}

        <!-- Tech Stack Pills -->
        ${pillsSvg}

        <!-- Inner Card Divider Line & Footer Status -->
        <line x1="${textStartX}" y1="${lineY}" x2="${cardX + cardWidth - innerPaddingX}" y2="${lineY}" stroke="#30363d" stroke-width="0.8"/>
        <text x="${textStartX}" y="${footerTextY}" fill="#22d3ee" font-size="11" font-weight="600">${escapeXml(item.footer)}</text>

        <animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.4s" fill="freeze"/>
        <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="${delay}s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
      </g>`;

      currentY += cardHeight + 14;
    });

    currentY += 8;
  }

  renderSection("Work Experience", "💼", "#00FF99", workExperience);
  renderSection("Education & Academic Honors", "🎓", "#00FF99", education);

  const totalHeight = Math.round(currentY + 24);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="${totalHeight}" viewBox="0 0 869 ${totalHeight}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="ebg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <!-- Background & Window Border (Matching all profile SVGs) -->
  <rect width="869" height="${totalHeight}" rx="12" fill="url(#ebg)"/>
  <rect x="0.5" y="0.5" width="868" height="${totalHeight - 1}" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  
  <!-- Window Header Bar & Controls -->
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~/experience-and-education</text>

  <!-- Cards Section Grid -->
  ${elementsSvg}

  <!-- Footer Divider Line & Status -->
  <line x1="0" y1="${totalHeight - 34}" x2="869" y2="${totalHeight - 34}" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="24" y="${totalHeight - 13}" font-size="12" fill="#00FF99">✦ <tspan fill="#7d8590">Career &amp; Academic Background: </tspan><tspan fill="#c9d1d9" font-weight="700">Full-Stack Development · Systems · Honors</tspan></text>
  <text x="845" y="${totalHeight - 13}" font-size="12" fill="#7d8590" text-anchor="end">status: <tspan fill="#22d3ee" font-weight="700">verified credentials</tspan></text>
</svg>`;
}

function main() {
  const svg = generateExperienceSvg();
  const outPath = path.join(__dirname, '..', 'experience.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated experience.svg matching repo design at ${outPath}`);
}

main();
