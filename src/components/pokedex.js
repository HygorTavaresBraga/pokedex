import PokemonCard from './pokemon-card.js';
import { fetchPokemon, fetchPokemonListPage } from '../api/pokeapi.js';

function debounce(fn, waitMs) {
    let t = null;
    return (...args) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), waitMs);
    };
}

class Pokedex {
    constructor(root) {
        this.root = root;

        this.pageSize = 20;
        this.page = 1;
        this.totalPages = 1;
        this.totalCount = 0;

        this.query = '';
        this.allPokemonNames = null;

        this.ui = {
            homeBtn: null,
            pokedexBtn: null,
            searchInput: null,
            clearBtn: null,
            status: null,
            grid: null,
            pagination: null,
            prevBtn: null,
            nextBtn: null,
            prevIcon: null,
            nextIcon: null,
            pages: null,
        };

        this._resizeCleanup = null;
    }

    async init() {
        this.renderShell();
        this.updatePageSizeFromLayout();
        this.stripQueryFromUrl();

        await this.loadAndRender();
    }

    stripQueryFromUrl() {
        try {
            if (window.location.search && window.location.search.length > 1) {
                const clean = window.location.pathname + window.location.hash;
                window.history.replaceState({}, '', clean);
            }
        } catch {
        }
    }

    computePageSize() {
        const grid = this.ui.grid;
        if (!grid) return this.pageSize;

        const cardWidth = 203;
        const rows = 3;

        const style = window.getComputedStyle(grid);
        const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
        const paddingRight = Number.parseFloat(style.paddingRight) || 0;
        const columnGap = Number.parseFloat(style.columnGap) || 17;

        const available = Math.max(0, grid.clientWidth - paddingLeft - paddingRight);
        const columns = Math.max(1, Math.floor((available + columnGap) / (cardWidth + columnGap)));
        const pageSize = Math.max(1, columns * rows);

        return Math.min(pageSize, 80);
    }

    renderSkeletonCards(count) {
        this.ui.grid.innerHTML = '';
        for (let i = 0; i < count; i += 1) {
            const card = document.createElement('article');
            card.className = 'pokemon-card pokemon-card--skeleton';

            const top = document.createElement('div');
            top.className = 'pokemon-card__top';

            const types = document.createElement('div');
            types.className = 'pokemon-card__types';
            const badge1 = document.createElement('div');
            badge1.className = 'skeleton skeleton--pill';
            const badge2 = document.createElement('div');
            badge2.className = 'skeleton skeleton--pill';
            types.appendChild(badge1);
            types.appendChild(badge2);

            const number = document.createElement('div');
            number.className = 'skeleton skeleton--text skeleton--number';

            top.appendChild(types);
            top.appendChild(number);

            const image = document.createElement('div');
            image.className = 'skeleton skeleton--image';

            const name = document.createElement('div');
            name.className = 'skeleton skeleton--text skeleton--name';

            const center = document.createElement('div');
            center.className = 'pokemon-card__center';
            center.appendChild(image);
            center.appendChild(name);

            card.appendChild(top);
            card.appendChild(center);
            this.ui.grid.appendChild(card);
        }
    }

    updatePageSizeFromLayout() {
        const newSize = this.computePageSize();
        if (newSize !== this.pageSize) {
            this.pageSize = newSize;
            this.page = 1;
        }

        if (!this._resizeCleanup) {
            const onResize = debounce(() => {
                const next = this.computePageSize();
                if (next !== this.pageSize) {
                    this.pageSize = next;
                    this.page = 1;
                    this.loadAndRender();
                }
            }, 150);

            let ro = null;
            if (window.ResizeObserver) {
                ro = new ResizeObserver(() => onResize());
                if (this.ui.grid) ro.observe(this.ui.grid);
            }

            window.addEventListener('resize', onResize);
            this._resizeCleanup = () => {
                window.removeEventListener('resize', onResize);
                if (ro) ro.disconnect();
            };
        }
    }

    renderShell() {
        this.root.innerHTML = '';

        const header = document.createElement('header');
        header.className = 'header';

        const brand = document.createElement('div');
        brand.className = 'brand';

        const logo = document.createElement('img');
        logo.className = 'brand__logo';
        logo.alt = 'Logo';
        logo.src = './src/assets/logo.svg';

        brand.appendChild(logo);

        const nav = document.createElement('nav');
        nav.className = 'nav';

        const homeBtn = document.createElement('button');
        homeBtn.className = 'nav__button nav__button--home';
        homeBtn.type = 'button';
        homeBtn.textContent = 'Home';
        homeBtn.style.backgroundColor = '#F5F5F5';
        homeBtn.style.borderRadius = '8px';
        homeBtn.style.width = '61px';
        homeBtn.style.height = '32px';
        homeBtn.style.display = 'inline-flex';
        homeBtn.style.alignItems = 'center';
        homeBtn.style.justifyContent = 'center';

        const pokedexBtn = document.createElement('button');
        pokedexBtn.className = 'nav__button';
        pokedexBtn.type = 'button';
        pokedexBtn.textContent = 'Pokedex';

        nav.appendChild(homeBtn);
        nav.appendChild(pokedexBtn);

        header.appendChild(brand);
        header.appendChild(nav);

        const searchSection = document.createElement('section');
        searchSection.className = 'search-section';

        const searchWrap = document.createElement('div');
        searchWrap.className = 'search-wrap';

        const search = document.createElement('input');
        search.className = 'search-input';
        search.type = 'text';
        search.placeholder = 'Faça uma busca pelo nome do pokémon';
        search.autocomplete = 'off';

        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear';
        clearButton.type = 'button';
        clearButton.setAttribute('aria-label', 'Limpar busca');
        clearButton.textContent = '×';
        clearButton.hidden = true;

        const searchButton = document.createElement('button');
        searchButton.className = 'search-button';
        searchButton.type = 'button';
        searchButton.setAttribute('aria-label', 'Buscar');

        const searchIcon = document.createElement('img');
        searchIcon.className = 'search-button__icon';
        searchIcon.alt = '';
        searchIcon.src = './src/assets/magnify-glass.svg';

        searchButton.appendChild(searchIcon);

        searchWrap.appendChild(search);
        searchWrap.appendChild(clearButton);
        searchWrap.appendChild(searchButton);

        searchSection.appendChild(searchWrap);

        const status = document.createElement('div');
        status.className = 'status';

        const grid = document.createElement('main');
        grid.className = 'grid';

        const pagination = document.createElement('footer');
        pagination.className = 'pagination';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination__button';
        prevBtn.type = 'button';

        const prevIcon = document.createElement('img');
        prevIcon.className = 'pagination__arrow';
        prevIcon.alt = '';
        prevIcon.src = './src/assets/active-arrow.svg';
        prevIcon.style.transform = 'rotate(180deg)';

        const prevLabel = document.createElement('span');
        prevLabel.textContent = 'Anterior';

        prevBtn.appendChild(prevIcon);
        prevBtn.appendChild(prevLabel);

        const pages = document.createElement('div');
        pages.className = 'pagination__pages';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination__button';
        nextBtn.type = 'button';

        const nextLabel = document.createElement('span');
        nextLabel.textContent = 'Próximo';

        const nextIcon = document.createElement('img');
        nextIcon.className = 'pagination__arrow';
        nextIcon.alt = '';
        nextIcon.src = './src/assets/active-arrow.svg';

        nextBtn.appendChild(nextLabel);
        nextBtn.appendChild(nextIcon);

        pagination.appendChild(prevBtn);
        pagination.appendChild(pages);
        pagination.appendChild(nextBtn);

        this.root.appendChild(header);
        this.root.appendChild(searchSection);
        this.root.appendChild(status);
        this.root.appendChild(grid);
        this.root.appendChild(pagination);

        this.ui = { homeBtn, pokedexBtn, searchInput: search, clearBtn: clearButton, status, grid, pagination, prevBtn, nextBtn, prevIcon, nextIcon, pages };

        this.updatePageSizeFromLayout();

        const runSearch = () => {
            this.query = search.value.trim().toLowerCase();
            this.page = 1;
            this.loadAndRender();
        };

        searchButton.addEventListener('click', runSearch);

        search.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key !== 'Enter') return;
            e.preventDefault();
            runSearch();
        });

        search.addEventListener('input', () => {
            const hasValue = search.value.trim().length > 0;
            clearButton.hidden = !hasValue;
        });

        clearButton.hidden = search.value.trim().length === 0;

        clearButton.addEventListener('click', () => {
            search.value = '';
            clearButton.hidden = true;
            this.query = '';
            this.page = 1;
            this.loadAndRender();
        });

        prevBtn.addEventListener('click', () => {
            if (this.page <= 1) return;
            this.page -= 1;
            this.loadAndRender();
        });

        nextBtn.addEventListener('click', () => {
            if (this.page >= this.totalPages) return;
            this.page += 1;
            this.loadAndRender();
        });
    }

    setStatus(text) {
        this.ui.status.textContent = text;
    }

    setPagination() {
        this.ui.prevBtn.disabled = this.page <= 1;
        this.ui.nextBtn.disabled = this.page >= this.totalPages;

        if (this.ui.prevIcon) {
            this.ui.prevIcon.src = this.ui.prevBtn.disabled
                ? './src/assets/desactived-arrow.svg'
                : './src/assets/active-arrow.svg';
            this.ui.prevIcon.style.transform = this.ui.prevBtn.disabled ? 'none' : 'rotate(180deg)';
        }

        if (this.ui.nextIcon) {
            this.ui.nextIcon.src = this.ui.nextBtn.disabled
                ? './src/assets/desactived-arrow.svg'
                : './src/assets/active-arrow.svg';
            this.ui.nextIcon.style.transform = this.ui.nextBtn.disabled ? 'rotate(180deg)' : 'none';
        }

        this.ui.pages.innerHTML = '';
        const maxButtons = 3;

        let start = Math.max(1, this.page - 1);
        let end = Math.min(this.totalPages, start + (maxButtons - 1));
        start = Math.max(1, end - (maxButtons - 1));

        for (let p = start; p <= end; p += 1) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'page-button';
            btn.textContent = String(p);
            btn.setAttribute('aria-label', `Ir para página ${p}`);
            if (p === this.page) {
                btn.classList.add('page-button--active');
            }
            btn.addEventListener('click', () => {
                if (p === this.page) return;
                this.page = p;
                this.loadAndRender();
            });
            this.ui.pages.appendChild(btn);
        }
    }

    async loadAndRender() {
        this.setStatus('');
        this.renderSkeletonCards(this.pageSize);

        try {
            if (this.query) {
                const isNumeric = /^\d+$/.test(this.query);
                const exact = await fetchPokemon(this.query);
                if (exact) {
                    this.totalPages = 1;
                    this.totalCount = 1;
                    this.page = 1;
                    this.setPagination();
                    this.renderPokemonCards([exact]);
                    this.setStatus('');
                    return;
                }

                if (isNumeric) {
                    this.totalPages = 1;
                    this.totalCount = 0;
                    this.setPagination();
                    this.setStatus('Nenhum Pokémon encontrado.');
                    return;
                }

                if (!this.allPokemonNames) {
                    const list = await fetchPokemonListPage(2000, 0);
                    this.allPokemonNames = (list?.results ?? []).map((p) => p?.name).filter(Boolean);
                }

                const matches = (this.allPokemonNames ?? []).filter((name) => name.includes(this.query));
                this.totalCount = matches.length;
                this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
                this.page = Math.min(this.page, this.totalPages);

                if (matches.length === 0) {
                    this.setPagination();
                    this.setStatus('Nenhum Pokémon encontrado.');
                    return;
                }

                const start = (this.page - 1) * this.pageSize;
                const pageNames = matches.slice(start, start + this.pageSize);
                const pokemons = await Promise.all(pageNames.map((n) => fetchPokemon(n)));

                this.setPagination();
                this.renderPokemonCards(pokemons.filter(Boolean));
                this.setStatus('');
                return;
            }
            const offset = (this.page - 1) * this.pageSize;
            const list = await fetchPokemonListPage(this.pageSize, offset);
            this.totalCount = list?.count ?? 0;
            this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
            this.page = Math.min(this.page, this.totalPages);

            const pageResults = list?.results ?? [];
            const pokemons = await Promise.all(pageResults.map((p) => fetchPokemon(p.name)));
            this.setPagination();
            this.renderPokemonCards(pokemons.filter(Boolean));
            this.setStatus('');
        } catch (err) {
            console.error(err);
            this.totalPages = 1;
            this.totalCount = 0;
            this.setPagination();
            this.setStatus('Erro ao carregar dados da PokéAPI.');
        }
    }
    renderPokemonCards(pokemons) {
        this.ui.grid.innerHTML = '';
        for (const pokemon of pokemons) {
            const card = new PokemonCard(pokemon);
            this.ui.grid.appendChild(card.render());
        }
    }
}

export default Pokedex;