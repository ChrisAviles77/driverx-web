const nav = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (year) year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
});

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

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

if (form && formNote) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = 'Mensaje recibido visualmente. En la siguiente fase conectamos este formulario al backend, correo o WhatsApp.';
    formNote.style.color = '#36d17c';
    form.reset();
  });
}

// DriverX basic chatbot: static assistant without external APIs.
const chatLauncher = document.getElementById('chatLauncher');
const chatbot = document.getElementById('chatbot');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const quickQuestions = document.getElementById('quickQuestions');

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const driverXAnswers = [
  {
    keywords: ['que es', 'driverx', 'empresa', 'plataforma'],
    answer: 'DriverX es una plataforma de movilidad que conecta pasajeros con conductores verificados para viajes en moto y carro. Nuestra meta es ofrecer viajes rápidos, seguros y accesibles.'
  },
  {
    keywords: ['conductor', 'trabajar', 'registro', 'registrarme', 'ganar dinero'],
    answer: 'Para ser conductor en DriverX debes registrarte, subir tus documentos, esperar la verificación manual y luego podrás recibir solicitudes de viaje cuando tu cuenta sea aprobada.'
  },
  {
    keywords: ['documento', 'requisito', 'licencia', 'seguro', 'identidad'],
    answer: 'Los requisitos principales son: documento de identidad válido, licencia vigente, foto de perfil clara, registro del vehículo o moto, seguro o documentos requeridos y aprobación manual de DriverX.'
  },
  {
    keywords: ['seguro', 'seguridad', 'verificado', 'verificacion', 'confiable'],
    answer: 'La seguridad en DriverX se basa en conductores verificados, revisión manual de documentos, historial de viajes, calificaciones, soporte y seguimiento del viaje en tiempo real.'
  },
  {
    keywords: ['disponible', 'ciudad', 'ciudades', 'managua', 'masaya', 'granada', 'leon', 'chinandega'],
    answer: 'DriverX se prepara para iniciar en ciudades seleccionadas. En la web aparecen como objetivo: Managua, Masaya, Granada, León y Chinandega, con expansión progresiva.'
  },
  {
    keywords: ['app', 'aplicacion', 'play store', 'google play', 'app store', 'descargar'],
    answer: 'La app de DriverX para pasajeros y conductores está en preparación. Muy pronto estará lista para App Store y Google Play.'
  },
  {
    keywords: ['moto', 'carro', 'viaje', 'servicio', 'precio', 'tarifa'],
    answer: 'DriverX contempla dos tipos de viaje: Moto, ideal para moverse rápido y ahorrar; y Carro, pensado para mayor comodidad y seguridad. Los precios exactos dependerán de distancia, disponibilidad y ciudad.'
  },
  {
    keywords: ['pago', 'tarjeta', 'cashback', 'promocion'],
    answer: 'DriverX está preparado para evolucionar hacia pagos modernos, promociones y cashback. La web muestra una promoción de referencia de 1% cashback en pagos con tarjeta.'
  },
  {
    keywords: ['soporte', 'ayuda', 'contacto', 'whatsapp', 'problema'],
    answer: 'Puedes usar el formulario de contacto de la web para soporte, consultas de pasajeros, conductores o alianzas. En una siguiente fase este asistente puede conectarse a WhatsApp o al backend.'
  },
  {
    keywords: ['alianza', 'socio', 'inversion', 'empresa', 'comercio'],
    answer: 'DriverX busca alianzas con conductores, comercios, empresas y socios estratégicos para construir una plataforma de movilidad regional con visión de crecimiento.'
  },
  {
    keywords: ['legal', 'privacidad', 'terminos', 'cancelacion'],
    answer: 'Las páginas legales básicas recomendadas para DriverX son: Términos y condiciones, Política de privacidad, Política de cancelación, Política de conductores y Política de seguridad.'
  }
];

const fallbackAnswer = 'Puedo ayudarte con información sobre DriverX, viajes, conductores, requisitos, seguridad, disponibilidad, app, pagos, soporte y alianzas. También puedes dejar tu mensaje en el formulario de contacto.';

function getDriverXAnswer(question) {
  const normalized = normalizeText(question);

  const match = driverXAnswers.find((item) =>
    item.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  return match ? match.answer : fallbackAnswer;
}

function appendMessage(text, type = 'bot') {
  if (!chatMessages) return null;

  const wrapper = document.createElement('div');
  wrapper.className = type === 'user' ? 'user-message' : 'bot-message';

  if (type === 'bot') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.textContent = 'DX';
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement('p');
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
}

function answerQuestion(question) {
  if (!question.trim()) return;

  appendMessage(question, 'user');
  const typing = appendMessage('Escribiendo...', 'bot');
  if (typing) typing.classList.add('typing');

  setTimeout(() => {
    if (typing) typing.remove();
    appendMessage(getDriverXAnswer(question), 'bot');
  }, 450);
}

function openChatbot() {
  if (!chatbot) return;
  chatbot.classList.add('open');
  chatbot.setAttribute('aria-hidden', 'false');
  setTimeout(() => chatInput?.focus(), 120);
}

function closeChatbot() {
  if (!chatbot) return;
  chatbot.classList.remove('open');
  chatbot.setAttribute('aria-hidden', 'true');
}

chatLauncher?.addEventListener('click', openChatbot);
chatClose?.addEventListener('click', closeChatbot);

quickQuestions?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-question]');
  if (!button) return;
  answerQuestion(button.dataset.question);
});

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = chatInput?.value || '';
  answerQuestion(question);
  if (chatInput) chatInput.value = '';
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeChatbot();
});
