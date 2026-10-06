const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const coffees = require("./coffees.json");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, "database.db"));

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

// Insert 60 coffee records if the database is empty
const count = db.prepare(
    "SELECT COUNT(*) AS total FROM coffees"
).get();

if (count.total === 0) {
    const insert = db.prepare(`
        INSERT INTO coffees
        (id, name, origin, roast, rating, votes)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const seed = db.transaction(() => {
        for (const coffee of coffees) {
            insert.run(
                coffee.id,
                coffee.name,
                coffee.origin,
                coffee.roast,
                coffee.rating,
                coffee.votes
            );
        }
    });

    seed();
    console.log(coffees.length + " coffee records loaded.");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Get all coffees
app.get("/api/coffees", (req, res) => {
    const result = db.prepare(
        "SELECT * FROM coffees ORDER BY id"
    ).all();

    res.json(result);
});

// Get top 5 coffees
app.get("/api/coffees/top", (req, res) => {
    const result = db.prepare(`
        SELECT * FROM coffees
        ORDER BY rating DESC, votes DESC
        LIMIT 5
    `).all();

    res.json(result);
});

// Vote for a coffee
app.post("/api/coffees/:id/vote", (req, res) => {
    const id = Number(req.params.id);

    const coffee = db.prepare(
        "SELECT * FROM coffees WHERE id = ?"
    ).get(id);

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

    const updatedCoffee = db.prepare(
        "SELECT * FROM coffees WHERE id = ?"
    ).get(id);

    res.json(updatedCoffee);
});

// Start server
app.listen(PORT, () => {
    console.log("Coffee Rating App running at http://localhost:" + PORT);
});