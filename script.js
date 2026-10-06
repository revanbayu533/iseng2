/* ========================================================
   1. PARAMETERS & INITIAL SETUP
   ======================================================== */
const params = new URLSearchParams(window.location.search);
let untuk = params.get('untuk') || 'Jelita';
let dari  = params.get('dari')  || 'Aku';
let hadiah = params.get('hadiah') || 'Traktir Makanan Favorit & Es Krim';

// Mode Penerima: Jika link memiliki parameter lock=1 atau untuk ditentukan (tanpa edit=1),
// maka tombol ganti nama, tombol ganti stiker, dan fitur edit foto otomatis dikunci!
const isLocked = params.get('lock') === '1' || (params.has('untuk') && params.get('edit') !== '1');
if (isLocked) {
  document.body.classList.add('is-recipient');
}

document.getElementById('title').textContent = 'Maafin Aku, ' + untuk;
document.getElementById('voucher-text').textContent = hadiah;

/* ========================================================
   2. WEB AUDIO API - SOOTHING ROMANTIC CHIMES & SOUND EFFECTS
   ======================================================== */
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play a gentle musical bell chord (Synthesized Celesta / Music Box)
function playNote(freq, type = 'sine', duration = 1.2, gainLevel = 0.15) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn(e);
  }
}

// Sound effect: Paper rustle / pop
function playPopSound() {
  if (!audioCtx) return;
  playNote(587.33, 'triangle', 0.25, 0.1); // D5
}

// Sound effect: Dodging boing
function playDodgeSound() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {}
}

// Sound effect: Celebration fanfare
function playFanfare() {
  if (!audioCtx) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((n, idx) => {
    setTimeout(() => playNote(n, 'sine', 1.4, 0.2), idx * 120);
  });
}

// Romantic ambient melody loop (Pachelbel-inspired soothing progression)
const romanticScale = [
  523.25, 659.25, 783.99, // C5, E5, G5
  493.88, 587.33, 739.99, // B4, D5, F#5
  440.00, 523.25, 659.25, // A4, C5, E5
  392.00, 493.88, 587.33, // G4, B4, D5
  349.23, 440.00, 523.25, // F4, A4, C5
  523.25, 659.25, 1046.50 // C5, E5, C6
];

let noteIndex = 0;
const bgAudio = document.getElementById('bg-music') || new Audio(encodeURI('Merry Christmas, Please Dont Call.mp3'));
const musicPill = document.getElementById('music-pill');
const discVinyl = document.getElementById('disc-vinyl');
const soundWave = document.getElementById('sound-wave');
const musicStatus = document.getElementById('music-status');

function updateMusicUI(playing) {
  if (playing) {
    if (discVinyl) discVinyl.classList.add('spinning');
    if (soundWave) soundWave.classList.add('active');
    if (musicStatus) musicStatus.textContent = 'Sedang diputar 🎶';
  } else {
    if (discVinyl) discVinyl.classList.remove('spinning');
    if (soundWave) soundWave.classList.remove('active');
    if (musicStatus) musicStatus.textContent = 'Ketuk untuk putar 🎵';
  }
}

function startMusic() {
  initAudio();
  isMusicPlaying = true;
  updateMusicUI(true);
  showToast('Memutar: Merry Christmas, Please Dont Call 🎵');

  // Try playing the custom MP3 song
  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      // Fallback to soothing synthesizer if browser restricts direct media
      if (musicInterval) clearInterval(musicInterval);
      musicInterval = setInterval(() => {
        if (!isMusicPlaying) return;
        const baseFreq = romanticScale[noteIndex % romanticScale.length];
        playNote(baseFreq, 'sine', 1.8, 0.08);
        if (noteIndex % 2 === 0) {
          playNote(baseFreq * 1.5, 'triangle', 2.0, 0.03);
        }
        noteIndex++;
      }, 550);
    });
  }
}

function stopMusic() {
  isMusicPlaying = false;
  if (bgAudio && !bgAudio.paused) {
    bgAudio.pause();
  }
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  updateMusicUI(false);
  showToast('Musik dijeda');
}

if (musicPill) {
  musicPill.addEventListener('click', () => {
    initAudio();
    if (isMusicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });
}

/* ========================================================
   3. DARK/LIGHT THEME SWITCHER
   ======================================================== */
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');

// Auto-detect system preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.textContent = '☀️';
}

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
  }
});

/* ========================================================
   4. ENVELOPE OPENING ANIMATION
   ======================================================== */
const envelopeBox = document.getElementById('envelope-box');
const envelopeFlap = document.getElementById('envelope-flap');
const mainCard = document.getElementById('main-card');
let hasOpened = false;

function openEnvelope() {
  if (hasOpened) return;
  hasOpened = true;
  initAudio();
  playPopSound();

  // Flap opening
  envelopeFlap.style.transform = 'rotateX(180deg)';
  document.getElementById('wax-seal').style.transform = 'scale(0.7)';
  document.getElementById('wax-seal').style.opacity = '0';

  // Auto start music gently if user hasn't explicitly disabled
  if (!isMusicPlaying) {
    startMusic();
  }

  setTimeout(() => {
    envelopeBox.style.opacity = '0';
    envelopeBox.style.transform = 'scale(0.85)';
    setTimeout(() => {
      envelopeBox.style.display = 'none';
      mainCard.style.display = 'block';
      startTyping();
    }, 400);
  }, 450);
}

envelopeBox.addEventListener('click', openEnvelope);

/* ========================================================
   5. TYPEWRITER EFFECT WITH ACCELERATION SUPPORT
   ======================================================== */
function buildLetterText() {
  return `Hai ${untuk},

Maaf ya kalau sekarang ada sikap, perkataan, atau caraku merespons yang kurang berkenan di hatimu sampai bikin kamu terasa menjauh dari aku.

Kalau kuingat lagi ke belakang, pasti kamu selalu jadi prioritasku. Dulu kamu yang selalu ada dan paling sering nyariin pas aku lagi sibuk-sibuknya dengan urusanku sendiri. Dan aku pengen kamu tahu, sekarang pun kalau kamu chat, sesibuk apa pun keadaanku atau sesibuk apa pun kamu, aku akan selalu ada dan selalu jawab chat dari kamu.

Sekarang, di saat waktuku sudah lebih luang dan aku ingin memperbaiki semuanya, aku paham kenapa situasinya justru berbalik. Aku sangat mengerti alasan kenapa kamu perlahan menjauh, bersikap dingin, atau bahkan mungkin terlihat seperti membenciku—terutama setelah ibumu tahu tentang hubungan kita. Aku tahu kamu pasti berada di posisi yang sangat sulit, serba salah, dan penuh tekanan di hadapan orang tuamu.

Aku gak pernah ada niat sedikit pun untuk bikin beban pikiranmu makin berat. Terlepas dari apa pun yang terjadi dan bagaimana perasaanmu ke aku saat ini, aku benar-benar menghargai setiap keputusan dan batasan yang kamu ambil.

Oh iya, untuk jersey kelasku nanti, sepertinya aku bakal tetap pakai nama inisialmu yaitu 'JLT' dan tanggal lahirmu untuk nomor punggungnya, yaitu 14.

Surat kecil ini bukan untuk menuntut apa-apa atau memaksakan keadaan kembali seperti dulu. Dari lubuk hatiku yang paling dalam, aku cuma pengen meminta maaf secara tulus agar gak ada ganjalan, beban, atau salah paham yang tersisa di antara kita.

Terima kasih ya Jelita, untuk semua waktu, cerita, dan kebaikan yang pernah kamu bagi bareng aku. Semoga langkahmu selalu dimudahkan dan hatimu selalu diberi ketenangan.

Dari orang yang tulus meminta maaf,
${dari} 💌`;
}
let letterText = buildLetterText();

const msgElement = document.getElementById('msg');
const speedHint = document.getElementById('speed-hint');
const reasonsBox = document.getElementById('reasons-box');
const askBox = document.getElementById('ask');
let typeIndex = 0;
let typeSpeed = 38;
let typeTimer = null;
let isTypingDone = false;

function typeWriter() {
  if (typeIndex < letterText.length) {
    msgElement.textContent += letterText[typeIndex++];
    typeTimer = setTimeout(typeWriter, typeSpeed);
  } else {
    finishTyping();
  }
}

function finishTyping() {
  if (isTypingDone) return;
  isTypingDone = true;
  clearTimeout(typeTimer);
  msgElement.textContent = letterText;
  msgElement.classList.remove('cursor');
  speedHint.style.display = 'none';
  reasonsBox.style.display = 'flex';
  const polaroidSection = document.getElementById('polaroid-section');
  if (polaroidSection) polaroidSection.style.display = 'block';
  askBox.style.display = 'block';
}

function startTyping() {
  speedHint.style.display = 'block';
  typeWriter();
}

// Allow user to tap letter to immediately reveal full text
document.getElementById('letter-click-area').addEventListener('click', () => {
  if (!isTypingDone) {
    finishTyping();
  }
});

/* ========================================================
   6. "TIDAK" BUTTON PLAYFUL DODGE MECHANIC
   ======================================================== */
const noBtn = document.getElementById('no');
const yesBtn = document.getElementById('yes');
const tooltip = document.getElementById('dodge-tooltip');
let dodgeCount = 0;
let yesScale = 1;

const wittyRemarks = [
  "Yakin gamau maafin? 🥺",
  "Jangan gitu dong cantik/ganteng.. 😢",
  "Tombol ini lagi mogok! 🏃💨",
  "Coba klik yang pink deh 👉👈",
  "Aku janji bakal nurut! 🥺",
  "Pliss maafin aku yaa? 💖",
  "Tombolnya kabur terus kan! 😂",
  "Nggak ada pilihan selain maafin! 🥰"
];

function dodgeNo(e) {
  if (e) e.preventDefault();
  initAudio();
  playDodgeSound();

  dodgeCount++;
  const remark = wittyRemarks[(dodgeCount - 1) % wittyRemarks.length];
  tooltip.textContent = remark;
  tooltip.classList.add('active');

  // Random position dodge within safe radius
  const boundX = 130;
  const boundY = 80;
  const randomX = (Math.random() - 0.5) * 2 * boundX;
  const randomY = (Math.random() - 0.5) * 2 * boundY;

  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;

  // Make "Yes" button progressively larger and more attractive
  yesScale = Math.min(yesScale + 0.12, 1.75);
  yesBtn.style.transform = `scale(${yesScale})`;

  // Change character state dynamically to crying
  setMainCharacterState('crying');

  // Hide tooltip after a moment
  setTimeout(() => {
    tooltip.classList.remove('active');
  }, 1800);
}

noBtn.addEventListener('mouseenter', dodgeNo);
noBtn.addEventListener('touchstart', dodgeNo, { passive: false });
noBtn.addEventListener('click', dodgeNo);

/* ========================================================
   7. "YES" BUTTON CELEBRATION & WHATSAPP GENERATOR
   ======================================================== */
yesBtn.addEventListener('click', () => {
  initAudio();
  playFanfare();

  document.getElementById('content-screen').style.display = 'none';
  document.getElementById('final').style.display = 'block';

  // Set happy character on celebration screen
  setFinalCharacterState('happy');

  document.getElementById('thanks').textContent =
    `Terima kasih banyak sudah berbesar hati memaafkan aku, ${untuk}. Aku mendoakan yang terbaik untuk ketenangan dan kebahagiaanmu. — Dari ${dari}`;

  // Set WhatsApp message link
  const waText = encodeURIComponent(
    `Hai ${dari}! Aku udah baca surat permintaan maafmu. Iya, aku maafin kamu kok 💖 Makasih udah memahami keadaanku ya.`
  );
  document.getElementById('wa-btn').href = `https://wa.me/?text=${waText}`;

  // Launch Massive Confetti & Heart Fireworks
  launchMegaConfetti();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('final').style.display = 'none';
  document.getElementById('content-screen').style.display = 'block';
  noBtn.style.transform = 'translate(0, 0)';
  yesScale = 1;
  yesBtn.style.transform = 'scale(1)';
  setMainCharacterState('sad');
});

/* ========================================================
   8. CANVAS PARTICLES & CONFETTI ENGINE (HIGH PERFORMANCE)
   ======================================================== */
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const heartsSymbols = ['❤', '💖', '💗', '💕', '🌸', '✨'];

class FloatingHeart {
  constructor(isConfetti = false) {
    this.reset(isConfetti);
  }

  reset(isConfetti = false) {
    this.isConfetti = isConfetti;
    this.symbol = heartsSymbols[Math.floor(Math.random() * heartsSymbols.length)];

    if (isConfetti) {
      this.x = width / 2;
      this.y = height * 0.42;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 2.5;
      this.alpha = 1;
      this.gravity = 0.16;
    } else {
      this.x = Math.random() * width;
      this.y = height + 30;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -(1.2 + Math.random() * 1.8);
      this.alpha = 0.4 + Math.random() * 0.5;
      this.gravity = 0;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    if (this.isConfetti) {
      this.alpha -= 0.015;
    }

    if (this.y < -40 || this.alpha <= 0) {
      if (this.isConfetti) {
        return false;
      } else {
        this.reset(false);
      }
    }
    return true;
  }

  draw() {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillText(this.symbol, this.x, this.y);
  }
}

// Ambient floating hearts (optimized count for 60fps locked performance)
for (let i = 0; i < 14; i++) {
  const p = new FloatingHeart(false);
  p.y = Math.random() * height;
  particles.push(p);
}

let isTabActive = true;
document.addEventListener('visibilitychange', () => {
  isTabActive = !document.hidden;
  if (isTabActive) {
    requestAnimationFrame(animateParticles);
  }
});

function animateParticles() {
  if (!isTabActive) return;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '22px serif';

  for (let i = particles.length - 1; i >= 0; i--) {
    const alive = particles[i].update();
    if (!alive) {
      particles.splice(i, 1);
    } else {
      particles[i].draw();
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

function launchMegaConfetti() {
  for (let i = 0; i < 28; i++) {
    setTimeout(() => {
      particles.push(new FloatingHeart(true));
    }, i * 35);
  }
}

/* ========================================================
   9. CUSTOMIZE MODAL & TOAST
   ======================================================== */
const customModal = document.getElementById('custom-modal');
const customTrigger = document.getElementById('customize-trigger');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const inputUntuk = document.getElementById('input-untuk');
const inputDari = document.getElementById('input-dari');
const inputHadiah = document.getElementById('input-hadiah');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

const inputShareLink = document.getElementById('input-share-link');
const btnCopyDirect = document.getElementById('btn-copy-direct');

function getRecipientUrl() {
  const u = (inputUntuk ? inputUntuk.value.trim() : '') || untuk;
  const d = (inputDari ? inputDari.value.trim() : '') || dari;
  const h = (inputHadiah ? inputHadiah.value.trim() : '') || hadiah;
  const recipientUrl = new URL(window.location.href);
  recipientUrl.searchParams.set('untuk', u);
  recipientUrl.searchParams.set('dari', d);
  recipientUrl.searchParams.set('hadiah', h);
  recipientUrl.searchParams.set('lock', '1');
  recipientUrl.searchParams.delete('edit');
  return recipientUrl.toString();
}

function updateShareLinkInput() {
  if (inputShareLink) {
    inputShareLink.value = getRecipientUrl();
  }
}

if (inputUntuk) inputUntuk.addEventListener('input', updateShareLinkInput);
if (inputDari) inputDari.addEventListener('input', updateShareLinkInput);
if (inputHadiah) inputHadiah.addEventListener('input', updateShareLinkInput);

if (btnCopyDirect) {
  btnCopyDirect.addEventListener('click', () => {
    updateShareLinkInput();
    const linkToCopy = inputShareLink.value;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(linkToCopy).then(() => {
        showToast('Link Read-Only tersalin! 🔒');
      }).catch(() => {
        showToast('Gagal menyalin otomatis');
      });
    } else {
      inputShareLink.select();
      document.execCommand('copy');
      showToast('Link Read-Only disalin! 🔒');
    }
  });
}

customTrigger.addEventListener('click', () => {
  inputUntuk.value = untuk === 'Kamu' ? '' : untuk;
  inputDari.value = dari === 'Aku' ? '' : dari;
  inputHadiah.value = hadiah;
  updateShareLinkInput();
  customModal.classList.add('active');
});

modalCancel.addEventListener('click', () => {
  customModal.classList.remove('active');
});

customModal.addEventListener('click', (e) => {
  if (e.target === customModal) customModal.classList.remove('active');
});

modalSave.addEventListener('click', () => {
  const u = inputUntuk.value.trim() || 'Kamu';
  const d = inputDari.value.trim() || 'Aku';
  const h = inputHadiah.value.trim() || 'Traktir Makan Favorit & Boba';

  // Update in-memory values instantly
  untuk = u;
  dari = d;
  hadiah = h;

  // Immediate DOM updates without reload
  document.getElementById('title').textContent = 'Maafin Aku, ' + untuk;
  document.getElementById('voucher-text').textContent = hadiah;

  letterText = buildLetterText();
  if (isTypingDone) {
    msgElement.textContent = letterText;
  }

  const thanksEl = document.getElementById('thanks');
  if (thanksEl) {
    thanksEl.textContent = `Terima kasih banyak sudah berbesar hati memaafkan aku, ${untuk}. Aku mendoakan yang terbaik untuk ketenangan dan kebahagiaanmu. — Dari ${dari}`;
  }

  const waBtn = document.getElementById('wa-btn');
  if (waBtn) {
    const waText = encodeURIComponent(
      `Hai ${dari}! Aku udah baca surat permintaan maafmu. Iya, aku maafin kamu kok 💖 Makasih udah memahami keadaanku ya.`
    );
    waBtn.href = `https://wa.me/?text=${waText}`;
  }

  // Update browser URL for sender in address bar
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('untuk', u);
  currentUrl.searchParams.set('dari', d);
  currentUrl.searchParams.set('hadiah', h);
  currentUrl.searchParams.set('edit', '1'); // Tetap mode edit untuk si pengirim
  window.history.replaceState({}, '', currentUrl.toString());

  // Buat link terkunci khusus untuk dikirim ke penerima
  const recipientUrlString = getRecipientUrl();
  updateShareLinkInput();

  // Copy link khusus penerima ke clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(recipientUrlString).then(() => {
      showToast('Link tersalin! 🔒 Mode Read-Only untuk Jelita');
    }).catch(() => {
      showToast('Pengaturan berhasil disimpan! ✨');
    });
  } else {
    showToast('Pengaturan berhasil disimpan! ✨');
  }

  customModal.classList.remove('active');
});

/* ========================================================
   10. POLAROID MEMORY GALLERY & PHOTO UPLOAD
   ======================================================== */
const defaultPolaroids = [
  {
    src: encodeURI('WhatsApp Image 2026-07-30 at 14.21.23.jpeg'),
    caption: 'mungkin ini foto yg aku punya'
  },
  {
    src: encodeURI('WhatsApp Image 2026-07-30 at 14.21.23 (1).jpeg'),
    caption: 'mungkin ini foto yg aku punya'
  },
  {
    src: encodeURI('WhatsApp Image 2026-07-30 at 14.21.23 (2).jpeg'),
    caption: 'mungkin ini foto yg aku punya'
  }
];

let targetPhotoIndex = 0;
const polaroidFileInput = document.getElementById('polaroid-file-input');
const uploadPolaroidBtn = document.getElementById('upload-polaroid-btn');

function initPolaroids() {
  const savedPhotos = JSON.parse(localStorage.getItem('apology_polaroid_photos') || '{}');
  const savedCaps = JSON.parse(localStorage.getItem('apology_polaroid_captions') || '{}');

  // Bersihkan cache lama SVG dummy atau caption default lama agar foto asli muncul
  const oldDefaults = ['Momen Favorit Kita ✨', 'Jersey JLT • 14 🎽', 'Jangan Marahan Lagi Ya 🥺', 'Momen Manis Kita', 'Selalu berharga buat aku 🤍', 'Mungkin ini foto yang aku punya ✨'];
  let modified = false;
  for (let i = 0; i < 3; i++) {
    if (savedCaps[i] && oldDefaults.includes(savedCaps[i])) {
      delete savedCaps[i];
      modified = true;
    }
    if (savedPhotos[i] && (savedPhotos[i].startsWith('data:image/svg+xml') || savedPhotos[i].startsWith('blob:'))) {
      delete savedPhotos[i];
      modified = true;
    }
  }
  if (modified) {
    try {
      localStorage.setItem('apology_polaroid_captions', JSON.stringify(savedCaps));
      localStorage.setItem('apology_polaroid_photos', JSON.stringify(savedPhotos));
    } catch (e) {}
  }

  for (let i = 0; i < 3; i++) {
    const imgEl = document.getElementById(`polaroid-img-${i}`);
    const capEl = document.getElementById(`polaroid-cap-${i}`);

    if (imgEl) {
      imgEl.src = savedPhotos[i] || defaultPolaroids[i].src;
    }
    if (capEl) {
      capEl.textContent = savedCaps[i] || defaultPolaroids[i].caption;

      if (isLocked) {
        capEl.setAttribute('contenteditable', 'false');
      } else {
        // Save changes to caption (hanya jika mode pengirim)
        capEl.addEventListener('blur', () => {
          const caps = JSON.parse(localStorage.getItem('apology_polaroid_captions') || '{}');
          caps[i] = capEl.textContent.trim();
          localStorage.setItem('apology_polaroid_captions', JSON.stringify(caps));
          showToast('Caption foto tersimpan! ✍️');
        });
      }
    }
  }

  // Click on polaroid card to upload photo (hanya untuk pengirim)
  document.querySelectorAll('.polaroid-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (isLocked) return;
      // If user clicked the caption to edit, don't trigger upload
      if (e.target.classList.contains('polaroid-caption')) return;
      targetPhotoIndex = parseInt(card.dataset.index, 10);
      polaroidFileInput.click();
    });
  });

  if (uploadPolaroidBtn) {
    uploadPolaroidBtn.addEventListener('click', () => {
      targetPhotoIndex = 0;
      polaroidFileInput.click();
    });
  }

  if (polaroidFileInput) {
    polaroidFileInput.addEventListener('change', handlePhotoUpload);
  }
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // Compress with offscreen canvas to avoid exceeding localStorage quota
      const canvas = document.createElement('canvas');
      const maxDim = 500;
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

      // Save to localStorage
      try {
        const photos = JSON.parse(localStorage.getItem('apology_polaroid_photos') || '{}');
        photos[targetPhotoIndex] = compressedDataUrl;
        localStorage.setItem('apology_polaroid_photos', JSON.stringify(photos));

        const imgEl = document.getElementById(`polaroid-img-${targetPhotoIndex}`);
        if (imgEl) imgEl.src = compressedDataUrl;

        showToast('Foto kenangan berhasil dipasang! 📸✨');
      } catch (err) {
        showToast('Ukuran foto terlalu besar untuk disimpan');
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

// Initialize Polaroid
initPolaroids();

/* ========================================================
   11. ANIMATED CHARACTER / STICKER SELECTION SYSTEM
   ======================================================== */
const characters = {
  cat: {
    sad: `<svg viewBox="0 0 100 100">
      <path d="M22 36 L15 15 L38 24 C42 22 46 22 50 22 C54 22 58 22 62 24 L85 15 L78 36 C86 44 88 56 86 66 C82 82 68 88 50 88 C32 88 18 82 14 66 C12 56 14 44 22 36 Z" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <polygon points="21,30 18,19 32,25" fill="#ffb8cb"/>
      <polygon points="79,30 82,19 68,25" fill="#ffb8cb"/>
      <ellipse cx="28" cy="60" rx="8" ry="4.5" fill="#ff9ebb" opacity="0.8"/>
      <ellipse cx="72" cy="60" rx="8" ry="4.5" fill="#ff9ebb" opacity="0.8"/>
      <circle cx="36" cy="49" r="8" fill="#3b202a"/>
      <circle cx="64" cy="49" r="8" fill="#3b202a"/>
      <circle cx="34" cy="46" r="3.2" fill="#ffffff"/>
      <circle cx="62" cy="46" r="3.2" fill="#ffffff"/>
      <circle cx="38" cy="51" r="1.5" fill="#ffffff"/>
      <circle cx="66" cy="51" r="1.5" fill="#ffffff"/>
      <path d="M46 58 Q50 56 54 58 Q50 62 46 58" fill="#ff7a99"/>
      <ellipse cx="32" cy="59" rx="2.5" ry="4" fill="#6ec5ff"/>
      <ellipse cx="68" cy="59" rx="2.5" ry="4" fill="#6ec5ff"/>
      <ellipse cx="44" cy="74" rx="7" ry="5.5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
      <ellipse cx="56" cy="74" rx="7" ry="5.5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
    </svg>`,
    crying: `<svg viewBox="0 0 100 100">
      <path d="M22 36 L15 15 L38 24 C42 22 46 22 50 22 C54 22 58 22 62 24 L85 15 L78 36 C86 44 88 56 86 66 C82 82 68 88 50 88 C32 88 18 82 14 66 C12 56 14 44 22 36 Z" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <polygon points="21,30 18,19 32,25" fill="#ffb8cb"/>
      <polygon points="79,30 82,19 68,25" fill="#ffb8cb"/>
      <ellipse cx="28" cy="62" rx="9" ry="5" fill="#ff7a99" opacity="0.9"/>
      <ellipse cx="72" cy="62" rx="9" ry="5" fill="#ff7a99" opacity="0.9"/>
      <path d="M28 48 Q36 44 44 50" stroke="#3b202a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M72 48 Q64 44 56 50" stroke="#3b202a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M44 60 Q50 56 56 60 Q50 68 44 60" fill="#e8436e"/>
      <path d="M30 52 C22 60 22 75 28 85" stroke="#6ec5ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M70 52 C78 60 78 75 72 85" stroke="#6ec5ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="74" rx="7" ry="5.5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
      <ellipse cx="56" cy="74" rx="7" ry="5.5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
    </svg>`,
    happy: `<svg viewBox="0 0 100 100">
      <path d="M22 36 L15 15 L38 24 C42 22 46 22 50 22 C54 22 58 22 62 24 L85 15 L78 36 C86 44 88 56 86 66 C82 82 68 88 50 88 C32 88 18 82 14 66 C12 56 14 44 22 36 Z" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <polygon points="21,30 18,19 32,25" fill="#ffb8cb"/>
      <polygon points="79,30 82,19 68,25" fill="#ffb8cb"/>
      <circle cx="28" cy="58" r="7" fill="#ff85a1" opacity="0.8"/>
      <circle cx="72" cy="58" r="7" fill="#ff85a1" opacity="0.8"/>
      <path d="M28 49 Q36 42 44 49" stroke="#3b202a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M72 49 Q64 42 56 49" stroke="#3b202a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M45 57 Q50 63 55 57" stroke="#ff5c8a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M50 70 C46 64 38 66 40 73 C42 78 50 84 50 84 C50 84 58 78 60 73 C62 66 54 64 50 70 Z" fill="#e8436e"/>
      <ellipse cx="43" cy="76" rx="6" ry="5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
      <ellipse cx="57" cy="76" rx="6" ry="5" fill="#ffffff" stroke="#f0d5dd" stroke-width="1.5"/>
    </svg>`
  },
  panda: {
    sad: `<svg viewBox="0 0 100 100">
      <circle cx="22" cy="25" r="13" fill="#2d2226"/>
      <circle cx="78" cy="25" r="13" fill="#2d2226"/>
      <circle cx="50" cy="54" r="36" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <ellipse cx="34" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(-15 34 50)"/>
      <ellipse cx="66" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(15 66 50)"/>
      <circle cx="34" cy="48" r="4.5" fill="#ffffff"/>
      <circle cx="66" cy="48" r="4.5" fill="#ffffff"/>
      <circle cx="35" cy="49" r="2" fill="#2d2226"/>
      <circle cx="67" cy="49" r="2" fill="#2d2226"/>
      <circle cx="25" cy="62" r="6" fill="#ff9ebb" opacity="0.8"/>
      <circle cx="75" cy="62" r="6" fill="#ff9ebb" opacity="0.8"/>
      <ellipse cx="50" cy="60" rx="4" ry="2.5" fill="#2d2226"/>
      <path d="M47 66 Q50 63 53 66" stroke="#2d2226" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <ellipse cx="28" cy="58" rx="2.5" ry="4" fill="#6ec5ff"/>
      <ellipse cx="72" cy="58" rx="2.5" ry="4" fill="#6ec5ff"/>
      <circle cx="43" cy="78" r="6" fill="#2d2226"/>
      <circle cx="57" cy="78" r="6" fill="#2d2226"/>
    </svg>`,
    crying: `<svg viewBox="0 0 100 100">
      <circle cx="22" cy="25" r="13" fill="#2d2226"/>
      <circle cx="78" cy="25" r="13" fill="#2d2226"/>
      <circle cx="50" cy="54" r="36" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <ellipse cx="34" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(-15 34 50)"/>
      <ellipse cx="66" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(15 66 50)"/>
      <path d="M28 50 L40 50" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M60 50 L72 50" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="62" r="6" fill="#ff7a99" opacity="0.9"/>
      <circle cx="75" cy="62" r="6" fill="#ff7a99" opacity="0.9"/>
      <ellipse cx="50" cy="60" rx="4" ry="2.5" fill="#2d2226"/>
      <path d="M46 66 Q50 72 54 66" stroke="#2d2226" stroke-width="2" fill="#e8436e"/>
      <path d="M28 53 C20 62 20 74 26 84" stroke="#6ec5ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M72 53 C80 62 80 74 74 84" stroke="#6ec5ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <circle cx="43" cy="78" r="6" fill="#2d2226"/>
      <circle cx="57" cy="78" r="6" fill="#2d2226"/>
    </svg>`,
    happy: `<svg viewBox="0 0 100 100">
      <circle cx="22" cy="25" r="13" fill="#2d2226"/>
      <circle cx="78" cy="25" r="13" fill="#2d2226"/>
      <circle cx="50" cy="54" r="36" fill="#ffffff" stroke="#f0d5dd" stroke-width="2"/>
      <ellipse cx="34" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(-15 34 50)"/>
      <ellipse cx="66" cy="50" rx="10" ry="12" fill="#2d2226" transform="rotate(15 66 50)"/>
      <path d="M28 50 Q34 44 40 50" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M60 50 Q66 44 72 50" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="62" r="6.5" fill="#ff7a99" opacity="0.8"/>
      <circle cx="76" cy="62" r="6.5" fill="#ff7a99" opacity="0.8"/>
      <ellipse cx="50" cy="60" rx="4" ry="2.5" fill="#2d2226"/>
      <path d="M46 64 Q50 69 54 64" stroke="#2d2226" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 72 C46 66 38 68 40 75 C42 80 50 86 50 86 C50 86 58 80 60 75 C62 68 54 66 50 72 Z" fill="#e8436e"/>
      <circle cx="43" cy="78" r="6" fill="#2d2226"/>
      <circle cx="57" cy="78" r="6" fill="#2d2226"/>
    </svg>`
  },
  bear: {
    sad: `<svg viewBox="0 0 100 100">
      <circle cx="24" cy="26" r="12" fill="#b07d62"/>
      <circle cx="76" cy="26" r="12" fill="#b07d62"/>
      <circle cx="24" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="76" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="50" cy="54" r="34" fill="#c38e70"/>
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#eddcd2"/>
      <circle cx="38" cy="49" r="4" fill="#2d1e18"/>
      <circle cx="62" cy="49" r="4" fill="#2d1e18"/>
      <circle cx="37" cy="47" r="1.5" fill="#ffffff"/>
      <circle cx="61" cy="47" r="1.5" fill="#ffffff"/>
      <ellipse cx="50" cy="58" rx="4" ry="2.8" fill="#2d1e18"/>
      <path d="M47 65 Q50 62 53 65" stroke="#2d1e18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="32" cy="56" rx="2" ry="3.5" fill="#6ec5ff"/>
      <ellipse cx="68" cy="56" rx="2" ry="3.5" fill="#6ec5ff"/>
      <path d="M50 72 C46 66 38 68 40 75 C42 80 50 86 50 86 C50 86 58 80 60 75 C62 68 54 66 50 72 Z" fill="#e8436e"/>
      <circle cx="39" cy="76" r="5" fill="#b07d62"/>
      <circle cx="61" cy="76" r="5" fill="#b07d62"/>
    </svg>`,
    crying: `<svg viewBox="0 0 100 100">
      <circle cx="24" cy="26" r="12" fill="#b07d62"/>
      <circle cx="76" cy="26" r="12" fill="#b07d62"/>
      <circle cx="24" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="76" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="50" cy="54" r="34" fill="#c38e70"/>
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#eddcd2"/>
      <path d="M33 49 L43 49" stroke="#2d1e18" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M57 49 L67 49" stroke="#2d1e18" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="50" cy="58" rx="4" ry="2.8" fill="#2d1e18"/>
      <path d="M46 65 Q50 71 54 65" stroke="#2d1e18" stroke-width="1.6" fill="#e8436e"/>
      <path d="M31 51 C24 59 24 70 30 80" stroke="#6ec5ff" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M69 51 C76 59 76 70 70 80" stroke="#6ec5ff" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="39" cy="76" r="5" fill="#b07d62"/>
      <circle cx="61" cy="76" r="5" fill="#b07d62"/>
    </svg>`,
    happy: `<svg viewBox="0 0 100 100">
      <circle cx="24" cy="26" r="12" fill="#b07d62"/>
      <circle cx="76" cy="26" r="12" fill="#b07d62"/>
      <circle cx="24" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="76" cy="26" r="6" fill="#eddcd2"/>
      <circle cx="50" cy="54" r="34" fill="#c38e70"/>
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#eddcd2"/>
      <path d="M34 49 Q40 43 46 49" stroke="#2d1e18" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M54 49 Q60 43 66 49" stroke="#2d1e18" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="60" r="5.5" fill="#ff7a99" opacity="0.8"/>
      <circle cx="72" cy="60" r="5.5" fill="#ff7a99" opacity="0.8"/>
      <ellipse cx="50" cy="58" rx="4" ry="2.8" fill="#2d1e18"/>
      <path d="M47 64 Q50 68 53 64" stroke="#2d1e18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M50 72 C46 66 38 68 40 75 C42 80 50 86 50 86 C50 86 58 80 60 75 C62 68 54 66 50 72 Z" fill="#e8436e"/>
      <circle cx="39" cy="76" r="5" fill="#b07d62"/>
      <circle cx="61" cy="76" r="5" fill="#b07d62"/>
    </svg>`
  },
  emoji: {
    sad: `<div style="font-size: 50px; line-height: 1;">🥺</div>`,
    crying: `<div style="font-size: 50px; line-height: 1;">😭</div>`,
    happy: `<div style="font-size: 50px; line-height: 1;">🥰</div>`
  }
};

let currentCharacterKey = localStorage.getItem('apology_active_character') || 'cat';
let customCharacterImg = localStorage.getItem('apology_custom_character_img') || null;

function renderCharacter(key, state = 'sad') {
  if (key === 'custom' && customCharacterImg) {
    return `<img src="${customCharacterImg}" alt="Karakter Stiker" style="width:72px; height:72px; border-radius:50%; object-fit:cover;">`;
  }
  const char = characters[key] || characters.cat;
  return char[state] || char.sad;
}

function setMainCharacterState(state) {
  const wrapper = document.getElementById('main-character-wrapper');
  if (wrapper) {
    wrapper.innerHTML = renderCharacter(currentCharacterKey, state);
  }
}

function setFinalCharacterState(state) {
  const wrapper = document.getElementById('final-character-wrapper');
  if (wrapper) {
    wrapper.innerHTML = renderCharacter(currentCharacterKey, state);
  }
}

// Initialize character preview tiles
function initStickerModal() {
  const tileCat = document.getElementById('tile-cat');
  const tilePanda = document.getElementById('tile-panda');
  const tileBear = document.getElementById('tile-bear');

  if (tileCat) tileCat.innerHTML = characters.cat.sad;
  if (tilePanda) tilePanda.innerHTML = characters.panda.sad;
  if (tileBear) tileBear.innerHTML = characters.bear.sad;

  const characterContainer = document.getElementById('character-container');
  const stickerModal = document.getElementById('sticker-modal');
  const closeX = document.getElementById('sticker-modal-close-x');
  const applyBtn = document.getElementById('sticker-modal-apply');
  const uploadBtn = document.getElementById('upload-sticker-btn');
  const customStickerInput = document.getElementById('custom-sticker-input');
  const stickerTiles = document.querySelectorAll('.sticker-tile');

  // Mark currently active tile
  stickerTiles.forEach(t => {
    t.classList.toggle('active', t.dataset.character === currentCharacterKey);
    t.addEventListener('click', () => {
      stickerTiles.forEach(o => o.classList.remove('active'));
      t.classList.add('active');
      currentCharacterKey = t.dataset.character;
    });
  });

  if (characterContainer) {
    characterContainer.addEventListener('click', () => {
      if (isLocked) return;
      stickerModal.classList.add('active');
    });
  }

  if (closeX) {
    closeX.addEventListener('click', () => {
      stickerModal.classList.remove('active');
    });
  }

  if (stickerModal) {
    stickerModal.addEventListener('click', (e) => {
      if (e.target === stickerModal) stickerModal.classList.remove('active');
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      localStorage.setItem('apology_active_character', currentCharacterKey);
      setMainCharacterState('sad');
      stickerModal.classList.remove('active');
      showToast('Karakter stiker diterapkan! ✨');
    });
  }

  // Upload custom sticker / GIF
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      customStickerInput.click();
    });
  }

  if (customStickerInput) {
    customStickerInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        customCharacterImg = event.target.result;
        currentCharacterKey = 'custom';
        try {
          localStorage.setItem('apology_custom_character_img', customCharacterImg);
          localStorage.setItem('apology_active_character', 'custom');
        } catch(err) {}

        setMainCharacterState('sad');
        stickerModal.classList.remove('active');
        showToast('Stiker kustom berhasil dipasang! 🌟');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }
}

// Initial render
setMainCharacterState('sad');
initStickerModal();


