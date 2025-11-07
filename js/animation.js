// hide/show navbar on scroll (guard DOM elements)
let lastScrollTop = 0;
const navbar = document.getElementById("mainNavbar");

if (navbar) {
  window.addEventListener("scroll", function () {
    let scrollTop = window.scrollY;

    if (scrollTop > lastScrollTop) {
      navbar.classList.add("navbar-hidden");
    } else {
      navbar.classList.remove("navbar-hidden");
    }

    lastScrollTop = scrollTop;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.querySelector(".contact-banner");

  // trigger banner animation on load
  if (banner) {
    banner.classList.remove("show");
    setTimeout(() => {
      banner.classList.add("show");
    }, 100);
  }
});