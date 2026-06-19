(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });

            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function startAuto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                showSlide(current);
                startAuto();
            });
        });

        showSlide(0);
        startAuto();
    }

    var filterToolbar = document.querySelector("[data-filter-toolbar]");
    var filterList = document.querySelector("[data-filter-list]");

    if (filterToolbar && filterList) {
        var queryInput = filterToolbar.querySelector("[data-filter-search]");
        var yearInput = filterToolbar.querySelector("[data-filter-year]");
        var typeInput = filterToolbar.querySelector("[data-filter-type]");
        var categoryInput = filterToolbar.querySelector("[data-filter-category]");
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        function getValue(input) {
            return input ? input.value.trim().toLowerCase() : "";
        }

        function applyFilter() {
            var query = getValue(queryInput);
            var year = getValue(yearInput);
            var type = getValue(typeInput);
            var category = getValue(categoryInput);

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }

                if (category && cardCategory !== category) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
            });
        }

        [queryInput, yearInput, typeInput, categoryInput].forEach(function (input) {
            if (input) {
                input.addEventListener("input", applyFilter);
                input.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }

    var playerShell = document.querySelector(".player-shell[data-stream]");

    if (playerShell) {
        var video = playerShell.querySelector("video");
        var playCover = playerShell.querySelector(".play-cover");
        var streamUrl = playerShell.getAttribute("data-stream");
        var hlsInstance = null;
        var hasPrepared = false;
        var playRequested = false;

        function requestPlay() {
            if (!video) {
                return;
            }

            var playTask = video.play();

            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        function prepareVideo() {
            if (!video || !streamUrl || hasPrepared) {
                return;
            }

            hasPrepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);

                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (playRequested) {
                            requestPlay();
                        }
                    });
                }

                return;
            }

            video.src = streamUrl;
        }

        function beginPlay() {
            playRequested = true;
            prepareVideo();
            playerShell.classList.add("playing");

            if (playCover) {
                playCover.classList.add("is-hidden");
            }

            requestPlay();
        }

        if (playCover) {
            playCover.addEventListener("click", beginPlay);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    beginPlay();
                }
            });

            video.addEventListener("play", function () {
                playerShell.classList.add("playing");

                if (playCover) {
                    playCover.classList.add("is-hidden");
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
