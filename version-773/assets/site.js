(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu]");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function initCatalogFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-filter]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-keyword]");
      var category = form.querySelector("[data-filter-category]");
      var region = form.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));
      var empty = document.querySelector(".no-results");

      function apply() {
        var keyword = normalize(input && input.value);
        var catValue = normalize(category && category.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchCategory = !catValue || cardCategory === catValue || text.indexOf(catValue) !== -1;
          var matchRegion = !regionValue || cardRegion === regionValue;
          var showCard = matchKeyword && matchCategory && matchRegion;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function initHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-header-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var keyword = input ? input.value.trim() : "";
        var url = "search.html";
        if (keyword) {
          url += "?q=" + encodeURIComponent(keyword);
        }
        window.location.href = url;
      });
    });
  }

  window.initVideoPlayer = function (source) {
    ready(function () {
      var video = document.querySelector(".player-video");
      var cover = document.querySelector(".player-cover");
      var controls = Array.prototype.slice.call(document.querySelectorAll("[data-play-control]"));
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = source;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      controls.forEach(function (control) {
        control.addEventListener("click", play);
      });
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initCatalogFilters();
    initHeaderSearch();
  });
})();
