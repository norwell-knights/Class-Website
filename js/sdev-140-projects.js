// sdev-140-projects.js
// Manages a simple image carousel for SDEV 140 student project samples.
// It attempts to fetch ../software-development-samples/projects.json. If not found,
// edit the `projects` array below to list images and descriptions located in
// ../software-development-samples/ (relative to pages that include this script).

const SAMPLE_DIR = '../images/software-development-samples/';

// Fallback projects list — edit this file to add your project images and descriptions.
let projects = [
  { image: SAMPLE_DIR + '1.jpg', title: 'Project Alpha', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.' },
  { image: SAMPLE_DIR + '2 flag.jpg', title: 'Project Beta', desc: 'Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.' },
  { image: SAMPLE_DIR + '3.jpg', title: 'Project Gamma', desc: 'Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.' },
  { image: SAMPLE_DIR + '4 flag.jpg', title: 'Project Delta', desc: 'Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora.' },
  { image: SAMPLE_DIR + '5.jpg', title: 'Project Epsilon', desc: 'Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.' },
  { image: SAMPLE_DIR + '6.jpg', title: 'Project Zeta', desc: 'Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.' },
  { image: SAMPLE_DIR + '7 gold.jpg', title: 'Project Eta', desc: 'Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.' }
];

const carousel = {
  container: null,
  inner: null,
  indicators: null,
  caption: null,
  prevBtn: null,
  nextBtn: null,
  current: 0,
  imgs: []
};

function buildSlide(item, index) {
  const itemEl = document.createElement('div');
  itemEl.className = 'carousel-item';
  itemEl.setAttribute('data-index', index);

  const img = document.createElement('img');
  img.src = item.image;
  img.alt = item.title || 'Student project image';
  img.loading = 'lazy';

  itemEl.appendChild(img);

  return itemEl;
}

function prev() { showSlide((carousel.current - 1 + projects.length) % projects.length); }
function next() { showSlide((carousel.current + 1) % projects.length); }

function showSlide(idx, userTriggered = false) {
  if (!carousel.inner) return;
  idx = ((idx % projects.length) + projects.length) % projects.length;
  const items = carousel.inner.querySelectorAll('.carousel-item');
  items.forEach((it, i) => {
    if (i === idx) it.classList.add('active'); else it.classList.remove('active');
  });
  // indicators
  if (carousel.indicators) {
    const dots = carousel.indicators.querySelectorAll('li');
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  // caption (external)
  if (carousel.caption) {
    carousel.caption.innerHTML = `<strong>${escapeHtml(projects[idx].title||'')}</strong><p style="margin:0.25rem 0 0;color:#222;">${escapeHtml(projects[idx].desc||'')}</p>`;
  }
  carousel.current = idx;
  if (userTriggered) restartTimer();
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initCarousel() {
  carousel.container = document.getElementById('sdevCarousel');
  if (!carousel.container) return;
  carousel.inner = document.getElementById('sdev-inner');
  carousel.indicators = document.getElementById('sdev-indicators');
  carousel.caption = document.getElementById('sdev-caption');
  carousel.prevBtn = document.getElementById('sdev-prev');
  carousel.nextBtn = document.getElementById('sdev-next');

  carousel.prevBtn.addEventListener('click', (e)=>{ e.preventDefault(); prev(); });
  carousel.nextBtn.addEventListener('click', (e)=>{ e.preventDefault(); next(); });

  // keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // try fetching JSON index from the samples folder
  fetch(SAMPLE_DIR + 'projects.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('no index'); return r.json(); })
    .then(list => {
      if (Array.isArray(list) && list.length > 0) {
        projects = list.map(it => ({ image: it.image.startsWith('http') ? it.image : SAMPLE_DIR + it.image, title: it.title || '', desc: it.desc || '' }));
      }
    })
    .catch(()=>{})
    .finally(()=>{
      // build items and indicators
      carousel.inner.innerHTML = '';
      carousel.indicators.innerHTML = '';
      projects.forEach((p, i) => {
        const el = buildSlide(p, i);
        if (i === 0) el.classList.add('active');
        carousel.inner.appendChild(el);

        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i);
        dot.className = i === 0 ? 'active' : '';
        dot.addEventListener('click', ()=> showSlide(i, true));
        carousel.indicators.appendChild(dot);
      });

      // set initial slide
      if (projects.length > 0) showSlide(0);

      // auto cycle
      startTimer();

      // pause on hover
      carousel.container.addEventListener('mouseenter', pauseTimer);
      carousel.container.addEventListener('mouseleave', startTimer);
    });
}

let timer = null;
function startTimer(){ if(timer) clearInterval(timer); timer = setInterval(()=> next(), 5000); }
function pauseTimer(){ if(timer) clearInterval(timer); timer = null; }
function restartTimer(){ pauseTimer(); startTimer(); }

// init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}
