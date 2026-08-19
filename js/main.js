/* ============================================================
   FlexiRates — Main JavaScript
   Powered by Bill Buddy
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Utility helpers
     ---------------------------------------------------------- */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* Analytics helper — sends a custom event (with optional properties) to
     Plausible if it is loaded. Safe no-op if the script is blocked/absent. */
  function track(name, props) {
    try {
      if (typeof window.plausible === 'function') {
        window.plausible(name, props ? { props: props } : undefined);
      }
    } catch (e) { /* never let analytics break the page */ }
  }

  /* ----------------------------------------------------------
     1. Sticky Navigation
        Adds .scrolled class to .site-nav after scrolling 10px
     ---------------------------------------------------------- */
  function initStickyNav() {
    var nav = $('.site-nav');
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ----------------------------------------------------------
     2. Mobile Hamburger Menu
     ---------------------------------------------------------- */
  function initMobileMenu() {
    var hamburger = $('.nav-hamburger');
    var mobileMenu = $('.nav-mobile');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      var isOpen = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close when a link in mobile menu is clicked
    $$('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('is-open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ----------------------------------------------------------
     3. Smooth Scroll for anchor links
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a[href^="#"]');
      if (!target) return;

      var href = target.getAttribute('href');
      if (href === '#') return;

      var destination = document.getElementById(href.slice(1));
      if (!destination) return;

      e.preventDefault();
      var navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72'
      );
      var top = destination.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     4. Active Nav Link
        Marks the current page's nav link with .active
     ---------------------------------------------------------- */
  function initActiveNav() {
    // Resolve the current page and each link to a normalised absolute path so
    // that /blog/index.html (Resources) is not confused with /index.html (Home).
    function norm(pathname) {
      var p = pathname;
      try { p = decodeURIComponent(p); } catch (e) {}
      p = p.replace(/index\.html$/, ''); // treat /dir/index.html the same as /dir/
      if (p.charAt(p.length - 1) !== '/') p = p + '/';
      return p;
    }
    var current = norm(window.location.pathname);

    $$('.nav-links a, .nav-mobile a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return;
      var linkPath;
      try {
        linkPath = norm(new URL(href, window.location.href).pathname);
      } catch (e) {
        return;
      }
      if (linkPath === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ----------------------------------------------------------
     5. Intersection Observer — fade-in animations
     ---------------------------------------------------------- */
  function initFadeInAnimations() {
    if (!window.IntersectionObserver) {
      // Fallback: make all visible immediately
      $$('.fade-in').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    $$('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     6. FAQ Accordion
     ---------------------------------------------------------- */
  function initFAQ() {
    $$('.faq-item__question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('is-open');

        // Close all
        $$('.faq-item').forEach(function (el) {
          el.classList.remove('is-open');
          el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked (unless it was already open)
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          var q = btn.querySelector('.faq-item__question-text');
          track('FAQ Open', { question: q ? q.textContent.trim() : '', page: window.location.pathname });
        }
      });

      btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ----------------------------------------------------------
     7. Contact Form Validation
     ---------------------------------------------------------- */
  function initContactForm() {
    var form = $('#contact-form');
    if (!form) return;

    var successMsg = $('#form-success');

    // Form-start event — fired once, on first interaction, for abandonment analysis.
    var formStarted = false;
    form.addEventListener('focusin', function () {
      if (!formStarted) {
        formStarted = true;
        track('Demo Form Start', { page: window.location.pathname });
      }
    });

    function showError(field, msg) {
      field.classList.add('error');
      var errorEl = document.getElementById(field.id + '-error');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
      }
    }

    function clearError(field) {
      field.classList.remove('error');
      var errorEl = document.getElementById(field.id + '-error');
      if (errorEl) {
        errorEl.classList.remove('visible');
      }
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Live validation on blur
    $$('[data-required]', form).forEach(function (field) {
      field.addEventListener('blur', function () {
        if (!field.value.trim()) {
          showError(field, 'This field is required.');
        } else if (field.type === 'email' && !validateEmail(field.value.trim())) {
          showError(field, 'Please enter a valid email address.');
        } else {
          clearError(field);
        }
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          if (field.value.trim()) {
            if (field.type === 'email' && !validateEmail(field.value.trim())) {
              return;
            }
            clearError(field);
          }
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;

      $$('[data-required]', form).forEach(function (field) {
        clearError(field);
        if (!field.value.trim()) {
          showError(field, 'This field is required.');
          isValid = false;
        } else if (field.type === 'email' && !validateEmail(field.value.trim())) {
          showError(field, 'Please enter a valid work email address.');
          isValid = false;
        }
      });

      if (!isValid) {
        // Focus first error
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Submit to Web3Forms — emails the submission to the address tied to the
      // access_key (sales@billbuddy.com). No backend of our own required.
      var submitBtn = form.querySelector('[type="submit"]');
      var originalLabel = submitBtn.textContent;
      var formError = document.getElementById('form-error');
      if (formError) { formError.style.display = 'none'; formError.textContent = ''; }
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            // Conversion event — only on a confirmed successful send. No PII sent.
            track('Demo Submit', { page: window.location.pathname });
            form.style.display = 'none';
            if (successMsg) successMsg.classList.add('visible');
          } else {
            throw new Error((result.data && result.data.message) || 'Submission failed');
          }
        })
        .catch(function () {
          track('Demo Submit Error', { page: window.location.pathname });
          submitBtn.textContent = originalLabel;
          submitBtn.disabled = false;
          if (formError) {
            formError.textContent =
              'Sorry — something went wrong sending your request. Please email sales@billbuddy.com or try again.';
            formError.style.display = 'block';
          }
        });
    });
  }

  /* ----------------------------------------------------------
     7b. Analytics — CTA clicks, scroll depth, video engagement
         (page views + outbound links are handled by the Plausible
         script tags in the page <head>).
     ---------------------------------------------------------- */
  function initAnalytics() {
    var path = window.location.pathname;

    function locationOf(el) {
      if (el.closest('.nav-mobile')) return 'mobile-nav';
      if (el.closest('.site-nav')) return 'nav';
      if (el.closest('.cta-section')) return 'final-cta';
      if (el.closest('.site-footer')) return 'footer';
      if (el.closest('.hero')) return 'hero';
      return 'body';
    }

    // Click tracking: explicit data-analytics tags, and demo CTAs
    document.addEventListener('click', function (e) {
      var tagged = e.target.closest('[data-analytics]');
      if (tagged) {
        var props = { page: path };
        Array.prototype.forEach.call(tagged.attributes, function (a) {
          if (a.name.indexOf('data-prop-') === 0) {
            props[a.name.slice(10)] = a.value;
          }
        });
        track(tagged.getAttribute('data-analytics'), props);
        return;
      }
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) {
        // mailto: clicks are NOT covered by Plausible's outbound-links extension
        track('Email Click', { location: locationOf(link), page: path });
      } else if (/contact\.html/.test(href)) {
        track('CTA: Request Demo', { location: locationOf(link), page: path });
      }
    });

    // Scroll depth — once per threshold per page load
    var thresholds = [25, 50, 75, 90];
    var fired = {};
    window.addEventListener('scroll', function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = (window.scrollY / scrollable) * 100;
      thresholds.forEach(function (t) {
        if (pct >= t && !fired[t]) {
          fired[t] = true;
          track('Scroll Depth', { percent: String(t), page: path });
        }
      });
    }, { passive: true });

    // Video engagement — load the Vimeo Player API only if an embed exists
    var vimeo = document.querySelector('iframe[src*="player.vimeo.com"]');
    if (vimeo) {
      var s = document.createElement('script');
      s.src = 'https://player.vimeo.com/api/player.js';
      s.async = true;
      s.onload = function () {
        if (!window.Vimeo) return;
        var player = new window.Vimeo.Player(vimeo);
        var started = false;
        player.on('play', function () {
          if (started) return;
          started = true;
          track('Video Play', { page: path });
        });
        player.on('ended', function () {
          track('Video Complete', { page: path });
        });
      };
      document.body.appendChild(s);
    }
  }

  /* ----------------------------------------------------------
     8. Init everything on DOMContentLoaded
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initStickyNav();
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initFadeInAnimations();
    initFAQ();
    initContactForm();
    initAnalytics();
  });
})();
