# Running the todo app

Run `npm install` followed by `npm start` in this folder, then open http://localhost:8000.

## Running in GitHub Codespaces

From the folder containing server.js and data.json, run `npm start` with Node.js 22.9 or later. Run npm install first to install Axios. This starts the API and the web page together on port 8000 and loads a local .env file when present.

In the Codespaces Ports tab, open port 8000 in the browser. Use its forwarded HTTPS URL, not the URL for Live Server or a Python static server. Keep the terminal process running. Check `curl http://localhost:8000/api/todos` in the Codespaces terminal: it should return a JSON array. If it fails, inspect the Node terminal for errors and check that data.json was uploaded and contains a valid JSON array.

The local .env file is ignored by Git and therefore does not transfer through a push. Configure GROQ_API_KEY as a Codespaces secret or a private .env inside the codespace. GROQ_MODEL is optional; the default is openai/gpt-oss-20b. A missing Groq key affects AI suggestions only, not loading saved tasks.
Node.js 22.9 or later and npm install are required. Use this server rather than opening index.html directly or using a static Live Server.

The browser sends Axios GET, POST, PUT, PATCH and DELETE requests to `/api/todos`. Every operation reads `data.json`; successful create, edit and delete operations write the updated array back to that file. Data survives page reloads and server restarts.

## CRUD user flow

### Read saved tasks

1. Open the application through the running Node server.
2. The app sends an Axios GET request to `/api/todos` and displays the saved tasks under **Your tasks**.
3. Tasks are sorted by urgency from 5 (highest) to 1 (lowest). Tasks with equal urgency keep their saved order. The task count updates whenever the list is rendered.
4. If the list is empty, the app displays **No tasks yet. Add your first todo above.** Reloading retrieves saved tasks again; it does not reset the list.

### Create a task

1. Enter a **Task name** containing 1 to 120 characters and select an **Urgency** from 1 to 5. The default urgency is 3.
2. Click **Add todo**. The app validates the values and sends an Axios POST request to `/api/todos`.
3. The server assigns an ID and saves the new task in `data.json`.
4. The form resets, the sorted list and task count refresh, and **Todo added.** appears.

You can also enter a goal under **Turn a goal into tasks** and click **Generate AI suggestions**. The app requests three suggestions from Groq through POST `/api/suggestions`. Suggestions are previews until you click **Add this task**. Each selected suggestion is created through POST `/api/todos`, removed from the preview list, and displayed in the saved task list. Generating suggestions requires a configured `GROQ_API_KEY`.

### Update a task

1. Click **Edit** beside a saved task. Its name and urgency populate the main form, the submit button changes to **Save changes**, and **Cancel edit** becomes available.
2. Change the name, urgency, or both, then click **Save changes**.
3. The app validates the complete task and sends an Axios PUT request to `/api/todos/{id}`.
4. The server saves the changes. The form returns to adding mode, the list is sorted again, and **Todo updated.** appears.

Click **Cancel edit** to discard unsaved form changes and return to adding mode. Canceling does not send an update request.

For a quick urgency change, select a different urgency directly in the task row. The app sends an Axios PATCH request to `/api/todos/{id}` containing only the urgency. The task name remains unchanged, the task moves to its appropriate sorted position, and **Urgency updated.** appears. This change saves immediately; **Cancel edit** does not undo it.

### Delete a task

1. Click **Delete** beside the task. A confirmation dialog displays the task name.
2. Cancel the dialog to keep the task; no DELETE request is sent.
3. Confirm the dialog to send an Axios DELETE request to `/api/todos/{id}`.
4. The server removes the task from `data.json`. The list and count refresh, and **Todo deleted.** appears. If the deleted task was being edited, the form returns to adding mode. Deleting the last task reveals the empty-state message.

### Feedback and failed requests

Buttons and task-row urgency selectors are disabled while requests are in progress. Successful mutations show a brief status message. Validation or request failures display an error without showing a success message. A failed inline urgency update restores the previous selection. If loading fails, check that the Node server is running and that the browser is using its port 8000 URL, then reload.

| User action | Axios method | Endpoint |
|---|---|---|
| Open or reload saved tasks | GET | `/api/todos` |
| Add a task or selected AI suggestion | POST | `/api/todos` |
| Save a full task edit | PUT | `/api/todos/{id}` |
| Change urgency directly in a row | PATCH | `/api/todos/{id}` |
| Confirm task deletion | DELETE | `/api/todos/{id}` |

## CRUD function call flow

The following traces explain which functions run for each user action. Browser functions are in `script.js` and `data.js`; server functions are in `server.js`. Both files define a function named `loadTodos`, but they have different roles: the browser function requests tasks, while the server function reads the saved file.

### Load index.html and read tasks

**Where to find the code**

- `index.html`: page structure and script loading order.
- `script.js`: `DOMContentLoaded` callback, browser `loadTodos()`, `setBusy()`, and `renderTodos()`.
- `data.js`: `requestTodos()` and `requestJson()`.
- `server.js`: `handleRequest()`, server `loadTodos()`, and `sendJson()`.
- `data.json`: saved task records.
- Axios provides `axios.get()`; Node.js provides `fs.readFile()`; JavaScript provides `JSON.parse()`.

Open the page through the Node server at port 8000. Opening the HTML file directly does not provide the API.

1. The server's `handleRequest()` serves `index.html` and its scripts. Axios loads first, followed by `data.js` and `script.js`.
2. The browser fires `DOMContentLoaded`. Its callback selects the DOM elements, sets `todos = []`, and registers the form, button, and urgency event handlers.
3. The callback calls the browser's `loadTodos()`, which calls `setBusy(true)` and `requestTodos("GET")`.
4. `requestTodos()` calls `requestJson("GET", "/api/todos", undefined)`, which calls `axios.get()`.
5. The server's `handleRequest()` receives GET `/api/todos`, waits for pending writes, and calls the server's `loadTodos()`.
6. The server's `loadTodos()` calls `fs.readFile()` to read `data.json`, then `JSON.parse()` to create the task array. `sendJson()` returns that array with HTTP 200.
7. `requestJson()` returns Axios's `response.data`. The browser assigns the returned array to `todos` and calls `renderTodos()` to display it in descending urgency order.
8. `setBusy(false)` enables the controls again.

### Add a todo

**Where to find the code**

- `index.html`: task form with `id="todoForm"` and the **Add todo** button.
- `script.js`: `form.addEventListener("submit", ...)` callback, `setBusy()`, `resetForm()`, `renderTodos()`, and `showStatus()`.
- `data.js`: `validateTodo()`, `requestTodos()`, and `requestJson()`.
- `server.js`: POST branch in `handleRequest()`, `readTodo()`, `updateData()`, server `loadTodos()`, and `sendJson()`.
- Axios provides `axios.post()`; Node.js provides `randomUUID()`, `fs.writeFile()`, and `fs.rename()`.

1. The user enters a name and urgency, then clicks **Add todo**. The form's `submit` callback runs.
2. `event.preventDefault()` stops the normal page submission. `setBusy(true)` disables controls during the request.
3. `todos.find((todo) => todo.id === editingId)` looks for an edited task. In adding mode, `editingId` is `null`, so `current` is `undefined`.
4. `validateTodo()` trims the name, converts urgency to a number, checks the values, and returns a task object.
5. `requestTodos("POST", "", validatedTodo)` calls `requestJson()`, which calls `axios.post("/api/todos", validatedTodo, config)`.
6. The server's `handleRequest()` calls `readTodo()` to parse and validate the request body, then `randomUUID()` to create the task ID.
7. `updateData()` calls the server's `loadTodos()`, appends the new task, writes a temporary file using `fs.writeFile()`, and replaces `data.json` using `fs.rename()`.
8. `sendJson()` returns the updated task array with HTTP 201. The browser assigns it to `todos`.
9. `resetForm()`, `renderTodos()`, and `showStatus("Todo added.")` run. Finally, `setBusy(false)` enables the controls.

### Edit a todo and save the full task

**Where to find the code**

- `script.js`: `edit.addEventListener("click", ...)` inside `renderTodos()` opens editing; `form.addEventListener("submit", ...)` saves the edit. Supporting functions are `setBusy()`, `resetForm()`, `renderTodos()`, and `showStatus()`.
- `data.js`: `validateTodo()`, `requestTodos()`, and `requestJson()`.
- `server.js`: PUT branch in `handleRequest()`, `readTodo()`, `updateData()`, server `loadTodos()`, and `sendJson()`.
- Axios provides `axios.put()`; JavaScript provides array `find()`, `some()`, and `map()`; Node.js provides the file operations.
- The **Cancel edit** handler is `document.querySelector("#cancelBtn").addEventListener("click", resetForm)` in `script.js`.

1. Clicking **Edit** runs that button's `click` callback. It sets `editingId = todo.id`, fills the name and urgency inputs, changes the button text to **Save changes**, reveals **Cancel edit**, and calls `nameInput.focus()`.
2. Clicking **Save changes** runs the same form `submit` callback used for adding. It calls `event.preventDefault()` and `setBusy(true)`.
3. `todos.find()` now returns the task matching `editingId`, so `current` contains an existing task object.
4. `validateTodo()` returns the validated fields. The expression `current ? "PUT" : "POST"` selects PUT, and `current ? current.id : ""` supplies the task ID.
5. `requestTodos("PUT", current.id, validatedTodo)` calls `requestJson()`, which calls `axios.put()` for `/api/todos/{id}`.
6. The server's `handleRequest()` calls `readTodo(request, false)` to validate the complete task, then `updateData()`.
7. Inside `updateData()`, the server's `loadTodos()` reads the saved array. `some()` checks that the ID exists, and `map()` updates the matching task while preserving the other tasks. `fs.writeFile()` and `fs.rename()` save the result.
8. `sendJson()` returns the updated array with HTTP 200. The browser assigns it to `todos`, then calls `resetForm()`, `renderTodos()`, `showStatus("Todo updated.")`, and finally `setBusy(false)`.

Clicking **Cancel edit** calls `resetForm()` only. It does not call Axios or modify saved tasks.

### Edit urgency directly in a task row

**Where to find the code**

- `script.js`: `urgency.addEventListener("change", ...)` inside `renderTodos()`, plus `setBusy()`, `renderTodos()`, and `showStatus()`.
- `data.js`: `requestTodos()` and the PATCH case in `requestJson()`.
- `server.js`: PATCH branch in `handleRequest()`, `readTodo(request, true)`, `updateData()`, server `loadTodos()`, and `sendJson()`.
- Axios provides `axios.patch()`; JavaScript provides `Number()`, array `some()`, and `map()`; Node.js provides the file operations.

1. Selecting a new urgency runs the row selector's `change` callback and calls `setBusy(true)`.
2. `Number(urgency.value)` converts the selected value to a number. `requestTodos("PATCH", todo.id, { urgency: newValue })` calls `requestJson()`, which calls `axios.patch()`.
3. The server's `handleRequest()` calls `readTodo(request, true)`. This validates only the supplied fields and rejects empty or unsupported updates.
4. `updateData()` calls the server's `loadTodos()`, checks the ID with `some()`, and updates the matching task with `map()`. Spreading the existing task before the supplied fields preserves its name and ID.
5. `fs.writeFile()` and `fs.rename()` persist the update. `sendJson()` returns the task array with HTTP 200.
6. The browser replaces `todos`. If the task is also open in the edit form, it synchronises that form's urgency. It calls `renderTodos()` to reorder the list, `showStatus("Urgency updated.")`, and finally `setBusy(false)`.

### Delete a todo

**Where to find the code**

- `script.js`: `remove.addEventListener("click", ...)` inside `renderTodos()`, plus `setBusy()`, `resetForm()`, `renderTodos()`, and `showStatus()`.
- `data.js`: `requestTodos()` and the DELETE case in `requestJson()`.
- `server.js`: DELETE branch in `handleRequest()`, `updateData()`, server `loadTodos()`, and `sendJson()`.
- The browser provides `confirm()`; Axios provides `axios.delete()`; JavaScript provides array `some()` and `filter()`; Node.js provides the file operations.

1. Clicking **Delete** runs its `click` callback, which calls `confirm()` with the task name. Canceling returns immediately without sending a request.
2. Confirming calls `setBusy(true)`, then `requestTodos("DELETE", todo.id)`. `requestJson()` calls `axios.delete()` for `/api/todos/{id}`.
3. The server's `handleRequest()` calls `updateData()` without calling `readTodo()`, because deletion does not require a request body.
4. `updateData()` calls the server's `loadTodos()`, checks the ID with `some()`, and removes the matching task using `filter()`. `fs.writeFile()` and `fs.rename()` save the remaining tasks.
5. `sendJson()` returns the updated array with HTTP 200. The browser replaces `todos` and calls `resetForm()` if the deleted task was being edited.
6. `renderTodos()` refreshes the sorted list, count, and empty state. `showStatus("Todo deleted.")` provides feedback, and `setBusy(false)` enables the controls again.

### How failed actions are handled

If `validateTodo()` throws, no API request is sent. If Axios rejects a request, `requestJson()` converts the response error or connection failure into a readable error. The calling handler catches it and calls `showStatus(error.message, true)`. The browser's task array is assigned only after a successful request; a failed urgency update restores the previous selector value. Each asynchronous handler calls `setBusy(false)` in `finally`, whether it succeeds or fails.

## LO12 external REST API demonstration

Requires Node.js 22 or later and internet access. Check weather consumes Open-Meteo's forecast REST API through GET /api/weather. Generate AI suggestions consumes Groq's chat completions REST API through POST /api/suggestions. The Node server makes the external HTTPS requests, parses JSON, validates results, and returns them to the browser. These are two external providers, including a generative AI service.

Configure GROQ_API_KEY in the server environment before starting Node. Never put a key in JavaScript served to the browser or commit it to a file. In PowerShell, enter it without displaying it or putting it in command history:

```powershell
$groqSecret = Read-Host "Groq API key" -AsSecureString
$env:GROQ_API_KEY = [System.Net.NetworkCredential]::new("", $groqSecret).Password
node server.js
```

Stop the running server first if port 8000 is occupied. Alternatively use `node --env-file=.env server.js` with a private local .env file; .env is not served by this app. The optional GROQ_MODEL environment variable overrides openai/gpt-oss-20b. Groq access and quota depend on your account.

1. Click Check weather and show the temperature, precipitation and update time for Singapore.
2. Enter a goal such as Prepare for my JavaScript assessment and click Generate AI suggestions. This sends the entered goal to Groq.
3. Review three generated tasks. Click Add this task on a suggestion, then reload to demonstrate persistence.
4. In browser developer tools, show GET /api/weather and POST /api/suggestions with JSON responses. The server.js code shows the corresponding outbound provider URLs and Groq Authorization header; the browser never receives the key.
5. Explain await Axios requests, JSON parsing, output validation, timeout handling and visible errors. A missing key produces a configuration error, not simulated AI output.

A completed LO12 demonstration requires successful live responses from both providers. Mock tests alone do not establish live provider access.

Provider documentation: https://open-meteo.com/en/docs and https://console.groq.com/docs/text-chat.

Assessment requirements are identified by comments in data.js, script.js, index.html and server.js. In particular, the submit handler passes validateTodo's return value to requestTodos. The app uses arrays, objects, custom functions, comparisons, logical operators, branching, loops, async/await, JSON responses and AJAX CRUD requests.

## Axios request methods

All browser and external provider HTTP requests use Axios. The browser bundle is served locally from the installed package and loads before data.js and script.js. GET loads tasks and weather; POST creates tasks and requests AI suggestions; PUT saves full edits; PATCH changes urgency directly in a task row; DELETE removes a confirmed task. Axios parses JSON into response.data. Server error messages are retained for the UI.

Run `node verify-axios.cjs` to check all five methods, partial-update validation and persistence using isolated test data. It does not change your saved tasks.
