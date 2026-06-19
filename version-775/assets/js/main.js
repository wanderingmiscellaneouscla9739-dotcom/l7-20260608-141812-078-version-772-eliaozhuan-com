(function () {
  function getText(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");

    if (!panel) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var searchInput = panel.querySelector("[data-filter-search]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var resetButton = panel.querySelector("[data-filter-reset]");
    var resultCount = document.querySelector("[data-result-count]");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");

    if (queryValue && searchInput) {
      searchInput.value = queryValue;
    }

    function filter() {
      var q = getText(searchInput && searchInput.value);
      var type = getText(typeSelect && typeSelect.value);
      var year = getText(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].map(getText).join(" ");
        var cardType = getText(card.getAttribute("data-type"));
        var cardYear = getText(card.getAttribute("data-year"));
        var matched = (!q || haystack.indexOf(q) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!year || cardYear === year);

        card.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = "共找到 " + visible + " 部影片";
      }
    }

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }

        if (typeSelect) {
          typeSelect.value = "";
        }

        if (yearSelect) {
          yearSelect.value = "";
        }

        filter();
      });
    }

    filter();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-button]");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hls = null;

      if (!video || !button || !stream) {
        return;
      }

      function attach() {
        if (started) {
          return;
        }

        started = true;
        button.hidden = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.hidden = false;
            started = false;
          });
        }
      }

      button.addEventListener("click", attach);

      video.addEventListener("click", function () {
        if (!started) {
          attach();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
