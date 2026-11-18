(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Sticky Header Elevation ---
  const header = document.getElementById('site-header');
  if (header) {
    const syncHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
  }

  // --- Mobile Navigation Drawer ---
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function setMenuOpen(isOpen) {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    mobileDrawer.classList.toggle('is-open', isOpen);
    mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!expanded);
    });

    mobileDrawer.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => setMenuOpen(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    });
  }

  // --- Hero Bento Video Card & Subtle Hover Tilt ---
  const videoCard = document.getElementById('bento-video-card');
  const heroVideo = document.getElementById('hero-video');
  const replayBtn = document.getElementById('video-replay');

  if (heroVideo && prefersReducedMotion) {
    heroVideo.removeAttribute('autoplay');
  }

  if (replayBtn && heroVideo) {
    replayBtn.addEventListener('click', () => {
      heroVideo.currentTime = 0;
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    });
  }

  if (
    videoCard &&
    !prefersReducedMotion &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    videoCard.addEventListener('mousemove', (event) => {
      const rect = videoCard.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = nx * 9;
      const rotateX = ny * -9;
      videoCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    videoCard.addEventListener('mouseleave', () => {
      videoCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  // --- Interactive Gartenplaner Preview Switcher ---
  const cropData = {
    tomate: {
      name: 'Tomate',
      season: 'Aussaat: März–April',
      good: 'Knoblauch, Buschbohne, Grünkohl',
      bad: 'Kartoffel, Erbse, Knollenfenchel',
      spacing: '70 × 50 cm'
    },
    karotte: {
      name: 'Karotte',
      season: 'Aussaat: März–Juni',
      good: 'Zwiebel, Lauch, Schnittlauch',
      bad: 'Dill, Sellerie, Pastinake',
      spacing: '30 × 4 cm'
    },
    salat: {
      name: 'Kopfsalat',
      season: 'Aussaat: März–Aug',
      good: 'Radieschen, Kohlrabi, Gurke',
      bad: 'Petersilie, Sellerie',
      spacing: '25 × 25 cm'
    }
  };

  const beetTabs = document.querySelectorAll('.beet-tab');
  const cropNameEl = document.getElementById('beet-crop-name');
  const cropSeasonEl = document.getElementById('beet-crop-season');
  const cropGoodEl = document.getElementById('beet-crop-good');
  const cropBadEl = document.getElementById('beet-crop-bad');
  const cropSpacingEl = document.getElementById('beet-crop-spacing');

  beetTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-crop');
      const data = cropData[key];
      if (!data) return;

      beetTabs.forEach((btn) => btn.setAttribute('aria-selected', String(btn === tab)));
      if (cropNameEl) cropNameEl.textContent = data.name;
      if (cropSeasonEl) cropSeasonEl.textContent = data.season;
      if (cropGoodEl) cropGoodEl.textContent = data.good;
      if (cropBadEl) cropBadEl.textContent = data.bad;
      if (cropSpacingEl) cropSpacingEl.textContent = data.spacing;
    });
  });

  // --- Product Platform Filter ---
  const productGrid = document.getElementById('product-grid');
  const filterPills = document.querySelectorAll('.filter-pill');
  const productCards = productGrid ? productGrid.querySelectorAll('.bento-card') : [];

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.getAttribute('data-filter') || 'all';
      filterPills.forEach((btn) => btn.setAttribute('aria-pressed', String(btn === pill)));

      if (productGrid) {
        productGrid.setAttribute('data-filter', filter);
      }

      productCards.forEach((card) => {
        const platforms = (card.getAttribute('data-platforms') || '').split(/\s+/);
        const matches = filter === 'all' || platforms.includes(filter);
        card.hidden = !matches;
        if (matches) {
          card.classList.add('is-visible');
        }
      });
    });
  });

  // --- Scroll Reveal Observer ---
  const revealNodes = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealNodes.forEach((el) => revealObserver.observe(el));
  }

  // --- Accessible Modal Management ---
  const modals = {
    contact: document.getElementById('contact-modal'),
    career: document.getElementById('career-modal'),
    privacy: document.getElementById('privacy-modal')
  };

  let activeModalKey = null;
  let lastFocusedElement = null;

  function updateHash(hash) {
    try {
      if (window.location.protocol !== 'file:' && window.location.hostname !== '') {
        if (hash) {
          history.replaceState(null, '', hash);
        } else {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch (_) {
      // Ignored in restricted local contexts
    }
  }

  function closeActiveModal(restoreFocus = true) {
    if (!activeModalKey) return;
    const modal = modals[activeModalKey];
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    activeModalKey = null;
    updateHash('');

    if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }

  function openModal(key, options = {}) {
    const modal = modals[key];
    if (!modal) return;

    if (activeModalKey && activeModalKey !== key) {
      closeActiveModal(false);
    }

    setMenuOpen(false);
    lastFocusedElement = document.activeElement;
    activeModalKey = key;

    if (key === 'contact' && options.topic) {
      const select = document.getElementById('modal-bereich');
      if (select) {
        select.value = options.topic;
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const hashMap = {
      contact: '#kontakt',
      career: '#karriere',
      privacy: '#datenschutz'
    };
    updateHash(hashMap[key] || '');

    const focusTarget = modal.querySelector('input, select, textarea, .modal-close');
    if (focusTarget) {
      setTimeout(() => focusTarget.focus(), 60);
    }
  }

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const key = trigger.getAttribute('data-open-modal');
      const topic = trigger.getAttribute('data-topic') || '';
      openModal(key, { topic });
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((closer) => {
    closer.addEventListener('click', () => closeActiveModal(true));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (activeModalKey) {
        closeActiveModal(true);
      } else if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuToggle.focus();
      }
    }
  });

  // Switch cleanly from Contact consent checkbox link to Privacy modal
  const switchToPrivacyBtn = document.getElementById('open-privacy-from-contact');
  if (switchToPrivacyBtn) {
    switchToPrivacyBtn.addEventListener('click', () => {
      openModal('privacy');
    });
  }

  // Open modal if URL contains a deep-link hash (on load & history navigation)
  function syncModalFromHash() {
    const hash = window.location.hash;
    if (hash === '#datenschutz') {
      openModal('privacy');
    } else if (hash === '#kontakt' || hash === '#kontakt-modal') {
      openModal('contact');
    } else if (hash === '#karriere') {
      openModal('career');
    }
  }

  syncModalFromHash();
  window.addEventListener('hashchange', syncModalFromHash);

  // --- Functional Contact Form (mailto + Instant Copy Fallback) ---
  const contactForm = document.getElementById('contact-form');
  const feedbackBox = document.getElementById('contact-feedback');
  const copyMessageBtn = document.getElementById('copy-message-btn');
  const mailtoDirectLink = document.getElementById('mailto-direct-link');
  let lastPreparedEmailBody = '';

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const name = (document.getElementById('modal-name')?.value || '').trim();
      const email = (document.getElementById('modal-email')?.value || '').trim();
      const topicSelect = document.getElementById('modal-bereich');
      const topicLabel =
        topicSelect && topicSelect.selectedIndex >= 0
          ? topicSelect.options[topicSelect.selectedIndex].text
          : 'Allgemeine Anfrage';
      const message = (document.getElementById('modal-message')?.value || '').trim();

      const subject = `[Bento Software] Anfrage: ${topicLabel}`;
      const body = [
        `Name: ${name}`,
        `E-Mail: ${email}`,
        `Bereich: ${topicLabel}`,
        '',
        'Nachricht:',
        message
      ].join('\n');

      lastPreparedEmailBody = `Betreff: ${subject}\n\n${body}`;

      const mailtoHref = `mailto:kontakt@bentosoftware.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (mailtoDirectLink) {
        mailtoDirectLink.setAttribute('href', mailtoHref);
      }
      if (feedbackBox) {
        feedbackBox.hidden = false;
      }

      window.location.href = mailtoHref;
    });
  }

  if (copyMessageBtn) {
    copyMessageBtn.addEventListener('click', async () => {
      if (!lastPreparedEmailBody) return;
      try {
        await navigator.clipboard.writeText(lastPreparedEmailBody);
        const original = copyMessageBtn.textContent;
        copyMessageBtn.textContent = 'Kopiert!';
        setTimeout(() => {
          copyMessageBtn.textContent = original;
        }, 2200);
      } catch (_) {
        copyMessageBtn.textContent = 'Bitte manuell markieren';
      }
    });
  }
})();
