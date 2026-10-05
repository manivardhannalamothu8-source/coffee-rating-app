const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new Database("database.db");

// Create coffees table
db.prepare(`
    CREATE TABLE IF NOT EXISTS coffees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        origin TEXT NOT NULL,
        roast TEXT NOT NULL,
        rating REAL NOT NULL,
        votes INTEGER NOT NULL
    )
`).run();

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// GET all coffees
app.get("/api/coffees", (req, res) => {
    const coffees = db.prepare(`
        SELECT * FROM coffees
        ORDER BY id
    `).all();

    res.json(coffees);
});

// GET top-rated coffees
app.get("/api/coffees/top", (req, res) => {
    const coffees = db.prepare(`
        SELECT * FROM coffees
        ORDER BY rating DESC, votes DESC
        LIMIT 5
    `).all();

    res.json(coffees);
});

// POST vote
app.post("/api/coffees/:id/vote", (req, res) => {
    const id = Number(req.params.id);

    const coffee = db.prepare(`
        SELECT * FROM coffees
        WHERE id = ?
    `).get(id);

    if (!coffee) {
        return res.status(404).json({
            error: "Coffee not found"
        });
    }

    db.prepare(`
        UPDATE coffees
        SET votes = votes + 1
        WHERE id = ?
    `).run(id);

    const updatedCoffee = db.prepare(`
        SELECT * FROM coffees
        WHERE id = ?
    `).get(id);

    res.json(updatedCoffee);
});

// Start server
app.listen(PORT, () => {
    console.log(`Coffee Rating App running at http://localhost:${PORT}`);
});