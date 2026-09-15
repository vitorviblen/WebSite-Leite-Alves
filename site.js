(function () {
  const header = document.getElementById('header');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (header) {
    const onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  window.toggleMenu = function () {
    if (!navLinks) return;
    const open = navLinks.classList.toggle('open');
    if (hamburger) {
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  };

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        if (hamburger) {
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  var path = location.pathname.replace(/index\.html$/, '');
  var absolute = location.origin + path;
  var canonical = document.getElementById('canonical');
  if (canonical) canonical.href = absolute;

  function absolutize(selector, attr) {
    var el = document.querySelector(selector);
    if (!el) return;
    var value = el.getAttribute(attr);
    if (value && !/^https?:/i.test(value)) {
      el.setAttribute(attr, new URL(value, location.href).href);
    }
  }

  var ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', absolute);
  absolutize('meta[property="og:image"]', 'content');
  absolutize('meta[name="twitter:image"]', 'content');

  document.querySelectorAll('.fade-up').forEach(function (el, i) {
    el.style.setProperty('--delay', (i % 8) * 0.07 + 's');
  });

  function reveal(el) {
    el.classList.add('visible');
  }

  if (reduceMotion) {
    document.querySelectorAll('.fade-up').forEach(reveal);
  } else if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.fade-up').forEach(function (el) {
      obs.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up').forEach(reveal);
  }

  if (!reduceMotion) {
    document.querySelectorAll('.stat-number').forEach(function (el) {
      var raw = el.textContent.trim();
      var num = parseInt(raw.replace(/\D/g, ''), 10);
      if (!num) return;
      var suffix = raw.replace(/[0-9]/g, '');
      var started = false;
      var run = function () {
        if (started) return;
        started = true;
        var start = performance.now();
        var duration = 1100;
        var tick = function (now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(num * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        var countObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              run();
              countObs.disconnect();
            }
          });
        }, { threshold: 0.4 });
        countObs.observe(el);
      } else {
        run();
      }
    });
  }
})();
