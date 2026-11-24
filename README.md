# BookaBite — book . dine . go

A restaurant reservation + pre-ordering prototype, built as a **frontend-only** web app (plain HTML/CSS/JavaScript, no backend, no database server). All data is stored in the browser via `localStorage`, and the three roles — **Customer**, **Restaurant**, and **Administrator** — are simulated as separate views of the same app, kept in sync across browser tabs.

This document supersedes `README.txt` (kept for history) and reflects the **updated** project after the client's additional requirements were implemented.

---

## 1. What's in this update

### Modified features
- **Payment methods** — Cash was removed everywhere. Customers now choose **GCash**, **Credit Card**, or **Debit Card** only (Restaurant and Admin views reflect the same three methods consistently).
- **Reservation flow order** — confirmed to already follow: choose restaurant → menu/food → date & time → number of diners → table/seating → review → cost breakdown → payment method → pay 50% → confirmation. The **Reservation Fee is paid at the end of the flow**, after the full breakdown is shown.
- **Cost breakdown** (Review Reservation screen & Digital Receipt) now shows, in order: Food Subtotal → Discount (if any) → VAT Amount → Total Cost → Reservation Fee (50%) → Remaining Balance (50%).
- **Digital receipt** — rewritten to show all 15 required fields with real, computed values (no placeholders): Restaurant Name, Reservation ID, Customer Info, Date/Time, Number of Diners, Ordered Items, Food Subtotal, Discount, VAT Amount, Total Cost, Reservation Fee (50%), Remaining Balance (50%), Payment Method, Payment Status, Transaction Date.
- **Branding** — confirmed the app already uses the exact brand colors (Yellow `#FDB916`, Black `#111111`, White `#FFFFFF`) throughout; no redesign was needed, only a couple of small UI polish fixes (see "Bug fixes" below).

### New features
- **Discount / promo system** — First-Time User (20%), Valentine's Day (20%), Christmas (20%), Mother's Day (20%), Father's Day (10%), Graduation (10%), Birthday (10%). All 7 are always selectable on the Review Reservation screen (with an "eligible today" hint on the ones that match the current date), so every discount type can be demoed and tested regardless of the real calendar date. Discounts **do not stack** by default; an Administrator can turn stacking on from **Admin → Reports → Settings**.
- **Reschedule flow (Customer)** — a customer can request a new date/time/diners for an existing reservation. The system checks restaurant availability (the restaurant reviews and approves/declines the request, same as a new reservation). A **2% rescheduling fee** is calculated and shown before submission, charged on approval, and reflected on the Restaurant and Admin sides. Declines require a reason, which is shown to the customer.
- **Cancellation flow (Customer)** — a customer can cancel a reservation; a **20% cancellation fee** is calculated from the total and shown before confirming, and the resulting refund/forfeit amount is displayed.
- **Terms & Conditions gates**:
  - **Customer** — full Terms & Conditions (7 items) and Conditions (9 items) are shown and must be agreed to before the customer can use the reservation service.
  - **Restaurant (Partner)** — a dedicated 10-clause Partner Restaurant Terms & Conditions screen is shown and must be agreed to during restaurant registration/first access, before any restaurant features (menu, reservations, etc.) become reachable. This is enforced both in the UI (bottom navigation bar stays hidden and the back button is disabled on this screen until agreement is recorded) and in the app's role-switching and session-restore logic, so the gate cannot be bypassed.
- **Administrator role** — an entirely new role/dashboard was added, with:
  - **Dashboard** — summary of reservations, restaurants, and today's activity.
  - **Reservations** — view/monitor all reservations across every restaurant, open full detail (payment status, breakdown, items), **approve or decline** a pending reservation directly (a reason is required when declining), and view reschedule/cancellation requests.
  - **Restaurants** — monitor all partner restaurants and their reservation activity/revenue.
  - **Accounts** — manage customer and restaurant accounts.
  - **Reports** — view basic statistics, and the **discount-stacking toggle** described above.
- **Reservation status model** — every reservation now moves through a single consistent set of statuses: `Pending → Confirmed`, or `Pending → Declined`, plus `Reschedule Requested`, `Cancelled`, and `Completed`. Declined reservations are visually distinct (a red "Declined" badge) and are never treated as confirmed. Status changes always trigger a notification to the affected roles (Customer/Restaurant/Admin), and a decline always includes a reason shown to the customer.
- **Role-based access control (RBAC)** — Customer, Restaurant, and Administrator each see only their own navigation, screens, and actions; a restaurant cannot reach its dashboard until its Partner T&C is agreed to, and all three roles stay in sync via the same underlying data (switching the demo role switches the view, not the data).

### Bug fixes found and fixed during testing
- A floating "🎛️ Demo" button was positioned so it could physically overlap the **last item in every bottom navigation bar** (Profile / Subscription / Reports), making it unclickable in some layouts. Repositioned above the nav bar.
- The new Restaurant Partner T&C screen could be bypassed via the bottom navigation bar or the back button before the restaurant had agreed to the terms. Fixed by hiding the navigation until agreement is recorded (on role switch, on session restore, and immediately after agreeing) and by removing the back button from that screen.

---

## 2. What was intentionally **not** changed

Per the client's instructions, the existing folder structure, database/storage approach (`localStorage`), overall layout, and all previously-working features were preserved. No rewrite or redesign was performed — only the parts needed for the 14 requirement sections were modified.

---

## 3. Important: payment gateway status

**No real payment gateway is integrated, and none was in the original project.** "GCash", "Credit Card", and "Debit Card" are **mock/simulated payment methods** — selecting one and tapping "Confirm Mock Payment" marks the reservation fee as paid in the local data, exactly as the original Cash flow did. No money moves, no third-party API is called, and no card or e-wallet details are collected or stored.

If/when you want to integrate a real gateway (e.g. GCash's API, PayMongo, Stripe, PayPal Philippines, etc.), you will need to:
1. Register for a merchant/developer account with the chosen provider and obtain API keys.
2. Add a small backend (this prototype has none) to hold secret keys and call the provider's server-side API — API secrets must never be placed in frontend JavaScript.
3. Replace `confirmMockPayment()` in `script.js` with a call to that backend, and update the payment screen to redirect to/embed the provider's real checkout.

See `.env.example` for the environment variable **names** such an integration would typically need — these are placeholders only; no real keys are included or required to run the prototype as-is.

---

## 4. Project structure

```
BookaBite/
├── index.html            All screens for Customer, Restaurant, and Admin
├── style.css             Styling and brand colors (#FDB916 / #111111 / #FFFFFF)
├── script.js              All app logic, sample data, pricing engine, localStorage
├── assets/
│   ├── logo/              BookaBite logo
│   ├── restaurants/       Restaurant covers & logos
│   ├── menu/              Food photos
│   └── icons/             (emoji icons are used; folder kept for future use)
├── README.md               This file
├── README.txt              Original project notes (kept for history)
├── .nojekyll
├── .env.example            Environment variable names for a future payment-gateway/backend integration
└── .gitignore
```

No build step, package manager, or server-side code is required — everything runs as static files.

---

## 5. How to run in Visual Studio Code

**Option 1 — Live Server (recommended)**
1. Open the `BookaBite` folder in VS Code (`File → Open Folder…`).
2. Install the **"Live Server"** extension (by Ritwick Dey) from the Extensions panel, if not already installed.
3. Right-click `index.html` → **"Open with Live Server"**.
4. The app opens at `http://127.0.0.1:5500/index.html` (or similar).

**Option 2 — any static file server**
From a terminal inside the folder:
```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```
or
```bash
npx serve .
```

**Opening `index.html` directly by double-click also works**, but some browsers restrict `localStorage`/`storage` events on `file://` pages, which affects the multi-tab demo (see below). A local server avoids this.

### Two/three-tab role demo
1. Open the app URL in **three** browser tabs.
2. In each tab, tap the **"🎛️ Demo"** button (bottom-right) and choose a different role: **👤 Customer**, **🍽️ Restaurant**, **🛡️ Administrator**.
3. Actions in one tab (e.g. a customer reserving a table) trigger notifications and status updates visible in the other tabs automatically — no refresh needed — because all three views read/write the same `localStorage` data and listen for the browser's `storage` event.
4. Use **"Reset Demo"** inside the Demo menu to wipe all data and start clean before/after a run-through.

---

## 6. Environment variables / configuration

This prototype needs **no environment variables to run** — it is fully static. `.env.example` lists the variable **names** a future real backend/payment-gateway integration would use, as placeholders, so the project can be extended without guessing names later. **No real secrets, keys, or credentials are included anywhere in this project.**

---

## 7. Remaining configuration before any production/real-money use

- A real payment gateway integration (see Section 3) — currently fully mocked.
- A real backend + database if you need data to persist beyond one browser/device (currently `localStorage`-only, per the original project's architecture).
- Replacing the mocked ID-upload and face-verification steps with a real KYC/identity provider, if required for production.
- Confirming the VAT rate: the project's source feasibility study (Chapters 1–8) specifies the 20% cancellation fee and 2% rescheduling fee exactly, but **does not specify a transaction VAT percentage**. This project currently uses the Philippines' standard **12% VAT** (`VAT_RATE` constant near the top of `script.js`) as a reasonable, clearly-documented default — change this single constant if your panel/client specifies a different figure.

---

## 8. Uploading to your existing GitHub repository

From inside this project folder:
```bash
git init                     # only if this folder isn't already a git repo
git add .
git commit -m "Implement additional client requirements: discounts, reschedule, admin role, receipts, RBAC"
git remote add origin https://github.com/<your-username>/<your-existing-repo>.git
git branch -M main
git push -u origin main
```
If the repository already exists and has commits, instead of `git init`/`remote add`, just copy these updated files into your existing local clone, then:
```bash
git add .
git commit -m "Implement additional client requirements: discounts, reschedule, admin role, receipts, RBAC"
git push
```
`.gitignore` is included to keep editor/OS clutter and any local `.env` file out of version control.

---

## 9. Deploying to GitHub Pages

The site is fully static with relative paths, so it works from a repo subpath (`https://<user>.github.io/<repo>/`).

1. Push the project so `index.html` is at the **repository root**.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then **Save**.
4. Wait 1-2 minutes. Your site will be live at `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so files are served as-is.

Notes: data lives in each visitor's own browser (`localStorage`), so reservations are not shared between different devices. The multi-tab role demo works across tabs in the same browser.
