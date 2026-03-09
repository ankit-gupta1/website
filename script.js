const sections = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.topbar nav a[href^="#"]');
const getHeaderOffset = () => {
  const header = document.querySelector('.topbar');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  return Math.ceil(headerHeight + 24);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

sections.forEach((section) => observer.observe(section));

const pulseSection = (id) => {
  const section = document.getElementById(id);
  if (!section) {
    return;
  }

  section.classList.remove('section-ping');
  void section.offsetWidth;
  section.classList.add('section-ping');

  window.setTimeout(() => {
    section.classList.remove('section-ping');
  }, 1400);
};

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href')?.slice(1);
    if (!id) {
      return;
    }

    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    event.preventDefault();

    // About has a larger H1; land it slightly lower for cleaner visual framing.
    const anchorOffset = id === 'about'
      ? Math.max(0, getHeaderOffset() - 30)
      : getHeaderOffset();

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - anchorOffset
    );
    window.history.pushState(null, '', `#${id}`);
    window.scrollTo({
      top,
      behavior: 'auto',
    });

    window.requestAnimationFrame(() => pulseSection(id));
  });
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (id) {
    pulseSection(id);
  }
});

if (window.location.hash) {
  pulseSection(window.location.hash.slice(1));
}
