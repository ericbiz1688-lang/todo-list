# Repository Guidelines

## Project Structure & Module Organization

This is a small browser-based todo application using plain HTML and JavaScript.

- `index.html` defines the form and list, loads Bootstrap and SweetAlert2 from CDNs, and includes the local scripts.
- `data.js` contains the array mutation helpers: `addTodo`, `deleteTodo`, and `modifyTodo`.
- `script.js` initializes sample todos, renders the list, and handles buttons and dialogs.
- `Agile Front End .pdf` is reference material.

Keep data operations in `data.js` and DOM interactions in `script.js`. Preserve the script loading order: libraries, `data.js`, then `script.js`. There are currently no separate test or asset directories.

## Build, Test, and Development Commands

No package manifest, build pipeline, or npm scripts are configured. Open `index.html` directly in a browser to run the application. Internet access is required for the CDN dependencies.

If Python is installed, run `python -m http.server 8000` from this directory and visit `http://localhost:8000` for local HTTP development. Reload the page after changes; there is no automatic reload.

## Coding Style & Naming Conventions

Use four-space indentation in HTML and JavaScript. Follow the existing camelCase naming for variables, functions, and element IDs, such as `renderTodos` and `taskUrgency`. Use descriptive action verbs for helpers and double quotes for ordinary JavaScript strings. Prefer `const` unless reassignment is needed, and terminate statements consistently with semicolons.

Use Bootstrap utility classes for layout. No formatter or linter is configured. Avoid introducing tooling without documenting its setup.

## Testing Guidelines

There is no automated test framework or coverage target. Verify changes manually in the browser: initial sample tasks, adding tasks at urgency levels 1–5, updating names and urgency, confirming deletion, and canceling dialogs. Check the developer console for errors and verify that unrelated tasks remain unchanged. Reloading resets the in-memory list.

## Commit & Pull Request Guidelines

This directory has no Git metadata, so existing commit conventions cannot be verified. Use concise, imperative messages, such as `Fix urgency selection in update dialog`. Keep changes focused. Pull requests should describe the behavior changed, list manual checks performed, link applicable issues, and include screenshots for visible interface changes.
