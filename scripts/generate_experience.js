const fs = require('fs');
const path = require('path');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapText(text, maxChars = 86) {
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
    date: "JUN 2026 — PRESENT",
    title: "Application Developer (Contract)",
    org: "Rameson Distribution Inc.",
    bullets: [
      "Contracted Application Developer responsible for developing and maintaining a custom business management system.",
      "Developed a centralized application supporting sales, invoicing, inventory, customer management, and business operations.",
      "Implemented a cloud-based database using Supabase with multi-user access and Role-Based Access Control (RBAC).",
      "Continuously enhance, maintain, and troubleshoot the system based on business requirements and operational needs.",
      "Provide ongoing development and technical support under a monthly contract."
    ],
    tech: ["Electron", "React", "Supabase", "TailwindCSS"]
  },
  {
    date: "FEB 2026 — APR 2026",
    title: "Junior IT Specialist & Web Developer (Internship)",
    org: "Associated Labor Unions — Luzon",
    bullets: [
      "Developed LaborConnect, a full-stack labor union management system featuring membership management, venue booking, ticketing, and workflow automation modules.",
      "Resolved hardware, software, and network issues for employees, improving operational continuity and reducing technical downtime.",
      "Collaborated with senior IT personnel on troubleshooting, system maintenance, and web application development initiatives."
    ],
    tech: ["React", "Node.js", "CSS", "MySQL", "n8n", "Vercel", "Railway", "IT Support"]
  },
  {
    date: "2019 — 2026",
    title: "Technical Support & Designer (Freelance)",
    org: "Self-Employed",
    bullets: [
      "Executed computer building commissions, complete Windows/Ubuntu operating system configurations, and routine hardware troubleshooting.",
      "Designed compelling marketing materials, including digital assets and physical prints for local businesses and clothing brands.",
      "Edited multimedia projects and short films, achieving the \"Best Video Edit\" award in 2024 for exceptional post-production quality."
    ],
    tech: ["Computer Assembly", "Troubleshooting", "Video Editing", "Graphic Design", "Figma"]
  }
];

const education = [
  {
    date: "EXPECTED AUG 2026",
    title: "College - Bachelor of Science in Information Technology",
    org: "Technological University of the Philippines, Manila",
    bullets: [
      "TUP-Manila Class of 2026 Salutatorian",
      "Ranked 2nd in Overall Batch Ranking",
      "Ranked 2nd in College of Science Department",
      "Ranked 1st in BS Information Technology Program",
      "Magna Cum Laude",
      "Consistent President's Lister"
    ],
    tech: []
  },
  {
    date: "2020 — 2022",
    title: "Senior High School - Science, Technology, Engineering, and Mathematics",
    org: "San Juan de Dios Educational Foundation Inc., Pasay",
    bullets: [
      "Graduated with High Honors",
      "Ranked 1st in Batch and Strand Ranking (A.Y. 2020-2021)"
    ],
    tech: []
  },
  {
    date: "2016 — 2020",
    title: "Junior High School",
    org: "Parañaque National High School — Baclaran, Parañaque",
    bullets: [
      "Completed with High Honors (Valedictorian)",
      "Ranked 1st among Grade 10 students (A.Y. 2020)"
    ],
    tech: []
  }
];

function generateExperienceSvg() {
  const cardX = 64;
  const cardWidth = 780;
  const timelineX = 36;
  let currentY = 56;

  let elementsSvg = '';
  let animIndex = 0;

  function renderSection(sectionTitle, items) {
    // Section Header
    elementsSvg += `
    <g opacity="0" transform="translate(0,4)">
      <line x1="24" y1="${currentY + 6}" x2="42" y2="${currentY + 6}" stroke="#818cf8" stroke-width="2"/>
      <text x="50" y="${currentY + 11}" fill="#ffffff" font-size="14.5" font-weight="700" letter-spacing="0.5">${escapeXml(sectionTitle)}</text>
      <animate attributeName="opacity" from="0" to="1" begin="${(0.1 + animIndex * 0.05).toFixed(2)}s" dur="0.4s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="0 4" to="0 0" begin="${(0.1 + animIndex * 0.05).toFixed(2)}s" dur="0.4s" fill="freeze"/>
    </g>`;
    animIndex++;

    currentY += 28;
    const nodeYPositions = [];

    items.forEach((item) => {
      const itemTopY = currentY;
      const innerPaddingX = 20;
      const textStartX = cardX + innerPaddingX;

      // Calculate lines for all bullet points
      const bulletBlocks = item.bullets.map(bullet => {
        return wrapText(bullet, 86);
      });

      let totalBulletLines = 0;
      bulletBlocks.forEach(lines => totalBulletLines += lines.length);

      // Card height calculation
      const headerHeight = 60; // date (14) + title (20) + org (18) + gaps
      const bulletsHeight = totalBulletLines * 17 + (bulletBlocks.length - 1) * 3;
      const pillsHeight = item.tech && item.tech.length > 0 ? 36 : 0;
      const bottomPadding = item.tech && item.tech.length > 0 ? 18 : 20;
      const cardHeight = headerHeight + bulletsHeight + pillsHeight + bottomPadding;

      const nodeCenterY = itemTopY + 28;
      nodeYPositions.push(nodeCenterY);

      // Tech Pills rendering
      let pillsSvg = '';
      if (item.tech && item.tech.length > 0) {
        let pillX = textStartX;
        const pillY = itemTopY + headerHeight + bulletsHeight + 10;
        
        pillsSvg = item.tech.map(t => {
          const w = t.length * 6.8 + 18;
          const curX = pillX;
          pillX += w + 6;
          const dotColor = TECH_COLORS[t] || '#818cf8';
          return `
            <rect x="${curX.toFixed(1)}" y="${pillY}" width="${w.toFixed(1)}" height="19" rx="4.5" fill="#1b1a2e" stroke="#2e2b48" stroke-width="0.8"/>
            <circle cx="${(curX + 7).toFixed(1)}" cy="${pillY + 9.5}" r="2.5" fill="${dotColor}"/>
            <text x="${(curX + 13).toFixed(1)}" y="${pillY + 13.5}" fill="#e2e8f0" font-size="10" font-weight="500">${escapeXml(t)}</text>
          `;
        }).join('');
      }

      // Bullet items rendering
      let bulletContentY = itemTopY + headerHeight + 6;
      let bulletsSvg = '';
      bulletBlocks.forEach(lines => {
        lines.forEach((line, lineIdx) => {
          if (lineIdx === 0) {
            bulletsSvg += `
              <text x="${textStartX}" y="${bulletContentY}" fill="#818cf8" font-size="11.5" font-weight="700">•</text>
              <text x="${textStartX + 12}" y="${bulletContentY}" fill="#cbd5e1" font-size="11.5">${escapeXml(line)}</text>
            `;
          } else {
            bulletsSvg += `
              <text x="${textStartX + 12}" y="${bulletContentY}" fill="#94a3b8" font-size="11.5">${escapeXml(line)}</text>
            `;
          }
          bulletContentY += 17;
        });
        bulletContentY += 3;
      });

      const delay = (0.15 + animIndex * 0.06).toFixed(2);
      animIndex++;

      elementsSvg += `
      <g opacity="0" transform="translate(0,6)">
        <!-- Timeline Node Circle -->
        <circle cx="${timelineX}" cy="${nodeCenterY}" r="6" fill="#0F0E1A" stroke="#818cf8" stroke-width="2"/>
        <circle cx="${timelineX}" cy="${nodeCenterY}" r="2.5" fill="#818cf8"/>

        <!-- Card Container -->
        <rect x="${cardX}" y="${itemTopY}" width="${cardWidth}" height="${cardHeight}" rx="8" fill="#131220" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>

        <!-- Date Badge -->
        <text x="${textStartX}" y="${itemTopY + 20}" fill="#818cf8" font-size="10.5" font-weight="700" letter-spacing="1">${escapeXml(item.date)}</text>

        <!-- Role / Title -->
        <text x="${textStartX}" y="${itemTopY + 38}" fill="#ffffff" font-size="14" font-weight="800">${escapeXml(item.title)}</text>

        <!-- Organization / Company -->
        <text x="${textStartX}" y="${itemTopY + 54}" fill="#94a3b8" font-size="12" font-weight="500">${escapeXml(item.org)}</text>

        <!-- Bullets -->
        ${bulletsSvg}

        <!-- Tech Pills -->
        ${pillsSvg}

        <animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.4s" fill="freeze"/>
        <animateTransform attributeName="transform" type="translate" from="0 6" to="0 0" begin="${delay}s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
      </g>`;

      currentY += cardHeight + 14;
    });

    // Timeline Line for this section
    if (nodeYPositions.length > 0) {
      const firstNodeY = nodeYPositions[0] - 12;
      const lastNodeY = nodeYPositions[nodeYPositions.length - 1] + 12;
      elementsSvg = `
      <!-- Vertical Timeline Connector -->
      <line x1="${timelineX}" y1="${firstNodeY}" x2="${timelineX}" y2="${lastNodeY}" stroke="#4c566a" stroke-opacity="0.6" stroke-width="1.5"/>
      ` + elementsSvg;
    }

    currentY += 10;
  }

  renderSection("Work Experience", workExperience);
  currentY += 8;
  renderSection("Education", education);

  const totalHeight = Math.round(currentY + 28);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="${totalHeight}" viewBox="0 0 869 ${totalHeight}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="ebg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <!-- Background & Outer Solid White Border -->
  <rect width="869" height="${totalHeight}" rx="12" fill="url(#ebg)"/>
  <rect x="0.5" y="0.5" width="868" height="${totalHeight - 1}" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  
  <!-- Header Bar -->
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~/experience-and-education --timeline</text>

  <!-- Section Cards & Timeline -->
  ${elementsSvg}

  <!-- Footer Divider Line -->
  <line x1="0" y1="${totalHeight - 34}" x2="869" y2="${totalHeight - 34}" stroke="#ffffff" stroke-opacity="0.3"/>

  <!-- Footer Metrics -->
  <text x="24" y="${totalHeight - 13}" font-size="11.5" fill="#00FF99">✦ <tspan fill="#7d8590">Career &amp; Academic Timeline: </tspan><tspan fill="#c9d1d9" font-weight="700">Software Engineering · Systems · Leadership</tspan></text>
  <text x="845" y="${totalHeight - 13}" font-size="11.5" fill="#7d8590" text-anchor="end">status: <tspan fill="#818cf8" font-weight="700">actively contributing</tspan></text>
</svg>`;
}

function main() {
  const svg = generateExperienceSvg();
  const outPath = path.join(__dirname, '..', 'experience.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully regenerated experience.svg at ${outPath}`);
}

main();
