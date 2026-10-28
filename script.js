/* =========================================================
   SR Rooftop Café and restaurant — vanilla JavaScript
   Handles: mobile nav, active section links, menu filters,
   gallery lightbox, review slider, and booking form checks.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupActiveNavOnScroll();
  setupMenuFilter();
  setupLightbox();
  setupReviewsSlider();
  setupBookingForm();
});

/* ---------- 1. Hamburger menu (mobile) ---------- */
function setupMobileNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".nav-links a");

  if (!header || !toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Close the drawer after a link is tapped
  links.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

/* ---------- 2. Highlight the nav link for the section in view ---------- */
function setupActiveNavOnScroll() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const isMatch = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-current", isMatch);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- 3. Menu category tabs ---------- */
function setupMenuFilter() {
  const tabs = document.querySelectorAll(".tab");
  const cards = document.querySelectorAll(".menu-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;

      tabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });

      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });
}

/* ---------- 4. Gallery lightbox ---------- */
function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const closeBtn = document.querySelector(".lightbox-close");
  const items = document.querySelectorAll(".gallery-item");

  if (!lightbox || !lightboxImage) return;

  function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Enlarged cafe photo";
    lightbox.hidden = false;
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
  }

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      openLightbox(item.dataset.full, img ? img.alt : "");
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}

/* ---------- 5. Simple reviews slider ---------- */
function setupReviewsSlider() {
  const slides = Array.from(document.querySelectorAll(".review-slide"));
  const dotsWrap = document.querySelector(".slider-dots");
  const buttons = document.querySelectorAll(".slider-btn");
  let index = 0;
  let timerId;

  if (!slides.length || !dotsWrap) return;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show review ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    restartTimer();
  }

  function restartTimer() {
    clearInterval(timerId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    timerId = setInterval(() => goTo(index + 1), 7000);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      goTo(index + Number(btn.dataset.dir));
    });
  });

  goTo(0);
}

/* ---------- 6. Booking / enquiry form validation ---------- */
function setupBookingForm() {
  const form = document.getElementById("booking-form");
  const success = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    success.hidden = true;

    const fields = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      date: form.date.value,
      message: form.message.value.trim(),
    };

    clearErrors(form);

    let valid = true;

    if (fields.name.length < 2) {
      showError("name", "Please enter your full name.");
      valid = false;
    }

    // Indian-friendly phone check: 10 digits, optional +91
    const phoneOk = /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(fields.phone.replace(/\s/g, ""));
    if (!phoneOk) {
      showError("phone", "Enter a valid 10-digit mobile number.");
      valid = false;
    }

    if (!fields.date) {
      showError("date", "Please pick a date.");
      valid = false;
    } else {
      const chosen = new Date(fields.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        showError("date", "Please choose today or a future date.");
        valid = false;
      }
    }

    if (fields.message.length < 10) {
      showError("message", "Tell us a little more (at least 10 characters).");
      valid = false;
    }

    if (!valid) return;

    form.reset();
    success.hidden = false;
  });
}

function showError(fieldId, message) {
  const node = document.querySelector(`[data-error-for="${fieldId}"]`);
  const input = document.getElementById(fieldId);
  if (node) node.textContent = message;
  if (input) input.setAttribute("aria-invalid", "true");
}

function clearErrors(form) {
  form.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
  form.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
  });
}
