const Database = require("better-sqlite3");
const coffees = require("./coffees.json");

const db = new Database("database.db");

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

const insert = db.prepare(`
    INSERT OR REPLACE INTO coffees
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

console.log(`${coffees.length} coffee records inserted successfully!`);

db.close();