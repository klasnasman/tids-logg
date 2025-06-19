  const storedFont = localStorage.getItem("font");
  if (storedFont) {
    document.body.setAttribute("data-user-font", storedFont);
  }
