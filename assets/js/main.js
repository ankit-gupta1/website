const sections = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.topbar nav a[href^="#"]');
const panels = document.querySelectorAll('.panel');
const getHeaderOffset = () => {
  const header = document.querySelector('.topbar');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  return Math.ceil(headerHeight + 24);
};

const applyTempClass = (node, className, timeoutMs) => {
  if (!node) {
    return;
  }

  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
  window.setTimeout(() => {
    node.classList.remove(className);
  }, timeoutMs);
};

const setCurrentNav = (id) => {
  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href')?.slice(1);
    link.classList.toggle('is-current', targetId === id);
  });
};

const addTouchFeedback = (node, className, timeoutMs) => {
  if (window.PointerEvent) {
    node.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') {
        applyTempClass(node, className, timeoutMs);
      }
    });
    return;
  }

  node.addEventListener(
    'touchstart',
    () => {
      applyTempClass(node, className, timeoutMs);
    },
    { passive: true }
  );
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
  addTouchFeedback(link, 'tap-hover', 320);

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
    setCurrentNav(id);

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

panels.forEach((panel) => {
  addTouchFeedback(panel, 'touch-hover', 420);
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (id) {
    setCurrentNav(id);
    pulseSection(id);
  }
});

setCurrentNav(window.location.hash ? window.location.hash.slice(1) : 'about');

if (window.location.hash) {
  pulseSection(window.location.hash.slice(1));
}
