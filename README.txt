=====================================================
 BOOKABITE — book . dine . go
 School project prototype (localhost only)
=====================================================

WHAT THIS IS
------------
A frontend-only prototype of a restaurant reservation + food ordering app.
No backend, no database, no real payments. Everything is simulated with
plain HTML, CSS, and JavaScript using the browser's localStorage.

It includes TWO connected interfaces in one app:
  - CUSTOMER APP        (register, browse, reserve, order, pay, track)
  - RESTAURANT DASHBOARD (receive reservations, confirm/decline, serve)

Both interfaces read/write the same localStorage data, so actions in one
show up in the other automatically (see "TWO-TAB DEMO" below).


FILES
-----
BookaBite/
├── index.html          -> the whole app (all screens live here)
├── style.css            -> all styling / brand colors
├── script.js             -> all app logic, sample data, localStorage
├── assets/
│   ├── logo/             -> BookaBite logo (already placed)
│   ├── restaurants/      -> restaurant covers & logos (placeholders included)
│   ├── menu/              -> food photos (placeholders included)
│   └── icons/             -> (icons are emoji, so this stays empty — optional)
└── README.txt


HOW TO RUN — OPTION 1 (VS Code, easiest)
-----------------------------------------
1. Open the BookaBite folder in VS Code.
2. Install the "Live Server" extension (by Ritwick Dey) if you don't have it.
3. Right-click index.html -> "Open with Live Server".
4. The app opens at something like http://127.0.0.1:5500/index.html

   (You can also just double-click index.html to open it directly in a
   browser — it will work, but a couple of browsers restrict file:// pages
   from using localStorage/storage-events fully, so Live Server or XAMPP
   is recommended for the two-tab demo.)


HOW TO RUN — OPTION 2 (XAMPP)
------------------------------
1. Copy the whole "BookaBite" folder into:
       C:\xampp\htdocs\bookabite\
2. Start Apache from the XAMPP Control Panel.
3. Open your browser to:
       http://localhost/bookabite/


TWO-BROWSER-TAB DEMO (recommended for presenting)
--------------------------------------------------
1. Open the app URL in TWO browser tabs.
2. In Tab 1, tap the "🎛️ Demo" button (bottom-right) -> choose "👤 Customer".
3. In Tab 2, tap "🎛️ Demo" -> choose "🍽️ Restaurant".
4. In Tab 1: register, verify, browse a restaurant, add food, reserve a
   table, and pay the mock down payment.
5. Switch to Tab 2: a 🔔 notification appears — open the reservation,
   check table availability, and confirm it.
6. Switch back to Tab 1: the reservation status updates to "Confirmed"
   automatically (no refresh needed).
7. Continue the flow: Customer Arrived -> Provide Table -> Remaining
   Payment -> Food Served -> Customer leaves feedback -> Restaurant sees it.

This works because reservations/notifications are stored in localStorage,
and the browser's built-in "storage" event tells the other tab to refresh
whenever something changes.

Each tab remembers its OWN role (Customer or Restaurant) for that
browser tab only, so you can safely run one as Customer and the other
as Restaurant at the same time.


THE "🎛️ DEMO" BUTTON
----------------------
Always visible bottom-right. Lets you:
  - Switch between Customer / Restaurant view in the current tab
  - "Load Sample Data" — restores the default restaurants/menu items
  - "Reset Demo" — wipes everything (account, reservations, notifications)
    and restarts fresh. Use this before/after each practice run.


WHERE TO PUT YOUR OWN IMAGES
------------------------------
- BookaBite logo:       assets/logo/bookabite-logo.png   (already placed)
- Restaurant covers:    assets/restaurants/<name>-cover.jpg
- Restaurant logos:     assets/restaurants/<name>-logo.jpg
- Food photos:          assets/menu/<food-name>.jpg

Placeholder images (labelled with their expected filename) are already
in place so the app looks complete even before you swap them out.


EDITING SAMPLE DATA (restaurants, menu, prices)
-------------------------------------------------
Open script.js and look for "SAMPLE / EDITABLE DATA" near the top —
the `freshSampleRestaurants()` function. Each restaurant is a plain
JavaScript object with a `menu` array. Change names, prices, images,
descriptions, hours, etc. directly there. After editing, use the
"Load Sample Data" button (or Reset Demo) to pick up your changes.


NOTES FOR THE PRESENTATION
-----------------------------
- No real backend, payment gateway, GPS, or facial recognition is used —
  everything marked "mock" or "simulated" is intentional per the project
  brief.
- Distances shown ("0.5 km away") are static sample values, not real GPS.
- If something looks stuck mid-demo, tap "🎛️ Demo" -> "Reset Demo" to
  start clean.
