(function () {
  "use strict";
  var lang = document.documentElement.lang === "en" ? "en" : "el";
  var L = {
    el: {
      open: "Η γραμματεία είναι ανοιχτή τώρα",
      closed: "Η γραμματεία είναι κλειστή\u00a0· ",
      opensAt: "ανοίγει ",
      today: "σήμερα ",
      tomorrow: "αύριο ",
      days: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
      required: "Συμπληρώστε τα υποχρεωτικά πεδία και αποδεχθείτε τη συγκατάθεση.",
      ready: "Ανοίξαμε το πρόγραμμα email σας με το μήνυμα έτοιμο. Πατήστε «Αποστολή» για να το στείλετε. Αν δεν άνοιξε, στείλτε μας απευθείας στο ",
      subject: "Μήνυμα από τον ιστότοπο",
      labels: { name: "Όνομα", surname: "Επίθετο", phone: "Τηλέφωνο", email: "Email", topic: "Θέμα", message: "Μήνυμα" },
      noMatch: "Καμία δημοσίευση δεν ταιριάζει.",
      badEmail: "Το email δεν φαίνεται σωστό.",
      badPhone: "Ο αριθμός τηλεφώνου δεν φαίνεται σωστός.",
      close: "Κλείσιμο",
      menu: "Μενού",
      zoomClose: "Κλείσιμο προβολής",
      fieldRequired: "Συμπληρώστε αυτό το πεδίο.",
      consentRequired: "Χρειάζεται η συγκατάθεσή σας για να σας απαντήσουμε.",
      pan: "Σύρετε για να δείτε όλο το διάγραμμα",
      of: " από "
    },
    en: {
      open: "The office is open now",
      closed: "The office is closed\u00a0· ",
      opensAt: "opens ",
      today: "today ",
      tomorrow: "tomorrow ",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: "Please fill in the required fields and give your consent.",
      ready: "Your email app has opened with the message ready. Press “Send” to send it. If it did not open, email us directly at ",
      subject: "Message from the website",
      labels: { name: "Name", surname: "Last name", phone: "Phone", email: "Email", topic: "Subject", message: "Message" },
      noMatch: "No publication matches.",
      badEmail: "The email address does not look right.",
      badPhone: "The phone number does not look right.",
      close: "Close",
      menu: "Menu",
      zoomClose: "Close image viewer",
      fieldRequired: "Please fill in this field.",
      consentRequired: "We need your consent to reply to you.",
      pan: "Swipe to see the whole diagram",
      of: " of "
    }
  }[lang];

  /* Header shadow */
  var header = document.querySelector("[data-header]");
  var onScroll = function () { header && header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Scroll lock on <html> (locking <body> breaks the sticky header) */
  var locks = 0;
  function lock(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.documentElement.classList.toggle("is-locked", locks > 0);
  }
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll("a[href], button, input, textarea, select, [tabindex]:not([tabindex='-1'])"), function (el) {
      return el.offsetParent !== null && !el.disabled;
    });
  }
  var DESKTOP = window.matchMedia("(min-width: 1241px)");
  var HOVER = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* Mobile nav */
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("site-nav");
  function setNav(open, refocus) {
    if (!toggle || !nav || nav.classList.contains("is-open") === open) return;
    var y = window.scrollY;
    if (!open && refocus) toggle.focus({ preventScroll: true });
    nav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    lock(open);
    var label = toggle.querySelector("span");
    if (label) label.textContent = open ? L.close : L.menu;
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" });
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var opening = !nav.classList.contains("is-open");
      setNav(opening);
      if (opening) toggle.focus({ preventScroll: true });  // keeps Tab inside the menu's focus loop
    });
    document.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); setNav(false, true); }
      if (e.key === "Tab") {
        var items = [toggle].concat(focusables(nav));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* "Clinic" dropdown */
  function setSub(li, open) {
    li.classList.toggle("is-open", open);
    li.querySelector("[data-sub-toggle]").setAttribute("aria-expanded", String(open));
  }
  document.querySelectorAll(".has-sub").forEach(function (li) {
    var btn = li.querySelector("[data-sub-toggle]");
    var hoverOpenedAt = 0;
    btn.addEventListener("click", function () {
      if (li.classList.contains("is-open") && Date.now() - hoverOpenedAt < 600) return;  // hover already opened it
      setSub(li, !li.classList.contains("is-open"));
    });
    li.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse" && HOVER.matches && DESKTOP.matches && !li.classList.contains("is-open")) { setSub(li, true); hoverOpenedAt = Date.now(); }
    });
    li.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse" && HOVER.matches && DESKTOP.matches && !li.querySelector(".sub").contains(document.activeElement)) setSub(li, false);
    });
    li.addEventListener("focusout", function (e) { if (DESKTOP.matches && !li.contains(e.relatedTarget)) setSub(li, false); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && DESKTOP.matches && li.classList.contains("is-open")) { e.stopPropagation(); setSub(li, false); btn.focus(); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && DESKTOP.matches) document.querySelectorAll(".has-sub.is-open").forEach(function (li) { setSub(li, false); });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-sub.is-open").forEach(function (li) {
      if (!li.contains(e.target) && DESKTOP.matches) setSub(li, false);
    });
  });
  DESKTOP.addEventListener("change", function () {
    setNav(false);
    document.querySelectorAll(".has-sub.is-open").forEach(function (li) { setSub(li, false); });
  });

  /* Opening status: weekdays 11:00–14:00 and 17:00–20:00, Athens time */
  var SLOTS = [[660, 840], [1020, 1200]];
  function athensNow() {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, min: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
  }
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    if (lang === "en") return (h % 12 || 12) + (mm ? ":" + String(mm).padStart(2, "0") : "") + (h < 12 ? "am" : "pm");
    return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  }
  function status() {
    var n = athensNow();
    var weekday = n.day >= 1 && n.day <= 5;
    if (weekday && SLOTS.some(function (s) { return n.min >= s[0] && n.min < s[1]; })) return { open: true, text: L.open };
    if (weekday) {
      for (var i = 0; i < SLOTS.length; i++) if (n.min < SLOTS[i][0]) return { open: false, text: L.closed + L.opensAt + L.today.replace(/ $/, "\u00a0") + fmt(SLOTS[i][0]) };
    }
    var d = n.day, add = 0;
    do { d = (d + 1) % 7; add++; } while (d === 0 || d === 6);
    var when = add === 1 ? L.tomorrow : L.days[d] + " ";
    return { open: false, text: L.closed + L.opensAt + when.replace(/ $/, "\u00a0") + fmt(SLOTS[0][0]) };
  }
  var statusEls = document.querySelectorAll("[data-status]");
  function paintStatus() {
    var s = status();
    statusEls.forEach(function (el) { el.textContent = s.text; el.setAttribute("data-open", String(s.open)); });
  }
  if (statusEls.length) { paintStatus(); setInterval(paintStatus, 60000); }

  /* Table of contents scroll-spy */
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  var spyTargets = Array.prototype.map.call(tocLinks, function (a) {
    return [a, document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)))];
  }).filter(function (p) { return p[1]; });
  if (spyTargets.length) {
    var spyActive = null, spyQueued = false;
    var spy = function () {
      spyQueued = false;
      var line = (header ? header.getBoundingClientRect().height : 0) + window.innerHeight * 0.3;
      var cur = spyTargets[0][0];
      spyTargets.forEach(function (p) { if (p[1].getBoundingClientRect().top <= line) cur = p[0]; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = spyTargets[spyTargets.length - 1][0];
      if (cur === spyActive) return;
      tocLinks.forEach(function (a) { a.classList.toggle("is-active", a === cur); });
      spyActive = cur;
      var box = cur.closest("ol");   // long lists scroll inside the sidebar: keep the active item in view
      if (box && box.scrollHeight > box.clientHeight) {
        var br = box.getBoundingClientRect(), ar = cur.getBoundingClientRect();
        if (ar.top < br.top || ar.bottom > br.bottom) box.scrollTop += ar.top - br.top - (br.height - ar.height) / 2;
      }
    };
    window.addEventListener("scroll", function () { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
    window.addEventListener("resize", spy);
    spy();
  }

  /* YouTube: load the player only on click (no cookies until then) */
  document.querySelectorAll("[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = btn.getAttribute("aria-label") || "YouTube";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      btn.replaceWith(f);
      f.focus();
    });
  });

  /* Google map: load only on click */
  document.querySelectorAll("[data-map]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".map");
      var f = document.createElement("iframe");
      f.src = btn.getAttribute("data-map");
      f.title = btn.getAttribute("data-title") || "Map";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = "";
      box.appendChild(f);
      f.tabIndex = 0;
      f.focus();
    });
  });

  /* Contact form: compose an email to the clinic, nothing stored by the site */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var setError = function (el, msg) {
      var holder = el.type === "checkbox" ? el.closest(".consent") : el.closest(".field");
      var id = "err-" + el.name, note = document.getElementById(id);
      el.setAttribute("aria-invalid", String(!!msg));
      if (el.type === "checkbox") holder.classList.toggle("is-invalid", !!msg);
      if (msg) {
        if (!note) { note = document.createElement("p"); note.className = "field-error"; note.id = id; holder.insertAdjacentElement(el.type === "checkbox" ? "afterend" : "beforeend", note); }
        note.textContent = msg;
        el.setAttribute("aria-describedby", id);
      } else if (note) { note.remove(); el.removeAttribute("aria-describedby"); }
    };
    var problem = function (el) {
      var v = el.value.trim();
      if (el.type === "checkbox") return el.required && !el.checked ? L.consentRequired : "";
      if (el.required && !v) return L.fieldRequired;
      if (el.name === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return L.badEmail;
      if (el.name === "phone" && v) {
        var digits = v.replace(/\D/g, "");
        if (!/^[\d\s()+.\-]+$/.test(v) || digits.length < 8 || digits.length > 15) return L.badPhone;
      }
      return "";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var st = form.querySelector(".form-status"), firstBad = null;
      form.querySelectorAll("input, textarea").forEach(function (el) {   // document order
        var msg = problem(el);
        setError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) {
        st.classList.remove("is-visible");
        firstBad.focus();
        return;
      }
      var v = function (n) { return (form.elements[n] && form.elements[n].value || "").trim(); };
      var body = [
        L.labels.name + ": " + v("name") + " " + v("surname"),
        L.labels.phone + ": " + v("phone"),
        L.labels.email + ": " + v("email"),
        "",
        v("message")
      ].join("\n");
      var to = form.getAttribute("data-to");
      var subj = v("topic") ? v("topic") : L.subject;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
      st.innerHTML = "";
      st.classList.remove("is-error");
      st.setAttribute("role", "status");
      st.appendChild(document.createTextNode(L.ready));
      var a = document.createElement("a"); a.href = "mailto:" + to; a.textContent = to; st.appendChild(a);
      st.classList.add("is-visible");
    });
    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true" && !problem(e.target)) setError(e.target, "");
    });
    form.addEventListener("change", function (e) {
      if (e.target.type === "checkbox" && e.target.getAttribute("aria-invalid") === "true" && !problem(e.target)) setError(e.target, "");
    });
  }

  /* Publication filter on bio pages: ignores Greek accents and case */
  function fold(t) { return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ς/g, "σ"); }
  document.querySelectorAll("[data-pub-search]").forEach(function (input) {
    var list = document.getElementById(input.getAttribute("data-pub-search"));
    var empty = input.parentElement.querySelector(".pub-empty");
    var count = input.closest("details").querySelector(".count");
    var total = count ? count.getAttribute("data-total") : 0;
    var countText = count ? count.textContent : "";
    var items = Array.prototype.map.call(list.querySelectorAll("li"), function (li) { return [li, fold(li.textContent)]; });
    input.addEventListener("input", function () {
      var q = fold(input.value.trim());
      var shown = 0;
      items.forEach(function (it) {
        var hit = !q || it[1].indexOf(q) !== -1;
        it[0].hidden = !hit;
        if (hit) shown++;
      });
      if (count) count.textContent = q ? shown + L.of + total : countText;
      if (empty) { empty.textContent = L.noMatch; empty.style.display = shown ? "none" : "block"; }
    });
  });

  /* FAQ expand/collapse all */
  document.querySelectorAll("[data-faq-all]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("data-faq-all") === "open";
      document.querySelectorAll(".faq-item").forEach(function (d) { d.open = open; });
    });
  });

  /* Lightbox for diagrams */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = "<button class='lightbox-close' type='button'>\u00d7</button><img alt=''><p class='lightbox-hint'></p>";
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbClose = lb.querySelector(".lightbox-close");
  lbClose.setAttribute("aria-label", L.zoomClose);
  lb.querySelector(".lightbox-hint").textContent = L.pan;
  var lastFocus = null, lbOpenedAt = 0;
  document.querySelectorAll(".figure-zoom, .paper-img").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var img = a.querySelector("img");
      lbImg.style.removeProperty("--nat");
      lbImg.onload = function () { lbImg.style.setProperty("--nat", lbImg.naturalWidth + "px"); };
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.setAttribute("aria-label", img.alt || L.zoomClose);
      lastFocus = a;
      lb.classList.add("is-open");
      lbOpenedAt = Date.now();
      lock(true);
      lb.scrollLeft = 0; lb.scrollTop = 0;
      lbClose.focus();
    });
  });
  function closeLb() {
    if (!lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lock(false);
    if (lastFocus) lastFocus.focus();
  }
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb && Date.now() - lbOpenedAt > 500) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "Tab") { e.preventDefault(); lbClose.focus(); }
  });

  /* Deep links (#section): re-align after web fonts load, since they change line heights */
  if (location.hash.length > 1) {
    var realign = function () {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!t) return;
      var headerH = header ? header.getBoundingClientRect().height : 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - headerH - 16, behavior: "instant" });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(realign); });
    window.addEventListener("load", function () { requestAnimationFrame(realign); });
  }

  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    setNav(false);
    closeLb();
    document.querySelectorAll(".has-sub.is-open").forEach(function (li) { setSub(li, false); });
  });

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
