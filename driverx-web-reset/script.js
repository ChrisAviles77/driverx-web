const nav = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.target || 0);
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.35 });

counters.forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('open');
      const icon = faq.querySelector('b');
      if (icon) icon.textContent = '+';
    });
    if (!wasOpen) {
      item.classList.add('open');
      const icon = item.querySelector('b');
      if (icon) icon.textContent = '−';
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formNote.textContent = 'Mensaje recibido visualmente. En la siguiente fase conectamos este formulario al backend, correo o WhatsApp.';
  formNote.style.color = '#36d17c';
  form.reset();
});
