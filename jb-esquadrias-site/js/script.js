'use strict';

const CONFIG = {
  companyName: 'JB Esquadrias de Alumínios',
  whatsapp: '5541985024581',
  instagram: 'https://www.instagram.com/jbesquadria_/',
  address: 'Av. Juscelino Kubitschek de Oliveira, 2480 - Caiobá - Matinhos/PR - CEP 83260-000'
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function buildWhatsAppUrl(message) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
}

function setupWhatsAppLinks() {
  qsa('.whatsapp-link').forEach(link => {
    const message = link.dataset.message || `Olá! Encontrei a ${CONFIG.companyName} pelo site e gostaria de solicitar um orçamento.`;
    link.href = buildWhatsAppUrl(message);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

function setupHeader() {
  const header = qs('.site-header');
  const menuButton = qs('.menu-toggle');
  const panel = qs('.nav-panel');

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const closeMenu = () => {
    panel?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  qsa('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

function setupActiveSection() {
  const links = qsa('.nav-links a[href^="#"]');
  const sections = links.map(link => qs(link.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

function setupRevealAnimations() {
  const items = qsa('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  items.forEach(item => observer.observe(item));
}

function setupPortfolioFilters() {
  const buttons = qsa('.filter-btn');
  const cards = qsa('.project-card');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      const filter = button.dataset.filter;
      cards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        card.hidden = !matches;
      });
    });
  });
}

function setupLightbox() {
  const dialog = qs('#lightbox');
  const image = dialog?.querySelector('img');
  const close = dialog?.querySelector('.lightbox-close');
  if (!dialog || !image) return;

  qsa('.project-card').forEach(card => card.addEventListener('click', () => {
    image.src = card.dataset.image;
    image.alt = card.querySelector('img')?.alt || 'Projeto JB Esquadrias';
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }));

  close?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
}

function setupHotspots() {
  const panel = qs('.detail-panel');
  if (!panel) return;
  qsa('.hotspot').forEach((button, index) => {
    button.addEventListener('click', () => {
      qsa('.hotspot').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      panel.querySelector('.detail-number').textContent = String(index + 1).padStart(2, '0');
      panel.querySelector('h3').textContent = button.dataset.title;
      panel.querySelector('p').textContent = button.dataset.text;
    });
  });
}

function setupServiceQuotes() {
  qsa('.service-quote').forEach(button => {
    button.addEventListener('click', () => {
      const service = button.dataset.service;
      const message = `Olá! Vim pelo site da JB Esquadrias.\n\nTenho interesse em um orçamento para:\n\nSERVIÇO\n${service}\n\nCIDADE / BAIRRO\n\nMEDIDAS APROXIMADAS\n\nOBSERVAÇÕES\n\nGostaria de receber mais informações.`;
      window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    });
  });
}

function setupPhoneMask() {
  const input = qs('#phone');
  input?.addEventListener('input', () => {
    let value = input.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (value.length > 6) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else value = value.replace(/^(\d*)/, '($1');
    input.value = value;
  });
}

function setupQuoteForm() {
  const form = qs('#quote-form');
  if (!form) return;
  const steps = qsa('.form-step', form);
  const status = qs('#form-status', form);
  let current = 0;

  const showStep = index => {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => {
      step.hidden = i !== current;
      step.classList.toggle('is-active', i === current);
    });
    status.textContent = '';
    const firstInput = steps[current].querySelector('select,input,textarea');
    firstInput?.focus({ preventScroll: true });
  };

  const validateStep = step => {
    let valid = true;
    qsa('[required]', step).forEach(field => {
      field.setAttribute('aria-invalid', String(!field.checkValidity()));
      if (!field.checkValidity()) valid = false;
    });
    if (!valid) status.textContent = 'Preencha os campos obrigatórios para continuar.';
    return valid;
  };

  qsa('.next-step', form).forEach(button => button.addEventListener('click', () => {
    if (validateStep(steps[current])) showStep(current + 1);
  }));
  qsa('.prev-step', form).forEach(button => button.addEventListener('click', () => showStep(current - 1)));

  qsa('input,select,textarea', form).forEach(field => field.addEventListener('input', () => field.removeAttribute('aria-invalid')));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateStep(steps[current])) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const message = [
      'Olá, JB Esquadrias!',
      '',
      'Encontrei vocês pelo site e gostaria de solicitar um orçamento.',
      '',
      'SERVIÇO', data.service,
      '',
      'MATERIAL', data.material,
      '',
      'IMÓVEL', data.property,
      '',
      'LOCAL', data.city,
      '',
      'MEDIDAS', data.dimensions || 'Não informado',
      '',
      'PRAZO', data.deadline || 'Não informado',
      '',
      'CLIENTE', data.name,
      '',
      'TELEFONE', data.phone,
      '',
      'OBSERVAÇÕES', data.notes || 'Sem observações',
      '',
      'Poderiam me orientar sobre esse projeto?'
    ].join('\n');
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  });
}

function setupBackToTop() {
  const button = qs('.back-to-top');
  if (!button) return;
  const sync = () => button.classList.toggle('is-visible', window.scrollY > 700);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initializeApp() {
  setupWhatsAppLinks();
  setupHeader();
  setupActiveSection();
  setupRevealAnimations();
  setupPortfolioFilters();
  setupLightbox();
  setupHotspots();
  setupServiceQuotes();
  setupPhoneMask();
  setupQuoteForm();
  setupBackToTop();
  const year = qs('#year');
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', initializeApp);
