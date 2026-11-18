(() => {
  // --- Device Gallery Switcher (iPhone / iPad) ---
  const deviceTabs = document.querySelectorAll('[data-gallery-tab]');
  const rails = document.querySelectorAll('[data-gallery-rail]');

  function getActiveRail() {
    for (const rail of rails) {
      if (!rail.hidden) return rail;
    }
    return rails[0] || null;
  }

  deviceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-gallery-tab');
      deviceTabs.forEach((btn) => btn.setAttribute('aria-pressed', String(btn === tab)));
      rails.forEach((rail) => {
        rail.hidden = rail.getAttribute('data-gallery-rail') !== target;
      });
    });
  });

  // --- Rail Horizontal Scroll Buttons ---
  const prevRailBtn = document.getElementById('rail-prev');
  const nextRailBtn = document.getElementById('rail-next');

  function scrollActiveRail(direction) {
    const rail = getActiveRail();
    if (!rail) return;
    const step = Math.max(260, Math.round(rail.clientWidth * 0.72));
    rail.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  if (prevRailBtn) prevRailBtn.addEventListener('click', () => scrollActiveRail(-1));
  if (nextRailBtn) nextRailBtn.addEventListener('click', () => scrollActiveRail(1));

  // --- Interactive Screenshot Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');
  const lbClosers = document.querySelectorAll('[data-close-lightbox]');

  let activeItems = [];
  let activeIndex = 0;
  let openerElement = null;

  function collectVisibleGalleryTriggers() {
    const activeRail = getActiveRail();
    if (activeRail) {
      return Array.from(activeRail.querySelectorAll('[data-lightbox-src]'));
    }
    const grid = document.querySelector('[data-gallery-grid]');
    if (grid) {
      return Array.from(grid.querySelectorAll('[data-lightbox-src]'));
    }
    return Array.from(document.querySelectorAll('[data-lightbox-src]'));
  }

  function renderLightboxItem() {
    const item = activeItems[activeIndex];
    if (!item || !lbImg) return;
    lbImg.src = item.src;
    lbImg.alt = item.alt || item.caption || '';
    if (lbCaption) lbCaption.textContent = item.caption || '';
    if (lbCounter) lbCounter.textContent = `${activeIndex + 1} / ${activeItems.length}`;
    if (lbPrev) lbPrev.hidden = activeItems.length <= 1;
    if (lbNext) lbNext.hidden = activeItems.length <= 1;
  }

  function openLightbox(items, startIndex, trigger) {
    if (!lightbox || !items.length) return;
    activeItems = items;
    activeIndex = Math.max(0, Math.min(startIndex, items.length - 1));
    openerElement = trigger || document.activeElement;
    renderLightboxItem();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (openerElement && typeof openerElement.focus === 'function') {
      openerElement.focus();
    }
    openerElement = null;
  }

  function stepLightbox(delta) {
    if (!activeItems.length) return;
    activeIndex = (activeIndex + delta + activeItems.length) % activeItems.length;
    renderLightboxItem();
  }

  document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const visibleTriggers = collectVisibleGalleryTriggers();
      const clickedSrc = trigger.getAttribute('data-lightbox-src');
      const items = visibleTriggers.map((el) => ({
        src: el.getAttribute('data-lightbox-src'),
        caption: el.getAttribute('data-lightbox-caption') || '',
        alt: el.querySelector('img')?.alt || ''
      }));
      let idx = visibleTriggers.indexOf(trigger);
      if (idx === -1) {
        idx = items.findIndex((it) => it.src === clickedSrc);
      }
      if (idx === -1) {
        items.unshift({
          src: clickedSrc,
          caption: trigger.getAttribute('data-lightbox-caption') || '',
          alt: trigger.querySelector('img')?.alt || ''
        });
        idx = 0;
      }
      openLightbox(items, idx, trigger);
    });
  });

  if (lbPrev) lbPrev.addEventListener('click', () => stepLightbox(-1));
  if (lbNext) lbNext.addEventListener('click', () => stepLightbox(1));
  lbClosers.forEach((btn) => btn.addEventListener('click', closeLightbox));

  document.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      stepLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      stepLightbox(1);
    }
  });
})();
