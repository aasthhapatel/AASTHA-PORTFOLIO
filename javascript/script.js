/**
 * Portfolio Navigation Engine
 * Handles dynamic section loading, smooth transitions, and no-scroll experience
 */

const SECTIONS = ['home', 'about', 'skills', 'projects', 'experience', 'certificates', 'contact'];
let currentSection = null;
const cache = {};

// Expose global nav function for inline buttons
window.portfolioNav = loadSection;

async function fetchSection(name) {
  if (cache[name]) return cache[name];
  try {
    const res = await fetch(`${name}.html`);
    if (!res.ok) throw new Error(`Failed to load ${name}.html`);
    const html = await res.text();
    cache[name] = html;
    return html;
  } catch (err) {
    return `<div class="section-wrap" style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:16px;color:var(--text-muted)">
      <span style="font-size:48px">⚠️</span>
      <p>Could not load section: <strong style="color:var(--accent-amber)">${name}</strong></p>
    </div>`;
  }
}

function injectCSS(name) {
  const id = `css-${name}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `${name}.css`;
  document.head.appendChild(link);
}

async function loadSection(name) {
  if (!SECTIONS.includes(name)) return;
  if (name === currentSection) return;

  const loader = document.getElementById('sectionLoader');
  const container = document.getElementById('sectionContainer');
  const navItems = document.querySelectorAll('.nav-item');

  // Show loader briefly
  loader.classList.add('visible');

  // Pre-inject CSS
  injectCSS(name);

  // Fetch HTML
  const html = await fetchSection(name);

  // Brief artificial delay for smooth feel
  await new Promise(r => setTimeout(r, 120));

  // Inject content
  container.innerHTML = html;

  // Re-inject any linked CSS inside the HTML fragment
  container.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const id = `css-${link.getAttribute('href').replace('.css','')}`;
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id;
      l.rel = 'stylesheet';
      l.href = link.getAttribute('href');
      document.head.appendChild(l);
    }
    link.remove();
  });

  // Trigger animation
  container.classList.remove('fade-in', 'slide-in');
  void container.offsetWidth; // reflow
  container.classList.add(currentSection ? 'slide-in' : 'fade-in');

  // Update active nav item
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === name);
  });

  currentSection = name;
  loader.classList.remove('visible');

  // Scroll container to top
  const wrap = container.querySelector('.section-wrap');
  if (wrap) wrap.scrollTop = 0;
}

// Wire up nav items
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    loadSection(btn.dataset.section);
  });
});

// Load home on init
loadSection('home');