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
  const bounds = element.getBoundingClientRect();
  const isInitiallyVisible =
    bounds.top < window.innerHeight && bounds.bottom > 0;
  const isAboveViewport = bounds.bottom <= 0;

  if (isInitiallyVisible || isAboveViewport) {
    element.classList.add("is-visible");
    return;
  }

  element.classList.add("is-pending");
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

function setActiveNavigation(activeLink) {
  document
    .querySelectorAll('.nav-links a[aria-current="location"]')
    .forEach(function clearCurrent(link) {
      link.removeAttribute("aria-current");
    });

  if (activeLink) {
    activeLink.setAttribute("aria-current", "location");
  }
}

const visibleNavigationTargets = new Set();

function updateActiveNavigation(entries) {
  entries.forEach(function updateEntry(entry) {
    if (entry.isIntersecting) {
      visibleNavigationTargets.add(entry.target);
    } else {
      visibleNavigationTargets.delete(entry.target);
    }
  });

  const activeTarget = Array.from(visibleNavigationTargets).sort(
    function compareDistance(firstTarget, secondTarget) {
      const readingLine = window.innerHeight * 0.3;
      return (
        Math.abs(firstTarget.getBoundingClientRect().top - readingLine) -
        Math.abs(secondTarget.getBoundingClientRect().top - readingLine)
      );
    },
  )[0];

  if (!activeTarget) {
    return;
  }

  setActiveNavigation(
    document.querySelector(`.nav-links a[href="#${activeTarget.id}"]`),
  );
}

function handleNavigationClick(event) {
  closeMenu();
  setActiveNavigation(event.currentTarget);
}

function syncHashNavigation() {
  if (!window.location.hash) {
    return;
  }

  const hashLink = document.querySelector(
    `.nav-links a[href="${window.location.hash}"]`,
  );

  if (hashLink) {
    setActiveNavigation(hashLink);
  }
}

const savedTheme = getSavedTheme();
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
setTheme(savedTheme || systemTheme);

menuButton.addEventListener("click", toggleMenu);
themeButton.addEventListener("click", toggleTheme);
document.addEventListener("keydown", handleEscape);
document
  .querySelectorAll(".nav-links a")
  .forEach(function bindNavigation(link) {
    link.addEventListener("click", handleNavigationClick);
  });
window.addEventListener("hashchange", syncHashNavigation);
syncHashNavigation();

const revealObserver = new IntersectionObserver(revealEntries, {
  rootMargin: "0px 0px -8% 0px",
  threshold: 0.12,
});

const navigationObserver = new IntersectionObserver(updateActiveNavigation, {
  rootMargin: "-30% 0px -60% 0px",
  threshold: 0,
});

document
  .querySelectorAll(".nav-links a[href^='#']")
  .forEach(function observeNavigationTarget(link) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      navigationObserver.observe(target);
    }
  });

if (reduceMotion.matches) {
  document
    .querySelectorAll(".reveal")
    .forEach(function showImmediately(element) {
      element.classList.add("is-visible");
    });
} else {
  document.querySelectorAll(".reveal").forEach(prepareReveal);
}
