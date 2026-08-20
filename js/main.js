/* ==========================================================================
   UNIVENS — interactions
   ========================================================================== */
(function () {
  'use strict';

  var d = document;

  /* ---------- Hero video slides (crossfade every 5s) ---------- */
  var heroSlides = d.querySelectorAll('.hero-video');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroSlides.length) {
    heroSlides.forEach(function (v, i) {
      if (reducedMotion) {
        v.removeAttribute('autoplay');
        if (i > 0) v.pause();
      }
    });
    if (heroSlides.length > 1 && !reducedMotion) {
      var slideIdx = 0;
      var fadeMs = 1200;
      function advanceSlide() {
        var current = heroSlides[slideIdx];
        slideIdx = (slideIdx + 1) % heroSlides.length;
        var next = heroSlides[slideIdx];
        var p = next.play();
        if (p && p.catch) p.catch(function () {});
        current.classList.remove('is-active');
        next.classList.add('is-active');
        setTimeout(function () {
          if (!current.classList.contains('is-active') && !current.paused) current.pause();
        }, fadeMs);
      }
      setInterval(advanceSlide, 5000);
    }
  }

  /* ---------- Mobile menu ---------- */
  var toggle = d.getElementById('navToggle');
  var menu = d.getElementById('navMenu');
  var header = d.getElementById('header');
  var panel = d.getElementById('navPanel');

  function bodyLock() {
    var open = (menu && menu.classList.contains('open')) || (panel && panel.classList.contains('open'));
    d.body.style.overflow = open ? 'hidden' : '';
  }

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    bodyLock();
    if (header) {
      if (open) header.classList.remove('light');
      else onScrollHeader();
    }
  }

  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle('open', open);
    var cta = d.querySelector('.nav-cta');
    if (cta) cta.setAttribute('aria-expanded', open ? 'true' : 'false');
    bodyLock();
    if (header) {
      if (open) header.classList.remove('light');
      else onScrollHeader();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setMenu(false);
        setPanel(false);
        closeDrop();
      }
    });
  }

  if (panel) {
    var panelClose = d.getElementById('navPanelClose');
    var navCta = d.querySelector('.nav-cta');
    if (navCta) {
      navCta.addEventListener('click', function (e) {
        e.preventDefault();
        setMenu(false);
        setPanel(!panel.classList.contains('open'));
      });
    }
    if (panelClose) {
      panelClose.addEventListener('click', function () { setPanel(false); });
    }
    panel.addEventListener('click', function (e) {
      if (e.target === panel) setPanel(false);
    });
    panel.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () { setPanel(false); });
    });
  }

  /* ---------- Solutions dropdown ---------- */
  var drop = d.querySelector('.nav-drop');
  var dropBtn = drop ? drop.querySelector('.nav-drop-toggle') : null;

  function closeDrop() {
    if (!drop) return;
    drop.classList.remove('open');
    if (dropBtn) dropBtn.setAttribute('aria-expanded', 'false');
  }

  if (drop && dropBtn) {
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = drop.classList.toggle('open');
      dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drop.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrop);
    });
    d.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) closeDrop();
    });
  }

  /* ---------- Header scroll state + adaptive theme ---------- */
  var themeSections = d.querySelectorAll('.hero, .clients, .cta, .footer');
  var heroSec = d.querySelector('.hero');
  function onScrollHeader() {
    if (!header) return;
    if (menu && menu.classList.contains('open')) return;
    if (panel && panel.classList.contains('open')) return;
    var heroH = heroSec ? heroSec.offsetHeight : 0;
    if (window.scrollY < heroH * 0.5) {
      header.classList.add('over-hero');
      header.classList.remove('scrolled', 'light');
      return;
    }
    header.classList.remove('over-hero');
    if (window.scrollY > 8) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    var probe = window.scrollY + header.offsetHeight / 2;
    var dark = false;
    themeSections.forEach(function (s) {
      if (probe >= s.offsetTop && probe < s.offsetTop + s.offsetHeight) dark = true;
    });
    header.classList.toggle('light', !dark);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- FAQ accordion ---------- */
  var faqItems = d.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        var otherBtn = other.querySelector('.faq-q');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Scrollspy (active nav link) ---------- */
  var navLinks = d.querySelectorAll('#navLinks > a');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var sec = d.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: link });
  });

  function spy() {
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function (s) {
      if (pos >= s.el.offsetTop) current = s.id;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle('active', s.id === current);
    });
  }
  if (sections.length) {
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();