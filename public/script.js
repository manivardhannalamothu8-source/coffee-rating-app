// Load all coffees
async function loadCoffees() {

    try {

        const response = await fetch("/api/coffees");

        const coffees = await response.json();

        displayCoffees(coffees);

        document.getElementById("coffee-count").textContent =
            `${coffees.length} coffee blends available`;

    } catch (error) {

        console.error("Error loading coffees:", error);

    }
}


// Display coffee cards
function displayCoffees(coffees) {

    const grid = document.getElementById("coffee-grid");

    grid.innerHTML = "";

    coffees.forEach(coffee => {

        const card = document.createElement("div");

        card.className = "coffee-card";

        card.innerHTML = `
            <h3>☕ ${coffee.name}</h3>

            <p class="coffee-info">
                🌍 <strong>Origin:</strong> ${coffee.origin}
            </p>

            <p class="coffee-info">
                🔥 <strong>Roast:</strong> ${coffee.roast}
            </p>

            <p class="rating">
                ⭐ ${coffee.rating}
            </p>

            <p class="votes">
                👍 ${coffee.votes} votes
            </p>

            <button
                class="vote-btn"
                onclick="voteCoffee(${coffee.id}, this)">
                Vote ☕
            </button>
        `;

        grid.appendChild(card);
    });
}


// Vote for coffee
async function voteCoffee(id, button) {

    button.disabled = true;

    button.textContent = "Voting...";

    try {

        const response = await fetch(
            `/api/coffees/${id}/vote`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error("Vote failed");
        }

        const updatedCoffee = await response.json();

        updateCoffeeCard(updatedCoffee, button);

        loadLeaderboard();

    } catch (error) {

        console.error("Voting error:", error);

        button.textContent = "Try Again";
        button.disabled = false;
    }
}


// Update only the selected card
function updateCoffeeCard(coffee, button) {

    const card = button.parentElement;

    const votesElement = card.querySelector(".votes");

    votesElement.textContent =
        `👍 ${coffee.votes} votes`;

    button.textContent = "Voted ✓";

    setTimeout(() => {

        button.textContent = "Vote ☕";
        button.disabled = false;

    }, 800);
}


// Load leaderboard
async function loadLeaderboard() {

    try {

        const response =
            await fetch("/api/coffees/top");

        const coffees =
            await response.json();

        displayLeaderboard(coffees);

    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );

    }
}


// Display leaderboard
function displayLeaderboard(coffees) {

    const leaderboard =
        document.getElementById("leaderboard");

    leaderboard.innerHTML = "";

    coffees.forEach((coffee, index) => {

        const card =
            document.createElement("div");

        card.className = "leader-card";

        let medal;

        if (index === 0) {
            medal = "🥇";
        } else if (index === 1) {
            medal = "🥈";
        } else if (index === 2) {
            medal = "🥉";
        } else {
            medal = `#${index + 1}`;
        }

        card.innerHTML = `
            <div class="rank">${medal}</div>

            <h3>${coffee.name}</h3>

            <p>
                ⭐ Rating: <strong>${coffee.rating}</strong>
            </p>

            <p>
                👍 Votes: ${coffee.votes}
            </p>

            <p>
                🌍 ${coffee.origin}
            </p>
        `;

        leaderboard.appendChild(card);
    });
}


// Start application
loadCoffees();
loadLeaderboard();