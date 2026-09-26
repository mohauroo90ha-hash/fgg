/* AEVYRON — shared dark/light theme toggle
   Persists the user's choice in localStorage and reflects it in the <button>.
   Works on index.html and all service/legal pages. */
(function () {
  "use strict";
  var STORAGE_KEY = "aevyron_theme";
  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
      var sunIcon = toggleBtn.querySelector(".ic-sun");
      var moonIcon = toggleBtn.querySelector(".ic-moon");
      if (sunIcon) sunIcon.style.display = theme === "light" ? "none" : "block";
      if (moonIcon) moonIcon.style.display = theme === "light" ? "block" : "none";
    }
  }

  function current() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) { /* ignore */ }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function toggle() {
    var next = current() === "light" ? "dark" : "light";
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggle);
  }

  apply(current());

  window.aevyronTheme = { init: function () { apply(current()); }, toggle: toggle, current: current };
})();
