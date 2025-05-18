We build static websites using only vanilla JavaScript (ES6+ modules) and semantic HTML—no frameworks or external libraries.
All JS code should be in `src/` as ES modules; all CSS in `styles/`. Filenames must be lowercase with hyphens (e.g., `main.js`, `header-component.js`).
Use `<script type="module">` in HTML and include separate CSS files via `<link rel="stylesheet">`.
Follow mobile-first, responsive CSS. Use semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<footer>`).
Add JSDoc comments (`/** ... */`) for every function and meaningful HTML comments for sections.
When generating code snippets or completing functions, adhere to these conventions and avoid any external dependencies.

NEVER re-implement anything- search the codebase first to check for existing implementations and consolidate them

Always update framework.txt with an ascii graph to show the project framework that shows how each file works with each other file.

Always check the codebase to make sure you stay consistent and follow the framework.
