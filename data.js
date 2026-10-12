// REQ - At least one custom function | MET: validateTodo is defined below.
function validateTodo(name, urgency) {
    // REQ - at least one object in your program. | MET: todo is an object with name and urgency.
    const todo = { name: name.trim(), urgency: Number(urgency) };
    // REQ - At least one comparison operator | MET: > and < compare name length and urgency.
    // REQ - At least one logical operator | MET: || combines conditions and ! negates values.
    // REQ - At least one branching | MET: if branches to reject invalid input.
    if (!todo.name || todo.name.length > 120 || !Number.isInteger(todo.urgency) || todo.urgency < 1 || todo.urgency > 5) {
        throw new Error("Enter a name (1–120 characters) and urgency from 1 to 5.");
    }
    // Structured programming evidence: return this object for the nested call in script.js.
    return todo;
}

async function requestPlanning(path, todo) {
    const response = await fetch(path, {
        method: todo ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: todo ? JSON.stringify(todo) : undefined
    });
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("The API returned a page instead of JSON. Start the app with npm start and open port 8000.");
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load planning information.");
    return data;
}

async function requestTodos(method = "GET", id = "", todo) {
    // REQ - Display the ability to perform at least one asynchronous call. | MET: await fetch performs an asynchronous network request.
    // AJAX implementation: fetch sends the GET, POST, PUT or DELETE method supplied by script.js.
    // The JavaScript server loads data.json for each operation and saves mutations.
    const response = await fetch(`/api/todos${id ? `/${encodeURIComponent(id)}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: todo ? JSON.stringify(todo) : undefined
    });
    // REQ - Display the ability to fetch data from a JSON resource. | MET: fetch retrieves /api/todos and response.json() parses JSON sourced from data.json.
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("The tasks API is unavailable. Start the app with npm start and open port 8000.");
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to complete the request.");
    return data;
}



