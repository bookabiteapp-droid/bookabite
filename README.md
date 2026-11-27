# BookaBite — book . dine . go

A restaurant reservation and pre-ordering prototype built as a **frontend-only** web app (plain HTML, CSS and JavaScript — no backend, no build step). All data is stored in the browser with `localStorage`. The **Customer** and **Restaurant** roles are simulated as two views of the same app and stay in sync across browser tabs.

## Features

**Customer**
- Terms & Conditions, registration, simulated ID and face verification
- Discover restaurants (filter by cuisine, mood, atmosphere, price; search by restaurant or dish)
- Browse menus, build an order, choose date, time, number of diners and a table
- Promo / discount codes (First-Time User, Valentine's Day, Christmas, Mother's Day, Father's Day, Graduation, Birthday) — one promo per reservation
- Cost breakdown: Food Subtotal → Discount → 12% VAT → Total → 50% Reservation Fee → Remaining Balance
- Mock payment (GCash, Credit Card, Debit Card) and a digital receipt
- Reschedule (2% fee), cancel (20% fee), rebook a declined reservation, feedback, notifications
- **Share My Location (optional):** on a confirmed reservation, share distance and estimated arrival so the restaurant knows when you're close

**Restaurant (Partner)**
- Partner Terms & Conditions gate before the dashboard is reachable
- See a customer's distance, ETA and a "Nearby" alert when they opt in to share their location
- Dashboard, reservations (confirm / decline with reason / assign table / mark served), menu management, restaurant profile, subscription, partnership workflow

> Payments are **simulated**. No real gateway is connected and no card or e-wallet details are collected.

## Project structure

```
BookaBite/
├── index.html      All screens and modals
├── style.css       Styling and brand colors (#FDB916 / #111111 / #FFFFFF)
├── script.js       App logic, sample data, pricing engine, localStorage
├── assets/
│   ├── logo/         BookaBite logo
│   ├── restaurants/  Restaurant covers and logos
│   └── menu/         Food photos and placeholder
├── .nojekyll
├── .gitignore
└── README.md
```

## Run locally

No installation is needed.

- **VS Code:** open the folder, install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.
- **Python:** `python3 -m http.server 8080`, then open <http://localhost:8080>.
- **Node:** `npx serve .`

Opening `index.html` directly also works, but a local server is recommended so cross-tab sync works reliably.

### Two-tab demo
1. Open the app in two browser tabs.
2. In each tab, tap **🎛️ Demo** (bottom-right) and pick **Customer** in one and **Restaurant** in the other.
3. Actions in one tab (e.g. a customer reserving) appear in the other automatically.
4. Use **Reset Demo** in the Demo menu to clear all data.

## Share My Location (privacy and setup)

- Off by default. The customer must tap **Share My Location** and allow the browser prompt; they can stop at any time.
- Only the rounded distance and estimated arrival time are stored and shown to the restaurant — **never the customer's coordinates**.
- Sharing stops automatically when the customer is marked arrived or cancels.
- The restaurant is notified once when the customer comes within 1 km (`NEARBY_KM` in `script.js`).
- Needs HTTPS or `localhost` (GitHub Pages is HTTPS). Restaurant pin locations are in `RESTAURANT_COORDS` in `script.js` — adjust them to the exact coordinates.
- To demo on a computer, use Chrome DevTools → **Sensors** → Location to fake a position.

## Configuration

The VAT rate (`VAT_RATE`), reservation fee, cancellation fee and reschedule fee are constants at the top of `script.js`.

## Deploy with GitHub Pages

1. Push the project so `index.html` is at the repository root.
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Select branch **main** and folder **/ (root)**, then **Save**.
4. The site goes live at `https://<your-username>.github.io/<repo-name>/`.

Data lives in each visitor's own browser, so reservations are not shared between devices.

## Limitations
- No real payment gateway, backend or database.
- ID upload and face verification are simulated.
- The 12% VAT rate is a documented default; change `VAT_RATE` if your requirements differ.
