document.documentElement.classList.add("js");

if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

const I = window.I18N;

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const toast = document.querySelector("[data-toast]");

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMenu = () => {
  header?.classList.remove("menu-visible");
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", I.t("menuOpen"));
};

menuButton?.addEventListener("click", () => {
  const open = !header?.classList.contains("menu-visible");
  header?.classList.toggle("menu-visible", open);
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? I.t("menuClose") : I.t("menuOpen"));
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const plans = {
  short: {
    label: I.t("planShortLabel"),
    route: I.t("planShortRoute"),
  },
  standard: {
    label: I.t("planStandardLabel"),
    route: I.t("planStandardRoute"),
  },
  day: {
    label: I.t("planDayLabel"),
    route: I.t("planDayRoute"),
  },
};

const planButtons = [...document.querySelectorAll("[data-plan]")];
const planLabel = document.querySelector("[data-plan-label]");
const planRoute = document.querySelector("[data-plan-route]");
const saveButton = document.querySelector("[data-save-plan]");
let selectedPlan = "standard";

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
};

const setPlan = (name) => {
  const plan = plans[name];
  if (!plan) return;
  selectedPlan = name;
  planButtons.forEach((button) => {
    const active = button.dataset.plan === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (planLabel) planLabel.textContent = plan.label;
  if (planRoute) planRoute.textContent = plan.route;
  const saved = localStorage.getItem("nitchu-saved-plan") === name;
  saveButton?.classList.toggle("saved", saved);
  const saveText = saveButton?.querySelector("span");
  if (saveText) saveText.textContent = saved ? I.t("saveSaved") : I.t("savePrompt");
};

planButtons.forEach((button) => {
  button.addEventListener("click", () => setPlan(button.dataset.plan));
});

const savedPlan = localStorage.getItem("nitchu-saved-plan");
setPlan(savedPlan && plans[savedPlan] ? savedPlan : "standard");

saveButton?.addEventListener("click", () => {
  localStorage.setItem("nitchu-saved-plan", selectedPlan);
  setPlan(selectedPlan);
  showToast(I.t("savedToast", [plans[selectedPlan].label]));
});

document.querySelector("[data-share]")?.addEventListener("click", async () => {
  const shareData = {
    title: I.t("shareTitle"),
    text: I.t("shareText"),
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast(I.t("copyToast"));
  } catch (error) {
    if (error?.name !== "AbortError") showToast(I.t("shareFail"));
  }
});
