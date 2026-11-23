// BharatFreshGlobals – site interactions
(function () {
  var ENQUIRY_EMAIL = "adnan.rayeen@bharatfreshglobals.com";

  // Free form-to-email service (no server code needed).
  // 1. Go to https://web3forms.com, enter adnan.rayeen@bharatfreshglobals.com, click "Create Access Key".
  // 2. Copy the key from the email you receive and paste it below.
  // Until a key is pasted, the form falls back to opening the visitor's email app.
  var WEB3FORMS_KEY = "da95e138-d7a1-44e7-9e72-9574acbde7e7";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Reveal on scroll
  var targets = document.querySelectorAll(
    ".section-head, .product, .spec-table, .spec-side, .steps li, .market-card, .why, .about-copy, .quote-form"
  );
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Quote form -> opens the visitor's email client with the enquiry pre-filled
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (f) {
      var valid = f.value.trim() !== "" && (f.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = "Please fill in the required fields marked *.";
      note.classList.add("error");
      return;
    }
    note.classList.remove("error");

    var d = new FormData(form);
    var subject = "Banana enquiry – " + d.get("company") + " (" + d.get("country") + ")";
    var body =
      "Name: " + d.get("name") + "\n" +
      "Company: " + d.get("company") + "\n" +
      "Email: " + d.get("email") + "\n" +
      "Phone/WhatsApp: " + (d.get("phone") || "-") + "\n" +
      "Destination country: " + d.get("country") + "\n" +
      "Monthly volume: " + (d.get("volume") || "-") + "\n\n" +
      "Message:\n" + (d.get("message") || "-");

    function openMailApp() {
      window.location.href =
        "mailto:" + ENQUIRY_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    }

    // No access key yet -> fall back to opening the visitor's email app
    if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf("PASTE") === 0) {
      openMailApp();
      note.textContent = "Thank you! Your email app should now open with the enquiry ready to send.";
      return;
    }

    // Spam honeypot: real visitors never fill this hidden field
    if (d.get("botcheck")) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending…";
    note.textContent = "";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: subject,
        from_name: "BharatFreshGlobals Website",
        replyto: d.get("email"),
        name: d.get("name"),
        company: d.get("company"),
        email: d.get("email"),
        phone: d.get("phone") || "-",
        destination_country: d.get("country"),
        monthly_volume: d.get("volume") || "-",
        message: d.get("message") || "-"
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message || "Submission failed");
        form.reset();
        note.classList.remove("error");
        note.classList.add("success");
        note.textContent = "Thank you! Your enquiry has been sent. We'll reply within 24 hours.";
      })
      .catch(function () {
        note.classList.add("error");
        note.innerHTML =
          'Sorry, the enquiry could not be sent. Please email us at <a href="mailto:' +
          ENQUIRY_EMAIL + '">' + ENQUIRY_EMAIL + '</a> or WhatsApp +91 84338 42327.';
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = "Send Enquiry";
      });
  });
})();
