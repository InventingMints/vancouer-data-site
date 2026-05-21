// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll(
  '.card, .why-feat, .step, .coverage-item, .faq-item, .cta-box, .why-text, .why-features, .section-label, .section-title, .testimonial-card, .case-featured, .case-card, .card-bespoke'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ── Discord webhook ──────────────────────────────────────────────
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1506152759567585370/aa9QBH4dur7y-Izkg4wBLMN42Oz28tKctvpddReeiFb-wHKE5OEHkUhCPuek1C6mS09h';

async function sendToDiscord(name, email, phone, business) {
  const now = new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'full', timeStyle: 'short' });
  const payload = {
    username: 'Datamint Labs · Lead Bot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/2920/2920244.png',
    embeds: [{
      title: '📬 New Review Request',
      color: 0xA252F3,
      fields: [
        { name: '👤 Name',     value: name     || '—', inline: true  },
        { name: '📧 Email',    value: email    || '—', inline: true  },
        { name: '📞 Phone',    value: phone    || '—', inline: true  },
        { name: '🏢 Business', value: business || '—', inline: false },
        { name: '📍 Source',   value: 'datamintlabs.ca — Book a Review form', inline: false },
        { name: '🕐 Time',     value: now,              inline: false },
      ],
      footer: { text: 'Datamint Labs' },
      thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/2920/2920244.png' },
    }]
  };
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ── Google Sheets (via Apps Script web app) ──────────────────────
// REPLACE the URL below with your deployed Apps Script web app URL
const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxLhekjxGkWxjgfxdPz-uRvaTSJoJ47WGNoIg5QlzZlOhhNMkr0MYBfcEDcJKplSNU_TQ/exec';

function sendToGoogleSheet(name, email, phone, business) {
  const params = new URLSearchParams({ name, email, phone, business });
  // Image beacon — bypasses CORS entirely, follows Google's redirects natively
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = `${GOOGLE_SHEET_WEBHOOK}?${params}`;
  });
}

// ── Form submit ──────────────────────────────────────────────────
const form = document.querySelector('.cta-form');
const submitBtn = form.querySelector('button');

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const inputs = form.querySelectorAll('input');
  const name     = inputs[0].value.trim();
  const email    = inputs[1].value.trim();
  const phone    = inputs[2].value.trim();
  const business = inputs[3].value.trim();

  // Validation
  if (!name) {
    inputs[0].focus(); inputs[0].style.borderColor = 'rgba(239,68,68,0.6)'; return;
  }
  if (!email || !email.includes('@')) {
    inputs[1].focus(); inputs[1].style.borderColor = 'rgba(239,68,68,0.6)'; return;
  }
  if (!phone) {
    inputs[2].focus(); inputs[2].style.borderColor = 'rgba(239,68,68,0.6)'; return;
  }

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    // Fire Sheets in background — don't let it block Discord or success state
    sendToGoogleSheet(name, email, phone, business).catch(() => {});
    await sendToDiscord(name, email, phone, business);
    submitBtn.textContent = '✓ Request Sent — We will be in touch within 24 hours';
    submitBtn.style.background = '#22c55e';
    submitBtn.style.boxShadow = '0 0 30px rgba(34,197,94,0.3)';
    inputs.forEach(i => i.disabled = true);
  } catch {
    submitBtn.textContent = 'Something went wrong — please email directly';
    submitBtn.style.background = '#ef4444';
    submitBtn.disabled = false;
  }
});
