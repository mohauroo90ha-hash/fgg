/* AEVYRON — service page script (nav, mobile menu, scroll-to-top, theme toggle) */
(function () {
  "use strict";
  var d = document;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* current year */
  var yearEl = d.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* nav shadow + scroll-to-top */
  var nav = d.getElementById("nav");
  var toTop = d.getElementById("to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* mobile menu */
  var mBtn = d.getElementById("menu-btn");
  var mMenu = d.getElementById("mobile-menu");
  function setMenu(open) {
    if (!mMenu) return;
    mMenu.classList.toggle("open", open);
    d.body.classList.toggle("nav-open", open);
    if (mBtn) mBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (mBtn && mMenu) {
    mBtn.addEventListener("click", function () { setMenu(!mMenu.classList.contains("open")); });
    Array.prototype.forEach.call(mMenu.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* theme toggle (shared) */
  (typeof window.aevyronTheme !== "undefined" ? window.aevyronTheme.init : function () {})();
})();
