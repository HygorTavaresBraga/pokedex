class PokemonCard {
    constructor(pokemon) {
        this.pokemon = pokemon;
    }

    setPokemon(pokemon) {
        this.pokemon = pokemon;
    }

    render() {
        const card = document.createElement('article');
        card.className = 'pokemon-card';

        const typePtBr = {
            normal: 'Normal',
            fire: 'Fogo',
            water: 'Água',
            electric: 'Elétrico',
            grass: 'Planta',
            ice: 'Gelo',
            fighting: 'Lutador',
            poison: 'Veneno',
            ground: 'Terra',
            flying: 'Voador',
            psychic: 'Psíquico',
            bug: 'Inseto',
            rock: 'Pedra',
            ghost: 'Fantasma',
            dragon: 'Dragão',
            dark: 'Sombrio',
            steel: 'Aço',
            fairy: 'Fada',
        };

        const types = document.createElement('div');
        types.className = 'pokemon-card__types';
        (this.pokemon?.types ?? []).forEach((t) => {
            const raw = String(t?.type?.name ?? '').toLowerCase();
            const badge = document.createElement('span');
            badge.className = `type-badge type-badge--${raw}`;
            badge.textContent = typePtBr[raw] ?? raw;
            types.appendChild(badge);
        });

        const number = document.createElement('span');
        number.className = 'pokemon-card__number';
        number.textContent = this.pokemon?.id ? `#${String(this.pokemon.id).padStart(3, '0')}` : '';

        const top = document.createElement('div');
        top.className = 'pokemon-card__top';
        top.appendChild(types);
        top.appendChild(number);

        const image = document.createElement('img');
        image.className = 'pokemon-card__image';
        image.loading = 'lazy';
        image.alt = this.pokemon?.name ?? 'pokemon';
        image.src =
            this.pokemon?.sprites?.other?.['official-artwork']?.front_default ||
            this.pokemon?.sprites?.front_default ||
            '';

        const name = document.createElement('h2');
        name.className = 'pokemon-card__name';
        name.textContent = this.pokemon?.name ?? '';

        const center = document.createElement('div');
        center.className = 'pokemon-card__center';
        center.appendChild(image);
        center.appendChild(name);

        card.appendChild(top);
        card.appendChild(center);

        return card;
    }
}

export default PokemonCard;