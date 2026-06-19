document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
});

function setupMobileNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function stopAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startAutoPlay();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeIndex - 1);
            startAutoPlay();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeIndex + 1);
            startAutoPlay();
        });
    }

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    showSlide(0);
    startAutoPlay();
}

function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    roots.forEach(function (root) {
        var input = root.querySelector("[data-filter-input]");
        var yearFilter = root.querySelector("[data-year-filter]");
        var sortFilter = root.querySelector("[data-sort-filter]");
        var grid = root.querySelector("[data-card-grid]");
        var count = root.querySelector("[data-filter-count]");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-keywords") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var shouldShow = matchedKeyword && matchedYear;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " 部影片";
            }
        }

        function sortCards() {
            if (!sortFilter) {
                return;
            }

            var mode = sortFilter.value;
            var sorted = cards.slice().sort(function (a, b) {
                var ay = Number(a.getAttribute("data-year") || 0);
                var by = Number(b.getAttribute("data-year") || 0);
                var at = a.getAttribute("data-title") || "";
                var bt = b.getAttribute("data-title") || "";

                if (mode === "year-asc") {
                    return ay - by || at.localeCompare(bt, "zh-CN");
                }

                if (mode === "title") {
                    return at.localeCompare(bt, "zh-CN");
                }

                return by - ay || at.localeCompare(bt, "zh-CN");
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });

            cards = sorted;
            apply();
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", apply);
        }

        if (sortFilter) {
            sortFilter.addEventListener("change", sortCards);
        }

        apply();
    });
}

function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var button = player.querySelector("[data-player-button]");
        var video = player.querySelector("video");
        var source = player.getAttribute("data-src");
        var started = false;

        if (!button || !video || !source) {
            return;
        }

        button.addEventListener("click", function () {
            if (!started) {
                started = true;
                attachVideoSource(video, source);
            }

            button.classList.add("is-hidden");
            video.play().catch(function () {
                button.classList.remove("is-hidden");
            });
        });
    });
}

function attachVideoSource(video, source) {
    var isM3u8 = /\.m3u8(\?|$)/i.test(source);

    if (isM3u8 && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        return;
    }

    if (isM3u8 && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
    }

    video.src = source;
}
