document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // CANVAS 2D PARTÍCULAS (Ligero, 0 lag)
    // =============================================
    const pCanvas = document.getElementById('particles-canvas');
    const pCtx = pCanvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    const PARTICLE_COUNT = 100;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.5,
            o: Math.random() * 0.4 + 0.1
        });
    }

    function drawParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = pCanvas.width;
            if (p.x > pCanvas.width) p.x = 0;
            if (p.y < 0) p.y = pCanvas.height;
            if (p.y > pCanvas.height) p.y = 0;

            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(0, 243, 255, ${p.o})`;
            pCtx.fill();

            // Conexiones al mouse
            const dxm = p.x - mouseX, dym = p.y - mouseY;
            const distM = Math.sqrt(dxm * dxm + dym * dym);
            if (distM < 180) {
                pCtx.beginPath();
                pCtx.moveTo(p.x, p.y);
                pCtx.lineTo(mouseX, mouseY);
                pCtx.strokeStyle = `rgba(255, 45, 117, ${0.12 * (1 - distM / 180)})`;
                pCtx.stroke();
            }

            // Conexiones entre partículas cercanas (limitado para rendimiento)
            if (i < 50) {
                for (let j = i + 1; j < Math.min(i + 10, particles.length); j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x, dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        pCtx.beginPath();
                        pCtx.moveTo(p.x, p.y);
                        pCtx.lineTo(p2.x, p2.y);
                        pCtx.strokeStyle = `rgba(0, 243, 255, ${0.06 * (1 - dist / 130)})`;
                        pCtx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    drawParticles();


    // =============================================
    // DEFINICIÓN DE ESCENAS
    // =============================================
    const scenes = [
        'scene-boot',       // 0
        'scene-blueprint',  // 1
        'scene-topo',       // 2
        'scene-suelos',     // 3
        'scene-cimientos',  // 4
        'scene-pilares',    // 5
        'scene-materiales', // 6
        'scene-fachada',    // 7
        'scene-interior',   // 8
        'scene-render',     // 9  (Foto + Frases)
        'scene-beso',       // 10 (El Primer Sello)
        'scene-llaves',     // 11
        'scene-question',   // 12
        'scene-final'       // 13
    ];
    let currentScene = 0;
    let isTransitioning = false;

    // =============================================
    // BARRA DE PROGRESO
    // =============================================
    const progressDots = document.getElementById('progress-dots');
    const progressLabel = document.getElementById('progress-label');
    const totalPhases = scenes.length;

    // Crear dots
    for (let i = 0; i < totalPhases; i++) {
        const dot = document.createElement('div');
        dot.className = 'p-dot';
        if (i === 0) dot.classList.add('active');
        progressDots.appendChild(dot);
    }

    function updateProgress(index) {
        const dots = progressDots.querySelectorAll('.p-dot');
        dots.forEach((d, i) => {
            d.classList.remove('active', 'done');
            if (i < index) d.classList.add('done');
            if (i === index) d.classList.add('active');
        });
        progressLabel.textContent = `FASE ${index} / ${totalPhases - 1}`;
    }

    // =============================================
    // TRANSICIÓN ENTRE ESCENAS (SIN FLASH/PARPADEO)
    // =============================================
    function transitionTo(targetIndex) {
        if (targetIndex < 0 || targetIndex >= scenes.length || isTransitioning) return;
        isTransitioning = true;

        const currentEl = document.getElementById(scenes[currentScene]);
        const targetEl = document.getElementById(scenes[targetIndex]);

        // Mostrar progreso a partir de escena 1
        if (targetIndex >= 1) {
            document.getElementById('progress-global').classList.add('visible');
        }

        // 1. PREPARAR la escena destino: asegurar que todos los .anim-el estén en opacity 0
        const animEls = targetEl.querySelectorAll('.anim-el');
        animEls.forEach(el => {
            gsap.set(el, { opacity: 0, y: 0 }); // Reset limpio
        });

        // 2. Salida de escena actual
        gsap.to(currentEl, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                currentEl.classList.remove('active');
                currentEl.style.visibility = 'hidden';
                currentEl.style.opacity = '0';

                // 3. Entrada de nueva escena (el contenedor aparece, pero los hijos están en opacity:0)
                targetEl.style.visibility = 'visible';
                targetEl.classList.add('active');
                gsap.set(targetEl, { opacity: 1 }); // Container visible instantáneamente

                currentScene = targetIndex;
                updateProgress(targetIndex);

                // 4. Ahora animar los hijos según la escena
                onSceneEnter(targetIndex);
            }
        });
    }

    // =============================================
    // ANIMACIONES POR ESCENA
    // =============================================
    function onSceneEnter(index) {
        const sceneId = scenes[index];
        
        switch(sceneId) {
            case 'scene-blueprint':
                playBlueprintAnim();
                break;
            case 'scene-topo':
                playContentScene('scene-topo', 'btn-topo');
                break;
            case 'scene-suelos':
                playContentScene('scene-suelos', 'btn-suelos', () => animateSoilLayers());
                break;
            case 'scene-cimientos':
                playContentScene('scene-cimientos', 'btn-cimientos', () => animateCimientos());
                break;
            case 'scene-pilares':
                playPilares();
                break;
            case 'scene-materiales':
                playContentScene('scene-materiales', 'btn-materiales', () => animateMaterials());
                break;
            case 'scene-fachada':
                playContentScene('scene-fachada', 'btn-fachada');
                break;
            case 'scene-interior':
                playContentScene('scene-interior', 'btn-interior', () => animateInterior());
                break;
            case 'scene-render':
                playRenderScene();
                break;
            case 'scene-beso':
                playContentScene('scene-beso', 'btn-beso', () => animateKiss());
                break;
            case 'scene-llaves':
                playContentScene('scene-llaves', 'btn-llaves');
                break;
            case 'scene-question':
                playQuestion();
                break;
            case 'scene-final':
                playFinal();
                break;
        }
    }

    // =============================================
    // ANIMACIÓN GENÉRICA PARA ESCENAS DE TEXTO
    // =============================================
    function playContentScene(sceneId, btnId, extraCallback) {
        const scene = document.getElementById(sceneId);
        const title = scene.querySelector('.scene-title');
        const sep = scene.querySelector('.separator');
        const text = scene.querySelector('.scene-text');
        const btn = document.getElementById(btnId);
        
        // Buscar elemento de animación extra
        const extraAnimEl = scene.querySelector('.topo-animation, .soil-layers, .cimientos-anim, .materials-grid, .facade-hearts, .interior-icons, .key-anim');

        // Preparar estados iniciales ANTES de animar
        gsap.set(title, { opacity: 0, y: -20 });
        gsap.set(sep, { opacity: 0, scaleX: 0 });
        gsap.set(text, { opacity: 0, y: 20 });
        gsap.set(btn, { opacity: 0, y: 15 });
        if (extraAnimEl) gsap.set(extraAnimEl, { opacity: 0, y: 15 });

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        tl.to(title, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
          .to(sep, { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" }, "-=0.3")
          .to(text, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.2");

        if (extraAnimEl) {
            tl.to(extraAnimEl, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");
        }

        if (extraCallback) {
            tl.call(extraCallback, null, ">-0.1");
        }

        tl.to(btn, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "+=0.2");
    }

    // =============================================
    // ESCENA 0: TERMINAL BOOT
    // =============================================
    const termOutput = document.getElementById('term-output');
    const bootProgress = document.getElementById('boot-progress');
    const bootLines = [
        "INICIALIZANDO SISTEMA T.E.R.N.U.R.I.T.A...",
        "CONECTANDO SERVIDORES NEURALES DEL CORAZÓN...",
        "CARGANDO MATRIZ DE RECUERDOS COMPARTIDOS...",
        "ANÁLISIS ESTRUCTURAL DEL CORAZÓN: ████████ 100%",
        "CALCULANDO RESISTENCIA DE SENTIMIENTOS...",
        "EJECUTANDO ALGORITMO DE COMPATIBILIDAD...",
        "RESULTADO: 100% MATCH PERFECTO ❤",
        "RENDERIZANDO ENTORNO ARQUITECTÓNICO...",
        "BYPASS DE SEGURIDAD EMOCIONAL: [ACEPTADO]",
        "SISTEMA LISTO. ESPERANDO AUTORIZACIÓN MANUAL."
    ];
    let bLine = 0;

    function bootSequence() {
        if (bLine < bootLines.length) {
            const span = document.createElement('span');
            span.style.display = 'block';
            span.textContent = `> ${bootLines[bLine]}`;
            gsap.set(span, { opacity: 0 });
            termOutput.appendChild(span);
            gsap.to(span, { opacity: 1, duration: 0.3 });

            bootProgress.style.width = `${((bLine + 1) / bootLines.length) * 100}%`;
            bLine++;
            setTimeout(bootSequence, 300 + Math.random() * 200);
        } else {
            const done = document.createElement('span');
            done.style.display = 'block';
            done.style.color = '#28c840';
            done.style.textShadow = '0 0 10px #28c840';
            done.style.marginTop = '10px';
            done.textContent = '>> TODOS LOS SISTEMAS OPERACIONALES <<';
            termOutput.appendChild(done);
            gsap.from(done, { opacity: 0, duration: 0.5 });

            const btnBoot = document.getElementById('btn-boot');
            gsap.to(btnBoot, { opacity: 1, pointerEvents: 'auto', duration: 0.6, delay: 0.3, ease: "back.out(2)" });
        }
    }
    setTimeout(bootSequence, 600);

    document.getElementById('btn-boot').addEventListener('click', () => {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.volume = 0.5; // Un volumen suave
            bgMusic.play().catch(e => console.log("Audio autoplay bloquedo, requiere más interacción."));
        }
        transitionTo(1);
    });

    // =============================================
    // ESCENA 1: BLUEPRINT SVG
    // =============================================
    function playBlueprintAnim() {
        const svgLines = document.querySelectorAll('#house-svg .draw-line');
        const btnBp = document.getElementById('btn-bp');
        const label = document.querySelector('.bp-label');

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        svgLines.forEach((line, i) => {
            const length = line.getTotalLength ? line.getTotalLength() : 600;
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;

            // Hacer el frame visible primero
            if (i === 0) {
                tl.to('.blueprint-frame', { opacity: 1, duration: 0.3 });
            }

            tl.to(line, {
                strokeDashoffset: 0,
                duration: 0.6,
                ease: "power1.inOut"
            }, i === 0 ? "+=0" : "-=0.25");
        });

        // Label y botón
        tl.to(label, { opacity: 0.7, duration: 0.4 }, "-=0.2")
          .to(btnBp, { opacity: 1, y: 0, duration: 0.5 }, "+=0.3");
    }

    document.getElementById('btn-bp').addEventListener('click', () => transitionTo(2));

    // =============================================
    // NAVEGACIÓN POR BOTONES
    // =============================================
    document.getElementById('btn-topo').addEventListener('click', () => transitionTo(3));
    document.getElementById('btn-suelos').addEventListener('click', () => transitionTo(4));
    document.getElementById('btn-cimientos').addEventListener('click', () => transitionTo(5));
    document.getElementById('btn-pilares').addEventListener('click', () => transitionTo(6));
    document.getElementById('btn-materiales').addEventListener('click', () => transitionTo(7));
    document.getElementById('btn-fachada').addEventListener('click', () => transitionTo(8));
    document.getElementById('btn-interior').addEventListener('click', () => transitionTo(9));
    document.getElementById('btn-render').addEventListener('click', () => transitionTo(10));
    document.getElementById('btn-beso').addEventListener('click', () => transitionTo(11));
    document.getElementById('btn-llaves').addEventListener('click', () => transitionTo(12));

    // =============================================
    // ANIMACIONES ESPECÍFICAS (gsap.set + gsap.to para evitar flash)
    // =============================================
    function animateSoilLayers() {
        const layers = document.querySelectorAll('.soil-layer');
        // Guardar anchos originales, setear a 0, luego animar
        layers.forEach(l => {
            const originalWidth = l.style.width || getComputedStyle(l).width;
            gsap.set(l, { width: 0, opacity: 0 });
            gsap.to(l, { width: originalWidth, opacity: 1, duration: 0.6, delay: 0.1, ease: "power2.out" });
        });
        // Stagger manual
        layers.forEach((l, i) => {
            const originalWidth = getComputedStyle(l).width;
            gsap.set(l, { opacity: 0 });
            gsap.to(l, { opacity: 1, duration: 0.5, delay: i * 0.2, ease: "power2.out" });
        });
    }

    function animateCimientos() {
        const blocks = document.querySelectorAll('.block');
        blocks.forEach((b, i) => {
            gsap.set(b, { y: 80, opacity: 0 });
            gsap.to(b, { y: 0, opacity: 1, duration: 0.5, delay: i * 0.12, ease: "bounce.out" });
        });
    }

    function animateMaterials() {
        const items = document.querySelectorAll('.material-item');
        items.forEach((item, i) => {
            gsap.set(item, { scale: 0, opacity: 0 });
            gsap.to(item, { scale: 1, opacity: 1, duration: 0.6, delay: i * 0.2, ease: "back.out(1.5)" });
        });
    }

    function animateInterior() {
        const icons = document.querySelectorAll('.int-icon');
        icons.forEach((icon, i) => {
            gsap.set(icon, { y: 40, opacity: 0, rotation: -20 });
            gsap.to(icon, { y: 0, opacity: 1, rotation: 0, duration: 0.6, delay: i * 0.18, ease: "back.out(1.5)" });
        });
    }

    // =============================================
    // ESCENA 9: NUESTRO RENDER (Foto + Frases)
    // =============================================
    function playRenderScene() {
        const scene = document.getElementById('scene-render');
        const title = scene.querySelector('.scene-title');
        const sep = scene.querySelector('.separator');
        const layout = scene.querySelector('.render-layout');
        const photo = scene.querySelector('.our-photo');
        const phrases = scene.querySelectorAll('.phrase');
        const btn = document.getElementById('btn-render');

        // Preparar estados iniciales
        gsap.set(title, { opacity: 0, y: -20 });
        gsap.set(sep, { opacity: 0, scaleX: 0 });
        gsap.set(layout, { opacity: 0 });
        gsap.set(btn, { opacity: 0, y: 15 });

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        tl.to(title, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
          .to(sep, { opacity: 1, scaleX: 1, duration: 0.4 }, "-=0.3")
          .to(layout, { opacity: 1, duration: 0.5 }, "-=0.2");

        // Foto aparece con efecto especial
        gsap.set(photo, { scale: 0.8, opacity: 0, filter: "blur(8px)" });
        tl.to(photo, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" }, "-=0.3");

        // Frases aparecen una por una con stagger
        phrases.forEach((p, i) => {
            gsap.set(p, { opacity: 0, x: -30 });
            tl.to(p, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, `-=${i === 0 ? 0.3 : 0.35}`);
        });

        tl.to(btn, { opacity: 1, y: 0, duration: 0.5 }, "+=0.3");
    }

    // =============================================
    // ANIMACIÓN: EL BESO (Primer Sello)
    // =============================================
    function animateKiss() {
        const kiss = document.querySelector('.kiss-emoji');
        const sparkles = document.querySelectorAll('.sparkle');
        
        gsap.set(kiss, { scale: 0, opacity: 0 });
        gsap.to(kiss, { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });

        sparkles.forEach((s, i) => {
            gsap.set(s, { scale: 0, opacity: 0 });
            gsap.to(s, { scale: 1, opacity: 1, duration: 0.5, delay: 0.3 + i * 0.2, ease: "back.out(2)" });
        });
    }

    // =============================================
    // ESCENA 5: PILARES
    // =============================================
    function playPilares() {
        const scene = document.getElementById('scene-pilares');
        const title = scene.querySelector('.scene-title');
        const sep = scene.querySelector('.separator');
        const text = scene.querySelector('.scene-text');
        const cards = scene.querySelectorAll('.pillar-card');
        const btn = document.getElementById('btn-pilares');

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        tl.to(title, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
          .to(sep, { opacity: 1, scaleX: 1, duration: 0.4 }, "-=0.3")
          .to(text, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

        cards.forEach((card, i) => {
            tl.to(card, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }, `-=${i === 0 ? 0 : 0.3}`);
        });

        tl.to(btn, { opacity: 1, y: 0, duration: 0.5 }, "+=0.3");
    }

    // =============================================
    // ESCENA 10: LA PREGUNTA
    // =============================================
    function playQuestion() {
        const panel = document.querySelector('.question-panel');
        const header = document.querySelector('.q-header');
        const sep = panel.querySelector('.separator');
        const sub = document.querySelector('.q-sub');
        const q = document.getElementById('the-q');
        const btns = document.querySelector('.q-buttons');

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        tl.to(panel, { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.6)" })
          .to(header, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
          .to(sep, { opacity: 1, scaleX: 1, duration: 0.4 }, "-=0.2")
          .to(sub, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
          .to(q, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }, "+=0.3")
          .to(btns, { opacity: 1, y: 0, duration: 0.5 }, "+=0.2");

        // Preparar estados iniciales extra
        gsap.set(panel, { scale: 0.9 });
        gsap.set(q, { scale: 0.85, filter: "blur(8px)" });
    }

    // =============================================
    // BOTÓN TROLL (Secuencia tierna + desaparece)
    // =============================================
    const btnNo = document.getElementById('btn-no');
    const noSequence = [
        "¿SEGURA?",
        "¿SEGURISIMA?",
        "¿LINDURA BELLA?",
        "JAJA NO PUEDES",
        "¿EN SERIO, MI VIDA?",
        "ÚLTIMO INTENTO..."
    ];
    let noCount = 0;
    const MAX_NO_ATTEMPTS = noSequence.length;
    let btnNoInitialized = false;
    let isEvading = false; // Flag para evitar que el evento se dispare muy rápido

    function evadeButton() {
        if (isEvading) return;
        
        // Si ya alcanzó el máximo, desaparecer el botón
        if (noCount >= MAX_NO_ATTEMPTS) {
            isEvading = true;
            gsap.to(btnNo, {
                opacity: 0,
                scale: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => { btnNo.style.display = 'none'; }
            });
            return;
        }

        isEvading = true; // Bloquea nuevos eventos mientras se mueve

        // Primera vez: capturar posición actual y cambiar a fixed
        if (!btnNoInitialized) {
            const rect = btnNo.getBoundingClientRect();
            btnNo.style.position = 'fixed';
            btnNo.style.left = rect.left + 'px';
            btnNo.style.top = rect.top + 'px';
            btnNo.style.width = rect.width + 'px';
            btnNo.style.zIndex = '9999';
            btnNo.style.margin = '0';
            btnNoInitialized = true;
        }

        // Calcular nueva posición aleatoria dentro de la pantalla
        const pad = 60;
        const btnW = btnNo.offsetWidth || 180;
        const btnH = btnNo.offsetHeight || 50;
        const maxX = window.innerWidth - btnW - pad;
        const maxY = window.innerHeight - btnH - pad;
        const newX = pad + Math.random() * (maxX - pad);
        const newY = pad + Math.random() * (maxY - pad);

        // Mostrar texto de la secuencia ANTES de mover para que se adapte el ancho si es necesario
        document.getElementById('no-text').textContent = noSequence[noCount];
        noCount++;

        // Mover con animación visible
        gsap.to(btnNo, {
            left: newX + 'px',
            top: newY + 'px',
            duration: 0.35,
            ease: "power3.out",
            onComplete: () => {
                isEvading = false; // Desbloquear cuando termine de moverse
            }
        });

        // Si fue el último intento, programar desaparición después de 1.5 segundos
        if (noCount >= MAX_NO_ATTEMPTS) {
            setTimeout(() => {
                gsap.to(btnNo, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.6,
                    ease: "power2.in",
                    onComplete: () => { btnNo.style.display = 'none'; }
                });
            }, 1500); // Le damos más tiempo para que lea "ÚLTIMO INTENTO..."
        }
    }

    btnNo.addEventListener('mouseenter', evadeButton);
    btnNo.addEventListener('touchstart', e => { e.preventDefault(); evadeButton(); });
    btnNo.addEventListener('click', e => { e.preventDefault(); evadeButton(); });

    // =============================================
    // BOTÓN SÍ → FINAL + NOTIFICACIÓN DISCORD
    // =============================================
    document.getElementById('btn-yes').addEventListener('click', () => {
        if (btnNo.style.position === 'fixed') {
            gsap.to(btnNo, { opacity: 0, duration: 0.2 });
        }
        // Ocultar progreso y detener música
        document.getElementById('progress-global').classList.remove('visible');
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            gsap.to(bgMusic, { volume: 0, duration: 2, onComplete: () => bgMusic.pause() }); // Fade out elegante
        }
        transitionTo(13);

        // Notificar por Discord
        const webhookUrl = 'https://discord.com/api/webhooks/1511199239961837708/yFa97DYWgonnievZI6HlFUxzQXPtPrqWA4TADN3A6G5kuTTPKSnu27GUxK_vXH38ZBgj';
        const now = new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' });

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "# 🚨 ALERTA MÁXIMA DEL SISTEMA T.E.R.N.U.R.I.T.A. 🚨",
                embeds: [{
                    title: "💖 ¡¡¡PERMISO DE CONSTRUCCIÓN APROBADO!!! 💖",
                    description: "**Ella le dio click a SÍ, AUTORIZAR PROYECTO.**\n\nLa Arquitecta Suprema ha firmado el contrato de obra eterna.\n\n🏗️ **Estado del Proyecto:** APROBADO\n❤️ **Nivel de Amor:** INFINITO\n📅 **Fecha de aprobación:** " + now,
                    color: 16720955,
                    footer: {
                        text: "Proyecto T.E.R.N.U.R.I.T.A. — Sistema de Amor Eterno v2.0"
                    },
                    thumbnail: {
                        url: "https://em-content.zobj.net/source/apple/391/revolving-hearts_1f49e.png"
                    }
                }]
            })
        }).catch(() => {}); // Silencioso si falla, no arruinar el momento
    });

    // =============================================
    // ESCENA FINAL
    // =============================================
    function playFinal() {
        document.body.style.overflow = 'hidden';
        const scene = document.getElementById('scene-final');

        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; launchHeartConfetti(); }
        });

        // Flash rosado
        gsap.fromTo(scene,
            { backgroundColor: "rgba(255, 45, 117, 0.5)" },
            { backgroundColor: "transparent", duration: 1.5, ease: "power2.out" }
        );

        const title = scene.querySelector('.final-title');
        const sub = scene.querySelector('.final-sub');
        const heart = scene.querySelector('.big-heart');
        const msg = scene.querySelector('.final-msg');

        tl.to(title, { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.4)" }, 0.5)
          .to(sub, { opacity: 1, y: 0, duration: 0.6 }, 1.2)
          .to(heart, { opacity: 1, scale: 1, rotation: 720, duration: 1.2, ease: "elastic.out(1, 0.3)" }, 1.5)
          .to(msg, { opacity: 1, y: 0, duration: 0.7 }, 2.5);

        gsap.set(title, { scale: 0 });
        gsap.set(heart, { scale: 0, rotation: 0 });
    }

    // =============================================
    // CONFETI DE CORAZONES
    // =============================================
    function launchHeartConfetti() {
        const scene = document.getElementById('scene-final');
        const hearts = ['❤️', '💖', '💕', '💗', '💘', '♥️', '🩷'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const h = document.createElement('span');
                h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                h.style.cssText = `
                    position: fixed;
                    font-size: ${Math.random() * 25 + 12}px;
                    left: ${Math.random() * 100}vw;
                    top: -30px;
                    z-index: 99999;
                    pointer-events: none;
                `;
                scene.appendChild(h);

                gsap.to(h, {
                    y: window.innerHeight + 50,
                    x: (Math.random() - 0.5) * 200,
                    rotation: Math.random() * 720 - 360,
                    opacity: 0,
                    duration: 3 + Math.random() * 2,
                    ease: "power1.in",
                    onComplete: () => h.remove()
                });
            }, i * 60);
        }
    }

});
