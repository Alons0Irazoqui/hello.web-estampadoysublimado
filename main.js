/* ============================================================
   DESPIERTA — main.js  v3
   Vanilla JS únicamente — sin librerías externas
============================================================ */
'use strict';

/* ============================================================
   1. LOADER
============================================================ */
(function initLoader() {
  const loader = document.getElementById('siteLoader');
  const bar    = document.getElementById('loaderBar');
  if (!loader) return;

  document.body.style.overflow = 'hidden';
  let progress = 0;

  const stages = [
    { target: 40,  delay: 0,   speed: 16 },
    { target: 70,  delay: 280, speed: 10 },
    { target: 90,  delay: 600, speed: 5  },
    { target: 100, delay: 200, speed: 12 },
  ];

  function runStage(i) {
    if (i >= stages.length) return;
    const s = stages[i];
    setTimeout(() => {
      const iv = setInterval(() => {
        if (progress >= s.target) {
          clearInterval(iv);
          if (s.target === 100) setTimeout(hideLoader, 280);
          else runStage(i + 1);
          return;
        }
        progress = Math.min(progress + 1, s.target);
        if (bar) bar.style.width = progress + '%';
      }, s.speed);
    }, s.delay);
  }

  function hideLoader() {
    loader.classList.add('loader-hidden');
    document.body.style.overflow = '';
    setTimeout(startHeroAnimations, 100);
  }

  if (document.readyState === 'complete') {
    runStage(0);
  } else {
    window.addEventListener('load', () => runStage(0), { once: true });
    setTimeout(() => { if (progress < 100) { progress = 100; if(bar) bar.style.width = '100%'; setTimeout(hideLoader, 200); } }, 4000);
  }
})();


/* ============================================================
   2. CANVAS PARTÍCULAS — StarField dorado
============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], raf;
  const N = window.innerWidth < 768 ? 50 : 100;

  function resize() {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function mkPt() {
    const size = Math.random() * 2 + 0.3;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size, baseSize: size,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.28 + 0.06),
      op: Math.random() * 0.5 + 0.05,
      td: Math.random() * 0.018 + 0.004,
      tdir: Math.random() > .5 ? 1 : -1,
      gold: Math.random() > 0.4,
    };
  }

  function init() { pts = []; for(let i=0;i<N;i++) pts.push(mkPt()); }

  function draw(p) {
    ctx.save();
    ctx.globalAlpha = p.op;
    ctx.shadowBlur  = p.size * 4;
    ctx.shadowColor = p.gold ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.gold ? `rgba(201,168,76,${p.op})` : `rgba(245,240,232,${p.op*.5})`;
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.op += p.td * p.tdir;
      if (p.op >= 0.65) p.tdir = -1;
      if (p.op <= 0.04) p.tdir =  1;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; p.op = 0.04; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W+10) p.x = -10;
      draw(p);
    });
    raf = requestAnimationFrame(tick);
  }

  function start() { resize(); init(); tick(); }
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); start(); }, 200); }, { passive:true });
  start();
})();


/* ============================================================
   2b. CANVAS PUNTOS DE COLORES DE MARCA — Orbes flotantes premium
   Colores: gold, silver, bronze, crimson, bone
============================================================ */
(function initColorDots() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [], raf;

  /* Paleta de colores de marca — violeta, verde neón, magenta y dorado,
     representando la variedad de tintas DTF/sublimación/vinil */
  const COLORS = [
    { r:157, g:92,  b:224, name:'violet'  },  /* violeta (primario) */
    { r:185, g:140, b:238, name:'violet2' },  /* violeta claro */
    { r:74,  g:222, b:128, name:'neon'    },  /* verde neón */
    { r:226, g:63,  b:115, name:'magenta' },  /* magenta */
    { r:246, g:243, b:238, name:'bone'    },  /* hueso */
    { r:227, g:166, b:61,  name:'gold'    },  /* dorado (acento) */
  ];

  const N = window.innerWidth < 768 ? 18 : 36;

  function resize() {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function mkDot() {
    const col  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.random() * 3.5 + 1.2;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.4 + 0.1;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size,
      col,
      op:    Math.random() * 0.45 + 0.05,
      td:    Math.random() * 0.012 + 0.003,
      tdir:  Math.random() > .5 ? 1 : -1,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed * 0.7 - 0.15, /* deriva suave hacia arriba */
      /* Orbe: tamaño del halo */
      haloR: size * (Math.random() * 5 + 4),
    };
  }

  function init() { dots = []; for(let i=0;i<N;i++) dots.push(mkDot()); }

  function drawDot(d) {
    ctx.save();

    /* Halo exterior difuso */
    const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.haloR);
    grd.addColorStop(0,   `rgba(${d.col.r},${d.col.g},${d.col.b},${d.op * 0.55})`);
    grd.addColorStop(0.4, `rgba(${d.col.r},${d.col.g},${d.col.b},${d.op * 0.18})`);
    grd.addColorStop(1,   `rgba(${d.col.r},${d.col.g},${d.col.b},0)`);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.haloR, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    /* Núcleo del punto */
    ctx.shadowBlur  = d.size * 6;
    ctx.shadowColor = `rgba(${d.col.r},${d.col.g},${d.col.b},0.9)`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${d.col.r},${d.col.g},${d.col.b},${d.op})`;
    ctx.fill();

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      d.op += d.td * d.tdir;
      if (d.op >= 0.5)  d.tdir = -1;
      if (d.op <= 0.03) d.tdir =  1;

      /* Rebote suave en bordes */
      if (d.x < -d.haloR)   d.x = W + d.haloR;
      if (d.x > W + d.haloR) d.x = -d.haloR;
      if (d.y < -d.haloR)   d.y = H + d.haloR;
      if (d.y > H + d.haloR) d.y = -d.haloR;

      drawDot(d);
    });
    raf = requestAnimationFrame(tick);
  }

  function start() { resize(); init(); tick(); }
  let rt2;
  window.addEventListener('resize', () => {
    clearTimeout(rt2);
    rt2 = setTimeout(() => { cancelAnimationFrame(raf); start(); }, 200);
  }, { passive:true });
  start();
})();


/* ============================================================
   3. HERO ANIMATIONS — Entrada secuencial
============================================================ */
/* ============================================================
   HERO ENTRANCE — Premium minimalista estilo Apple/Stripe
   Timing: lento, easing suave, sin rebotes
   Secuencia total: ~3.2 segundos
============================================================ */

function startHeroAnimations() {
  /* Preparar DOM del título antes de activar las transiciones */
  splitTitleIntoLines();

  /* Una sola clase en body activa TODAS las transiciones CSS.
     El stagger lo maneja el CSS con transition-delay por elemento.
     Pequeño frame de pausa para que el browser pinte el estado inicial. */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('hero-ready');
    });
  });

  /* Navbar */
  setTimeout(() => document.getElementById('navbar')?.classList.add('nav-visible'), 200);

  /* Contadores — después de que los stats hayan aparecido (delay 1.28s + 0.9s transición) */
  setTimeout(runCounters, 2300);
}

/* Divide el título en 3 líneas semánticas perfectamente balanceadas.
   Control manual = sin sorpresas en ningún viewport.                 */
function splitTitleIntoLines() {
  const title = document.getElementById('heroTitle');
  if (!title || title.dataset.split) return;
  title.dataset.split = '1';

  /* 3 líneas: equilibradas, sin cortes raros */
  const textLines = [
    'Estampamos tu idea',
    'con colores que sí resaltan,',
  ];
  const emText = 'y que aguantan lavada tras lavada.';

  title.innerHTML = '';

  function makeLine(content, isEm) {
    const wrap  = document.createElement('span');
    wrap.className = 'hero-title-line';
    const inner = document.createElement('span');
    inner.className = 'hero-title-line-inner';
    if (isEm) {
      const em = document.createElement('em');
      em.className = 'hero-em';
      em.textContent = content;
      inner.appendChild(em);
    } else {
      inner.textContent = content;
    }
    wrap.appendChild(inner);
    return wrap;
  }

  textLines.forEach(t => title.appendChild(makeLine(t, false)));
  title.appendChild(makeLine(emText, true));
}

function showEl(sel, delay) {
  setTimeout(() => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('is-visible');
  }, delay);
}


/* ============================================================
   4. HERO PARALLAX — Imagen de fondo reacciona al cursor
============================================================ */
(function initHeroParallax() {
  const hero  = document.getElementById('inicio');
  const bgImg = document.querySelector('.hero-bg-img');
  if (!hero || !bgImg) return;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
  }, { passive:true });

  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  const waterDrop = document.getElementById('waterDrop');

  function tick() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    const mx = cx * 18, my = cy * 12;
    bgImg.style.transform = `scale(1.08) translate(${mx}px, ${my}px)`;

    /* Gota de agua: parallax más suave y en dirección opuesta para efecto profundidad */
    if (waterDrop) {
      const dx = cx * -8, dy = cy * -6;
      waterDrop.style.transform = `translateY(-52%) translate(${dx}px, ${dy}px)`;
    }

    raf = requestAnimationFrame(tick);
  }
  tick();

  /* Parallax de scroll suave en la imagen */
  window.addEventListener('scroll', () => {
    if (window.scrollY > hero.offsetHeight) return;
    const pct = window.scrollY / hero.offsetHeight;
    bgImg.style.transform = `scale(1.08) translateY(${pct * 60}px)`;
  }, { passive:true });
})();


/* ============================================================
   5. CONTADOR DE ESTADÍSTICAS
============================================================ */
function runCounters() {
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const target = parseInt(el.dataset.countTo, 10);
    const pre    = el.dataset.prefix || '';
    const suf    = el.dataset.suffix || '';
    const dur    = 1500;
    const t0     = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function step(now) {
      const prog = Math.min((now - t0) / dur, 1);
      el.textContent = pre + Math.round(easeOut(prog) * target) + suf;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}


/* ============================================================
   6. BOTONES MAGNÉTICOS
============================================================ */
(function initMagnet() {
  document.querySelectorAll('.btn-mag').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.22;
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.3s';
      btn.style.transform  = `translate(${dx}px,${dy}px) scale(1.03)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s';
      btn.style.transform  = 'translate(0,0) scale(1)';
    });
  });
})();


/* ============================================================
   7. NAVBAR
============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const ham    = document.getElementById('hamburger');
  const mob    = document.getElementById('mobileMenu');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive:true });

  ham?.addEventListener('click', () => {
    ham.classList.toggle('active');
    mob.classList.toggle('open');
    document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
  });

  /* Active section highlight */
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('nav-active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -80px 0px' });
  sections.forEach(s => obs.observe(s));
})();

function closeMobileMenu() {
  document.getElementById('hamburger')?.classList.remove('active');
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.body.style.overflow = '';
}


/* ============================================================
   8. SCROLL REVEAL GENERAL
============================================================ */
(function initReveal() {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);

      /* Stagger para grids */
      const grid = entry.target.closest(
        '.identify-grid,.products-grid,.ritual-steps,.business-grid,.testimonials-grid'
      );
      if (grid && !grid.dataset.done) {
        grid.dataset.done = '1';
        grid.querySelectorAll('.reveal-up').forEach((el, i) => {
          setTimeout(() => el.classList.add('revealed'), i * 90);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el => obs.observe(el));
})();


/* ============================================================
   9. PRODUCT SECTIONS — Reveal imagen + texto
============================================================ */
(function initProductReveal() {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const section = entry.target;
      const img  = section.querySelector('.prod-reveal-img');
      const text = section.querySelector('.prod-reveal-text');

      if (img)  { setTimeout(() => img.classList.add('ps-shown'),  0);   }
      if (text) { setTimeout(() => text.classList.add('ps-shown'), 200); }

      observer.unobserve(section);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.product-section').forEach(s => obs.observe(s));
})();


/* ============================================================
   10. PRODUCT IMAGE — Tilt 3D al mover ratón sobre imagen
============================================================ */
(function initProductTilt() {
  document.querySelectorAll('.ps-img-wrap').forEach(wrap => {
    const img = wrap.querySelector('.ps-img');
    if (!img) return;

    wrap.addEventListener('mousemove', e => {
      const r  = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5; /* -0.5 a 0.5 */
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      const rx = -ny * 12; /* giro X */
      const ry =  nx * 12; /* giro Y */
      img.style.transition = 'transform 0.1s ease';
      img.style.transform  = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04) translateY(-8px)`;
    });

    wrap.addEventListener('mouseleave', () => {
      img.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      img.style.transform  = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)';
    });
  });
})();


/* ============================================================
   11. PILLAR CARDS ENTRANCE
============================================================ */
(function initPillars() {
  const col = document.querySelector('.pillars-col');
  if (!col) return;
  const cards = col.querySelectorAll('.pillar-card');
  cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateX(40px)'; });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
          c.style.opacity = '1'; c.style.transform = 'translateX(0)';
        }, i * 130);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  obs.observe(col);
})();


/* ============================================================
   12. LEARN CARDS ENTRANCE
============================================================ */
(function initLearnCards() {
  const lc = document.querySelector('.learn-cards');
  if (!lc) return;
  const cards = lc.querySelectorAll('.learn-card');
  cards.forEach(c => { c.style.opacity='0'; c.style.transform='translateY(28px)'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cards.forEach((c, i) => setTimeout(() => {
        c.style.transition = 'opacity 0.55s var(--ease-out), transform 0.55s var(--ease-out)';
        c.style.opacity='1'; c.style.transform='translateY(0)';
      }, i * 140));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  obs.observe(lc);
})();


/* ============================================================
   13. TESTIMONIALS ENTRANCE
============================================================ */
(function initTestis() {
  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.testi-card');
  cards.forEach(c => { c.style.opacity='0'; c.style.transform='translateY(50px) scale(0.97)'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cards.forEach((c, i) => setTimeout(() => {
        c.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)';
        c.style.opacity='1'; c.style.transform='translateY(0) scale(1)';
      }, i * 160));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  obs.observe(grid);
})();


/* ============================================================
   14. BIZ CARDS ENTRANCE
============================================================ */
(function initBiz() {
  const grid = document.querySelector('.business-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.biz-card');
  cards.forEach(c => { c.style.opacity='0'; c.style.transform='translateY(36px)'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cards.forEach((c, i) => setTimeout(() => {
        c.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out), border-color 0.3s, box-shadow 0.3s';
        c.style.opacity='1'; c.style.transform='translateY(0)';
      }, i * 90));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  obs.observe(grid);
})();


/* ============================================================
   15. PRODUCTS GRID ENTRANCE
============================================================ */
(function initProducts() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach(c => { c.style.opacity='0'; c.style.transform='translateY(55px)'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cards.forEach((c, i) => setTimeout(() => {
        c.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out), border-color 0.3s, box-shadow 0.4s';
        c.style.opacity='1'; c.style.transform='translateY(0)';
      }, i * 120));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  obs.observe(grid);
})();


/* ============================================================
   16. CURSOR GLOW — solo desktop
============================================================ */
(function initCursorGlow() {
  if (window.innerWidth <= 1024) return;
  const g = document.createElement('div');
  g.style.cssText = `position:fixed;pointer-events:none;z-index:0;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left 0.12s ease,top 0.12s ease,opacity 0.4s;will-change:left,top;opacity:0;`;
  document.body.appendChild(g);
  let vis = false;
  document.addEventListener('mousemove', e => {
    g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px';
    if (!vis) { g.style.opacity='1'; vis=true; }
  }, { passive:true });
  document.addEventListener('mouseleave', () => { g.style.opacity='0'; vis=false; });
})();


/* ============================================================
   17. FORM SUBMIT — Redirige a WhatsApp con los datos del formulario
============================================================ */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (!btn) return;

  /* Recoger campos */
  const nombre   = (document.getElementById('fNombre')?.value   || '').trim();
  const telefono = (document.getElementById('fTelefono')?.value || '').trim();
  const interes  = (document.getElementById('fInteres')?.value  || '').trim();
  const mensaje  = (document.getElementById('fMensaje')?.value  || '').trim();

  /* Validar nombre mínimo */
  if (!nombre) {
    document.getElementById('fNombre')?.focus();
    return;
  }

  /* Construir mensaje para WhatsApp */
  let waText = `Hola, me comunico desde la página web de ANGROS.\n\n`;
  waText += `*Nombre:* ${nombre}\n`;
  if (telefono) waText += `*Teléfono:* ${telefono}\n`;
  if (interes)  waText += `*Me interesa:* ${interes}\n`;
  if (mensaje)  waText += `*Mensaje:* ${mensaje}\n`;
  waText += `\n¡Quedo en espera de su respuesta!`;

  /* Animación de carga en el botón */
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" style="animation:fspin 0.7s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span>Abriendo WhatsApp...</span>`;

  if (!document.getElementById('fspinStyle')) {
    const s = document.createElement('style');
    s.id = 'fspinStyle';
    s.textContent = '@keyframes fspin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  /* Pequeña pausa visual, luego abrir WA */
  setTimeout(() => {
    const waURL = `https://wa.me/521234567890?text=${encodeURIComponent(waText)}`;
    window.open(waURL, '_blank', 'noopener,noreferrer');

    /* Confirmación visual */
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>¡WhatsApp abierto!</span>`;
    btn.style.background = 'linear-gradient(135deg,#25D366,#1ebe5a)';
    btn.style.transform  = 'scale(1.03)';

    setTimeout(() => {
      btn.style.transform = '';
      setTimeout(() => {
        btn.innerHTML    = origHTML;
        btn.style.background = '';
        btn.disabled     = false;
        e.target.reset();
      }, 2500);
    }, 300);
  }, 900);
}
