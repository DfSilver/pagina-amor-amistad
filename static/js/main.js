/* ==========================================================================
   main.js
   Logica interactiva: canvas de particulas, corazones al clic, sobre animado,
   lightbox, boton sorpresa con confeti, contador de tiempo y musica de fondo.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================================
     1. CANVAS DE PARTICULAS DE FONDO (corazones, estrellas, globos, cartas)
     ===================================================================== */
  const particlesCanvas = document.getElementById("particles-canvas");
  const pCtx = particlesCanvas.getContext("2d");

  const SIMBOLOS = ["❤️", "💕", "💖", "✨", "⭐", "🎈", "💌"];

  let particulas = [];

  function resizeParticlesCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }

  class Particula {
    constructor() {
      this.reset(true);
    }

    reset(inicial = false) {
      this.simbolo = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
      this.x = Math.random() * particlesCanvas.width;
      this.y = inicial
        ? Math.random() * particlesCanvas.height
        : particlesCanvas.height + Math.random() * 100;
      this.size = 14 + Math.random() * 22;
      this.speed = 0.3 + Math.random() * 0.9;
      this.drift = (Math.random() - 0.5) * 0.6;
      this.opacity = 0.25 + Math.random() * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y -= this.speed;
      this.x += Math.sin(this.angle) * this.drift;
      this.angle += this.spin;

      if (this.y < -60) {
        this.reset(false);
      }
    }

    draw() {
      pCtx.save();
      pCtx.globalAlpha = this.opacity;
      pCtx.font = `${this.size}px sans-serif`;
      pCtx.textAlign = "center";
      pCtx.textBaseline = "middle";
      pCtx.translate(this.x, this.y);
      pCtx.rotate(Math.sin(this.angle) * 0.15);
      pCtx.fillText(this.simbolo, 0, 0);
      pCtx.restore();
    }
  }

  function initParticulas() {
    resizeParticlesCanvas();
    const cantidad = window.innerWidth < 600 ? 22 : 42;
    particulas = Array.from({ length: cantidad }, () => new Particula());
  }

  function animarParticulas() {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particulas.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animarParticulas);
  }

  window.addEventListener("resize", () => {
    resizeParticlesCanvas();
  });

  initParticulas();
  animarParticulas();

  /* =====================================================================
     2. MINI-CORAZONES AL HACER CLIC / TOCAR LA PANTALLA
     ===================================================================== */
  const clickLayer = document.getElementById("click-hearts-layer");
  const CORAZONES_CLICK = ["❤️", "💕", "💗", "💖", "💘"];

  function crearCorazonClick(x, y) {
    const heart = document.createElement("span");
    heart.className = "click-heart";
    heart.textContent = CORAZONES_CLICK[Math.floor(Math.random() * CORAZONES_CLICK.length)];
    heart.style.left = `${x + (Math.random() * 30 - 15)}px`;
    heart.style.top = `${y}px`;
    clickLayer.appendChild(heart);

    setTimeout(() => heart.remove(), 950);
  }

  function crearRafagaCorazones(x, y, cantidad = 6) {
    for (let i = 0; i < cantidad; i++) {
      setTimeout(() => crearCorazonClick(x, y), i * 40);
    }
  }

  document.addEventListener("click", (e) => {
    crearRafagaCorazones(e.clientX, e.clientY, 5);
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (touch) crearRafagaCorazones(touch.clientX, touch.clientY, 5);
    },
    { passive: true }
  );

  /* =====================================================================
     3. SCROLL SUAVE DESDE EL BOTON DEL HERO
     ===================================================================== */
  const btnScrollStory = document.getElementById("btn-scroll-story");
  const galeriaSection = document.getElementById("galeria");

  if (btnScrollStory && galeriaSection) {
    btnScrollStory.addEventListener("click", () => {
      galeriaSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* =====================================================================
     4. TILT 3D EN TARJETAS POLAROID (efecto de inclinacion con el mouse)
     ===================================================================== */
  const tiltCards = document.querySelectorAll(".tilt-card");

  tiltCards.forEach((card) => {
    const inner = card.querySelector(".polaroid-inner");
    const rotBase = card.classList.contains("polaroid-card") &&
      card.matches(":nth-child(odd)") ? -2 : 2;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 10;
      const rotateX = ((centerY - y) / centerY) * 10;

      inner.style.transform =
        `rotate(${rotBase}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      inner.style.transform = `rotate(${rotBase}deg)`;
    });
  });

  /* =====================================================================
     5. LIGHTBOX MODAL PARA LA GALERIA
     ===================================================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const polaroidCards = document.querySelectorAll(".polaroid-card");

  let indiceActual = 0;
  const fotosData = Array.from(polaroidCards).map((card) => {
    const img = card.querySelector("img");
    const caption = card.querySelector(".polaroid-caption");
    return { src: img.src, alt: img.alt, caption: caption ? caption.textContent : "" };
  });

  function abrirLightbox(indice) {
    if (!fotosData.length) return;
    indiceActual = indice;
    actualizarLightbox();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function actualizarLightbox() {
    const foto = fotosData[indiceActual];
    lightboxImg.src = foto.src;
    lightboxImg.alt = foto.alt;
    lightboxCaption.textContent = foto.caption;
  }

  function cerrarLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  polaroidCards.forEach((card, idx) => {
    card.addEventListener("click", () => abrirLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", cerrarLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      indiceActual = (indiceActual - 1 + fotosData.length) % fotosData.length;
      actualizarLightbox();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      indiceActual = (indiceActual + 1) % fotosData.length;
      actualizarLightbox();
    });
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) cerrarLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowLeft" && lightboxPrev) lightboxPrev.click();
    if (e.key === "ArrowRight" && lightboxNext) lightboxNext.click();
  });

  /* =====================================================================
     6. SOBRE ANIMADO + CARTA DE AMOR (carta desacoplada, vive en <body>)
     ===================================================================== */
  const envelope = document.getElementById("envelope");
  const letterCard = document.getElementById("letter-card");
  const letterCardInner = document.getElementById("letter-card-inner");
  const letterClose = document.getElementById("letter-close");
  const envelopeHint = document.getElementById("envelope-hint");
  const letterOverlay = document.getElementById("letter-overlay");

  function abrirSobre() {
    if (envelope) envelope.classList.add("open");
    if (letterCard) letterCard.classList.add("open");
    if (envelopeHint) envelopeHint.style.opacity = "0";
    if (letterOverlay) letterOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    if (letterCardInner) {
      letterCardInner.scrollTop = 0;
      // Forzar foco en el contenedor para que el teclado (flechas, Page Down)
      // tambien pueda desplazar el texto de la carta.
      letterCardInner.setAttribute("tabindex", "0");
      setTimeout(() => letterCardInner.focus({ preventScroll: true }), 350);
    }
  }

  function cerrarSobre() {
    if (envelope) envelope.classList.remove("open");
    if (letterCard) letterCard.classList.remove("open");
    if (envelopeHint) envelopeHint.style.opacity = "1";
    if (letterOverlay) letterOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (envelope) {
    envelope.addEventListener("click", () => {
      if (envelope.classList.contains("open")) return;
      abrirSobre();
    });

    envelope.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!envelope.classList.contains("open")) abrirSobre();
      }
    });
  }

  if (letterClose) {
    letterClose.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarSobre();
    });
  }

  if (letterOverlay) {
    letterOverlay.addEventListener("click", () => {
      cerrarSobre();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && letterCard && letterCard.classList.contains("open")) {
      cerrarSobre();
    }
  });

  /* Evita que el gesto de scroll dentro de la carta "se fugue" y mueva la
     pagina de fondo al llegar al principio o al final del texto. */
  if (letterCardInner) {
    letterCardInner.addEventListener(
      "wheel",
      (e) => {
        const { scrollTop, scrollHeight, clientHeight } = letterCardInner;
        const atTop = scrollTop <= 0;
        const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
        e.stopPropagation();
      },
      { passive: false }
    );

    letterCardInner.addEventListener(
      "touchmove",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  /* =====================================================================
     7. BOTON SORPRESA + LLUVIA DE CONFETI DE CORAZONES
     ===================================================================== */
  const btnSurprise = document.getElementById("btn-surprise");
  const surpriseMessage = document.getElementById("surprise-message");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const cCtx = confettiCanvas.getContext("2d");

  let confetiActivo = false;
  let piezasConfeti = [];

  const EMOJIS_CONFETI = ["❤️", "💖", "💕", "💗", "💘", "✨"];

  class PiezaConfeti {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = -20 - Math.random() * confettiCanvas.height * 0.5;
      this.size = 16 + Math.random() * 18;
      this.speedY = 2 + Math.random() * 4;
      this.speedX = (Math.random() - 0.5) * 3;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.emoji = EMOJIS_CONFETI[Math.floor(Math.random() * EMOJIS_CONFETI.length)];
      this.opacity = 1;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > confettiCanvas.height + 40) {
        this.reset();
        this.y = -20;
      }
    }

    draw() {
      cCtx.save();
      cCtx.globalAlpha = this.opacity;
      cCtx.translate(this.x, this.y);
      cCtx.rotate((this.rotation * Math.PI) / 180);
      cCtx.font = `${this.size}px sans-serif`;
      cCtx.textAlign = "center";
      cCtx.textBaseline = "middle";
      cCtx.fillText(this.emoji, 0, 0);
      cCtx.restore();
    }
  }

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function iniciarConfeti(duracionMs = 4500) {
    resizeConfettiCanvas();
    confettiCanvas.style.display = "block";
    piezasConfeti = Array.from({ length: 90 }, () => new PiezaConfeti());
    confetiActivo = true;

    function loop() {
      if (!confetiActivo) return;
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      piezasConfeti.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(loop);
    }
    loop();

    setTimeout(() => {
      confetiActivo = false;
      confettiCanvas.style.display = "none";
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }, duracionMs);
  }

  if (btnSurprise) {
    btnSurprise.addEventListener("click", () => {
      iniciarConfeti();
      if (surpriseMessage) surpriseMessage.classList.add("visible");
      crearRafagaCorazones(
        btnSurprise.getBoundingClientRect().left + btnSurprise.offsetWidth / 2,
        btnSurprise.getBoundingClientRect().top,
        14
      );
    });
  }

  window.addEventListener("resize", () => {
    if (confetiActivo) resizeConfettiCanvas();
  });

  /* =====================================================================
     8. CONTADOR DE TIEMPO JUNTOS
     ===================================================================== */
  const counterGrid = document.getElementById("counter-grid");

  if (counterGrid) {
    const fechaInicioStr = counterGrid.dataset.start;
    const fechaInicio = new Date(fechaInicioStr.replace(" ", "T"));

    const elDias = document.getElementById("count-days");
    const elHoras = document.getElementById("count-hours");
    const elMinutos = document.getElementById("count-minutes");
    const elSegundos = document.getElementById("count-seconds");

    function actualizarContador() {
      const ahora = new Date();
      let diffMs = ahora - fechaInicio;
      if (diffMs < 0) diffMs = 0;

      const segTotales = Math.floor(diffMs / 1000);
      const dias = Math.floor(segTotales / 86400);
      const horas = Math.floor((segTotales % 86400) / 3600);
      const minutos = Math.floor((segTotales % 3600) / 60);
      const segundos = segTotales % 60;

      if (elDias) elDias.textContent = dias.toLocaleString("es-ES");
      if (elHoras) elHoras.textContent = String(horas).padStart(2, "0");
      if (elMinutos) elMinutos.textContent = String(minutos).padStart(2, "0");
      if (elSegundos) elSegundos.textContent = String(segundos).padStart(2, "0");
    }

    actualizarContador();
    setInterval(actualizarContador, 1000);
  }

  /* =====================================================================
     9. MUSICA DE FONDO CON BOTON DE PLAY/PAUSA DISCRETO
     ===================================================================== */
  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  if (musicToggle && bgMusic) {
    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {
          console.warn("No se pudo reproducir el audio. Verifica que exista el archivo en static/audio/musica-fondo.mp3");
        });
        musicToggle.classList.add("playing");
        musicToggle.querySelector(".music-icon").textContent = "🎶";
      } else {
        bgMusic.pause();
        musicToggle.classList.remove("playing");
        musicToggle.querySelector(".music-icon").textContent = "🎵";
      }
    });
  }

});
