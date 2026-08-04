document.documentElement.classList.add("js");

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
  menuButton?.setAttribute("aria-label", "メニューを開く");
};

menuButton?.addEventListener("click", () => {
  const open = !header?.classList.contains("menu-visible");
  header?.classList.toggle("menu-visible", open);
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
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
    label: "60分精華コース",
    route: "喜多方駅 → 南側入口 → まちなか桜道 → SL広場 → 同じ道を戻る",
  },
  standard: {
    label: "120分賞桜コース",
    route: "南側入口 → SL広場 → 桜のトンネル → 北側の静かな区間 → 市街地へ戻る",
  },
  day: {
    label: "喜多方一日コース",
    route: "朝ラー → 日中線しだれ桜並木 → 昼食 → 蔵のまち歩き → 酒蔵・喫茶",
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
  if (saveText) saveText.textContent = saved ? "保存済み" : "このコースを保存";
};

planButtons.forEach((button) => {
  button.addEventListener("click", () => setPlan(button.dataset.plan));
});

const savedPlan = localStorage.getItem("nitchu-saved-plan");
setPlan(savedPlan && plans[savedPlan] ? savedPlan : "standard");

saveButton?.addEventListener("click", () => {
  localStorage.setItem("nitchu-saved-plan", selectedPlan);
  setPlan(selectedPlan);
  showToast(`${plans[selectedPlan].label}をこの端末に保存しました`);
});

document.querySelector("[data-share]")?.addEventListener("click", async () => {
  const shareData = {
    title: "日中線しだれ桜並木 旅人向けガイド",
    text: "線路は消え、春だけの道が残った。喜多方の日中線しだれ桜並木を歩くためのガイドです。",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast("ページのアドレスをコピーしました");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("共有できませんでした");
  }
});
