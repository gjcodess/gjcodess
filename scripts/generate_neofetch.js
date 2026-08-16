const fs = require('fs');
const path = require('path');

function calculateAge(birthDateString = '2003-10-07') {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const m = today.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age--;
  }
  return age;
}

function generateNeofetchSvg() {
  const age = calculateAge('2003-10-07');
  const ageStr = `${age} years old`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="294" viewBox="0 0 869 294" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="nbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0E1A"/>
      <stop offset="1" stop-color="#090812"/>
    </linearGradient>
  </defs>

  <!-- Background & Window Border -->
  <rect width="869" height="294" rx="12" fill="url(#nbg)"/>
  <rect x="0.5" y="0.5" width="868" height="293" rx="12" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <line x1="0" y1="30" x2="869" y2="30" stroke="#ffffff" stroke-opacity="0.35"/>

  <!-- Window Controls -->
  <circle cx="20" cy="15.0" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="15.0" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="15.0" r="5" fill="#27c93f"/>
  <text x="434.5" y="19.0" fill="#9ca3af" font-size="12" text-anchor="middle">gjcodess@github: ~$ neofetch</text>

  <!-- Vertical Divider Between Columns -->
  <line x1="434" y1="38" x2="434" y2="250" stroke="#ffffff" stroke-opacity="0.25"/>

  <!-- ═══════════════════ LEFT COLUMN: PROFILE SPECS ═══════════════════ -->
  <!-- User Prompt Header -->
  <g opacity="0" transform="translate(0,5)">
    <text x="24" y="55" font-size="13.5" font-weight="700">
      <tspan fill="#00FF99">gjcodess</tspan><tspan fill="#7d8590">@</tspan><tspan fill="#22d3ee">github</tspan>
    </text>
    <line x1="140" y1="51" x2="415" y2="51" stroke="#ffffff" stroke-opacity="0.25"/>
    <animate attributeName="opacity" from="0" to="1" begin="0.12s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.12s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Left Rows -->
  <g opacity="0" transform="translate(0,5)">
    <text x="24" y="78" fill="#ffa657" font-size="12" font-weight="700">Roles</text>
    <text x="110" y="78" fill="#c9d1d9" font-size="12">Full-Stack Dev · UI/UX Designer</text>

    <text x="24" y="100" fill="#ffa657" font-size="12" font-weight="700">Education</text>
    <text x="110" y="100" fill="#c9d1d9" font-size="12">BSIT @ TUP Manila (2022–2026)</text>

    <text x="24" y="122" fill="#ffa657" font-size="12" font-weight="700">Honors</text>
    <text x="110" y="122" fill="#c9d1d9" font-size="12">Salutatorian (Magna Cum Laude)</text>

    <text x="24" y="144" fill="#ffa657" font-size="12" font-weight="700">Location</text>
    <text x="110" y="144" fill="#c9d1d9" font-size="12">Philippines, Parañaque City</text>

    <text x="24" y="166" fill="#ffa657" font-size="12" font-weight="700">Focus</text>
    <text x="110" y="166" fill="#c9d1d9" font-size="12">Scalable Systems · Automation</text>

    <text x="24" y="188" fill="#ffa657" font-size="12" font-weight="700">Experience</text>
    <text x="110" y="188" fill="#c9d1d9" font-size="11.5">Rameson Dist. Inc. (App Dev) · Contract</text>

    <text x="24" y="210" fill="#ffa657" font-size="12" font-weight="700">Portfolio</text>
    <text x="110" y="210" fill="#c9d1d9" font-size="12">https://www.gjcodes.me</text>

    <text x="24" y="232" fill="#ffa657" font-size="12" font-weight="700">Age</text>
    <text x="110" y="232" fill="#00FF99" font-weight="700" font-size="12">${ageStr}</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.2s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.2s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ═══════════════════ RIGHT COLUMN: STACK & HIGHLIGHTS ═══════════════════ -->
  <!-- Primary Stack Section Header -->
  <g opacity="0" transform="translate(0,5)">
    <text x="455" y="55" fill="#22d3ee" font-size="13" font-weight="700">— Primary Stack</text>
    <line x1="575" y1="51" x2="845" y2="51" stroke="#ffffff" stroke-opacity="0.25"/>
    <animate attributeName="opacity" from="0" to="1" begin="0.25s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.25s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Stack Rows -->
  <g opacity="0" transform="translate(0,5)">
    <text x="455" y="78" fill="#ffa657" font-size="12" font-weight="700">Frontend</text>
    <text x="535" y="78" fill="#c9d1d9" font-size="12">React, Next.js, React Native, Electron, TS</text>

    <text x="455" y="100" fill="#ffa657" font-size="12" font-weight="700">Backend</text>
    <text x="535" y="100" fill="#c9d1d9" font-size="12">Node.js, Express, Python, MySQL, Supabase</text>

    <text x="455" y="122" fill="#ffa657" font-size="12" font-weight="700">DevOps</text>
    <text x="535" y="122" fill="#c9d1d9" font-size="12">Git, GitHub Actions, n8n, Vercel, Linux</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.32s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.32s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- Key Milestones Section Header -->
  <g opacity="0" transform="translate(0,5)">
    <text x="455" y="152" fill="#22d3ee" font-size="13" font-weight="700">— Key Milestones</text>
    <line x1="585" y1="148" x2="845" y2="148" stroke="#ffffff" stroke-opacity="0.25"/>

    <circle cx="462" cy="174" r="3" fill="#00FF99"/>
    <text x="474" y="178" fill="#c9d1d9" font-size="11.8">Salutatorian (Magna Cum Laude) · TUP Manila</text>

    <circle cx="462" cy="196" r="3" fill="#00FF99"/>
    <text x="474" y="200" fill="#c9d1d9" font-size="11.8">2nd Place · Best Capstone Project 2026</text>

    <circle cx="462" cy="218" r="3" fill="#00FF99"/>
    <text x="474" y="222" fill="#c9d1d9" font-size="11.8">4th Place · University Hackathon 2025</text>

    <circle cx="462" cy="240" r="3" fill="#00FF99"/>
    <text x="474" y="244" fill="#c9d1d9" font-size="11.8">Rank 1 in IT Program · Consistent President's Lister</text>

    <animate attributeName="opacity" from="0" to="1" begin="0.38s" dur="0.4s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" begin="0.38s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </g>

  <!-- ═══════════════════ FOOTER BAR ═══════════════════ -->
  <line x1="0" y1="258" x2="869" y2="258" stroke="#ffffff" stroke-opacity="0.3"/>
  <text x="24" y="278" font-size="11.5" fill="#00FF99">✦ <tspan fill="#7d8590">Shell: </tspan><tspan fill="#c9d1d9" font-weight="700">zsh 5.9</tspan><tspan fill="#7d8590">   ·   Terminal: </tspan><tspan fill="#c9d1d9" font-weight="700">kitty</tspan><tspan fill="#7d8590">   ·   Editor: </tspan><tspan fill="#c9d1d9" font-weight="700">VS Code</tspan></text>
  <text x="845" y="278" font-size="11.5" fill="#7d8590" text-anchor="end">status: <tspan fill="#00FF99" font-weight="700">open to opportunities</tspan></text>
</svg>`;
}

function main() {
  const svg = generateNeofetchSvg();
  const outPath = path.join(__dirname, '..', 'neofetch.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`✅ Successfully generated updated compact neofetch.svg at ${outPath}`);
}

main();
