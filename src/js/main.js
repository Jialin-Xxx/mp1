/* Your JS here. */

document.querySelectorAll('.menu a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;

    navLinks.forEach(x => x.classList.toggle('active', x === a));

    const y = target.getBoundingClientRect().top + window.pageYOffset - navH() + 1;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});



const navbar = document.getElementById('navbar');
function updateNavbarSize() {
  const scrolled = window.scrollY || document.documentElement.scrollTop;
  navbar.classList.toggle('shrink', scrolled > 10);
}
updateNavbarSize();
window.addEventListener('scroll', updateNavbarSize, { passive: true });

// ===== ScrollSpy=====
const navLinks = Array.from(document.querySelectorAll('.menu a[href^="#"]'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const linkById = Object.fromEntries(
  navLinks.map(a => [a.getAttribute('href').slice(1), a])
);

function setActive(id) {
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
}

// （顶端大、滚动后小）
const navH = () => navbar.getBoundingClientRect().height || 0;

// sectio绝对位置
let sectionMeta = [];
function recomputeOffsets() {
  sectionMeta = sections.map(s => ({
    id: s.id,
    top: s.getBoundingClientRect().top + window.pageYOffset
  })).sort((a,b)=>a.top-b.top);
}


function spy() {
  const y = window.pageYOffset + navH() + 2; 
  let current = sectionMeta[0]?.id;
  for (const {id, top} of sectionMeta) {
    if (y >= top) current = id; else break;
  }
  if (current) setActive(current);

  // forse last
  if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
    setActive(sectionMeta[sectionMeta.length - 1].id);
  }
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => { spy(); ticking = false; });
    ticking = true;
  }
}

recomputeOffsets();
spy();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { recomputeOffsets(); spy(); });

window.addEventListener('load', () => { recomputeOffsets(); spy(); });
navbar.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'height' || e.propertyName === 'font-size' || e.propertyName === 'padding') {
    recomputeOffsets(); spy();
  }
});
document.querySelectorAll('img, video').forEach(el => {
  el.addEventListener('load', () => { recomputeOffsets(); spy(); }, { once: true });
});



// 轮播
document.querySelectorAll('.carousel').forEach(car => {
  const track = car.querySelector('.track');
  const slides = Array.from(track.children);
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  // no gap
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = Array.from(track.children);
  let index = 1;
  const slideCount = allSlides.length;

  track.style.transform = `translateX(${-index * 100}%)`;

  const update = () => {
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(${-index * 100}%)`;
  };

  const go = (dir) => {
    index += dir;
    update();
  };

  car.querySelector('.prev').addEventListener('click', () => go(-1));
  car.querySelector('.next').addEventListener('click', () => go(1));

  track.addEventListener('transitionend', () => {
    if (index === slideCount - 1) {
      track.style.transition = 'none';
      index = 1;
      track.style.transform = `translateX(${-index * 100}%)`;
    }
    if (index === 0) {
      track.style.transition = 'none';
      index = slideCount - 2;
      track.style.transform = `translateX(${-index * 100}%)`;
    }
  });

  // aoto play
  if (car.dataset.autoplay === 'true') {
    setInterval(() => go(1), 4000);
  }
});


// ========== Modal（通用化） ==========
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
}
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
}

document.querySelectorAll('[data-open-modal]').forEach(btn => {
  const targetId = btn.getAttribute('data-open-modal');
  const target = document.getElementById(targetId);
  btn.addEventListener('click', () => openModal(target));
});

document.addEventListener('click', (e) => {
  const closeTrigger = e.target.closest('[data-close-modal], .modal .close, .modal .backdrop');
  if (closeTrigger) {
    const modalEl = closeTrigger.closest('.modal');
    closeModal(modalEl);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal[aria-hidden="false"]').forEach(closeModal);
  }
});

// ========== match：卡片 ->  -> 打开 #fixtureModal ==========
const fixtureModal = document.getElementById('fixtureModal');
const fixtureImg   = fixtureModal?.querySelector('.fixture-img');
const fixtureTitle = fixtureModal?.querySelector('.fixture-title');

document.querySelectorAll('.fixture-card').forEach(card => {
  card.addEventListener('click', () => {
    const src   = card.getAttribute('data-img');
    const title = card.getAttribute('data-title')
      || card.querySelector('h3')?.textContent?.trim()
      || 'Match';

    if (fixtureImg) { fixtureImg.src = src || ''; fixtureImg.alt = title; }
    if (fixtureTitle) fixtureTitle.textContent = title;

    openModal(fixtureModal);
  });
});

fixtureModal?.addEventListener('transitionend', () => {
  if (fixtureModal.getAttribute('aria-hidden') === 'true' && fixtureImg) {
    fixtureImg.src = '';
  }
});


