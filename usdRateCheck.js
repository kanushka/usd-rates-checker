const axios = require("axios");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");

// Database setup
const db = new sqlite3.Database("usd_rates.db", (err) => {
    if (err) console.error("Could not connect to database", err);
    db.run(
        `CREATE TABLE IF NOT EXISTS rates (
            id INTEGER PRIMARY KEY,
            date TEXT UNIQUE,
            rate REAL
        )`
    );
});

// Function to fetch the USD rate
async function fetchUsdRate() {
    try {
        const { data } = await axios.get("https://www.combank.lk/rates-tariff#exchange-rates");
        const $ = cheerio.load(data);

        // Locate the rate within the webpage
        const rateText = $("td:contains('US DOLLARS')").nextAll().eq(4).text(); // Select the "before last" value
        const rate = parseFloat(rateText);

        if (!rate) {
            console.error("Failed to retrieve the USD rate");
            throw new Error("Failed to retrieve the USD rate");
        }

        const today = new Date().toISOString().split("T")[0];

        console.log(`Today's rate: ${rate}`);

        // Store the rate in the database
        db.run(`INSERT OR IGNORE INTO rates (date, rate) VALUES (?, ?)`, [today, rate], (err) => {
            if (err) console.error("Could not store rate in database", err);
            showRateNotification();
        });
    } catch (err) {
        console.error("Error fetching rate:", err);
    }
}

// Function to retrieve the last 4 days' rates and display a notification
function showRateNotification() {
    db.all(`SELECT date, rate FROM rates ORDER BY date DESC LIMIT 4`, (err, rows) => {
        if (err) console.error("Error querying database", err);

        console.log("Last 4 days' rates:", rows);

        if (rows.length > 0) {
            const currentRate = rows[0].rate;
            const previousRates = rows
                .slice(1)
                .map((row) => row.rate)
                .reverse(); // Previous rates
            const rateChange =
                rows.length >= 4
                    ? (currentRate - previousRates[2]).toFixed(2) // Calculate change over last 3 days
                    : 0;

            const changeType = rateChange >= 0 ? "increased" : "decreased";

            const notificationMessage = `
                USD Rate Update:
                - Current rate: ${currentRate}
                - Previous rates: ${previousRates.join(", ") || "No previous rates"}
                - Change over last 3 days: ${changeType} by ${Math.abs(rateChange)}
            `;

            exec(
                `osascript -e 'display notification "${notificationMessage}" with title "USD Rate Alert" sound name "Funk"'`,
                (err) => {
                    if (err) console.error("Failed to show notification", err);
                }
            );
        }
    });
}

// Schedule function to run every day
console.log("USD rate checker started");
fetchUsdRate();
