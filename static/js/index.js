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
