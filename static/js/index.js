document.addEventListener('DOMContentLoaded', () => {
  // ---- Copy BibTeX to clipboard ----
  const button = document.getElementById('copyBibtex');
  const codeEl = document.getElementById('bibtex-content');
  if (button && codeEl) {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.innerText);
        const original = button.innerHTML;
        button.classList.add('copied');
        button.textContent = 'Copied';
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = original;
        }, 1500);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => revObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in-view'));
  }

  // ---- TOC scroll-spy ----
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const sectionFor = new Map();
    tocLinks.forEach((a) => {
      const sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) sectionFor.set(sec, a);
    });
    let active = null;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = sectionFor.get(entry.target);
        if (!link || link === active) return;
        if (active) active.classList.remove('active');
        active = link;
        active.classList.add('active');
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    sectionFor.forEach((_, sec) => spy.observe(sec));
  }

  // ---- Autoplay videos when scrolled into view; pause when out ----
  const videos = document.querySelectorAll('video');
  if ('IntersectionObserver' in window) {
    const vidObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          const p = v.play();
          if (p !== undefined) p.catch(() => { /* autoplay blocked */ });
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach((v) => vidObserver.observe(v));
  }
});

// ---- Partner-prediction carousel ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-pcar]').forEach((root) => {
    const track = root.querySelector('.pcar__track');
    const slides = root.querySelectorAll('.pcar__slide');
    const chips = root.querySelectorAll('.pcar__chip');
    const nEl = root.querySelector('[data-pcar-n]');
    const n = slides.length;
    let cur = 0;
    const go = (i) => {
      cur = (i + n) % n;
      track.style.transform = `translateX(${-100 * cur}%)`;
      chips.forEach((c, k) => {
        c.classList.toggle('is-active', k === cur);
        c.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      });
      slides.forEach((s, k) => s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'));
      if (nEl) nEl.textContent = cur + 1;
    };
    root.querySelectorAll('.pcar__nav').forEach((b) =>
      b.addEventListener('click', () => go(cur + Number(b.dataset.dir))));
    chips.forEach((c) => c.addEventListener('click', () => go(Number(c.dataset.i))));
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });
    let x0 = null;
    const vp = root.querySelector('.pcar__viewport');
    vp.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    go(0);
  });
});
