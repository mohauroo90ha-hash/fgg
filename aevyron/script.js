/*
  AEVYRON — script.js
  Navigation + scroll effects, mobile menu, reveal animations, tilt cards,
  and a fully functional contact form (validation, autosave, spam protection).

  FORM SETUP (free, no backend — FormSubmit):
    FormSubmit (https://formsubmit.co) emails you every submission.
    NO registration needed.
    1. On the FIRST submission, FormSubmit sends a confirmation email to the
       address below. Click the link in that email ONCE to activate the form.
    2. After that, all submissions are delivered straight to your inbox.
    Set CONTACT_EMAIL below to the address you want forms sent to.
    The form sends via AJAX (no page reload).
*/

/* ============ EDIT THIS ============ */
var CONTACT_EMAIL = "officialAevyron@gmail.com"; // where form submissions are delivered
/* ================================== */

(function () {
  "use strict";
  var d = document;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current year ---------- */
  var yearEl = d.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav shadow / scroll progress / scrollspy / back-to-top ---------- */
  var nav = d.getElementById("nav");
  var progress = d.getElementById("progress");
  var toTop = d.getElementById("to-top");
  var sections = Array.prototype.slice.call(d.querySelectorAll("main section[id]"));
  var spyLinks = Array.prototype.slice.call(d.querySelectorAll('.nav-links a[href^="#"]:not(.btn), .mobile-menu a[href^="#"]'));

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 700);
    if (progress) {
      var max = d.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    var current = "";
    var probe = y + 120;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) current = sections[i].id;
    }
    spyLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- mobile menu ---------- */
  var mBtn = d.getElementById("menu-btn");
  var mMenu = d.getElementById("mobile-menu");
  function setMenu(open) {
    mMenu.classList.toggle("open", open);
    d.body.classList.toggle("nav-open", open);
    mBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (mBtn) {
    mBtn.addEventListener("click", function () { setMenu(!mMenu.classList.contains("open")); });
    Array.prototype.forEach.call(mMenu.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    d.addEventListener("click", function (e) {
      if (!mMenu.contains(e.target) && !mBtn.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(d.querySelectorAll(".reveal"));
  var canAnimate = !prefersReduced && "IntersectionObserver" in window;
  if (!canAnimate) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    d.documentElement.classList.add("anims");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    /* safety net: never leave content hidden */
    window.setTimeout(function () { revealEls.forEach(function (el) { el.classList.add("in"); }); }, 2500);
  }

  /* ---------- subtle 3D tilt on work cards ---------- */
  if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    Array.prototype.forEach.call(d.querySelectorAll(".tilt"), function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- contact form ---------- */
  var form = d.getElementById("contact-form");
  if (!form) return;

  var DRAFT_KEY = "aevyron_draft_v1";
  var statusEl = d.getElementById("form-status");
  var submitBtn = form.querySelector("button[type=submit]");
  var botField = form._gotcha;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showStatus(type, msg) {
    statusEl.className = "form-status show " + type;
    statusEl.textContent = msg;
  }
  function clearStatus() { statusEl.className = "form-status"; statusEl.textContent = ""; }

  function setErr(input, msg) {
    input.closest(".field").classList.add("err");
    var fe = input.closest(".field").querySelector(".fe");
    if (fe) fe.textContent = msg;
  }
  function clearErr(input) {
    input.closest(".field").classList.remove("err");
  }

  function checkField(input) {
    var v = input.value.trim();
    var ok = true;
    if (input.name === "name") {
      ok = v.length >= 2;
      if (!ok) setErr(input, v ? "Please tell us your name." : "Name is required.");
    } else if (input.name === "_replyto") {
      ok = EMAIL_RE.test(v);
      if (!ok) setErr(input, v ? "That email doesn't look right." : "Business email is required.");
    } else if (input.name === "details") {
      ok = v.length >= 10;
      if (!ok) setErr(input, "A little more detail helps (at least 10 characters).");
    }
    if (ok) clearErr(input);
    return ok;
  }

  /* character counter on Project Details */
  var detailsEl = form.details;
  var counterEl = d.getElementById("f-count");
  var MAX = 1000;
  if (counterEl) {
    detailsEl.addEventListener("input", function () {
      var n = detailsEl.value.length;
      counterEl.textContent = n + " / " + MAX;
      counterEl.classList.toggle("over", n > 500);
    });
  }

  /* autosave a draft so an interrupted visitor doesn't lose their message */
  var DRAFT_FIELDS = ["name", "_replyto", "phone_code", "phone", "company", "service", "budget", "details"];
  function saveDraft() {
    try {
      var data = {};
      DRAFT_FIELDS.forEach(function (n) {
        data[n] = form.elements[n] ? form.elements[n].value : "";
      });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (ignored) { }
  }
  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      DRAFT_FIELDS.forEach(function (n) {
        if (data[n] && form.elements[n]) form.elements[n].value = data[n];
      });
    } catch (ignored) { }
  }
  loadDraft();
  DRAFT_FIELDS.forEach(function (n) {
    var el = form.elements[n];
    if (!el) return;
    el.addEventListener("input", function () {
      if (n === "name" || n === "_replyto" || n === "details") clearErr(el);
      saveDraft();
    });
    if (n === "name" || n === "_replyto" || n === "details") {
      el.addEventListener("blur", function () { checkField(el); });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearStatus();

    var ok = true;
    ["name", "_replyto", "details"].forEach(function (n) {
      if (!checkField(form.elements[n])) ok = false;
    });
    if (!ok) {
      var firstErr = form.querySelector(".field.err input, .field.err textarea");
      if (firstErr) firstErr.focus();
      return;
    }

    /* honeypot: bots fill the hidden field — pretend success, send nothing */
    if (botField && botField.value.trim() !== "") {
      showStatus("ok", "Thanks! Your message has been sent. We'll get back to you soon.");
      form.reset();
      saveDraft();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    /* Build the data payload for FormSubmit */
    var phoneVal = form.phone && form.phone.value.trim()
      ? (form.phone_code.value + " " + form.phone.value.trim())
      : "Not provided";
    var payload = {
      name: form.name.value.trim(),
      email: form._replyto.value.trim(),
      _replyto: form._replyto.value.trim(),
      _subject: "New project inquiry \u2014 " + form.name.value.trim(),
      phone: phoneVal,
      company: form.company.value.trim() || "-",
      service: form.service.value || "Not selected",
      budget: form.budget.value || "Not selected",
      details: form.details.value.trim(),
      _template: "table",
      _captcha: "false"
    };

    fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONTACT_EMAIL), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        /* First-ever submission: FormSubmit emails a one-time confirmation request. */
        if (data && data.success === "false") {
          showStatus("ok", "Almost done! Check your inbox at " + CONTACT_EMAIL +
            " for a one-time confirmation email from FormSubmit and click the link to activate the form. Your message will be delivered after that.");
        } else {
          showStatus("ok", "Thanks! Your message has been sent. We'll get back to you soon.");
        }
        form.reset();
        try { localStorage.removeItem(DRAFT_KEY); } catch (ignored) { }
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      })
      .catch(function () {
        showStatus("err", "Something went wrong. Please try again or email us at " + CONTACT_EMAIL + ".");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      });
  });
})();