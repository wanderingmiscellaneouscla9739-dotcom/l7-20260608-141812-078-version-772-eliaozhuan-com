(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }

        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var searchPage = document.querySelector("[data-search-page]");

        if (!searchPage) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim().toLowerCase();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var visible = 0;

        if (input) {
            input.value = params.get("q") || "";
        }

        if (title && keyword) {
            title.textContent = "与“" + (params.get("q") || "") + "”相关的影片";
        }

        cards.forEach(function (card) {
            var value = (card.getAttribute("data-search") || "").toLowerCase();
            var matched = !keyword || value.indexOf(keyword) !== -1;
            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");

        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }

            var stream = video.getAttribute("data-stream");

            if (!stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function startVideo() {
            loadVideo();
            player.classList.add("is-playing");
            var playResult = video.play();

            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", function () {
            startVideo();
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove("is-playing");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
