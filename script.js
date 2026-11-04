/**
 * ALEXANDER VANE // CINEMATIC PORTFOLIO ENGINE
 * Architecture: Vanilla Modular ES6 JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. INITIALIZE SYSTEM MODULES
  IntroSystem.init();
  AtmosphereEngine.init();
  CursorEngine.init();
  NavigationSystem.init();
  ScrollColorOrchestrator.init();
  ThemeSystem.init();
  RevealEngine.init();
  TiltEngine.init();
  ProjectModalSystem.init();
  CounterEngine.init();
});

/* ===================================================================
   THEME MODE TOGGLE
   =================================================================== */
const ThemeSystem = {
  init() {
    const root = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    const icon = toggle.querySelector('.theme-icon');
    let initialMode = root.dataset.colorMode === 'dark' ? 'dark' : 'light';
    try {
      const savedMode = localStorage.getItem('portfolio-color-mode');
      if (savedMode === 'dark' || savedMode === 'light') initialMode = savedMode;
    } catch {}

    const setMode = (mode, persist = false) => {
      const isDark = mode === 'dark';
      root.dataset.colorMode = isDark ? 'dark' : 'light';
      if (icon) icon.textContent = isDark ? '☀' : '☾';

      const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      toggle.setAttribute('aria-label', 'Dark theme');
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.title = label;

      ScrollColorOrchestrator.applyTheme(document.body.getAttribute('data-theme') || 'hero');

      if (persist) {
        try {
          localStorage.setItem('portfolio-color-mode', isDark ? 'dark' : 'light');
        } catch {}
      }
    };

    toggle.addEventListener('click', () => {
      setMode(root.dataset.colorMode === 'dark' ? 'light' : 'dark', true);
    });
    setMode(initialMode);
  }
};

/* ===================================================================
   MODULE 1: CINEMATIC INTRO SEQUENCE
   =================================================================== */
const IntroSystem = {
  init() {
    const overlay = document.getElementById('intro-overlay');
    const video = document.getElementById('intro-video');
    if (!overlay || !video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const revealSite = () => {
      overlay.classList.add('fade-out');
      // Trigger Hero entrance reveals only after the intro video finishes.
      document.querySelectorAll('#hero .mask-reveal').forEach((el, index) => {
        setTimeout(() => el.classList.add('revealed'), index * 180);
      });
    };

    const startVideo = () => {
      video.play().catch(() => {
        // If autoplay is blocked, the next tap or click starts the intro.
        document.addEventListener('pointerdown', startVideo, { once: true });
      });
    };

    video.addEventListener('ended', revealSite, { once: true });
    video.addEventListener('error', revealSite, { once: true });
    startVideo();
  }
};

/* ===================================================================
   MODULE 2: ATMOSPHERE ENGINE (CANVAS + MOUSE GLOW)
   =================================================================== */
const AtmosphereEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  particleCount: 45,
  mouseX: 0,
  mouseY: 0,

  init() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    const mouseGlow = document.getElementById('mouse-glow');
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (mouseGlow) {
        mouseGlow.style.left = `${e.clientX}px`;
        mouseGlow.style.top = `${e.clientY}px`;
      }
    });
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render floating background particles
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(85, 124, 103, ${p.alpha})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
};

/* ===================================================================
   MODULE 3: CUSTOM CURSOR ENGINE
   =================================================================== */
const CursorEngine = {
  cursor: null,
  follower: null,
  textSpan: null,
  posX: 0, posY: 0,
  targetX: 0, targetY: 0,

  init() {
    this.cursor = document.getElementById('custom-cursor');
    if (!this.cursor) return;

    this.follower = this.cursor.querySelector('.cursor-follower');
    this.textSpan = this.cursor.querySelector('.cursor-text');

    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    });

    this.bindHoverInteractions();
    this.render();
  },

  bindHoverInteractions() {
    // Links & Buttons hover
    document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('hovered'));
    });

    // Project Cards "VIEW" hover
    document.querySelectorAll('[data-cursor="VIEW"]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.cursor.classList.add('view-mode');
        this.textSpan.textContent = 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('view-mode');
      });
    });
  },

  render() {
    this.posX += (this.targetX - this.posX) * 0.15;
    this.posY += (this.targetY - this.posY) * 0.15;

    this.cursor.style.transform = `translate3d(${this.posX}px, ${this.posY}px, 0)`;

    requestAnimationFrame(() => this.render());
  }
};

/* ===================================================================
   MODULE 4: NAVIGATION & MOBILE MENU SYSTEM
   =================================================================== */
const NavigationSystem = {
  header: null,
  toggle: null,
  overlay: null,

  init() {
    this.header = document.querySelector('.site-header');
    this.toggle = document.querySelector('.mobile-toggle');
    this.overlay = document.querySelector('.mobile-nav-overlay');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });

    if (this.toggle && this.overlay) {
      this.toggle.addEventListener('click', () => {
        const isActive = this.overlay.classList.toggle('active');
        this.toggle.setAttribute('aria-expanded', isActive);
      });

      document.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => {
          this.overlay.classList.remove('active');
          this.toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }
};

/* ===================================================================
   MODULE 5: COLOR SCHEME ORCHESTRATOR (SCROLL-BASED SHIFTS)
   =================================================================== */
const ScrollColorOrchestrator = {
  themes: {
    hero: { primary: '#557c67', secondary: '#8d7188', glow: 'rgba(85, 124, 103, 0.18)' },
    about: { primary: '#88708d', secondary: '#c46f56', glow: 'rgba(136, 112, 141, 0.18)' },
    skills: { primary: '#688c67', secondary: '#557c67', glow: 'rgba(104, 140, 103, 0.18)' },
    projects: { primary: '#c47945', secondary: '#bf6257', glow: 'rgba(196, 121, 69, 0.18)' },
    experience: { primary: '#4e8063', secondary: '#688c67', glow: 'rgba(78, 128, 99, 0.18)' },
    contact: { primary: '#a8782e', secondary: '#88708d', glow: 'rgba(168, 120, 46, 0.18)' }
  },

  darkThemes: {
    hero: { primary: '#75aaff', secondary: '#b89cff', glow: 'rgba(117, 170, 255, 0.2)' },
    about: { primary: '#b89cff', secondary: '#ff91b2', glow: 'rgba(184, 156, 255, 0.2)' },
    skills: { primary: '#6fddd2', secondary: '#75aaff', glow: 'rgba(111, 221, 210, 0.18)' },
    projects: { primary: '#ffad70', secondary: '#ff8585', glow: 'rgba(255, 173, 112, 0.18)' },
    experience: { primary: '#66d69e', secondary: '#6fddd2', glow: 'rgba(102, 214, 158, 0.18)' },
    contact: { primary: '#f0c76d', secondary: '#b89cff', glow: 'rgba(240, 199, 109, 0.18)' }
  },

  init() {
    const sections = document.querySelectorAll('section[data-theme]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const themeName = entry.target.getAttribute('data-theme');
          this.applyTheme(themeName);
          this.updateActiveNavLink(entry.target.id);
        }
      });
    }, { threshold: 0.4 });

    sections.forEach((sec) => observer.observe(sec));
  },

  applyTheme(themeName) {
    const root = document.documentElement;
    const palette = root.dataset.colorMode === 'dark' ? this.darkThemes : this.themes;
    const theme = palette[themeName];
    if (!theme) return;

    root.style.setProperty('--current-primary', theme.primary);
    root.style.setProperty('--current-secondary', theme.secondary);
    root.style.setProperty('--current-glow', theme.glow);
    document.body.setAttribute('data-theme', themeName);
  },

  updateActiveNavLink(id) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('href') === '#' + id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};
/* ===================================================================
   MODULE 6: INTERSECTION OBSERVER REVEALS
   =================================================================== */
const RevealEngine = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.mask-reveal').forEach((el) => observer.observe(el));
  }
};

/* ===================================================================
   MODULE 7: 3D GLASS TILT EFFECT
   =================================================================== */
const TiltEngine = {
  init() {
    if (window.innerWidth < 768) return; // Disable on touch mobile

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
      });
    });
  }
};

/* ===================================================================
   MODULE 8: PROJECT DETAIL MODAL SYSTEM
   =================================================================== */
const ProjectModalSystem = {
  modalData: {
    p1: {
      num: "01",
      title: "NEBULA SYNAPSE 3D",
      tech: ["WebGL", "Three.js", "Web Audio API", "GLSL Shaders"],
      bgClass: "p1-bg",
      description: "Nebula Synapse is an interactive browser experience that processes realtime user audio streams into 3D volumetric particle nebulas. Built with custom WebGL shaders to ensure 60fps performance across modern displays.",
      features: [
        "Realtime FFT spectrum audio data extraction",
        "GPU-accelerated particle physics via WebGL transform feedback",
        "Customizable color grading and particle density controls"
      ],
      liveUrl: "#",
      githubUrl: "#"
    },
    p2: {
      num: "02",
      title: "AETHER CHRONO LABS",
      tech: ["JavaScript", "GSAP", "CSS 3D", "Shopify API"],
      bgClass: "p2-bg",
      description: "A luxury watch e-commerce showcase featuring dynamic raytraced lighting simulations, 360-degree interactive product rotation, and seamless page transitions.",
      features: [
        "Photorealistic product view with high-res texture swapping",
        "Fluid page navigation with ZERO full page reloads",
        "Headless Shopify backend integration"
      ],
      liveUrl: "#",
      githubUrl: "#"
    },
    p3: {
      num: "03",
      title: "CYBERNETIC CORE",
      tech: ["React", "D3.js", "Canvas API", "Node.js"],
      bgClass: "p3-bg",
      description: "A futuristic AI neural network monitor designed for complex telemetry visualization. Maps multi-node cluster data into clear topological graphs.",
      features: [
        "Streaming WebSockets data integration",
        "Custom D3 force-directed topological graph renderer",
        "High-contrast dark mode aesthetic optimized for control rooms"
      ],
      liveUrl: "#",
      githubUrl: "#"
    },
    p4: {
      num: "04",
      title: "QUANTUM AUDIO VISUALIZER",
      tech: ["Vanilla JS", "WebAudio", "Canvas 2D", "SVG Animation"],
      bgClass: "p4-bg",
      description: "Mathematical sound generator mapping pitch, harmonics, and timbre directly into generative visual geometry.",
      features: [
        "Pure Canvas 2D math rendering with zero external graphics frameworks",
        "Export generated artwork as high-res vector SVGs",
        "Interactive frequency manipulator pad"
      ],
      liveUrl: "#",
      githubUrl: "#"
    }
  },

  init() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');

    document.querySelectorAll('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-open-modal');
        this.openModal(id);
      });
    });

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
  },

  openModal(id) {
    const data = this.modalData[id];
    if (!data) return;

    const modal = document.getElementById('project-modal');
    const bgMedia = document.getElementById('modal-media-bg');

    document.getElementById('modal-project-num').textContent = data.num;
    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-description').textContent = data.description;

    // Tech stack pills
    const techContainer = document.getElementById('modal-tech-list');
    techContainer.innerHTML = data.tech.map(t => `<span>${t}</span>`).join('');

    // Features list
    const featuresContainer = document.getElementById('modal-features-list');
    featuresContainer.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

    // Media background class
    bgMedia.className = `modal-media-bg ${data.bgClass}`;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
};

/* ===================================================================
   MODULE 9: ANIMATED METRIC COUNTERS
   =================================================================== */
const CounterEngine = {
  init() {
    const counters = document.querySelectorAll('.metric-number');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          this.animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((c) => observer.observe(c));
  },

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    let current = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / target));

    const timer = setInterval(() => {
      current += 1;
      el.textContent = current < 10 ? `0${current}` : current;
      if (current >= target) {
        el.textContent = target < 10 ? `0${target}` : target;
        clearInterval(timer);
      }
    }, stepTime);
  }
};