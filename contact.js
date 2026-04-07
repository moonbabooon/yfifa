const ballBtn       = document.getElementById('ball-btn');
const modal         = document.getElementById('contact-modal');
const overlay       = document.getElementById('contact-overlay');
const closeBtn      = document.getElementById('contact-close');
const form          = document.getElementById('contact-form');
const sendBtn       = document.getElementById('send-btn');

function openModal() {
  modal.classList.add('visible');
  overlay.classList.add('visible');
}

function closeModal() {
  modal.classList.remove('visible');
  overlay.classList.remove('visible');
}

ballBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name  = form.querySelector('[name="from_name"]').value.trim();
  const email = form.querySelector('[name="from_email"]').value.trim();
  if (!name || !email) return;

  sendBtn.textContent = 'Sending...';
  sendBtn.disabled = true;

  try {
    await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form);
  } catch (err) {
    // Still play the animation even if emailjs isn't configured yet
    console.warn('EmailJS not configured:', err);
  }

  form.reset();
  closeModal();

  // Trigger the 3D ball kick
  if (typeof window.triggerBallKick === 'function') {
    window.triggerBallKick();
  }

  sendBtn.disabled = false;
  sendBtn.innerHTML = 'Kick it in! <span class="btn-ball">⚽</span>';
});
