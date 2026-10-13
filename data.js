// REQ - At least one custom function | MET: validateTodo is defined below.
function validateTodo(name, urgency, todos = [], editingId = null) {
    // REQ - at least one object in your program. | MET: todo is an object with name and urgency.
    const todo = { name: name.trim(), urgency: Number(urgency) };
    // REQ - At least one comparison operator | MET: > and < compare name length and urgency.
    // REQ - At least one logical operator | MET: || combines conditions and ! negates values.
    // REQ - At least one branching | MET: if branches to reject invalid input.
    if (!todo.name || todo.name.length > 120 || !Number.isInteger(todo.urgency) || todo.urgency < 1 || todo.urgency > 5) {
        throw new Error("Enter a name (1–120 characters) and urgency from 1 to 5.");
    }
    if (todos.some((existing) => existing.id !== editingId
        && existing.name.trim().toLowerCase() === todo.name.toLowerCase())) {
        throw new Error("This todo already exists.");
    }
    // Structured programming evidence: return this object for the nested call in script.js.
    return todo;
}

async function requestPlanning(path, todo) {
    return requestJson(todo ? "POST" : "GET", path, todo);
}

async function requestTodos(method = "GET", id = "", todo) {
    // CRUD request helper: GET reads, POST creates, PUT/PATCH update, DELETE removes.
    // Used by the UI handlers in script.js; returns the latest saved task array.
    // REQ - Async AJAX and JSON resource consumption through Axios.
    return requestJson(method, `/api/todos${id ? `/${encodeURIComponent(id)}` : ""}`, todo);
}

async function requestJson(method, url, data) {
    // Send CRUD requests with Axios and return the parsed JSON response.
    try {
        const config = { timeout: 40000, responseType: "json" };
        let response;
        switch (method) {
            case "GET": response = await axios.get(url, config); break;
            case "POST": response = await axios.post(url, data, config); break;
            case "PUT": response = await axios.put(url, data, config); break;
            case "PATCH": response = await axios.patch(url, data, config); break;
            case "DELETE": response = await axios.delete(url, config); break;
            default: throw new Error("Unsupported request method.");
        }
        if (!response.headers["content-type"]?.includes("application/json")) {
            throw new Error("The API returned a page instead of JSON. Start the app with npm start and open port 8000.");
        }
        return response.data;
    } catch (error) {
        if (!axios.isAxiosError(error)) throw error;
        throw new Error(error.response?.data?.error || (error.code === "ECONNABORTED"
            ? "The request timed out. Please try again."
            : "Unable to reach the API. Check the server and connection."));
    }
}



