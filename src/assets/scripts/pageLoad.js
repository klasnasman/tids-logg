const enableFadeIn = () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("fade-in-loaded");
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enableFadeIn);
} else {
  enableFadeIn();
}
