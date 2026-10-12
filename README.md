# Running the todo app

Run `node server.js` in this folder, then open http://localhost:8000.
Node.js is the only prerequisite; no npm packages are needed. Use this server rather than opening index.html directly or using a static Live Server.

The browser sends GET, POST, PUT and DELETE requests to `/api/todos`. Every operation reads `data.json`; successful create, edit and delete operations write the updated array back to that file. Data survives page reloads and server restarts.

## LO12 external REST API demonstration

Requires Node.js 22 or later and internet access. Check weather consumes Open-Meteo's forecast REST API through GET /api/weather. Generate AI suggestions consumes Groq's chat completions REST API through POST /api/suggestions. The Node server makes the external HTTPS requests, parses JSON, validates results, and returns them to the browser. These are two external providers, including a generative AI service.

Configure GROQ_API_KEY in the server environment before starting Node. Never put a key in JavaScript served to the browser or commit it to a file. In PowerShell, enter it without displaying it or putting it in command history:

```powershell
$groqSecret = Read-Host "Groq API key" -AsSecureString
$env:GROQ_API_KEY = [System.Net.NetworkCredential]::new("", $groqSecret).Password
node server.js
```

Stop the running server first if port 8000 is occupied. Alternatively use `node --env-file=.env server.js` with a private local .env file; .env is not served by this app. The optional GROQ_MODEL environment variable overrides llama-3.3-70b-versatile. Groq access and quota depend on your account.

1. Click Check weather and show the temperature, precipitation and update time for Singapore.
2. Enter a goal such as Prepare for my JavaScript assessment and click Generate AI suggestions. This sends the entered goal to Groq.
3. Review three generated tasks. Click Add this task on a suggestion, then reload to demonstrate persistence.
4. In browser developer tools, show GET /api/weather and POST /api/suggestions with JSON responses. The server.js code shows the corresponding outbound provider URLs and Groq Authorization header; the browser never receives the key.
5. Explain await fetch, JSON parsing, output validation, timeout handling and visible errors. A missing key produces a configuration error, not simulated AI output.

A completed LO12 demonstration requires successful live responses from both providers. Mock tests alone do not establish live provider access.

Provider documentation: https://open-meteo.com/en/docs and https://console.groq.com/docs/text-chat.

Assessment requirements are identified by comments in data.js, script.js, index.html and server.js. In particular, the submit handler passes validateTodo's return value to requestTodos. The app uses arrays, objects, custom functions, comparisons, logical operators, branching, loops, async/await, JSON responses and AJAX CRUD requests.
