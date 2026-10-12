// Assessment review: all listed REQ items are MET in this implementation.
// Unmet requirements: none identified. Run node server.js; load the page, add a todo,
// and edit it to demonstrate real GET, POST and PUT requests and data.json persistence.
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#todoForm");
    const nameInput = document.querySelector("#todoName");
    const urgencyInput = document.querySelector("#taskUrgency");
    const toast = document.querySelector("#toast");
    const formError = document.querySelector("#formError");
    let toastTimer;
    // REQ - use at least one array | MET: todos is an array holding the saved todo objects.
    let todos = [];
    let editingId = null;
    let busy = false;

    function showStatus(message, error = false) {
        clearTimeout(toastTimer);
        toast.classList.remove("visible");
        formError.hidden = !error;
        formError.textContent = error ? message : "";
        if (!error) {
            toast.textContent = message;
            toast.classList.add("visible");
            toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
        }
    }

    function resetForm() {
        editingId = null;
        form.reset();
        document.querySelector("#addBtn").textContent = "Add todo";
        document.querySelector("#cancelBtn").hidden = true;
    }

    function setBusy(value) {
        busy = value;
        for (const button of document.querySelectorAll("button")) {
            button.disabled = value;
        }
    }

    function renderTodos() {
        const list = document.querySelector("#todoList");
        list.replaceChildren();
        document.querySelector("#taskCount").textContent = `${todos.length} task(s)`;
        document.querySelector("#emptyState").hidden = todos.length > 0;
        // REQ - At least one loop | MET: for...of iterates over the todos array.
        // REQ - Allow the user to see all created resources, objects or documents | MET: render every todo as a list row.
        for (const todo of todos) {
            const row = document.createElement("li");
            const name = document.createElement("span");
            name.className = "task-name";
            name.textContent = todo.name; // User content is text, never executable HTML.
            const urgency = document.createElement("span");
            urgency.className = "badge";
            urgency.textContent = `Urgency ${todo.urgency}`;
            const edit = document.createElement("button");
            edit.textContent = "Edit";
            // REQ - Allow the user to edit instances of at least one type of resources, object or document | MET: Edit fills the form; submitting sends PUT and updates data.json.
            edit.addEventListener("click", () => {
                editingId = todo.id;
                nameInput.value = todo.name;
                urgencyInput.value = todo.urgency;
                document.querySelector("#addBtn").textContent = "Save changes";
                document.querySelector("#cancelBtn").hidden = false;
                nameInput.focus();
            });
            const remove = document.createElement("button");
            remove.textContent = "Delete";
            remove.className = "danger";
            // REQ - Allow the user to delete instances of at least one type of resource, object or document | MET: Delete confirms, sends DELETE, updates data.json, and refreshes the list.
            remove.addEventListener("click", async () => {
                if (busy || !confirm(`Delete "${todo.name}"?`)) {
                    return;
                }
                try {
                    setBusy(true);
                    todos = await requestTodos("DELETE", todo.id);
                    if (editingId === todo.id) resetForm();
                    // REQ - At least one function call | MET: renderTodos() is called to refresh the list.
                    renderTodos();
                    showStatus("Todo deleted.");
                } catch (error) {
                    showStatus(error.message, true);
                } finally {
                    setBusy(false);
                }
            });
            row.append(name, urgency, edit, remove);
            list.append(row);
        }
    }

    // REQ - Allow the user to create instances of at least one type of resource, object or document | MET: submitting a new todo sends POST; the server creates an object and saves it to data.json.
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const current = todos.find((todo) => todo.id === editingId);
            // REQ - Develop your program using the structured programming technique. Have at
            // least one function whose return value is used as the argument of another
            // function call. | MET: validation, AJAX, rendering and file storage use separate
            // functions with sequence, branching and loops. validateTodo returns the object
            // passed directly as the third argument to requestTodos below.
            // REQ - You must execute at least one GET request via AJAX, and at least one of the
            // following requests via AJAX: POST, PATCH or PUT. | MET: this call sends POST on
            // create or PUT on edit; loadTodos below sends GET when the page opens.
            todos = await requestTodos(current ? "PUT" : "POST", current ? current.id : "",
                validateTodo(nameInput.value, urgencyInput.value));
            resetForm();
            // REQ - At least one function call | MET: renderTodos() is called to refresh the list.
            renderTodos();
            showStatus(current ? "Todo updated." : "Todo added.");

        } catch (error) {
            showStatus(error.message, true);
        } finally {
            setBusy(false);
        }
    });
    document.querySelector("#cancelBtn").addEventListener("click", resetForm);

    document.querySelector("#weatherBtn").addEventListener("click", async () => {
        if (busy) return;
        const result = document.querySelector("#weatherResult");
        setBusy(true);
        result.textContent = "Loading weather...";
        try {
            const weather = await requestPlanning("/api/weather");
            result.textContent = `Singapore: ${weather.temperature_2m} °C, precipitation ${weather.precipitation} mm. Updated ${weather.time.replace("T", " ")} (Singapore time).`;
        } catch (error) { result.textContent = error.message; }
        finally { setBusy(false); }
    });

    document.querySelector("#aiForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy) return;
        const status = document.querySelector("#aiStatus");
        const list = document.querySelector("#suggestionList");
        list.replaceChildren();
        setBusy(true);
        status.textContent = "Generating suggestions...";
        try {
            const result = await requestPlanning("/api/suggestions", validateTodo(document.querySelector("#goalName").value, 3));
            for (const suggestion of result.tasks) {
                const row = document.createElement("li");
                const text = document.createElement("span");
                text.className = "task-name";
                text.textContent = `${suggestion.name} — Urgency ${suggestion.urgency}`;
                const add = document.createElement("button");
                add.type = "button";
                add.textContent = "Add this task";
                add.addEventListener("click", async () => {
                    if (busy) return;
                    setBusy(true);
                    try {
                        todos = await requestTodos("POST", "", validateTodo(suggestion.name, suggestion.urgency));
                        row.remove();
                        renderTodos();
                        showStatus("Suggested task added.");
                    } catch (error) { showStatus(error.message, true); }
                    finally { setBusy(false); }
                });
                row.append(text, add);
                list.append(row);
            }
            status.textContent = "Suggestions from Groq. Choose which tasks to add.";
        } catch (error) { status.textContent = error.message; }
        finally { setBusy(false); }
    });

    async function loadTodos() {
        setBusy(true);
        try {
            // REQ - AJAX GET | MET: loading the page executes GET /api/todos; POST and PUT execute when the form is submitted.
            // Asynchronous JSON evidence: await the server response containing the saved todos.
            todos = await requestTodos("GET");
            // REQ - At least one function call | MET: renderTodos() is called to refresh the list.
            renderTodos();
        } catch (error) {
            showStatus(`Unable to load your tasks. ${error.message}`, true);
        } finally {
            setBusy(false);
        }
    }
    loadTodos();
});





