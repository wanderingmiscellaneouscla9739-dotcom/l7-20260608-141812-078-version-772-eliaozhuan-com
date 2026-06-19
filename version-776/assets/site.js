(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');

    panels.forEach(function (panel) {
      var root = panel.parentNode;
      var grid = qs('[data-filter-grid]', root);
      var count = qs('[data-result-count]', root);
      var keywordInput = qs('[data-filter-keyword]', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var reset = qs('[data-filter-reset]', panel);

      if (!grid) {
        return;
      }

      var items = qsa('.movie-card, .ranking-row', grid);

      function update() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-type'),
            item.getAttribute('data-year'),
            item.getAttribute('data-tags'),
            item.getAttribute('data-category')
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesType = !type || normalize(item.getAttribute('data-type')).indexOf(type) !== -1;
          var matchesYear = !year || normalize(item.getAttribute('data-year')) === year;
          var show = matchesKeyword && matchesType && matchesYear;

          item.classList.toggle('is-hidden', !show);

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' 部作品';
        }
      }

      [keywordInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keywordInput) {
            keywordInput.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          update();
        });
      }

      update();
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 在线观看封面" class="poster-img" loading="lazy">',
      '      <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="card-content">',
      '      <div class="card-kicker">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>👁 ' + Number(movie.views || 0).toLocaleString() + '</span>',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.categoryName) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var app = qs('[data-search-app]');

    if (!app || !window.MOVIES_INDEX) {
      return;
    }

    var input = qs('[data-search-input]', app);
    var form = qs('[data-search-form]', app);
    var results = qs('[data-search-results]', app);
    var count = qs('[data-search-count]', app);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var keyword = normalize(query);
      var matches = window.MOVIES_INDEX.filter(function (movie) {
        if (!keyword) {
          return false;
        }

        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.categoryName
        ].join(' ')).indexOf(keyword) !== -1;
      });

      var limited = matches.slice(0, 120);
      results.innerHTML = limited.map(movieCard).join('');

      if (count) {
        if (!keyword) {
          count.textContent = '请输入关键词开始搜索。';
        } else {
          count.textContent = '找到 ' + matches.length + ' 部相关作品，当前显示 ' + limited.length + ' 部。';
        }
      }
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var url = new URL(window.location.href);
        if (query) {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        render(query);
      });
    }

    qsa('[data-quick-search]', app).forEach(function (button) {
      button.addEventListener('click', function () {
        var query = button.getAttribute('data-quick-search') || '';
        if (input) {
          input.value = query;
        }
        render(query);
      });
    });

    render(initialQuery);
  }

  function loadScript(src, done) {
    var existing = qs('script[src="' + src + '"]');

    if (existing) {
      existing.addEventListener('load', done);
      done();
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = done;
    script.onerror = done;
    document.head.appendChild(script);
  }

  function initPlayer() {
    var video = qs('#movie-player');
    var button = qs('[data-play-button]');

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    var initialized = false;

    function start() {
      if (!src) {
        return;
      }

      if (initialized) {
        video.play().catch(function () {});
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {});
      } else {
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js', function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = src;
            video.play().catch(function () {});
          }
        });
      }

      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  function initImageFallback() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
        var parent = img.parentElement;
        if (parent && !parent.getAttribute('data-image-missing')) {
          parent.setAttribute('data-image-missing', 'true');
          parent.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
    initImageFallback();
  });
})();
