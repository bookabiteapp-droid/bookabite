/* =========================================================================
   BOOKABITE — APP LOGIC
   Plain JavaScript + localStorage. No backend, no build tools.

   HOW THE DATA IS ORGANIZED (see bottom of this section):
   - SAMPLE_RESTAURANTS  -> edit names/prices/images here
   - STATE                -> everything currently in memory
   - localStorage keys     -> 'bb_customer', 'bb_restaurants', 'bb_reservations',
                              'bb_notifications'
   - sessionStorage key    -> 'bb_role'  (per BROWSER TAB — this is what makes
                              the two-tab customer/restaurant demo work)
   ========================================================================= */

/* ---------------------------------------------------------------------
   1. SAMPLE / EDITABLE DATA
   Replace names, prices, descriptions and image paths here.
   Images should be placed inside the /assets folder.
--------------------------------------------------------------------- */
const TABLES = [
  { id: 1, seats: 2 },
  { id: 2, seats: 4 },
  { id: 3, seats: 6 },
  { id: 4, seats: 8 }
];

/* ---------------------------------------------------------------------
   1b. PLATFORM CONFIG — fees, VAT, payment methods, promos
   Source: BookaBite feasibility study (Ch. 1-8) + client requirements doc.
   - Cancellation fee 20% and rescheduling fee 2% of total order cost are
     explicitly stated in the feasibility study (Table 14-16, Ch.3).
   - NOTE ON VAT: the feasibility study does not define a per-transaction
     VAT rate anywhere (only an unrelated 12% "market penetration rate").
     Since a VAT rate must not be invented, this uses the Philippines'
     standard statutory VAT rate (12%), which is a matter of law rather
     than a made-up figure. Change VAT_RATE below if your panel specifies
     a different figure.
--------------------------------------------------------------------- */
const VAT_RATE = 0.12;                 // 12% Philippine standard VAT
const RESERVATION_FEE_RATE = 0.50;     // 50% of total paid up front
const CANCELLATION_FEE_RATE = 0.20;    // 20% of total order cost
const RESCHEDULE_FEE_RATE = 0.02;      // 2% of total order cost

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", icon: "📱" },
  { id: "credit_card", label: "Credit Card", icon: "💳" },
  { id: "debit_card", label: "Debit Card", icon: "💳" }
];

// Occasion / promotional discounts (client-provided reference table).
// Only ONE may be applied per reservation unless an Administrator turns
// on "Allow Promo Stacking" in Admin > Settings.
const DISCOUNTS = {
  first_time:  { label: "First-Time User",  percent: 20, hint: "Auto-applied on your first reservation" },
  valentines:  { label: "Valentine's Day",  percent: 20, hint: "Feb 14" },
  christmas:   { label: "Christmas",        percent: 20, hint: "Dec 24 – 25" },
  mothers_day: { label: "Mother's Day",     percent: 20, hint: "2nd Sunday of May" },
  fathers_day: { label: "Father's Day",     percent: 10, hint: "3rd Sunday of June" },
  graduation:  { label: "Graduation",       percent: 10, hint: "Promo code from BookaBite" },
  birthday:    { label: "Birthday",         percent: 10, hint: "Your birth month & day" }
};

const RESERVATION_STATUSES = ["pending", "confirmed", "declined", "reschedule_requested", "cancelled", "completed"];

function freshSampleRestaurants() {
  return [
    {
      id: "r1",
      name: "Hygge Restaurant",
      logo: "assets/restaurants/hygge-logo.jpg",
      cover: "assets/restaurants/hygge-cover.jpg",
      description: "Cozy resto-bar known for generous sharing trays, wood-grilled mains, all-day Filipino breakfast, and a full bar of cocktails, wine, and craft brews. Warm interiors made for long, unhurried meals.",
      location: "Rosario Complex, Rosario Avenue, San Pedro City, Laguna",
      distanceKm: 3.4,
      rating: 4.7,
      cuisine: "International",
      priceRange: "₱₱₱",
      hours: "11:00 AM – 10:00 PM",
      contact: "0917 143 8644",
      mood: ["Casual", "Family", "Friends"],
      atmosphere: ["Indoor", "Outdoor"],
      seatingOptions: ["Indoor", "Outdoor", "Bar seating"],
      subscription: { active: true, paidAt: "2026-03-01" },
      menu: [
        { id: "m1", name: "Grilled Pork Chops in Chimichurri", description: "Char-grilled pork chops finished with fresh chimichurri, good for sharing (2–3 pax)", price: 585, category: "Main", image: "assets/menu/hygge-porkchops.jpg", available: true },
        { id: "m2", name: "8-Hour Slow Roasted Angus Beef", description: "Slow-cooked Angus beef with Madagascar sauce, roasted vegetables — sharing tray (5 pax)", price: 1950, category: "Main", image: "assets/menu/hygge-angus-beef.jpg", available: true },
        { id: "m3", name: "Biscoff Cheesecake", description: "Creamy baked cheesecake topped with a whole Biscoff cookie", price: 195, category: "Dessert", image: "assets/menu/hygge-biscoff-cheesecake.jpg", available: true },
        { id: "m4", name: "Peach Cobbler Latte", description: "Espresso, milk, and peach, served iced with whipped cream", price: 165, category: "Drinks", image: "assets/menu/hygge-peach-cobbler-latte.jpg", available: true }
      ],
      reviews: [
        { name: "Migz A.", rating: 5, comment: "Sharing trays are perfect for barkada dinners!" },
        { name: "Steph P.", rating: 4, comment: "Loved the pork chops, cozy vibe too." }
      ]
    },
    {
      id: "r2",
      name: "The Nest Dining in the Sky",
      logo: "assets/restaurants/the-nest-logo.jpg",
      cover: "assets/restaurants/the-nest-cover.jpg",
      description: "Rooftop fine dining at Vivere Hotel with skyline views over Alabang. Asian-fusion favorites, hearty grills, and sizzling Filipino classics, perfect for special occasions.",
      location: "31/F Vivere Hotel, 5102 Bridgeway Avenue, Filinvest City, Alabang, Muntinlupa City",
      distanceKm: 8.1,
      rating: 4.8,
      cuisine: "Asian Fusion",
      priceRange: "₱₱₱",
      hours: "11:00 AM – 11:00 PM",
      contact: "(02) 8771 7777",
      mood: ["Romantic", "Business", "Special occasion"],
      atmosphere: ["Rooftop", "Scenic", "Indoor"],
      seatingOptions: ["Indoor", "Window", "Private area"],
      subscription: { active: true, paidAt: "2026-02-10" },
      menu: [
        { id: "m5", name: "Korean Barbecue Set", description: "Barbecued chicken thigh fillet and thinly sliced beef short ribs with 3 Korean vegetable condiments, served with steamed rice", price: 600, category: "Main", image: "assets/menu/nest-korean-bbq-set.jpg", available: true },
        { id: "m6", name: "BBQ Beef Rib Fingers", description: "Smothered in sweet and spicy barbecue sauce, grilled to perfection, served with twice-baked potato and homemade coleslaw", price: 375, category: "Appetizer", image: "assets/menu/nest-bbq-rib-fingers.jpg", available: true },
        { id: "m7", name: "Crispy Binagoongan", description: "Bestseller — lechon kawali simmered in shrimp paste and tomatoes with lady fingers", price: 530, category: "Main", image: "assets/menu/nest-crispy-binagoongan.jpg", available: true },
        { id: "m8", name: "Fish and Chips", description: "Crispy on the outside, tender on the inside — beer-battered lapu-lapu fillet with pan-fried potatoes, malt vinegar, and remoulade", price: 620, category: "Main", image: "assets/menu/nest-fish-and-chips.jpg", available: true }
      ],
      reviews: [
        { name: "Carla V.", rating: 5, comment: "The view alone is worth it, food was excellent too." },
        { name: "Paolo D.", rating: 5, comment: "Perfect for our anniversary dinner." }
      ]
    },
    {
      id: "r3",
      name: "Virginia's Bistro",
      logo: "assets/restaurants/virginias-bistro-logo.jpg",
      cover: "assets/restaurants/virginias-bistro-cover.jpg",
      description: "Neighborhood European bistro serving comfort classics — wine-braised mains, honest pastas, and family-style Spanish trays. Warm, unpretentious, and great for weekend lunches.",
      location: "The Village Front, Brentville International, Mamplasan, Biñan",
      distanceKm: 5.6,
      rating: 4.6,
      cuisine: "European Bistro",
      priceRange: "₱₱",
      hours: "11:00 AM – 9:00 PM",
      contact: "0945 239 3273",
      mood: ["Casual", "Family", "Friends"],
      atmosphere: ["Indoor", "Outdoor"],
      seatingOptions: ["Indoor", "Outdoor"],
      subscription: { active: false, paidAt: null },
      menu: [
        { id: "m9", name: "Osso Buco Milanese", description: "House specialty — wine-braised shank with gremolata, served with risotto", price: 800, category: "Main", image: "assets/menu/virginias-osso-buco.jpg", available: true },
        { id: "m10", name: "Pan Roasted Salmon", description: "Salmon fillet with dill mustard sauce and side salad", price: 650, category: "Main", image: "assets/menu/virginias-seared-salmon.jpg", available: true },
        { id: "m11", name: "Aligue Rico", description: "Pasta tossed in olive oil, crab fat, olives, and capers", price: 400, category: "Main", image: "assets/menu/virginias-aligue-rico.jpg", available: true },
        { id: "m12", name: "Pan Seared Sea Bass", description: "Seared sea bass fillet finished with fresh herbs and lemon", price: 620, category: "Main", image: "assets/menu/virginias-sea-bass.jpg", available: true }
      ],
      reviews: [
        { name: "Grace T.", rating: 5, comment: "The Osso Buco is a must-try, so tender." },
        { name: "Ronnie M.", rating: 4, comment: "Great family Sunday lunch spot." }
      ]
    }
  ];
}

/* ---------------------------------------------------------------------
   2. STATE + PERSISTENCE
--------------------------------------------------------------------- */
const STATE = {
  role: null,                 // 'customer' | 'restaurant' | 'admin'  (per browser tab)
  customer: null,             // current demo customer
  restaurants: [],
  reservations: [],
  notifications: [],
  settings: null,             // platform-wide settings (admin-controlled)
  activeRestaurantId: "r1",   // which restaurant the Restaurant Dashboard is managing
  draft: null,                // in-progress reservation being built by the customer
  discoverFilters: { cuisine: null, mood: null, atmosphere: null, seating: null, price: null },
  rResFilter: "all",
  adminResFilter: "all",
  viewingReservationId: null,
  reschedulingId: null,
  cancellingId: null,
  feedbackRating: 5,
  selectedPaymentMethod: null,
  selectedTableId: null,
  selectedDiscountKeys: [],   // discount(s) chosen on the review-reservation screen
  reschDiners: 2,
  lastCreatedId: null,
  pendingIdVerified: false,
  restaurantTermsAgreed: false
};

function saveCustomer() { localStorage.setItem("bb_customer", JSON.stringify(STATE.customer)); }
function saveRestaurants() { localStorage.setItem("bb_restaurants", JSON.stringify(STATE.restaurants)); }
function saveReservations() { localStorage.setItem("bb_reservations", JSON.stringify(STATE.reservations)); }
function saveNotifications() { localStorage.setItem("bb_notifications", JSON.stringify(STATE.notifications)); }
function saveSettings() { localStorage.setItem("bb_settings", JSON.stringify(STATE.settings)); }

function freshSettings() {
  return {
    allowPromoStacking: false,   // Admin-only toggle — "Prevent multiple promotional discounts
                                  // from stacking unless the Administrator has explicitly enabled it"
    pendingRestaurants: []       // restaurant names/notes submitted for Admin approval (demo)
  };
}

function loadAllFromStorage() {
  const c = localStorage.getItem("bb_customer");
  const r = localStorage.getItem("bb_restaurants");
  const res = localStorage.getItem("bb_reservations");
  const n = localStorage.getItem("bb_notifications");
  const s = localStorage.getItem("bb_settings");
  STATE.customer = c ? JSON.parse(c) : null;
  STATE.restaurants = r ? JSON.parse(r) : freshSampleRestaurants();
  STATE.reservations = res ? JSON.parse(res) : [];
  STATE.notifications = n ? JSON.parse(n) : [];
  STATE.settings = s ? JSON.parse(s) : freshSettings();
  STATE.restaurantTermsAgreed = localStorage.getItem("bb_restaurant_terms_agreed") === "1";
  if (!r) saveRestaurants();
  if (!s) saveSettings();
}

function findRestaurant(id) { return STATE.restaurants.find(r => r.id === id); }
function findReservation(id) { return STATE.reservations.find(r => r.id === id); }
function findMenuItem(restaurant, id) { return restaurant.menu.find(m => m.id === id); }

/* ---------------------------------------------------------------------
   3. NAVIGATION
--------------------------------------------------------------------- */
let currentScreen = "screen-splash";
let historyStack = [];

const NO_BACK_SCREENS = new Set([
  "screen-splash", "screen-verify-success", "screen-payment-success", "screen-r-terms",
  "screen-home", "screen-discover", "screen-reservations", "screen-orders", "screen-profile",
  "screen-r-dashboard", "screen-r-reservations", "screen-r-menu", "screen-r-restaurant", "screen-r-subscription",
  "screen-a-dashboard", "screen-a-reservations", "screen-a-restaurants", "screen-a-accounts", "screen-a-reports"
]);

const SCREEN_TITLES = {
  "screen-terms": "Terms & Conditions",
  "screen-register": "Create Account",
  "screen-verify-id": "Verify Identity",
  "screen-verify-face": "Facial Verification",
  "screen-reservation-form": "Reservation Details",
  "screen-review-reservation": "Review Reservation",
  "screen-payment": "Payment",
  "screen-receipt": "Digital Receipt",
  "screen-reservation-detail": "Reservation",
  "screen-reschedule-form": "Reschedule",
  "screen-feedback-form": "Feedback",
  "screen-r-terms": "Partner Terms & Conditions",
  "screen-r-reservation-detail": "Reservation",
  "screen-r-partnership": "Partnership",
  "screen-a-reservation-detail": "Reservation"
};

function show(id) {
  currentScreen = id;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  updateTopbar(id);
  updateNavHighlight(id);
  renderScreen(id);
  const sc = document.getElementById("scrollArea");
  if (sc) sc.scrollTop = 0;
}

function go(id) {
  if (currentScreen && currentScreen !== id) historyStack.push(currentScreen);
  show(id);
}
function goBack() {
  const prev = historyStack.pop();
  const fallback = STATE.role === "restaurant"
    ? (STATE.restaurantTermsAgreed ? "screen-r-dashboard" : "screen-r-terms")
    : STATE.role === "admin" ? "screen-a-dashboard" : "screen-home";
  show(prev || fallback);
}
function navTo(id) {
  historyStack = [];
  show(id);
}

function updateTopbar(id) {
  const title = SCREEN_TITLES[id] || null;
  const backBtn = document.getElementById("btnBack");
  const titleEl = document.getElementById("tbTitle");
  const logoEl = document.getElementById("tbLogo");
  if (title) {
    backBtn.style.display = NO_BACK_SCREENS.has(id) ? "none" : "flex";
    titleEl.style.display = "block";
    titleEl.textContent = id === "screen-restaurant-detail" ? "" : title;
    logoEl.style.display = "none";
  } else {
    backBtn.style.display = "none";
    titleEl.style.display = "none";
    logoEl.style.display = "block";
  }
  // dedicated dynamic title for restaurant detail
  if (id === "screen-restaurant-detail") {
    titleEl.style.display = "block";
    logoEl.style.display = "none";
    backBtn.style.display = "flex";
  }
}

function updateNavHighlight(id) {
  document.querySelectorAll("#navCustomer .nav-item, #navRestaurant .nav-item, #navAdmin .nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === id);
  });
}

function renderScreen(id) {
  switch (id) {
    case "screen-home": renderHome(); break;
    case "screen-discover": renderDiscover(); break;
    case "screen-restaurant-detail": renderRestaurantDetail(); break;
    case "screen-reservation-form": renderReservationForm(); break;
    case "screen-review-reservation": renderReviewReservation(); break;
    case "screen-payment": renderPayment(); break;
    case "screen-payment-success": renderPaymentSuccess(); break;
    case "screen-receipt": renderReceipt(); break;
    case "screen-reservations": renderCustResList(); break;
    case "screen-reservation-detail": renderCustResDetail(); break;
    case "screen-reschedule-form": renderRescheduleForm(); break;
    case "screen-feedback-form": renderFeedbackForm(); break;
    case "screen-orders": renderCustOrders(); break;
    case "screen-profile": renderProfile(); break;
    case "screen-r-terms": renderRTerms(); break;
    case "screen-r-dashboard": renderRDashboard(); break;
    case "screen-r-reservations": renderRResList(); break;
    case "screen-r-reservation-detail": renderRResDetail(); break;
    case "screen-r-menu": renderRMenu(); break;
    case "screen-r-restaurant": renderRProfile(); break;
    case "screen-r-subscription": renderRSubscription(); break;
    case "screen-r-partnership": renderPartnership(); break;
    case "screen-a-dashboard": renderADashboard(); break;
    case "screen-a-reservations": renderAResList(); break;
    case "screen-a-reservation-detail": renderAResDetail(); break;
    case "screen-a-restaurants": renderARestaurants(); break;
    case "screen-a-accounts": renderAAccounts(); break;
    case "screen-a-reports": renderAReports(); break;
  }
  updateNotifBadge();
}

/* ---------------------------------------------------------------------
   4. TOASTS + MODALS
--------------------------------------------------------------------- */
function showToast(text, icon) {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>${icon || "✅"}</span><span>${text}</span>`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function money(n) { return "₱" + Math.round(n).toLocaleString(); }

/* ---------------------------------------------------------------------
   5. DEMO ROLE SWITCHER / RESET
--------------------------------------------------------------------- */
function setRole(role) {
  STATE.role = role;
  sessionStorage.setItem("bb_role", role);
  closeModal("modalDemo");
  document.getElementById("navCustomer").classList.toggle("hidden", role !== "customer");
  // Restaurant nav stays hidden until the Partner Terms are agreed to — this is the
  // role-based access gate, so a restaurant user cannot tap a nav item to skip past it.
  document.getElementById("navRestaurant").classList.toggle("hidden", !(role === "restaurant" && STATE.restaurantTermsAgreed));
  document.getElementById("navAdmin").classList.toggle("hidden", role !== "admin");
  historyStack = [];
  if (role === "customer") {
    if (STATE.customer && STATE.customer.verified) enterCustomerApp();
    else show("screen-splash");
  } else if (role === "restaurant") {
    if (!STATE.restaurantTermsAgreed) show("screen-r-terms");
    else show("screen-r-dashboard");
  } else if (role === "admin") {
    show("screen-a-dashboard");
  }
}

/* ---- Partner Restaurant Terms & Conditions gate ---- */
function renderRTerms() {
  document.getElementById("rAgreeCheck").checked = false;
  document.getElementById("btnRAgree").disabled = true;
}
function agreeRestaurantTerms() {
  STATE.restaurantTermsAgreed = true;
  localStorage.setItem("bb_restaurant_terms_agreed", "1");
  document.getElementById("navRestaurant").classList.remove("hidden");
  showToast("Thanks! Partner Terms accepted.", "✅");
  navTo("screen-r-dashboard");
}

function resetDemo() {
  if (!confirm("This clears all reservations, notifications, feedback and your demo account. Continue?")) return;
  localStorage.removeItem("bb_customer");
  localStorage.removeItem("bb_restaurants");
  localStorage.removeItem("bb_reservations");
  localStorage.removeItem("bb_notifications");
  localStorage.removeItem("bb_settings");
  localStorage.removeItem("bb_restaurant_terms_agreed");
  sessionStorage.removeItem("bb_role");
  location.reload();
}

function loadSampleData(showToastMsg) {
  STATE.restaurants = freshSampleRestaurants();
  saveRestaurants();
  closeModal("modalDemo");
  renderScreen(currentScreen);
  if (showToastMsg) showToast("Sample restaurant & menu data restored.", "📦");
}

/* ---------------------------------------------------------------------
   6. NOTIFICATIONS
--------------------------------------------------------------------- */
function addNotification(role, icon, text, reservationId) {
  STATE.notifications.unshift({
    id: "n" + Date.now() + Math.floor(Math.random() * 999),
    role, icon, text, reservationId,
    read: false,
    time: new Date().toISOString()
  });
  saveNotifications();
}

function updateNotifBadge() {
  const count = STATE.notifications.filter(n => n.role === STATE.role && !n.read).length;
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  if (count > 0) { badge.style.display = "flex"; badge.textContent = count > 9 ? "9+" : count; }
  else badge.style.display = "none";
}

function renderNotifList() {
  const list = STATE.notifications.filter(n => n.role === STATE.role);
  const el = document.getElementById("notifList");
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🔔</div><h4>No notifications yet</h4><p>You'll see updates here.</p></div>`;
    return;
  }
  el.innerHTML = list.map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <div class="ni-icon">${n.icon}</div>
      <div><h5>${n.text}</h5><p>${timeAgo(n.time)}</p></div>
    </div>
  `).join("");
  list.forEach(n => n.read = true);
  saveNotifications();
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnNotif").addEventListener("click", () => setTimeout(() => { renderNotifList(); updateNotifBadge(); }, 10));
});

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
  return Math.floor(diff / 86400) + " day(s) ago";
}

/* ---------------------------------------------------------------------
   7. ONBOARDING — REGISTER / VERIFY
--------------------------------------------------------------------- */
function skipToHomeExistingUser() {
  if (STATE.customer && STATE.customer.verified) enterCustomerApp();
  else showToast("No existing account found — please register.", "ℹ️");
}

function submitRegistration() {
  const name = document.getElementById("regName").value.trim();
  const mobile = document.getElementById("regMobile").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const age = parseInt(document.getElementById("regAge").value, 10);
  const birthday = document.getElementById("regDOB").value || null;
  const ageField = document.getElementById("ageField");

  if (!name || !mobile || !email) {
    showToast("Please fill out all fields.", "⚠️");
    return;
  }
  if (!age || age < 18) {
    ageField.classList.add("has-error");
    return;
  }
  ageField.classList.remove("has-error");

  STATE.customer = {
    name, mobile, email, age, birthday,
    verified: false,
    firstReservationUsed: false,
    createdAt: new Date().toISOString()
  };
  saveCustomer();
  go("screen-verify-id");
}

function simulateIdUpload() {
  document.getElementById("idBoxIcon").textContent = "⏳";
  document.getElementById("idBoxText").textContent = "Uploading...";
  setTimeout(() => {
    document.getElementById("idBoxIcon").textContent = "✅";
    document.getElementById("idBoxText").textContent = "ID Uploaded";
    document.getElementById("idUploadBox").style.borderColor = "var(--success)";
    document.getElementById("btnIdContinue").disabled = false;
  }, 900);
}

function simulateFaceVerify() {
  const scan = document.getElementById("faceScan");
  const btn = document.getElementById("btnStartFace");
  scan.classList.add("scanning");
  scan.textContent = "🔍";
  btn.disabled = true;
  btn.textContent = "Verifying...";
  setTimeout(() => {
    scan.classList.remove("scanning");
    scan.classList.add("verified");
    scan.textContent = "✅";
    btn.textContent = "Continue";
    btn.disabled = false;
    btn.onclick = () => {
      STATE.customer.verified = true;
      saveCustomer();
      document.getElementById("verifiedName").textContent = STATE.customer.name.split(" ")[0];
      go("screen-verify-success");
    };
  }, 1600);
}

function enterCustomerApp() {
  STATE.role = "customer";
  sessionStorage.setItem("bb_role", "customer");
  document.getElementById("navCustomer").classList.remove("hidden");
  document.getElementById("navRestaurant").classList.add("hidden");
  navTo("screen-home");
}

/* ---------------------------------------------------------------------
   8. CUSTOMER HOME + DISCOVER
--------------------------------------------------------------------- */
function restaurantCardHTML(r) {
  return `
    <div class="restaurant-card" onclick="openRestaurant('${r.id}')">
      <img src="${r.cover}" alt="${r.name}">
      <div class="rc-body">
        <div class="rc-top">
          <div><h4>${r.name}</h4><div class="rc-meta">${r.cuisine} · ${r.location}</div></div>
          <div class="rating">★ ${r.rating}</div>
        </div>
        <div class="tag-row">
          <span class="tag yellow">${r.priceRange}</span>
          <span class="tag">${r.distanceKm} km away</span>
          <span class="tag">${r.subscription.active ? "Open now" : "Limited slots"}</span>
        </div>
      </div>
    </div>`;
}

function upcomingReservationHTML() {
  const upcoming = STATE.reservations
    .filter(r => ["pending", "confirmed", "reschedule_requested"].includes(r.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (!upcoming) return "";
  return `
    <div class="section-title">Upcoming Reservation</div>
    <div class="card" onclick="openCustResDetail('${upcoming.id}')">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:14.5px;">${upcoming.restaurantName}</h4>
          <p class="small muted mt-8">${formatDate(upcoming.date)} · ${upcoming.time} · ${upcoming.diners} diners</p>
        </div>
        ${statusBadgeHTML(upcoming.status)}
      </div>
    </div>`;
}

function renderHome() {
  document.getElementById("upcomingResSlot").innerHTML = upcomingReservationHTML();

  const featured = [...STATE.restaurants].sort((a, b) => b.rating - a.rating);
  document.getElementById("featuredScroll").innerHTML = featured.map(r => `
    <div class="mini-card" onclick="openRestaurant('${r.id}')">
      <img src="${r.cover}" alt="${r.name}">
      <div class="mc-body"><h5>${r.name}</h5><span>★ ${r.rating} · ${r.cuisine}</span></div>
    </div>`).join("");

  const allFood = [];
  STATE.restaurants.forEach(r => r.menu.forEach(m => allFood.push({ ...m, restaurantId: r.id, restaurantName: r.name })));
  document.getElementById("popularFoodScroll").innerHTML = allFood.slice(0, 8).map(f => `
    <div class="mini-card" onclick="openRestaurant('${f.restaurantId}')">
      <img src="${f.image}" alt="${f.name}">
      <div class="mc-body"><h5>${f.name}</h5><span>${money(f.price)} · ${f.restaurantName}</span></div>
    </div>`).join("");

  const nearby = [...STATE.restaurants].sort((a, b) => a.distanceKm - b.distanceKm);
  document.getElementById("nearbyList").innerHTML = nearby.map(restaurantCardHTML).join("");
}

const FILTER_OPTIONS = {
  cuisine: ["International", "Asian Fusion", "European Bistro"],
  mood: ["Casual", "Family", "Friends", "Romantic", "Business", "Special occasion"],
  atmosphere: ["Indoor", "Outdoor", "Rooftop", "Scenic"],
  seating: ["Indoor", "Outdoor", "Bar seating", "Window", "Private area"],
  price: ["₱", "₱₱", "₱₱₱"]
};

function buildFilterChips(groupKey, elId) {
  const el = document.getElementById(elId);
  el.innerHTML = FILTER_OPTIONS[groupKey].map(opt => `
    <button class="chip ${STATE.discoverFilters[groupKey] === opt ? "active" : ""}" onclick="toggleDiscoverFilter('${groupKey}','${opt}')">${opt}</button>
  `).join("");
}

function toggleDiscoverFilter(group, value) {
  STATE.discoverFilters[group] = STATE.discoverFilters[group] === value ? null : value;
  renderDiscover();
}
function clearDiscoverFilters() {
  STATE.discoverFilters = { cuisine: null, mood: null, atmosphere: null, seating: null, price: null };
  document.getElementById("discoverSearch").value = "";
  renderDiscover();
}

function renderDiscover() {
  buildFilterChips("cuisine", "filterCuisine");
  buildFilterChips("mood", "filterMood");
  buildFilterChips("atmosphere", "filterAtmosphere");
  buildFilterChips("seating", "filterSeating");
  buildFilterChips("price", "filterPrice");

  const q = (document.getElementById("discoverSearch").value || "").toLowerCase();
  const f = STATE.discoverFilters;

  let list = STATE.restaurants.filter(r => {
    if (f.cuisine && r.cuisine !== f.cuisine) return false;
    if (f.mood && !r.mood.includes(f.mood)) return false;
    if (f.atmosphere && !r.atmosphere.includes(f.atmosphere)) return false;
    if (f.seating && !r.seatingOptions.includes(f.seating)) return false;
    if (f.price && r.priceRange !== f.price) return false;
    if (q) {
      const inName = r.name.toLowerCase().includes(q);
      const inFood = r.menu.some(m => m.name.toLowerCase().includes(q));
      if (!inName && !inFood) return false;
    }
    return true;
  });

  const el = document.getElementById("discoverList");
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🍽️</div><h4>No restaurants found</h4><p>Try adjusting your filters.</p></div>`;
  } else {
    el.innerHTML = list.map(restaurantCardHTML).join("");
  }
}

/* ---------------------------------------------------------------------
   9. RESTAURANT DETAIL + MENU/CART
--------------------------------------------------------------------- */
function openRestaurant(id) {
  if (!STATE.draft || STATE.draft.restaurantId !== id) {
    STATE.draft = { restaurantId: id, items: [], diners: 2, date: "", time: "19:00", seating: "" };
  }
  go("screen-restaurant-detail");
}

function switchRdTab(tab) {
  ["menu", "about", "reviews"].forEach(t => {
    document.getElementById("tab" + capitalize(t)).classList.toggle("active", t === tab);
    document.getElementById("rdPane" + capitalize(t)).style.display = t === tab ? "block" : "none";
  });
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderRestaurantDetail() {
  const r = findRestaurant(STATE.draft.restaurantId);
  document.getElementById("tbTitle").textContent = r.name;
  document.getElementById("rdHeroImg").src = r.cover;
  document.getElementById("rdName").textContent = r.name;
  document.getElementById("rdLocation").textContent = "📍 " + r.location + " · " + r.distanceKm + " km";
  document.getElementById("rdRating").textContent = "★ " + r.rating;
  document.getElementById("rdTags").innerHTML = `<span class="tag yellow">${r.priceRange}</span>` +
    r.mood.map(m => `<span class="tag">${m}</span>`).join("");
  document.getElementById("rdDescription").textContent = r.description;
  document.getElementById("rdHours").textContent = r.hours;
  document.getElementById("rdAboutText").textContent = r.description + " Located at " + r.location + ". Contact: " + r.contact + ".";
  document.getElementById("rdSeatingOptions").textContent = r.seatingOptions.join(", ");
  document.getElementById("rdPriceRange").textContent = r.priceRange;

  document.getElementById("rdMenuList").innerHTML = r.menu.map(m => {
    const qty = cartQty(m.id);
    return `
    <div class="food-item">
      <img src="${m.image}" alt="${m.name}">
      <div class="fi-body">
        <h5>${m.name}</h5>
        <p class="desc">${m.description}</p>
        <div class="price">${money(m.price)}</div>
      </div>
      <div class="fi-action">
        ${qty > 0
          ? `<div class="qty-pill"><button onclick="changeCartQty('${m.id}',-1)">−</button><span>${qty}</span><button onclick="changeCartQty('${m.id}',1)">+</button></div>`
          : `<button class="add-btn" onclick="changeCartQty('${m.id}',1)">Add</button>`}
      </div>
    </div>`;
  }).join("");

  document.getElementById("rdReviewsList").innerHTML = r.reviews.map(rv => `
    <div class="review-item">
      <h5>${rv.name}</h5>
      <div class="stars">${"★".repeat(rv.rating)}${"☆".repeat(5 - rv.rating)}</div>
      <p>${rv.comment}</p>
    </div>`).join("");

  const count = STATE.draft.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartSubtotal(r);
  document.getElementById("cartBarSlot").innerHTML = `
    <div class="card" style="position:sticky; bottom:0; display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div>
        <div class="small muted">${count} item(s)</div>
        <div style="font-weight:800;">${money(subtotal)}</div>
      </div>
      <button class="btn btn-primary" style="width:auto; padding:12px 20px;" onclick="go('screen-reservation-form')">Reserve a Table</button>
    </div>`;
}

function cartQty(itemId) {
  const entry = STATE.draft.items.find(i => i.itemId === itemId);
  return entry ? entry.qty : 0;
}
function cartSubtotal(restaurant) {
  return STATE.draft.items.reduce((sum, i) => {
    const m = findMenuItem(restaurant, i.itemId);
    return sum + (m ? m.price * i.qty : 0);
  }, 0);
}
function changeCartQty(itemId, delta) {
  let entry = STATE.draft.items.find(i => i.itemId === itemId);
  if (!entry) { entry = { itemId, qty: 0 }; STATE.draft.items.push(entry); }
  entry.qty += delta;
  if (entry.qty <= 0) STATE.draft.items = STATE.draft.items.filter(i => i.itemId !== itemId);
  renderRestaurantDetail();
}

/* ---------------------------------------------------------------------
   10. RESERVATION FORM -> REVIEW -> PAYMENT
--------------------------------------------------------------------- */
function renderReservationForm() {
  const r = findRestaurant(STATE.draft.restaurantId);
  document.getElementById("dinerCount").textContent = STATE.draft.diners;
  document.getElementById("resDate").value = STATE.draft.date;
  document.getElementById("resDate").min = new Date().toISOString().split("T")[0];
  document.getElementById("resTime").value = STATE.draft.time;

  const sel = document.getElementById("resSeating");
  sel.innerHTML = r.seatingOptions.map(s => `<option value="${s}">${s}</option>`).join("");
  if (STATE.draft.seating) sel.value = STATE.draft.seating;

  const list = document.getElementById("orderItemsList");
  const noMsg = document.getElementById("noItemsMsg");
  if (STATE.draft.items.length === 0) {
    list.innerHTML = ""; noMsg.style.display = "block";
  } else {
    noMsg.style.display = "none";
    list.innerHTML = STATE.draft.items.map(i => {
      const m = findMenuItem(r, i.itemId);
      return `
      <div class="food-item">
        <img src="${m.image}" alt="${m.name}">
        <div class="fi-body"><h5>${m.name}</h5><div class="price">${money(m.price)} × ${i.qty}</div></div>
        <div class="fi-action">
          <div class="qty-pill"><button onclick="changeCartQty('${m.id}',-1)">−</button><span>${i.qty}</span><button onclick="changeCartQty('${m.id}',1)">+</button></div>
        </div>
      </div>`;
    }).join("");
  }
}

function changeDiners(delta) {
  STATE.draft.diners = Math.max(1, Math.min(20, STATE.draft.diners + delta));
  document.getElementById("dinerCount").textContent = STATE.draft.diners;
}

function readReservationFormInputs() {
  STATE.draft.date = document.getElementById("resDate").value;
  STATE.draft.time = document.getElementById("resTime").value;
  STATE.draft.seating = document.getElementById("resSeating").value;
}

// hook: capture inputs right before leaving reservation-form screen
document.addEventListener("click", (e) => {
  if (e.target && e.target.matches('#screen-reservation-form .btn-primary')) {
    readReservationFormInputs();
    if (!STATE.draft.date) { showToast("Please select a reservation date.", "⚠️"); e.stopImmediatePropagation(); e.preventDefault(); }
  }
}, true);

/* ---- Discount / promo eligibility ---- */
function isDateInRange(d, startMD, endMD) {
  // d: Date, startMD/endMD: [month(1-12), day]
  const mmdd = (d.getMonth() + 1) * 100 + d.getDate();
  const start = startMD[0] * 100 + startMD[1];
  const end = endMD[0] * 100 + endMD[1];
  return mmdd >= start && mmdd <= end;
}
function nthWeekdayOfMonth(year, month, weekday, n) {
  // month: 1-12, weekday: 0=Sun..6=Sat
  const d = new Date(year, month - 1, 1);
  let count = 0;
  while (d.getMonth() === month - 1) {
    if (d.getDay() === weekday) { count++; if (count === n) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
  return null;
}
function getEligibleDiscountKeys() {
  const today = new Date();
  const eligible = [];
  if (STATE.customer && !STATE.customer.firstReservationUsed) eligible.push("first_time");
  if (isDateInRange(today, [2, 14], [2, 14])) eligible.push("valentines");
  if (isDateInRange(today, [12, 24], [12, 25])) eligible.push("christmas");
  const mothersDay = nthWeekdayOfMonth(today.getFullYear(), 5, 0, 2);
  if (mothersDay && today.toDateString() === mothersDay.toDateString()) eligible.push("mothers_day");
  const fathersDay = nthWeekdayOfMonth(today.getFullYear(), 6, 0, 3);
  if (fathersDay && today.toDateString() === fathersDay.toDateString()) eligible.push("fathers_day");
  if (STATE.customer && STATE.customer.birthday) {
    const b = new Date(STATE.customer.birthday + "T00:00:00");
    if (b.getMonth() === today.getMonth() && b.getDate() === today.getDate()) eligible.push("birthday");
  }
  return eligible;
}

function computePricing(restaurant, discountKeys) {
  const subtotal = cartSubtotal(restaurant);
  const keys = Array.isArray(discountKeys) ? discountKeys : (discountKeys ? [discountKeys] : []);
  const allowStacking = !!(STATE.settings && STATE.settings.allowPromoStacking);
  const applied = allowStacking ? keys.slice() : keys.slice(0, 1);
  let discountPercent = applied.reduce((s, k) => s + (DISCOUNTS[k] ? DISCOUNTS[k].percent : 0), 0);
  if (discountPercent > 100) discountPercent = 100;
  const discountLabel = applied.map(k => DISCOUNTS[k] ? DISCOUNTS[k].label : k).join(" + ") || null;
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round(taxable * VAT_RATE);
  const total = taxable + vatAmount;
  const reservationFee = Math.round(total * RESERVATION_FEE_RATE);
  const remainingBalance = total - reservationFee;
  const firstTime = STATE.customer && !STATE.customer.firstReservationUsed;
  return {
    subtotal, discountKeys: applied, discountPercent, discountLabel, discountAmount,
    vatAmount, total, reservationFee, remainingBalance, firstTime,
    // legacy aliases kept so nothing else in the app breaks
    discount: discountAmount, downPayment: reservationFee, remaining: remainingBalance
  };
}

function renderDiscountPicker() {
  const eligible = getEligibleDiscountKeys();
  const allowStacking = !!(STATE.settings && STATE.settings.allowPromoStacking);
  document.getElementById("revStackHint").style.display = allowStacking ? "inline" : "none";

  const el = document.getElementById("revDiscountPicker");
  el.innerHTML = Object.keys(DISCOUNTS).map(key => {
    const d = DISCOUNTS[key];
    const isEligible = eligible.includes(key);
    const isSelected = STATE.selectedDiscountKeys.includes(key);
    return `
    <div class="discount-opt ${isSelected ? "selected" : ""}" onclick="toggleDiscountKey('${key}')">
      <div>
        <h5>${d.label} <span class="muted small">— ${d.percent}%</span></h5>
        <p class="small muted">${d.hint}${isEligible ? " · eligible today" : ""}</p>
      </div>
      <span class="discount-check">${isSelected ? "✓" : ""}</span>
    </div>`;
  }).join("");
}
function toggleDiscountKey(key) {
  const allowStacking = !!(STATE.settings && STATE.settings.allowPromoStacking);
  const idx = STATE.selectedDiscountKeys.indexOf(key);
  if (idx > -1) {
    STATE.selectedDiscountKeys.splice(idx, 1);
  } else if (allowStacking) {
    STATE.selectedDiscountKeys.push(key);
  } else {
    STATE.selectedDiscountKeys = [key];
  }
  renderReviewReservation();
}

function renderReviewReservation() {
  const r = findRestaurant(STATE.draft.restaurantId);
  document.getElementById("revRestaurant").textContent = r.name;
  document.getElementById("revDate").textContent = formatDate(STATE.draft.date);
  document.getElementById("revTime").textContent = formatTime(STATE.draft.time);
  document.getElementById("revDiners").textContent = STATE.draft.diners;
  document.getElementById("revSeating").textContent = STATE.draft.seating;

  document.getElementById("revItemsList").innerHTML = STATE.draft.items.length
    ? STATE.draft.items.map(i => {
        const m = findMenuItem(r, i.itemId);
        return `<div class="sum-row"><span>${i.qty}x ${m.name}</span><span>${money(m.price * i.qty)}</span></div>`;
      }).join("")
    : `<p class="small muted">No food items added.</p>`;

  renderDiscountPicker();

  const p = computePricing(r, STATE.selectedDiscountKeys);
  document.getElementById("revSubtotal").textContent = money(p.subtotal);
  if (p.discountAmount > 0) {
    document.getElementById("revDiscountRow").style.display = "flex";
    document.getElementById("revDiscountLabel").textContent = `Discount (${p.discountLabel}, ${p.discountPercent}%)`;
    document.getElementById("revDiscount").textContent = "-" + money(p.discountAmount);
  } else {
    document.getElementById("revDiscountRow").style.display = "none";
  }
  document.getElementById("revVat").textContent = money(p.vatAmount);
  document.getElementById("revTotal").textContent = money(p.total);
  document.getElementById("revDownPayment").textContent = money(p.reservationFee);
  document.getElementById("revRemaining").textContent = money(p.remainingBalance);
}

function renderPayment() {
  const r = findRestaurant(STATE.draft.restaurantId);
  const p = computePricing(r, STATE.selectedDiscountKeys);
  document.getElementById("payTotal").textContent = money(p.total);
  document.getElementById("payDown").textContent = money(p.reservationFee);
  document.getElementById("payRemaining").textContent = money(p.remainingBalance);

  document.getElementById("payMethodList").innerHTML = PAYMENT_METHODS.map(m => `
    <div class="list-row" style="cursor:pointer; border:1.6px solid ${STATE.selectedPaymentMethod === m.id ? "var(--yellow)" : "transparent"}; background:${STATE.selectedPaymentMethod === m.id ? "var(--yellow-soft)" : "var(--gray-100)"}; border-radius:12px; padding:12px 14px; margin-bottom:8px;"
         onclick="selectPaymentMethod('${m.id}')">
      <div class="lr-left"><span class="lr-icon">${m.icon}</span> ${m.label}</div>
      <span>${STATE.selectedPaymentMethod === m.id ? "✓" : ""}</span>
    </div>`).join("");
}
function selectPaymentMethod(id) { STATE.selectedPaymentMethod = id; renderPayment(); }
function paymentMethodLabel(id) {
  const m = PAYMENT_METHODS.find(x => x.id === id);
  return m ? m.label : (id || "—");
}

function confirmMockPayment() {
  if (!STATE.selectedPaymentMethod) { showToast("Please select a payment method.", "⚠️"); return; }
  const r = findRestaurant(STATE.draft.restaurantId);
  const p = computePricing(r, STATE.selectedDiscountKeys);

  const reservation = {
    id: "BB-" + Math.floor(10000 + Math.random() * 89999),
    restaurantId: r.id,
    restaurantName: r.name,
    customerName: STATE.customer.name,
    customerMobile: STATE.customer.mobile,
    customerEmail: STATE.customer.email,
    diners: STATE.draft.diners,
    date: STATE.draft.date,
    time: STATE.draft.time,
    seating: STATE.draft.seating,
    items: STATE.draft.items.map(i => {
      const m = findMenuItem(r, i.itemId);
      return { name: m.name, price: m.price, qty: i.qty };
    }),
    subtotal: p.subtotal,
    discountKeys: p.discountKeys,
    discountLabel: p.discountLabel,
    discountPercent: p.discountPercent,
    discount: p.discountAmount,
    vatAmount: p.vatAmount,
    total: p.total,
    downPayment: p.reservationFee,       // Reservation Fee (50%)
    remaining: p.remainingBalance,       // Remaining Balance (50%)
    paymentMethod: STATE.selectedPaymentMethod,
    paymentStatus: "Reservation Fee Paid",
    status: "pending",
    declineReason: null,
    cancellationFee: null,
    rescheduleFee: null,
    table: null,
    arrived: false,
    tableProvided: false,
    remainingPaid: false,
    served: false,
    feedback: null,
    rescheduleRequest: null,
    priorStatus: null,
    createdAt: new Date().toISOString(),
    transactionDate: new Date().toISOString()
  };

  STATE.reservations.unshift(reservation);
  saveReservations();

  if (p.discountKeys.includes("first_time")) { STATE.customer.firstReservationUsed = true; saveCustomer(); }

  addNotification("restaurant", "🔔", `New reservation from ${STATE.customer.name} at ${r.name}`, reservation.id);
  addNotification("admin", "🔔", `New reservation ${reservation.id} from ${STATE.customer.name} at ${r.name}`, reservation.id);

  STATE.draft = null;
  STATE.selectedPaymentMethod = null;
  STATE.selectedDiscountKeys = [];
  STATE.lastCreatedId = reservation.id;

  go("screen-payment-success");
}

function renderPaymentSuccess() {
  document.getElementById("successResId").textContent = STATE.lastCreatedId;
}
function viewReservationFromSuccess() {
  openCustResDetail(STATE.lastCreatedId);
}

/* ---- Digital Receipt ---- */
function openReceipt(id) {
  STATE.viewingReservationId = id;
  go("screen-receipt");
}
function renderReceipt() {
  const r = findReservation(STATE.viewingReservationId);
  if (!r) { navTo("screen-home"); return; }
  document.getElementById("rcptTxnDate").textContent = "Transaction Date: " + new Date(r.transactionDate || r.createdAt).toLocaleString("en-PH");
  document.getElementById("rcptRestaurant").textContent = r.restaurantName;
  document.getElementById("rcptResId").textContent = r.id;
  document.getElementById("rcptCustomer").textContent = r.customerName;
  document.getElementById("rcptMobile").textContent = r.customerMobile;
  document.getElementById("rcptDateTime").textContent = formatDate(r.date) + " · " + formatTime(r.time);
  document.getElementById("rcptDiners").textContent = r.diners;

  document.getElementById("rcptItems").innerHTML = r.items.length
    ? r.items.map(i => `<div class="sum-row"><span>${i.qty}x ${i.name}</span><span>${money(i.price * i.qty)}</span></div>`).join("")
    : `<p class="small muted">No food items.</p>`;

  document.getElementById("rcptSubtotal").textContent = money(r.subtotal);
  if (r.discount > 0) {
    document.getElementById("rcptDiscountRow").style.display = "flex";
    document.getElementById("rcptDiscountLabel").textContent = `Discount (${r.discountLabel || ""}, ${r.discountPercent}%)`;
    document.getElementById("rcptDiscount").textContent = "-" + money(r.discount);
  } else {
    document.getElementById("rcptDiscountRow").style.display = "none";
  }
  document.getElementById("rcptVat").textContent = money(r.vatAmount || 0);
  document.getElementById("rcptTotal").textContent = money(r.total);
  document.getElementById("rcptDown").textContent = money(r.downPayment);
  document.getElementById("rcptRemaining").textContent = r.remainingPaid ? "₱0 (Paid)" : money(r.remaining);

  document.getElementById("rcptMethod").textContent = paymentMethodLabel(r.paymentMethod);
  document.getElementById("rcptPayStatus").textContent = r.remainingPaid ? "Paid in Full" : (r.status === "cancelled" ? "Reservation Fee Forfeited" : "Reservation Fee Paid — Balance Due");
  document.getElementById("rcptResStatus").textContent = statusLabel(displayStatus(r));
}
function statusLabel(status) {
  const map = {
    pending: "Pending", confirmed: "Confirmed", declined: "Declined",
    reschedule_requested: "Reschedule Requested", cancelled: "Cancelled", completed: "Completed"
  };
  return map[status] || status;
}

/* ---------------------------------------------------------------------
   11. CUSTOMER RESERVATIONS + ORDERS + PROFILE
--------------------------------------------------------------------- */
function statusBadgeHTML(status) {
  const map = {
    pending: ["badge-pending", "Pending Confirmation"],
    confirmed: ["badge-confirmed", "Confirmed"],
    declined: ["badge-declined", "Declined"],
    reschedule_requested: ["badge-reschedule", "Reschedule Pending"],
    cancelled: ["badge-cancelled", "Cancelled"],
    completed: ["badge-completed", "Completed"]
  };
  const [cls, label] = map[status] || ["badge-pending", status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderCustResList() {
  const el = document.getElementById("custResList");
  const list = [...STATE.reservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">📅</div><h4>No reservations yet</h4><p>Book a table from Discover to get started.</p></div>`;
    return;
  }
  el.innerHTML = list.map(r => `
    <div class="res-card" onclick="openCustResDetail('${r.id}')">
      <div class="rc-head">
        <div><h4>${r.restaurantName}</h4><div class="rc-id">${r.id}</div></div>
        ${statusBadgeHTML(displayStatus(r))}
      </div>
      <div class="rc-line"><span>${formatDate(r.date)} · ${formatTime(r.time)}</span><span>${r.diners} diners</span></div>
    </div>`).join("");
}

function displayStatus(r) {
  if (r.served) return "completed";
  return r.status;
}

function openCustResDetail(id) {
  STATE.viewingReservationId = id;
  go("screen-reservation-detail");
}

function renderCustResDetail() {
  const r = findReservation(STATE.viewingReservationId);
  if (!r) { navTo("screen-reservations"); return; }
  document.getElementById("crdId").textContent = r.id;
  document.getElementById("crdStatusBadge").outerHTML = statusBadgeHTML(displayStatus(r)).replace('class="badge', 'id="crdStatusBadge" class="badge');
  document.getElementById("crdRestaurant").textContent = r.restaurantName;
  document.getElementById("crdDate").textContent = formatDate(r.date);
  document.getElementById("crdTime").textContent = formatTime(r.time);
  document.getElementById("crdDiners").textContent = r.diners;
  document.getElementById("crdTable").textContent = r.table ? `Table ${r.table.id} (${r.table.seats} seats)` : "Not yet assigned";

  document.getElementById("crdItems").innerHTML = r.items.length
    ? r.items.map(i => `<div class="sum-row"><span>${i.qty}x ${i.name}</span><span>${money(i.price * i.qty)}</span></div>`).join("")
    : `<p class="small muted">No food items.</p>`;
  document.getElementById("crdDown").textContent = money(r.downPayment);
  document.getElementById("crdRemaining").textContent = r.remainingPaid ? "₱0 (Paid)" : money(r.remaining);

  document.getElementById("crdTimeline").innerHTML = buildTimeline(r);
  document.getElementById("crdActions").innerHTML = buildCustActions(r);
}

function buildTimeline(r) {
  const steps = [];
  steps.push({ label: "Reservation Placed", done: true, sub: formatDate(r.date) + " · " + formatTime(r.time) });

  if (r.status === "declined") {
    steps.push({ label: "Declined", declined: true, sub: r.declineReason || "No suitable table was available." });
    return renderTimelineSteps(steps);
  }
  if (r.status === "cancelled") {
    steps.push({ label: "Cancelled by Customer", declined: true, sub: `20% cancellation fee applied: ${money(r.cancellationFee || 0)}` });
    return renderTimelineSteps(steps);
  }

  steps.push({
    label: "Restaurant Confirmation",
    done: r.status === "confirmed" || r.arrived || r.served,
    active: r.status === "pending" || r.status === "reschedule_requested",
    sub: r.status === "pending" ? "Waiting for restaurant" : r.status === "reschedule_requested" ? "Reschedule requested" : "Confirmed" + (r.table ? " · Table " + r.table.id : "")
  });
  steps.push({ label: "Customer Arrived", done: r.arrived, active: r.status === "confirmed" && !r.arrived, sub: r.arrived ? "Checked in" : "Pending arrival" });
  steps.push({ label: "Table Provided", done: r.tableProvided, active: r.arrived && !r.tableProvided, sub: r.tableProvided ? "Seated" : "Pending" });
  steps.push({ label: "Remaining Payment", done: r.remainingPaid, active: r.tableProvided && !r.remainingPaid, sub: r.remainingPaid ? "Paid at restaurant" : "Pending" });
  steps.push({ label: "Food Served", done: r.served, active: r.remainingPaid && !r.served, sub: r.served ? "Enjoy your meal!" : "Pending" });
  steps.push({ label: "Feedback Submitted", done: !!r.feedback, active: r.served && !r.feedback, sub: r.feedback ? `${r.feedback.rating}★ — "${r.feedback.comment.slice(0, 40)}"` : "Share your experience" });

  return renderTimelineSteps(steps);
}
function renderTimelineSteps(steps) {
  return steps.map(s => `
    <div class="tl-step ${s.done ? "done" : s.active ? "active" : s.declined ? "declined" : ""}">
      <div class="tl-dot">${s.done ? "✓" : s.declined ? "✕" : ""}</div>
      <div class="tl-text"><h5>${s.label}</h5><p>${s.sub}</p></div>
    </div>`).join("");
}

function buildCustActions(r) {
  const receiptBtn = `<button class="btn btn-outline mt-8" onclick="openReceipt('${r.id}')">View Digital Receipt</button>`;
  if (r.status === "declined") {
    return `
      <div class="btn-row">
        <button class="btn btn-outline" onclick="rebookFromDeclined('${r.id}')">Try Another Time</button>
        <button class="btn btn-primary" onclick="rebookFromDeclined('${r.id}')">Modify Booking</button>
      </div>${receiptBtn}`;
  }
  if (r.status === "cancelled") {
    return `<p class="small muted center">This reservation was cancelled. A 20% cancellation fee was applied.</p>${receiptBtn}`;
  }
  if (r.status === "reschedule_requested") {
    return `<p class="small muted center">Waiting for the restaurant to review your reschedule request.</p>${receiptBtn}`;
  }
  if (r.status === "pending" || r.status === "confirmed") {
    return `
      <button class="btn btn-outline-yellow" onclick="openReschedule('${r.id}')">Reschedule Reservation</button>
      <button class="btn btn-danger mt-8" onclick="openCancelConfirm('${r.id}')">Cancel Reservation</button>
      ${receiptBtn}`;
  }
  if (r.served && !r.feedback) {
    return `<button class="btn btn-primary" onclick="openFeedback('${r.id}')">Rate Your Experience</button>${receiptBtn}`;
  }
  if (r.feedback) {
    return `<p class="small muted center">Thanks for your feedback! ⭐ ${r.feedback.rating}/5</p>${receiptBtn}`;
  }
  return receiptBtn;
}

/* ---- Cancellation (customer, 20% fee) ---- */
function openCancelConfirm(id) {
  STATE.cancellingId = id;
  const r = findReservation(id);
  const fee = Math.round(r.total * CANCELLATION_FEE_RATE);
  document.getElementById("cancTotal").textContent = money(r.total);
  document.getElementById("cancFee").textContent = money(fee);
  document.getElementById("cancRefund").textContent = money(Math.max(0, r.downPayment - fee));
  openModal("modalCancelConfirm");
}
function confirmCancelReservation() {
  const r = findReservation(STATE.cancellingId);
  const fee = Math.round(r.total * CANCELLATION_FEE_RATE);
  r.priorStatus = r.status;
  r.status = "cancelled";
  r.cancellationFee = fee;
  saveReservations();
  addNotification("restaurant", "🔔", `${r.customerName} cancelled their reservation at ${r.restaurantName}.`, r.id);
  addNotification("admin", "🔔", `Reservation ${r.id} was cancelled by ${r.customerName}. Cancellation fee: ${money(fee)}.`, r.id);
  closeModal("modalCancelConfirm");
  showToast("Reservation cancelled.", "✅");
  renderCustResDetail();
}

function rebookFromDeclined(id) {
  const r = findReservation(id);
  STATE.draft = {
    restaurantId: r.restaurantId,
    items: r.items.map(i => {
      const rest = findRestaurant(r.restaurantId);
      const found = rest.menu.find(m => m.name === i.name);
      return found ? { itemId: found.id, qty: i.qty } : null;
    }).filter(Boolean),
    diners: r.diners, date: "", time: r.time, seating: r.seating
  };
  go("screen-restaurant-detail");
}

/* ---- Reschedule (customer) ---- */
function openReschedule(id) {
  STATE.reschedulingId = id;
  const r = findReservation(id);
  STATE.reschDiners = r.diners;
  go("screen-reschedule-form");
}
function renderRescheduleForm() {
  const r = findReservation(STATE.reschedulingId);
  document.getElementById("reschDate").value = r.date;
  document.getElementById("reschDate").min = new Date().toISOString().split("T")[0];
  document.getElementById("reschTime").value = r.time;
  document.getElementById("reschDinerCount").textContent = STATE.reschDiners;
  document.getElementById("reschFeePreview").textContent = money(Math.round(r.total * RESCHEDULE_FEE_RATE));
}
function changeReschDiners(d) {
  STATE.reschDiners = Math.max(1, Math.min(20, STATE.reschDiners + d));
  document.getElementById("reschDinerCount").textContent = STATE.reschDiners;
}
function submitReschedule() {
  const date = document.getElementById("reschDate").value;
  const time = document.getElementById("reschTime").value;
  if (!date) { showToast("Please select a new date.", "⚠️"); return; }
  const r = findReservation(STATE.reschedulingId);
  const fee = Math.round(r.total * RESCHEDULE_FEE_RATE);
  r.priorStatus = r.status;
  r.status = "reschedule_requested";
  r.rescheduleRequest = { date, time, diners: STATE.reschDiners, status: "pending", fee };
  saveReservations();
  addNotification("restaurant", "🔔", `Reschedule request from ${r.customerName} for ${r.restaurantName}`, r.id);
  addNotification("admin", "🔔", `${r.customerName} requested to reschedule ${r.id} at ${r.restaurantName}.`, r.id);
  showToast("Reschedule request sent to the restaurant.", "📨");
  openCustResDetail(r.id);
}

/* ---- Feedback ---- */
function openFeedback(id) {
  STATE.viewingReservationId = id;
  STATE.feedbackRating = 5;
  go("screen-feedback-form");
}
function renderFeedbackForm() { renderStarPicker(); document.getElementById("feedbackComment").value = ""; }
function renderStarPicker() {
  const el = document.getElementById("starPicker");
  el.innerHTML = [1, 2, 3, 4, 5].map(n => `<span onclick="setFeedbackRating(${n})" style="color:${n <= STATE.feedbackRating ? "var(--yellow-dark)" : "var(--gray-300)"};">★</span>`).join("");
}
function setFeedbackRating(n) { STATE.feedbackRating = n; renderStarPicker(); }
function submitFeedback() {
  const comment = document.getElementById("feedbackComment").value.trim();
  const r = findReservation(STATE.viewingReservationId);
  r.feedback = { rating: STATE.feedbackRating, comment: comment || "(No comment provided)" };
  saveReservations();
  addNotification("restaurant", "⭐", `${r.customerName} rated ${r.restaurantName} ${r.feedback.rating} star(s)`, r.id);
  showToast("Thanks for your feedback!", "🙏");
  openCustResDetail(r.id);
}

/* ---- Orders tab ---- */
function renderCustOrders() {
  const el = document.getElementById("custOrdersList");
  const withFood = [...STATE.reservations].filter(r => r.items.length > 0).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (withFood.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🛒</div><h4>No orders yet</h4><p>Food you order with a reservation shows up here.</p></div>`;
    return;
  }
  el.innerHTML = withFood.map(r => {
    let orderStatus = "Preparing";
    if (r.status === "declined") orderStatus = "Cancelled";
    else if (r.served) orderStatus = "Served";
    else if (r.status === "confirmed") orderStatus = "Confirmed";
    else if (r.status === "pending") orderStatus = "Awaiting Confirmation";
    return `
    <div class="res-card" onclick="openCustResDetail('${r.id}')">
      <div class="rc-head">
        <div><h4>${r.restaurantName}</h4><div class="rc-id">${r.id} · ${r.items.reduce((s, i) => s + i.qty, 0)} item(s)</div></div>
        <span class="badge badge-pending">${orderStatus}</span>
      </div>
      <div class="rc-line"><span>${r.items.map(i => i.qty + "x " + i.name).join(", ")}</span><span>${money(r.subtotal)}</span></div>
    </div>`;
  }).join("");
}

function renderProfile() {
  const c = STATE.customer;
  if (!c) return;
  document.getElementById("profAvatar").textContent = c.name.charAt(0).toUpperCase();
  document.getElementById("profName").textContent = c.name;
  document.getElementById("profEmail").textContent = c.email;
  document.getElementById("profDiscountText").textContent = c.firstReservationUsed
    ? "Already used on your first reservation." : "10% OFF your first reservation — auto-applied.";
}

/* ---------------------------------------------------------------------
   12. RESTAURANT DASHBOARD
--------------------------------------------------------------------- */
function activeRestaurant() { return findRestaurant(STATE.activeRestaurantId); }
function resForActive() { return STATE.reservations.filter(r => r.restaurantId === STATE.activeRestaurantId); }

function renderRDashboard() {
  const r = activeRestaurant();
  document.getElementById("rDashLogo").src = r.logo;
  document.getElementById("rDashName").textContent = r.name;

  const all = resForActive();
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("statPending").textContent = all.filter(x => x.status === "pending").length;
  document.getElementById("statConfirmed").textContent = all.filter(x => x.status === "confirmed").length;
  document.getElementById("statToday").textContent = all.filter(x => x.date === today && ["confirmed", "pending"].includes(x.status)).reduce((s, x) => s + x.diners, 0);
  const ratings = all.filter(x => x.feedback).map(x => x.feedback.rating).concat(r.reviews.map(rv => rv.rating));
  document.getElementById("statRating").textContent = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "–";

  const notifs = STATE.notifications.filter(n => n.role === "restaurant").slice(0, 6);
  const el = document.getElementById("rDashNotifList");
  if (notifs.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🔔</div><h4>No notifications yet</h4><p>New reservations will appear here.</p></div>`;
  } else {
    el.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? "" : "unread"}" style="cursor:pointer;" onclick="jumpToNotifTarget('${n.reservationId || ""}')">
        <div class="ni-icon">${n.icon}</div>
        <div><h5>${n.text}</h5><p>${timeAgo(n.time)}</p></div>
      </div>`).join("");
  }
}
function jumpToNotifTarget(resId) {
  if (!resId) return;
  const r = findReservation(resId);
  if (!r) return;
  openRResDetail(resId);
}

function setRResFilter(f) {
  STATE.rResFilter = f;
  document.querySelectorAll("#rResFilterRow .filter-chip").forEach(b => b.classList.toggle("active", b.dataset.f === f));
  renderRResList();
}

function renderRResList() {
  let list = resForActive();
  if (STATE.rResFilter !== "all") {
    if (STATE.rResFilter === "completed") list = list.filter(r => r.served);
    else list = list.filter(r => r.status === STATE.rResFilter);
  }
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const el = document.getElementById("rResList");
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><h4>No reservations here</h4><p>Try a different filter.</p></div>`;
    return;
  }
  el.innerHTML = list.map(r => `
    <div class="res-card">
      <div class="rc-head">
        <div><h4>${r.customerName}</h4><div class="rc-id">${r.id}</div></div>
        ${statusBadgeHTML(displayStatus(r))}
      </div>
      <div class="rc-line"><span>${formatDate(r.date)} · ${formatTime(r.time)}</span><span>${r.diners} diners</span></div>
      <div class="rc-line"><span>${r.items.reduce((s, i) => s + i.qty, 0)} item(s) · ${money(r.total)}</span><span></span></div>
      <button class="btn btn-outline btn-sm mt-8" style="width:100%;" onclick="openRResDetail('${r.id}')">View Details</button>
    </div>`).join("");
}

function openRResDetail(id) {
  STATE.viewingReservationId = id;
  go("screen-r-reservation-detail");
}

function renderRResDetail() {
  const r = findReservation(STATE.viewingReservationId);
  if (!r) { navTo("screen-r-reservations"); return; }
  document.getElementById("rrdId").textContent = r.id;
  document.getElementById("rrdStatusBadge").outerHTML = statusBadgeHTML(displayStatus(r)).replace('class="badge', 'id="rrdStatusBadge" class="badge');
  document.getElementById("rrdCustomer").textContent = r.customerName;
  document.getElementById("rrdMobile").textContent = r.customerMobile;
  document.getElementById("rrdDate").textContent = formatDate(r.date);
  document.getElementById("rrdTime").textContent = formatTime(r.time);
  document.getElementById("rrdDiners").textContent = r.diners;
  document.getElementById("rrdSeating").textContent = r.seating;

  document.getElementById("rrdItems").innerHTML = r.items.length
    ? r.items.map(i => `<div class="sum-row"><span>${i.qty}x ${i.name}</span><span>${money(i.price * i.qty)}</span></div>`).join("")
    : `<p class="small muted">No food items.</p>`;
  document.getElementById("rrdTotal").textContent = money(r.total);
  document.getElementById("rrdDown").textContent = money(r.downPayment) + " (paid)";
  document.getElementById("rrdRemaining").textContent = r.remainingPaid ? "₱0 (Paid)" : money(r.remaining);
  document.getElementById("rrdMethod").textContent = paymentMethodLabel(r.paymentMethod);

  document.getElementById("rrdActionZone").innerHTML = buildRestaurantActions(r);

  if (r.feedback) {
    document.getElementById("rrdActionZone").innerHTML += `
      <div class="card mt-16">
        <p class="small muted">Customer Feedback</p>
        <div class="stars" style="color:var(--yellow-dark); font-size:16px; margin:4px 0;">${"★".repeat(r.feedback.rating)}${"☆".repeat(5 - r.feedback.rating)}</div>
        <p class="small">"${r.feedback.comment}"</p>
      </div>`;
  }
}

function buildRestaurantActions(r) {
  if (r.status === "declined") return `<p class="small muted center mt-16">This reservation was declined.${r.declineReason ? ' Reason: "' + r.declineReason + '"' : ""}</p>`;
  if (r.status === "cancelled") return `<p class="small muted center mt-16">This reservation was cancelled by the customer. 20% cancellation fee: ${money(r.cancellationFee || 0)}.</p>`;
  if (r.status === "reschedule_requested") {
    return `<button class="btn btn-primary mt-16" onclick="reviewReschedule('${r.id}')">Review Reschedule Request</button>`;
  }
  if (r.status === "pending") {
    return `<button class="btn btn-primary mt-16" onclick="openTableAvailability('${r.id}')">Check Table Availability</button>`;
  }
  if (r.status === "confirmed" && !r.arrived) {
    return `<button class="btn btn-primary mt-16" onclick="markArrived('${r.id}')">Customer Arrived</button>`;
  }
  if (r.arrived && !r.tableProvided) {
    return `<button class="btn btn-primary mt-16" onclick="provideTable('${r.id}')">Provide Reserved Table</button>`;
  }
  if (r.tableProvided && !r.remainingPaid) {
    return `<button class="btn btn-primary mt-16" onclick="openRemainingPayment('${r.id}')">Confirm Remaining Payment</button>`;
  }
  if (r.remainingPaid && !r.served) {
    return `<button class="btn btn-primary mt-16" onclick="markServed('${r.id}')">Mark Food as Served</button>`;
  }
  if (r.served) return `<p class="small muted center mt-16">✓ Order complete. Waiting on customer feedback.</p>`;
  return "";
}

/* ---- table availability / confirm / decline ---- */
function openTableAvailability(id) {
  STATE.viewingReservationId = id;
  STATE.selectedTableId = null;
  document.getElementById("btnConfirmTable").disabled = true;
  document.getElementById("tableGrid").innerHTML = TABLES.map(t => `
    <div class="table-opt" id="tableOpt${t.id}" onclick="pickTable(${t.id})">
      <div class="to-num">Table ${t.id}</div>
      <div class="to-seats">${t.seats} seats</div>
    </div>`).join("");
  openModal("modalTableAvail");
}
function pickTable(tid) {
  STATE.selectedTableId = tid;
  TABLES.forEach(t => document.getElementById("tableOpt" + t.id).classList.toggle("selected", t.id === tid));
  document.getElementById("btnConfirmTable").disabled = false;
}
function confirmReservationWithTable() {
  const r = findReservation(STATE.viewingReservationId);
  const table = TABLES.find(t => t.id === STATE.selectedTableId);
  r.status = "confirmed";
  r.table = table;
  r.declineReason = null;
  saveReservations();
  addNotification("customer", "🔔", `Your reservation at ${r.restaurantName} has been confirmed.`, r.id);
  addNotification("admin", "🔔", `${r.restaurantName} confirmed reservation ${r.id}.`, r.id);
  document.getElementById("tableDeclineReason").value = "";
  closeModal("modalTableAvail");
  showToast("Reservation confirmed.", "✅");
  renderRResDetail();
}
function declineReservation() {
  const r = findReservation(STATE.viewingReservationId);
  const reason = (document.getElementById("tableDeclineReason").value || "").trim() || "No suitable table was available for this schedule.";
  r.status = "declined";
  r.declineReason = reason;
  saveReservations();
  addNotification("customer", "🔔", `Your reservation at ${r.restaurantName} was declined. Reason: ${reason}`, r.id);
  addNotification("admin", "🔔", `${r.restaurantName} declined reservation ${r.id}. Reason: ${reason}`, r.id);
  document.getElementById("tableDeclineReason").value = "";
  closeModal("modalTableAvail");
  showToast("Reservation declined.", "❌");
  renderRResDetail();
}

/* ---- reschedule review (restaurant) — includes the 2% reschedule fee ---- */
function reviewReschedule(id) {
  STATE.viewingReservationId = id;
  const r = findReservation(id);
  const rr = r.rescheduleRequest;
  document.getElementById("reschDeclineReason").value = "";
  document.getElementById("reschReviewBody").innerHTML = `
    <p><strong>${r.customerName}</strong> requested to change:</p>
    <div class="sum-row"><span>New Date</span><span>${formatDate(rr.date)}</span></div>
    <div class="sum-row"><span>New Time</span><span>${formatTime(rr.time)}</span></div>
    <div class="sum-row"><span>New Diners</span><span>${rr.diners}</span></div>
    <div class="sum-row"><span>Rescheduling Fee (2%)</span><span>${money(rr.fee || Math.round(r.total * RESCHEDULE_FEE_RATE))}</span></div>`;
  openModal("modalReschReview");
}
function respondReschedule(approve) {
  const r = findReservation(STATE.viewingReservationId);
  if (approve) {
    const fee = r.rescheduleRequest.fee || Math.round(r.total * RESCHEDULE_FEE_RATE);
    r.date = r.rescheduleRequest.date;
    r.time = r.rescheduleRequest.time;
    r.diners = r.rescheduleRequest.diners;
    r.rescheduleRequest.status = "approved";
    r.rescheduleFee = fee;
    r.status = r.priorStatus || "confirmed";
    r.declineReason = null;
    addNotification("customer", "🔔", `Your reschedule request for ${r.restaurantName} was approved. A 2% rescheduling fee of ${money(fee)} applies.`, r.id);
    addNotification("admin", "🔔", `${r.restaurantName} approved the reschedule for ${r.id}. Fee collected: ${money(fee)}.`, r.id);
    showToast("Reschedule approved.", "✅");
  } else {
    const reason = (document.getElementById("reschDeclineReason").value || "").trim() || "Requested schedule is not available.";
    r.rescheduleRequest.status = "declined";
    r.rescheduleRequest.declineReason = reason;
    r.status = r.priorStatus || "confirmed";
    addNotification("customer", "🔔", `Your reschedule request for ${r.restaurantName} was declined. Reason: ${reason}`, r.id);
    addNotification("admin", "🔔", `${r.restaurantName} declined the reschedule request for ${r.id}. Reason: ${reason}`, r.id);
    showToast("Reschedule declined.", "❌");
  }
  saveReservations();
  closeModal("modalReschReview");
  renderRResDetail();
}

/* ---- arrival / table / payment / served ---- */
function markArrived(id) {
  const r = findReservation(id);
  r.arrived = true;
  saveReservations();
  addNotification("customer", "🔔", `You've been marked as arrived at ${r.restaurantName}.`, r.id);
  showToast("Customer marked as arrived.", "✅");
  renderRResDetail();
}
function provideTable(id) {
  const r = findReservation(id);
  r.tableProvided = true;
  saveReservations();
  showToast("✓ Table Reserved.", "🪑");
  renderRResDetail();
}
function openRemainingPayment(id) {
  STATE.viewingReservationId = id;
  const r = findReservation(id);
  document.getElementById("rpayTotal").textContent = money(r.total);
  document.getElementById("rpayDown").textContent = money(r.downPayment);
  document.getElementById("rpayRemaining").textContent = money(r.remaining);
  openModal("modalRemainingPay");
}
function confirmRemainingPayment() {
  const r = findReservation(STATE.viewingReservationId);
  r.remainingPaid = true;
  r.paymentStatus = "Paid in Full";
  saveReservations();
  closeModal("modalRemainingPay");
  showToast("✓ Payment Completed.", "💳");
  renderRResDetail();
}
function markServed(id) {
  const r = findReservation(id);
  r.served = true;
  saveReservations();
  addNotification("customer", "🍽️", `Your food has been served at ${r.restaurantName}. Enjoy!`, r.id);
  addNotification("admin", "🍽️", `Reservation ${r.id} at ${r.restaurantName} marked as completed.`, r.id);
  showToast("Marked as served.", "🍽️");
  renderRResDetail();
}

/* ---------------------------------------------------------------------
   13. RESTAURANT MENU MANAGEMENT
--------------------------------------------------------------------- */
function renderRMenu() {
  const r = activeRestaurant();
  const el = document.getElementById("rMenuList");
  if (r.menu.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🍴</div><h4>No menu items yet</h4><p>Tap "+ Add Food" to create one.</p></div>`;
    return;
  }
  el.innerHTML = r.menu.map(m => `
    <div class="food-item">
      <img src="${m.image}" alt="${m.name}">
      <div class="fi-body">
        <h5>${m.name} ${m.available ? "" : '<span class="badge badge-declined" style="margin-left:6px;">Unavailable</span>'}</h5>
        <p class="desc">${m.description}</p>
        <div class="price">${money(m.price)} · ${m.category}</div>
      </div>
      <div class="fi-action" style="display:flex; flex-direction:column; gap:6px;">
        <button class="btn btn-outline btn-sm" onclick="openMenuForm('${m.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${m.id}')">Delete</button>
      </div>
    </div>`).join("");
}
function openMenuForm(itemId) {
  const r = activeRestaurant();
  document.getElementById("menuFormId").value = itemId || "";
  if (itemId) {
    const m = findMenuItem(r, itemId);
    document.getElementById("menuFormTitle").textContent = "Edit Food";
    document.getElementById("menuFormName").value = m.name;
    document.getElementById("menuFormDesc").value = m.description;
    document.getElementById("menuFormPrice").value = m.price;
    document.getElementById("menuFormCategory").value = m.category;
    document.getElementById("menuFormImage").value = m.image;
    document.getElementById("menuFormAvailable").checked = m.available;
  } else {
    document.getElementById("menuFormTitle").textContent = "Add Food";
    ["menuFormName", "menuFormDesc", "menuFormPrice", "menuFormImage"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("menuFormCategory").value = "Main";
    document.getElementById("menuFormAvailable").checked = true;
  }
  openModal("modalMenuForm");
}
function saveMenuItem() {
  const r = activeRestaurant();
  const id = document.getElementById("menuFormId").value;
  const name = document.getElementById("menuFormName").value.trim();
  const price = parseFloat(document.getElementById("menuFormPrice").value);
  if (!name || !price) { showToast("Please enter a food name and price.", "⚠️"); return; }

  const data = {
    name,
    description: document.getElementById("menuFormDesc").value.trim(),
    price,
    category: document.getElementById("menuFormCategory").value,
    image: document.getElementById("menuFormImage").value.trim() || "assets/menu/placeholder.svg",
    available: document.getElementById("menuFormAvailable").checked
  };

  if (id) {
    Object.assign(findMenuItem(r, id), data);
  } else {
    r.menu.push({ id: "m" + Date.now(), ...data });
  }
  saveRestaurants();
  closeModal("modalMenuForm");
  showToast("Menu item saved.", "✅");
  renderRMenu();
}
function deleteMenuItem(id) {
  if (!confirm("Delete this food item?")) return;
  const r = activeRestaurant();
  r.menu = r.menu.filter(m => m.id !== id);
  saveRestaurants();
  showToast("Food item deleted.", "🗑️");
  renderRMenu();
}

/* ---------------------------------------------------------------------
   14. RESTAURANT PROFILE + SUBSCRIPTION + PARTNERSHIP
--------------------------------------------------------------------- */
function renderRProfile() {
  const sel = document.getElementById("rActiveRestaurantSelect");
  sel.innerHTML = STATE.restaurants.map(r => `<option value="${r.id}" ${r.id === STATE.activeRestaurantId ? "selected" : ""}>${r.name}</option>`).join("");
  const r = activeRestaurant();
  document.getElementById("rpName").value = r.name;
  document.getElementById("rpDescription").value = r.description;
  document.getElementById("rpLocation").value = r.location;
  document.getElementById("rpContact").value = r.contact;
  document.getElementById("rpHours").value = r.hours;
  document.getElementById("rpCuisine").value = r.cuisine;
  document.getElementById("rpSeating").value = r.seatingOptions.join(", ");
}
function switchActiveRestaurant(id) {
  STATE.activeRestaurantId = id;
  renderRProfile();
  showToast("Now managing " + activeRestaurant().name, "🏪");
}
function saveRestaurantProfile() {
  const r = activeRestaurant();
  r.name = document.getElementById("rpName").value.trim() || r.name;
  r.description = document.getElementById("rpDescription").value.trim();
  r.location = document.getElementById("rpLocation").value.trim();
  r.contact = document.getElementById("rpContact").value.trim();
  r.hours = document.getElementById("rpHours").value.trim();
  r.cuisine = document.getElementById("rpCuisine").value.trim();
  r.seatingOptions = document.getElementById("rpSeating").value.split(",").map(s => s.trim()).filter(Boolean);
  saveRestaurants();
  showToast("Restaurant profile updated.", "✅");
}

function renderRSubscription() {
  const r = activeRestaurant();
  const card = document.getElementById("subStatusCard");
  const btn = document.getElementById("btnPaySub");
  if (r.subscription.active) {
    card.innerHTML = `<div class="center"><span class="badge badge-confirmed">✓ Active</span><p class="small muted mt-8">Paid on ${formatDate(r.subscription.paidAt)}</p></div>`;
    btn.textContent = "Subscription Active";
    btn.disabled = true;
  } else {
    card.innerHTML = `<div class="center"><span class="badge badge-declined">Inactive</span><p class="small muted mt-8">Pay the annual fee to go live on BookaBite.</p></div>`;
    btn.textContent = "Pay Annual Subscription (Mock)";
    btn.disabled = false;
  }
}
function paySubscription() {
  const r = activeRestaurant();
  r.subscription = { active: true, paidAt: new Date().toISOString().split("T")[0] };
  saveRestaurants();
  showToast("✓ Subscription payment successful.", "✅");
  renderRSubscription();
}

function renderPartnership() {
  const steps = [
    ["Identify Potential Partner Restaurant", "BookaBite scouts restaurants that fit the platform."],
    ["Sales Representative Contacts Restaurant", "Initial outreach and introduction call."],
    ["Present BookaBite Services & Benefits", "Walkthrough of the app, dashboard, and fees."],
    ["Discuss Terms and Conditions", "Review of the subscription and service terms."],
    ["Restaurant Interested?", "If not interested, onboarding ends here."],
    ["Prepare & Sign Partnership Agreement", "Formal agreement between BookaBite and the restaurant."],
    ["Register Restaurant in BookaBite System", "Restaurant account is created."],
    ["Pay ₱3,000 Annual Subscription", "Required to activate the restaurant's listing."],
    ["Upload Restaurant Info, Images & Menu", "Logo, cover photo, description, and food items."],
    ["Restaurant Goes Live", "Now visible to customers on Discover."]
  ];
  document.getElementById("partnershipSteps").innerHTML = steps.map((s, i) => `
    <div class="wf-step">
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div class="wf-num">${i + 1}</div>
        ${i < steps.length - 1 ? '<div class="wf-line"></div>' : ""}
      </div>
      <div class="wf-body"><h5>${s[0]}</h5><p>${s[1]}</p></div>
    </div>`).join("");
}

/* ---------------------------------------------------------------------
   14b. ADMINISTRATOR DASHBOARD
   Role-based: this whole section is only reachable via setRole('admin').
   Admin can monitor every reservation/restaurant/account across the
   platform (shared localStorage keys), approve/decline reservations,
   review cancellations & reschedules, and control the promo-stacking
   setting. It never edits a restaurant's own menu/profile — that stays
   restaurant-only, preserving role-based access control.
--------------------------------------------------------------------- */
function allReservationsSorted() {
  return [...STATE.reservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderADashboard() {
  const all = STATE.reservations;
  document.getElementById("aStatPending").textContent = all.filter(r => r.status === "pending").length;
  document.getElementById("aStatConfirmed").textContent = all.filter(r => r.status === "confirmed").length;
  document.getElementById("aStatResch").textContent = all.filter(r => r.status === "reschedule_requested").length;
  document.getElementById("aStatCancelled").textContent = all.filter(r => r.status === "cancelled").length;
  document.getElementById("aStatCompleted").textContent = all.filter(r => r.served).length;
  document.getElementById("aStatRestaurants").textContent = STATE.restaurants.length;

  const revenue = all.reduce((s, r) => s + (r.downPayment || 0), 0);
  document.getElementById("aRevenueTotal").textContent = money(revenue);

  const notifs = STATE.notifications.filter(n => n.role === "admin").slice(0, 8);
  const el = document.getElementById("aDashNotifList");
  if (notifs.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">🔔</div><h4>No activity yet</h4><p>Platform-wide events will appear here.</p></div>`;
  } else {
    el.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? "" : "unread"}" style="cursor:pointer;" onclick="jumpToAdminNotifTarget('${n.reservationId || ""}')">
        <div class="ni-icon">${n.icon}</div>
        <div><h5>${n.text}</h5><p>${timeAgo(n.time)}</p></div>
      </div>`).join("");
  }
}
function jumpToAdminNotifTarget(resId) {
  if (!resId || !findReservation(resId)) return;
  openAResDetail(resId);
}

function setAdminResFilter(f) {
  STATE.adminResFilter = f;
  document.querySelectorAll("#aResFilterRow .filter-chip").forEach(b => b.classList.toggle("active", b.dataset.f === f));
  renderAResList();
}
function renderAResList() {
  let list = allReservationsSorted();
  if (STATE.adminResFilter !== "all") {
    if (STATE.adminResFilter === "completed") list = list.filter(r => r.served);
    else list = list.filter(r => r.status === STATE.adminResFilter);
  }
  const el = document.getElementById("aResList");
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><h4>No reservations here</h4><p>Try a different filter.</p></div>`;
    return;
  }
  el.innerHTML = list.map(r => `
    <div class="res-card">
      <div class="rc-head">
        <div><h4>${r.customerName}</h4><div class="rc-id">${r.id} · ${r.restaurantName}</div></div>
        ${statusBadgeHTML(displayStatus(r))}
      </div>
      <div class="rc-line"><span>${formatDate(r.date)} · ${formatTime(r.time)}</span><span>${r.diners} diners</span></div>
      <div class="rc-line"><span>${money(r.total)} total</span><span></span></div>
      <button class="btn btn-outline btn-sm mt-8" style="width:100%;" onclick="openAResDetail('${r.id}')">View / Manage</button>
    </div>`).join("");
}

function openAResDetail(id) {
  STATE.viewingReservationId = id;
  go("screen-a-reservation-detail");
}
function renderAResDetail() {
  const r = findReservation(STATE.viewingReservationId);
  if (!r) { navTo("screen-a-reservations"); return; }
  document.getElementById("ardId").textContent = r.id;
  document.getElementById("ardStatusBadge").outerHTML = statusBadgeHTML(displayStatus(r)).replace('class="badge', 'id="ardStatusBadge" class="badge');
  document.getElementById("ardRestaurant").textContent = r.restaurantName;
  document.getElementById("ardCustomer").textContent = r.customerName;
  document.getElementById("ardMobile").textContent = r.customerMobile;
  document.getElementById("ardDate").textContent = formatDate(r.date);
  document.getElementById("ardTime").textContent = formatTime(r.time);
  document.getElementById("ardDiners").textContent = r.diners;
  document.getElementById("ardTotal").textContent = money(r.total);
  document.getElementById("ardDown").textContent = money(r.downPayment);
  document.getElementById("ardRemaining").textContent = r.remainingPaid ? "₱0 (Paid)" : money(r.remaining);
  document.getElementById("ardMethod").textContent = paymentMethodLabel(r.paymentMethod);

  const reasonField = document.getElementById("ardDeclineReasonField");
  reasonField.style.display = (r.status === "pending") ? "block" : "none";
  document.getElementById("ardDeclineReason").value = "";

  document.getElementById("ardActionZone").innerHTML = buildAdminActions(r);
}
function buildAdminActions(r) {
  if (r.status === "declined") return `<p class="small muted center mt-8">Declined.${r.declineReason ? ' Reason: "' + r.declineReason + '"' : ""}</p>`;
  if (r.status === "cancelled") return `<p class="small muted center mt-8">Cancelled by customer. 20% fee: ${money(r.cancellationFee || 0)}.</p>`;
  if (r.served) return `<p class="small muted center mt-8">✓ Completed.</p>`;
  if (r.status === "pending") {
    return `
      <div class="btn-row">
        <button class="btn btn-danger" onclick="adminDeclineReservation('${r.id}')">Decline</button>
        <button class="btn btn-primary" onclick="adminApproveReservation('${r.id}')">Approve / Confirm</button>
      </div>`;
  }
  if (r.status === "reschedule_requested") {
    return `<p class="small muted center mt-8">Awaiting the restaurant's review of this reschedule request.</p>`;
  }
  return `<p class="small muted center mt-8">Being handled by the restaurant — Admin can monitor but does not need to act.</p>`;
}
function adminApproveReservation(id) {
  const r = findReservation(id);
  const table = TABLES[0];
  r.status = "confirmed";
  r.table = r.table || table;
  r.declineReason = null;
  saveReservations();
  addNotification("customer", "🔔", `Your reservation at ${r.restaurantName} has been confirmed by BookaBite Administration.`, r.id);
  addNotification("restaurant", "🔔", `Administrator confirmed reservation ${r.id}.`, r.id);
  showToast("Reservation approved.", "✅");
  renderAResDetail();
}
function adminDeclineReservation(id) {
  const r = findReservation(id);
  const reason = (document.getElementById("ardDeclineReason").value || "").trim();
  if (!reason) { showToast("Please provide a reason for declining.", "⚠️"); return; }
  r.status = "declined";
  r.declineReason = reason;
  saveReservations();
  addNotification("customer", "🔔", `Your reservation at ${r.restaurantName} was declined by BookaBite Administration. Reason: ${reason}`, r.id);
  addNotification("restaurant", "🔔", `Administrator declined reservation ${r.id}. Reason: ${reason}`, r.id);
  showToast("Reservation declined.", "❌");
  renderAResDetail();
}

function renderARestaurants() {
  const el = document.getElementById("aRestaurantList");
  el.innerHTML = STATE.restaurants.map(r => {
    const resList = STATE.reservations.filter(x => x.restaurantId === r.id);
    const revenue = resList.reduce((s, x) => s + (x.downPayment || 0), 0);
    return `
    <div class="card">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${r.logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;">
        <div>
          <h4 style="font-size:14.5px;">${r.name}</h4>
          <p class="small muted">${r.cuisine} · ${r.location}</p>
        </div>
      </div>
      <div class="divider"></div>
      <div class="sum-row"><span>Subscription</span><span>${r.subscription.active ? "✅ Active" : "❌ Inactive"}</span></div>
      <div class="sum-row"><span>Total Reservations</span><span>${resList.length}</span></div>
      <div class="sum-row"><span>Fees Collected</span><span>${money(revenue)}</span></div>
      <div class="sum-row"><span>Average Rating</span><span>${r.rating}</span></div>
    </div>`;
  }).join("");
}

function renderAAccounts() {
  const custEl = document.getElementById("aCustomerAccounts");
  if (STATE.customer) {
    custEl.innerHTML = `
      <div class="card">
        <div class="sum-row"><span>Name</span><span>${STATE.customer.name}</span></div>
        <div class="sum-row"><span>Mobile</span><span>${STATE.customer.mobile}</span></div>
        <div class="sum-row"><span>Email</span><span>${STATE.customer.email}</span></div>
        <div class="sum-row"><span>Verified</span><span>${STATE.customer.verified ? "✅ Yes" : "❌ No"}</span></div>
      </div>`;
  } else {
    custEl.innerHTML = `<div class="empty-state"><div class="es-icon">👤</div><h4>No customer account yet</h4><p>Register as a customer in this demo to see an account here.</p></div>`;
  }

  document.getElementById("aRestaurantAccounts").innerHTML = STATE.restaurants.map(r => `
    <div class="card">
      <div class="sum-row"><span>Restaurant</span><span>${r.name}</span></div>
      <div class="sum-row"><span>Contact</span><span>${r.contact}</span></div>
      <div class="sum-row"><span>Location</span><span>${r.location}</span></div>
      <div class="sum-row"><span>Subscription</span><span>${r.subscription.active ? "✅ Active" : "❌ Inactive"}</span></div>
    </div>`).join("");
}

function renderAReports() {
  const all = STATE.reservations;
  document.getElementById("arTotalRes").textContent = all.length;
  document.getElementById("arTotalResch").textContent = all.filter(r => r.rescheduleRequest).length;
  document.getElementById("arTotalCancel").textContent = all.filter(r => r.status === "cancelled").length;
  document.getElementById("arTotalSales").textContent = money(all.reduce((s, r) => s + (r.subtotal || 0), 0));
  document.getElementById("arTotalVat").textContent = money(all.reduce((s, r) => s + (r.vatAmount || 0), 0));
  document.getElementById("arTotalDiscount").textContent = money(all.reduce((s, r) => s + (r.discount || 0), 0));
  document.getElementById("arTotalFees").textContent = money(all.reduce((s, r) => s + (r.downPayment || 0), 0));

  document.getElementById("aStackingBadge").outerHTML = (STATE.settings.allowPromoStacking
    ? `<span id="aStackingBadge" class="badge badge-confirmed">ON</span>`
    : `<span id="aStackingBadge" class="badge badge-declined">OFF</span>`);
}
function toggleStacking() {
  STATE.settings.allowPromoStacking = !STATE.settings.allowPromoStacking;
  saveSettings();
  showToast(`Promo stacking ${STATE.settings.allowPromoStacking ? "enabled" : "disabled"}.`, "🎟️");
  renderAReports();
}

/* ---------------------------------------------------------------------
   15. HELPERS
--------------------------------------------------------------------- */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/* ---------------------------------------------------------------------
   16. CROSS-TAB LIVE SYNC (storage event)
   This is what lets Tab 1 (Customer) and Tab 2 (Restaurant) see each
   other's updates in real time, as required by the two-tab demo.
--------------------------------------------------------------------- */
window.addEventListener("storage", (e) => {
  if (!["bb_customer", "bb_restaurants", "bb_reservations", "bb_notifications", "bb_settings"].includes(e.key)) return;
  loadAllFromStorage();
  renderScreen(currentScreen);
  if (e.key === "bb_notifications") {
    const latest = STATE.notifications[0];
    if (latest && latest.role === STATE.role && !latest._toasted) {
      showToast(latest.text, latest.icon);
      latest._toasted = true;
    }
  }
});

/* ---------------------------------------------------------------------
   17. INIT
--------------------------------------------------------------------- */
function init() {
  loadAllFromStorage();
  const savedRole = sessionStorage.getItem("bb_role");
  if (savedRole) {
    STATE.role = savedRole;
    document.getElementById("navCustomer").classList.toggle("hidden", savedRole !== "customer");
    document.getElementById("navRestaurant").classList.toggle("hidden", !(savedRole === "restaurant" && STATE.restaurantTermsAgreed));
    document.getElementById("navAdmin").classList.toggle("hidden", savedRole !== "admin");
    if (savedRole === "customer") {
      if (STATE.customer && STATE.customer.verified) { show("screen-home"); }
      else { show("screen-splash"); }
    } else if (savedRole === "restaurant") {
      show(STATE.restaurantTermsAgreed ? "screen-r-dashboard" : "screen-r-terms");
    } else if (savedRole === "admin") {
      show("screen-a-dashboard");
    }
  } else {
    show("screen-splash");
    setTimeout(() => openModal("modalDemo"), 400);
  }
}
document.addEventListener("DOMContentLoaded", init);
