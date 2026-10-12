const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const axios = require("axios");

async function verify() {
    // Isolate persistence checks so the user's tasks are never modified.
    const directory = await fs.mkdtemp(path.join(__dirname, ".verify-axios-"));
    let server;
    try {
        await fs.copyFile(path.join(__dirname, "server.js"), path.join(directory, "server.cjs"));
        await fs.writeFile(path.join(directory, "data.json"), "[]");
        server = require(path.join(directory, "server.cjs")).server;
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        const client = axios.create({ baseURL: `http://127.0.0.1:${server.address().port}`, adapter: "http" });
        client.isAxiosError = axios.isAxiosError;
        const context = vm.createContext({ axios: client });
        await vm.runInContext(await fs.readFile(path.join(__dirname, "data.js"), "utf8"), context);
        const request = (method, id, todo) => context.requestTodos(method, id, todo);
        assert.equal((await request("GET")).length, 0);
        const created = await request("POST", "", { name: "Axios verification", urgency: 2 });
        const id = created[0].id;
        const updated = await request("PUT", id, { name: "Full update", urgency: 3 });
        assert.equal(updated[0].name, "Full update");
        const patched = await request("PATCH", id, { urgency: 5 });
        assert.equal(patched[0].name, "Full update");
        assert.equal(patched[0].urgency, 5);
        const renamed = await request("PATCH", id, { name: "Partial rename" });
        assert.equal(renamed[0].urgency, 5);
        for (const invalid of [{}, { urgency: 6 }, { name: "" }, { id: "other" }]) {
            await assert.rejects(request("PATCH", id, invalid), /Enter a name/);
        }
        await assert.rejects(request("PUT", id, { urgency: 1 }), /Enter a name/);
        await assert.rejects(request("PATCH", "missing", { urgency: 1 }), /Todo not found/);
        assert.equal((await request("GET"))[0].name, "Partial rename");
        assert.equal((JSON.parse(await fs.readFile(path.join(directory, "data.json"), "utf8")))[0].urgency, 5);
        assert.equal((await request("DELETE", id)).length, 0);
        console.log("PASS: browser Axios helpers perform GET, POST, PUT, PATCH and DELETE; partial updates preserve other fields; validation, errors and persistence verified with isolated data.");
    } finally {
        if (server) await new Promise((resolve) => server.close(resolve));
        await fs.rm(directory, { recursive: true, force: true });
    }
}

verify().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
