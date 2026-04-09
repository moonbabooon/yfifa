const ballBtn    = document.getElementById('ball-btn');
const declineBtn = document.getElementById('decline-btn');
const modal      = document.getElementById('contact-modal');
const overlay    = document.getElementById('contact-overlay');
const closeBtn   = document.getElementById('contact-close');
const form       = document.getElementById('contact-form');
const sendBtn    = document.getElementById('send-btn');
const title      = modal.querySelector('.contact-title');
const sub        = modal.querySelector('.contact-sub');
const toast      = document.getElementById('success-toast');

let isDecline = false;

const seatsField = form.querySelector('[name="guests"]');

function openRsvp() {
  isDecline = false;
  title.textContent    = 'Are You Coming?';
  sub.textContent      = 'RSVP for the match';
  sendBtn.innerHTML    = 'Kick it in! <span class="btn-ball">⚽</span>';
  seatsField.style.display = '';
  modal.classList.add('visible');
  overlay.classList.add('visible');
}

function openDecline() {
  isDecline = true;
  title.textContent    = "Can't Make It?";
  sub.textContent      = "Let us know — we'll miss you";
  sendBtn.innerHTML    = 'Send Decline <span class="btn-ball">😔</span>';
  seatsField.style.display = 'none';
  modal.classList.add('visible');
  overlay.classList.add('visible');
}

function closeModal() {
  modal.classList.remove('visible');
  overlay.classList.remove('visible');
}

ballBtn.addEventListener('click', openRsvp);
declineBtn.addEventListener('click', openDecline);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name  = form.querySelector('[name="from_name"]').value.trim();
  const email = form.querySelector('[name="from_email"]').value.trim();
  if (!name || !email) return;

  const originalBtn = sendBtn.innerHTML;
  sendBtn.textContent = 'Sending...';
  sendBtn.disabled = true;

  try {
    const data = new FormData(form);
    data.append('rsvp_type', isDecline ? 'decline' : 'accept');
    await fetch('https://formspree.io/f/xzdkqylq', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
  } catch (err) {
    console.warn('Formspree error:', err);
  }

  form.reset();
  closeModal();

  if (isDecline) {
    toast.textContent = "We'll miss you! Thanks for letting us know 💙";
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3500);
  } else {
    // Trigger the 3D ball kick
    if (typeof window.triggerBallKick === 'function') window.triggerBallKick();
  }

  sendBtn.disabled = false;
  sendBtn.innerHTML = originalBtn;
});
