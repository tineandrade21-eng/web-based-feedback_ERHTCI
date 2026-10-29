// Shared constants and small helper functions (no Firebase here).

export const CATS = ["Teachers", "School Facilities", "Academic Services", "Student Services", "School Activities", "Other Concerns"];
export const COURSES = ["Diploma in Information Technology", "Cookery NC II", "Food and Beverage Services NC II", "Shielded Metal Arc Welding (SMAW) NC I & NC II", "Bread and Pastry Production NC II", "Computer Systems Servicing NC II"];
export const YEARS = ["1st Year", "2nd Year", "3rd Year"];
export const STATUSES = ["New", "Pending", "Reviewed", "Resolved"];
export const LOGO = '<img class="logo-img" src="assets/images/logo.png" alt="El Royale Hotelier Training Center Inc.">';

// Icons: simple line icons (24x24). Use icon("name") to place one in a page.
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  dash: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  bell: '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  chat: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  board: '<path d="M3 4h18v11H3z"/><path d="M8 21h8M12 15v6"/>',
  building: '<path d="M4 21V5l8-2 8 2v16"/><path d="M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
  book: '<path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z"/><path d="M8 8h8"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.7-2.5 2-2.5 3.5M12 17h.01"/>'
};
export function icon(name) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
}
// Icon shown next to each feedback category
export const CAT_ICONS = {
  "Teachers": "board", "School Facilities": "building", "Academic Services": "book",
  "Student Services": "user", "School Activities": "flag", "Other Concerns": "help"
};

export function $(id) { return document.getElementById(id); }
export function v(id) { return $(id).value.trim(); }

// Escapes text before it is placed into HTML.
export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Builds <option> tags from a list.
export function opts(list, selected, first) {
  return (first ? '<option value="">' + first + "</option>" : "") +
    list.map((x) => "<option" + (x === selected ? " selected" : "") + ">" + esc(x) + "</option>").join("");
}

// Shows a message box. type: "", "err" or "ok".
export function note(id, text, type) {
  const n = $(id);
  if (!n) return;
  n.className = "note " + (type || "");
  n.textContent = text;
  n.hidden = false;
}

export function fmt(date) {
  return new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fullname(u) {
  return [u.first, u.mid, u.last].filter(Boolean).join(" ");
}
