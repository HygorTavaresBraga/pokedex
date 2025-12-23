# Pokedex

Projeto em **HTML/CSS/JS (Vanilla + ES Modules)** consumindo a **PokéAPI**.

## Projeto Hospedado (GitHub Pages)
- Link: 

## Requisitos para rodar localmente
- Rodar em **servidor local** (não funciona via `file://` por causa de ES Modules)
- Navegador moderno (Chrome/Edge/Firefox)

## Como rodar (Windows)

### Opção 1: VS Code + Live Server (recomendado)
1. Instale a extensão **Live Server**
2. Clique com o botão direito em `index.html` → **Open with Live Server**

### Opção 2: Python (se tiver instalado)
No PowerShell, dentro da pasta do projeto:

1. `py -m http.server 5173`
	 - ou `python -m http.server 5173`
2. Abra: `http://localhost:5173`

## Funcionalidades
- Listagem paginada e dinâmica (ajusta a quantidade conforme o tamanho do monitor)
- Busca por nome ou número

## Layout / UX
- Skeleton loader para melhorar a percepção de carregamento
- Responsivo

## Estrutura do projeto
```
index.html
src/
	main.js
	style.css
	api/
		pokeapi.js
	components/
		pokedex.js
		pokemon-card.js
```