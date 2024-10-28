# USD Rate Checker

This is a Node.js application that fetches the daily USD exchange rate from the [Commercial Bank of Ceylon](https://www.combank.lk/rates-tariff#exchange-rates) website and notifies the user if the rate has increased significantly within the last 4 days. The app stores rates in an SQLite database and displays a desktop notification with the current rate, previous rates, and the change amount.

## Features

- **Automated Rate Fetching**: Retrieves the USD exchange rate every day.
- **Database Storage**: Stores rates in SQLite for tracking changes.
- **Daily Notifications**: Desktop notifications show the current rate, last 4 days' rates, and change status.
- **Rate Monitoring**: Alerts the user if the rate has increased by more than 1 within the last 4 days.

## Requirements

- **Node.js** and **npm** installed
- **SQLite3** for database management
- **MacOS** (for notifications; see compatibility)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/usd-rate-checker.git
   cd usd-rate-checker
