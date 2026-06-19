(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupSearchScopes();
    setupPlayer();
  });

  function setupMenu() {
    var button = document.querySelector('.menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      }, { once: true });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchScopes() {
    var scopes = document.querySelectorAll('[data-search-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('.js-search-input');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));
      if (!input && buttons.length === 0) {
        return;
      }
      var activeFilter = 'all';
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
          var filter = card.getAttribute('data-filter') || '';
          var matchText = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === 'all' || filter === activeFilter;
          card.classList.toggle('is-hidden', !(matchText && matchFilter));
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector('video[data-stream]');
    var shell = document.querySelector('.player-shell');
    var button = document.querySelector('.player-play');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    function playVideo() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          startPlayback();
        } else {
          import('./hls.js').then(function (module) {
            var Hls = module.H;
            if (Hls && Hls.isSupported && Hls.isSupported()) {
              var hls = new Hls();
              hls.loadSource(stream);
              hls.attachMedia(video);
              video.hlsPlayer = hls;
              video.addEventListener('loadedmetadata', startPlayback, { once: true });
            } else {
              video.src = stream;
              startPlayback();
            }
          }).catch(function () {
            video.src = stream;
            startPlayback();
          });
        }
      } else {
        startPlayback();
      }
      if (shell) {
        shell.classList.add('is-playing');
      }
    }
    function startPlayback() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }
}());
