const fs = require('fs');
const path = require('path');

function generateTechStackSvg() {
  const categories = [
    // LEFT COLUMN
    {
      title: "🎨 Frontend & Mobile",
      color: "#00FF99",
      x: 24,
      y: 56,
      skills: [
        { name: "React", color: "#61DAFB" },
        { name: "React Native", color: "#61DAFB" },
        { name: "Next.js", color: "#ffffff" },
        { name: "TypeScript", color: "#3178C6" },
        { name: "JavaScript", color: "#F7DF1E" },
        { name: "Electron", color: "#9FEAF9" },
        { name: "Tailwind CSS", color: "#38B2AC" },
        { name: "HTML5 / CSS3", color: "#E34F26" },
        { name: "Vite", color: "#646CFF" },
        { name: "Zustand", color: "#443E38" },
        { name: "GSAP", color: "#88CE02" },
        { name: "Framer Motion", color: "#0055FF" }
      ]
    },
    {
      title: "⚙️ Backend & APIs",
      color: "#22d3ee",
      x: 24,
      y: 190,
      skills: [
        { name: "Node.js", color: "#339933" },
        { name: "Express.js", color: "#ffffff" },
        { name: "Python", color: "#3776AB" },
        { name: "REST APIs", color: "#FF6C37" },
        { name: "JWT Auth", color: "#D63AFF" },
        { name: "Stripe API", color: "#635BFF" }
      ]
    },
    {
      title: "🗄️ Databases & Storage",
      color: "#ffa657",
      x: 24,
      y: 300,
      skills: [
        { name: "MySQL", color: "#4479A1" },
        { name: "PostgreSQL", color: "#4169E1" },
        { name: "Supabase", color: "#3FCF8E" },
        { name: "SQLite", color: "#003B57" },
        { name: "NeonDB", color: "#00E699" }
      ]
    },

    // RIGHT COLUMN
    {
      title: "🚀 DevOps & Cloud",
      color: "#00FF99",
      x: 455,
      y: 56,
      skills: [
        { name: "Git", color: "#F05032" },
        { name: "GitHub Actions", color: "#2088FF" },
        { name: "Vercel", color: "#ffffff" },
        { name: "Railway", color: "#ffffff" },
        { name: "Linux / Ubuntu", color: "#FCC624" },
        { name: "Expo", color: "#ffffff" },
        { name: "Cloudflare", color: "#F38020" }
      ]
    },
    {
      title: "⚡ Automation & AI",
      color: "#22d3ee",
      x: 455,
      y: 190,
      skills: [
        { name: "n8n Orchestration", color: "#EA4B71" },
        { name: "Groq AI", color: "#F55036" },
        { name: "Workflow Automation", color: "#00FF99" },
        { name: "Webhooks", color: "#22d3ee" }
      ]
    },
    {
      title: "🎨 UI/UX & Creative",
      color: "#a855f7",
      x: 455,
      y: 300,
      skills: [
        { name: "Figma", color: "#F24E1E" },
        { name: "Adobe Photoshop", color: "#31A8FF" },
        { name: "Premiere Pro", color: "#9999FF" },
        { name: "Canva", color: "#00C4CC" },
        { name: "Wireframing", color: "#a855f7" }
      ]
    }
  ];

  function renderCategoryPills(cat, baseDelay = 0.15) {
    let pillsSvg = '';
    let curX = cat.x;
    let curY = cat.y + 20;
    const maxX = cat.x + 380;
    const rowHeight = 26;

    cat.skills.forEach((skill, idx) => {
      // Calculate pill width based on text length
      const textLen = skill.name.length;
      const pillWidth = Math.max(54, textLen * 7.4 + 24);

      if (curX + pillWidth > maxX && curX > cat.x) {
        curX = cat.x;
        curY += rowHeight;
      }

      pillsSvg += `
      <g transform="translate(${curX}, ${curY})">
        <rect width="${pillWidth.toFixed(1)}" height="20" rx="5" fill="#161b22" stroke="#30363d" stroke-width="1"/>
        <circle cx="9" cy="10" r="3.5" fill="${skill.color}"/>
        <text x="18" y="14" fill="#e6edf3" font-size="11" font-weight="500">${skill.name}</text>
      </g>`;

      curX += pillWidth + 6;
    });

    return `
    <g opacity="0" transform="translate(0,5)">
      <text x="${cat.x}" y="${cat.y}" fill="${cat.color}" font-size="13.5" font-weight="700">${cat.title}</text>
      ${pillsSvg}
      <animate attributeName="opacity" from="0" to="1" begin="${baseDelay}s" dur="0.4s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="${baseDelay}s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
    </g>`;
  }

  const renderedCategories = categories.map((c, i) => renderCategoryPills(c, (0.15 + i * 0.08).toFixed(2))).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="425" viewBox="0 0 869 425" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="tbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="425" rx="12" fill="url(#tbg)"/>
  <rect x="0.5" y="0.5" width="868" height="424" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~/tech-stack --all</text>

  <!-- Vertical Divider Between Columns -->
  <line x1="434" y1="40" x2="434" y2="375" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- Tech Categories & Interactive Pills -->
  ${renderedCategories}

  <!-- Footer Divider Line -->
  <line x1="0" y1="388" x2="869" y2="388" stroke="#ffffff" stroke-opacity="0.3"/>

  <!-- Footer Metrics -->
  <text x="24" y="408" font-size="12" fill="#00FF99">✦ <tspan fill="#7d8590">Stack Overview: </tspan><tspan fill="#c9d1d9" font-weight="700">35+ Core Languages, Frameworks &amp; Tools</tspan></text>
  <text x="845" y="408" font-size="12" fill="#7d8590" text-anchor="end">status: <tspan fill="#22d3ee" font-weight="700">production-ready</tspan></text>
</svg>`;
}

function main() {
  const svg = generateTechStackSvg();
  const outPath = path.join(__dirname, '..', 'tech_stack.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated tech_stack.svg at ${outPath}`);
}

main();
