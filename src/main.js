import Pokedex from './components/pokedex.js';

const app = document.getElementById('app');
if (!app) {
	throw new Error('App root element (#app) not found');
}

const pokedex = new Pokedex(app);
pokedex.init();