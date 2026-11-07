/* Advanced Kid-Friendly Global Script Library with Indian English TTS */
(function (global) {
  'use strict';

  // Audio Context & Synth Engine
  var audioCtx = null;
  var soundMuted = false;
  var cachedVoices = [];

  try {
    soundMuted = localStorage.getItem('kidsapp-sound-muted') === 'true';
  } catch (e) {}

  function getAudioContext() {
    if (!audioCtx) {
      var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Load SpeechSynthesis Voices
  function loadVoices() {
    if ('speechSynthesis' in window) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Indian Accent English TTS Function
  function speakText(text, lang) {
    if (soundMuted) return;
    if (!('speechSynthesis' in window)) return;
    if (!text) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      var utterance = new SpeechSynthesisUtterance(text);
      var targetLang = lang || 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.85; // Slightly relaxed pace for kids
      utterance.pitch = 1.15; // Cheerful friendly pitch for kids

      var voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      var inVoice = voices.find(function (v) {
        return (v.lang === 'en-IN' || v.lang === 'en_IN' || v.name.includes('India') || v.name.includes('Indian'));
      });

      if (!inVoice && targetLang.startsWith('en')) {
        inVoice = voices.find(function (v) { return v.lang.startsWith('en'); });
      }

      if (inVoice) {
        utterance.voice = inVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('TTS Error:', e);
    }
  }

  // Smart Speech / Sound Player (Bilingual aware)
  function speakOrPlay(item, defaultAudioFile) {
    var lang = 'or';
    try { lang = localStorage.getItem('mosanga-lang') || 'or'; } catch (e) {}

    if (lang === 'en') {
      var textToSpeak = typeof item === 'string' ? item : (item.nameEn || item.eng || item.char || item.name || '');
      speakText(textToSpeak, 'en-IN');
    } else {
      var audioPath = typeof item === 'object' ? (item.audio || defaultAudioFile) : defaultAudioFile;
      if (audioPath) {
        var audio = new Audio(audioPath);
        audio.play().catch(function () {
          var odiaText = typeof item === 'object' ? (item.nameOr || item.odia || item.char) : item;
          speakText(odiaText, 'hi-IN');
        });
      } else {
        playSound('pop');
      }
    }
  }

  function playSound(type) {
    if (soundMuted) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    var now = ctx.currentTime;

    if (type === 'click' || type === 'pop') {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach(function (freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0.3, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.15);
      });
    } else if (type === 'wrong') {
      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.2);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);
    } else if (type === 'cheer') {
      [440, 554.37, 659.25, 880].forEach(function (f, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.3, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    }
  }

  function toggleSound() {
    soundMuted = !soundMuted;
    if (soundMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      localStorage.setItem('kidsapp-sound-muted', soundMuted ? 'true' : 'false');
    } catch (e) {}
    updateSoundBtn();
    if (!soundMuted) playSound('click');
  }

  function updateSoundBtn() {
    var btns = document.querySelectorAll('.sound-toggle-btn');
    btns.forEach(function (btn) {
      btn.textContent = soundMuted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', soundMuted ? 'Unmute Sound' : 'Mute Sound');
    });
  }

  // Confetti Particle Effect
  function triggerConfetti() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var particles = [];
    var colors = ['#FF6B6B', '#FFC93C', '#3DDC97', '#2EA8FF', '#8E6BFF', '#FF8AC6'];

    for (var i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 6 + 4,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10
      });
    }

    var startTime = Date.now();
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var elapsed = Date.now() - startTime;

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 3000) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    requestAnimationFrame(animate);
  }

  // Header Auto-Injector Helper
  function injectHeader(titleOr, titleEn, rootRelPath) {
    var container = document.getElementById('kidsHeader');
    if (!container) return;

    var root = rootRelPath || '';
    var savedLang = 'or';
    try { savedLang = localStorage.getItem('mosanga-lang') || 'or'; } catch (e) {}

    var html = '' +
      '<header class="app-header">' +
        '<div class="header-left">' +
          '<a href="' + root + 'index.html" class="nav-btn" onclick="KidsApp.playSound(\'click\')">🏠 Home</a>' +
          '<button type="button" class="nav-btn" onclick="KidsApp.playSound(\'click\'); history.back()">⬅️ Back</button>' +
        '</div>' +
        '<h1 class="header-title" id="appHeaderTitle" data-or="' + titleOr + '" data-en="' + titleEn + '">' +
          (savedLang === 'or' ? titleOr : titleEn) +
        '</h1>' +
        '<div class="header-right">' +
          '<button type="button" class="nav-btn sound-toggle-btn" onclick="KidsApp.toggleSound()">' + (soundMuted ? '🔇' : '🔊') + '</button>' +
          '<button type="button" class="nav-btn language-toggle-btn" id="langSwitchBtn" role="switch" onclick="KidsApp.switchLang()"></button>' +
        '</div>' +
      '</header>';

    container.innerHTML = html;
    applyLang(savedLang);
  }

  function applyLang(lang) {
    document.body.className = 'lang-' + lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('mosanga-lang', lang); } catch (e) {}

    var titleEl = document.getElementById('appHeaderTitle');
    if (titleEl) {
      var t = titleEl.getAttribute('data-' + lang);
      if (t) titleEl.textContent = t;
    }

    updateLanguageButton(lang);

    document.querySelectorAll('[data-or][data-en]').forEach(function (el) {
      var txt = el.getAttribute('data-' + lang);
      if (txt) el.textContent = txt;
    });

    var pageTitleEl = titleEl || document.querySelector('h1[data-or][data-en]');
    if (pageTitleEl) document.title = pageTitleEl.textContent;

    document.dispatchEvent(new CustomEvent('kidsapp:languagechange', { detail: { lang: lang } }));
  }

  function updateLanguageButton(lang) {
    var langBtn = document.getElementById('langSwitchBtn');
    if (!langBtn) return;

    var englishSelected = lang === 'en';
    langBtn.innerHTML = '<span class="language-option" lang="or">ଓଡ଼ିଆ</span><span class="language-option" lang="en">English</span>';
    langBtn.dataset.language = lang;
    langBtn.setAttribute('role', 'switch');
    langBtn.setAttribute('aria-checked', englishSelected ? 'true' : 'false');
    langBtn.setAttribute('aria-label', englishSelected ? 'English selected. Switch to Odia.' : 'Odia selected. Switch to English.');
  }

  function switchLang() {
    var current = 'or';
    try { current = localStorage.getItem('mosanga-lang') || 'or'; } catch (e) {}
    var next = current === 'or' ? 'en' : 'or';
    playSound('click');
    applyLang(next);
  }

  // Auto initialize sound feedback on all buttons & clickable elements
  document.addEventListener('click', function (e) {
    var target = e.target.closest('button, .kids-card, .tile, a, .option');
    if (target && !target.classList.contains('no-sound') && !target.classList.contains('language-toggle-btn')) {
      playSound('click');
    }
  }, true);

  // Export public API
  global.KidsApp = {
    playSound: playSound,
    speakText: speakText,
    speakOrPlay: speakOrPlay,
    toggleSound: toggleSound,
    triggerConfetti: triggerConfetti,
    injectHeader: injectHeader,
    applyLang: applyLang,
    switchLang: switchLang
  };

})(window);
