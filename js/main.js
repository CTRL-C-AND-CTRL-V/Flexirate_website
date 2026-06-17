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
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';

    // Normalise: empty or '/' means index.html
    if (filename === '' || filename === '/') filename = 'index.html';

    // Desktop links
    $$('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkFile = href.split('/').pop() || 'index.html';
      if (linkFile === filename) {
        link.classList.add('active');
      }
    });

    // Mobile links
    $$('.nav-mobile a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkFile = href.split('/').pop() || 'index.html';
      if (linkFile === filename) {
        link.classList.add('active');
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

      // Simulate submission (no backend)
      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function () {
        form.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');
      }, 1000);
    });
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
  });
})();
