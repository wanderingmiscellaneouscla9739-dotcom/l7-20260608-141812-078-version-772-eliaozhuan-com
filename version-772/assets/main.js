(() => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', () => {
            panel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const activate = (index) => {
            current = index;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => activate(index));
        });

        if (slides.length > 1) {
            window.setInterval(() => {
                activate((current + 1) % slides.length);
            }, 5000);
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        const searchInput = filterPanel.querySelector('[data-search-input]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const yearSelect = filterPanel.querySelector('[data-filter-year]');
        const emptyState = filterPanel.querySelector('[data-empty-state]');
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

        const normalize = (value) => String(value || '').trim().toLowerCase();

        const matchYear = (cardYear, selectedYear) => {
            if (!selectedYear) {
                return true;
            }

            const year = Number(cardYear);

            if (selectedYear === '2020') {
                return year <= 2020;
            }

            return String(cardYear) === selectedYear;
        };

        const applyFilters = () => {
            const query = normalize(searchInput ? searchInput.value : '');
            const selectedType = normalize(typeSelect ? typeSelect.value : '');
            const selectedRegion = normalize(regionSelect ? regionSelect.value : '');
            const selectedYear = yearSelect ? yearSelect.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' '));
                const type = normalize(card.dataset.type);
                const region = normalize(card.dataset.region);
                const year = card.dataset.year || '';
                const matched = (!query || haystack.includes(query))
                    && (!selectedType || type.includes(selectedType))
                    && (!selectedRegion || region.includes(selectedRegion) || haystack.includes(selectedRegion))
                    && matchYear(year, selectedYear);

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };

        [searchInput, typeSelect, regionSelect, yearSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }
})();
