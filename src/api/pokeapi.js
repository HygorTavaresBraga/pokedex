const API_BASE_URL = 'https://pokeapi.co/api/v2';

const pokemonCacheByName = new Map();

export async function fetchPokemon(nameOrId) {
    const key = String(nameOrId).trim().toLowerCase();
    if (!key) return null;

    if (pokemonCacheByName.has(key)) return pokemonCacheByName.get(key);

    const response = await fetch(`${API_BASE_URL}/pokemon/${encodeURIComponent(key)}`);
    if (!response.ok) return null;
    const data = await response.json();
    pokemonCacheByName.set(String(data.name).toLowerCase(), data);
    return data;
}

export async function fetchPokemonListPage(limit = 20, offset = 0) {
    const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error('Falha ao buscar lista de Pokémon');
    }
    return await response.json();
}

export async function fetchTypes() {
    const response = await fetch(`${API_BASE_URL}/type`);
    if (!response.ok) {
        throw new Error('Falha ao buscar tipos');
    }
    return await response.json();
}

export async function fetchPokemonNamesByType(typeName) {
    const name = String(typeName).trim().toLowerCase();
    if (!name) return [];
    const response = await fetch(`${API_BASE_URL}/type/${encodeURIComponent(name)}`);
    if (!response.ok) {
        throw new Error('Falha ao buscar detalhes do tipo');
    }
    const data = await response.json();
    return (data.pokemon || []).map((p) => p?.pokemon?.name).filter(Boolean);
}