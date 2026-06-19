(function() {
    function closestRoot(element) {
        return element.closest('main') || document;
    }

    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function(hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                    start();
                }
            });
        });

        hero.addEventListener('mouseenter', function() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        });
        hero.addEventListener('mouseleave', start);
        start();
    });

    function normalized(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(form) {
        var root = closestRoot(form);
        var keywordInput = form.querySelector('[data-filter-keyword]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var keyword = normalized(keywordInput && keywordInput.value);
        var year = normalized(yearSelect && yearSelect.value);
        var type = normalized(typeSelect && typeSelect.value);
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function(card) {
            var haystack = normalized([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var cardYear = normalized(card.getAttribute('data-year'));
            var cardType = normalized(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        var empty = root.querySelector('[data-no-result]');
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    document.querySelectorAll('[data-local-filter]').forEach(function(form) {
        var keywordInput = form.querySelector('[data-filter-keyword]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && keywordInput) {
            keywordInput.value = query;
        }
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            applyFilter(form);
        });
        form.querySelectorAll('input, select').forEach(function(control) {
            control.addEventListener('input', function() {
                applyFilter(form);
            });
            control.addEventListener('change', function() {
                applyFilter(form);
            });
        });
        applyFilter(form);
    });
})();
