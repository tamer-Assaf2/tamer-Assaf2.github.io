document.documentElement.classList.add("js");

const year = document.getElementById("year");
const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector(".nav-links");
const themeButton = document.querySelector(".theme-toggle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

year.textContent = new Date().getFullYear();

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function handleEscape(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return null;
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === "dark" ? "Light theme" : "Dark theme";
  themeButton.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(nextTheme);

  try {
    localStorage.setItem("portfolio-theme", nextTheme);
  } catch {
    // The selected theme still applies for this page view.
  }
}

function prepareReveal(element) {
  revealObserver.observe(element);
}

function revealEntries(entries) {
  entries.forEach(function revealEntry(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}

const savedTheme = getSavedTheme();
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
setTheme(savedTheme || systemTheme);

menuButton.addEventListener("click", toggleMenu);
themeButton.addEventListener("click", toggleTheme);
document.addEventListener("keydown", handleEscape);
document.querySelectorAll(".nav-links a").forEach(function bindNavigation(link) {
  link.addEventListener("click", closeMenu);
});

const revealObserver = new IntersectionObserver(revealEntries, {
  rootMargin: "0px 0px -8% 0px",
  threshold: 0.12,
});

if (reduceMotion.matches) {
  document.querySelectorAll(".reveal").forEach(function showImmediately(element) {
    element.classList.add("is-visible");
  });
} else {
  document.querySelectorAll(".reveal").forEach(prepareReveal);
}
