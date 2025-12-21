/* =========================================
   ELEMENTS DEL DOM (VARIABLES)
   ========================================= */
const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot"); // NOU: Afegit
const header = document.getElementById("main-header");
const scrambleTitle = document.getElementById("scramble-title");
const btnOpenVideo = document.getElementById("btn-open-video");
const btnCloseVideo = document.getElementById("btn-close-video");
const videoModal = document.getElementById("video-modal");
// Validem que existeixi el modal abans de buscar l'iframe per evitar errors si no hi és
const videoIframe = videoModal ? videoModal.querySelector("iframe") : null;
const heroContent = document.querySelector(".hero-content"); 

// Element de l'indicador d'scroll
const scrollIndicator = document.querySelector(".scroll-indicator");


/* =========================================
   1. CURSOR PERSONALITZAT
   ========================================= */
if (cursorCircle) {
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Movem el cercle
        cursorCircle.style.left = `${mouseX}px`;
        cursorCircle.style.top = `${mouseY}px`;

        // NOU: Movem el punt (si existeix)
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    const interactiveElements = document.querySelectorAll("a, button, .close-btn");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursorCircle.classList.add("hovered"); 
        });
        el.addEventListener("mouseleave", () => {
            cursorCircle.classList.remove("hovered"); 
        });
    });
}

/* =========================================
   2. SCRAMBLE TEXT EFFECT
   ========================================= */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________'; 
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span style="color: #ff6b00">${char}</span>`; 
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve(); 
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

if (scrambleTitle) {
    const fx = new TextScramble(scrambleTitle);
    const phrases = ['HOQUEI PATINS', 'PASSIÓ SOBRE RODES', 'ESTIL DE VIDA'];
    let counter = 0;
    const nextPhrase = () => {
        fx.setText(phrases[counter]).then(() => {
            setTimeout(nextPhrase, 3000); 
        });
        counter = (counter + 1) % phrases.length;
    };
    nextPhrase();
}

/* =========================================
   3. SMART HEADER & SCROLL INDICATOR
   ========================================= */
let lastScroll = 0;
let indicatorTimeout; 
let isLoopRunning = false; 

// --- CONFIGURACIÓ DE TEMPS (VARIABLES) ---
const TIME_VISIBLE = 2000; // Temps que està visible (2 segons)
const TIME_HIDDEN = 6000;  // Temps que s'amaga abans de tornar a sortir (6 segons)

if (header) header.classList.add("scrolled");

// Funció que executa el BUCLE INFINIT de l'indicador
function startIndicatorLoop() {
    if (!scrollIndicator) return;
    // Si ja hem baixat, no fem res
    if (window.pageYOffset > 50) return;
    
    isLoopRunning = true;

    // 1. APAREIXER
    scrollIndicator.style.transition = "opacity 1s ease"; 
    scrollIndicator.style.opacity = "0.7";
    
    // 2. Esperar TIME_VISIBLE segons i DESAPAREIXER
    clearTimeout(indicatorTimeout);
    indicatorTimeout = setTimeout(() => {
        if (window.pageYOffset > 50) return; // Comprovació de seguretat

        scrollIndicator.style.transition = "opacity 1s ease"; 
        scrollIndicator.style.opacity = "0";
        
        // 3. Esperar TIME_HIDDEN segons amagat i TORNAR A COMENÇAR
        indicatorTimeout = setTimeout(() => {
            if (window.pageYOffset < 50) {
                startIndicatorLoop(); // Recursivitat
            }
        }, TIME_HIDDEN); 

    }, TIME_VISIBLE); 
}

// Iniciem el bucle al carregar
startIndicatorLoop();

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    
    // --- GESTIÓ DEL HEADER ---
    if (header) {
        if (currentScroll > lastScroll && !header.classList.contains("scroll-down")) {
            header.style.transform = "translateY(-100%)";
        } else if (currentScroll < lastScroll && header.style.transform === "translateY(-100%)") {
            header.style.transform = "translateY(0)";
        }
    }
    
    // --- GESTIÓ DE L'INDICADOR D'SCROLL ---
    if (scrollIndicator) {
        if (currentScroll > 50) {
            // L'usuari ha baixat: MATAR EL BUCLE
            scrollIndicator.style.transition = "opacity 0.3s ease"; 
            scrollIndicator.style.opacity = "0";
            clearTimeout(indicatorTimeout); 
            isLoopRunning = false;
        } else {
            // L'usuari ha tornat a dalt de tot
            if (!isLoopRunning) {
                // Si el bucle estava parat, el REINICIEM
                startIndicatorLoop();
            }
        }
    }

    lastScroll = currentScroll;
});

/* =========================================
   4. MODAL VÍDEO (ARREGLAT)
   ========================================= */
if (videoModal && btnOpenVideo) {
    const originalSrc = videoIframe ? videoIframe.src : ""; 

    btnOpenVideo.addEventListener("click", () => {
        videoModal.classList.add("active");
        
        if (videoIframe && originalSrc) {
            // Comprovem si l'enllaç ja té paràmetres '?' o no
            const symbol = originalSrc.includes('?') ? '&' : '?';
            videoIframe.src = originalSrc + symbol + "autoplay=1"; 
        }
    });

    function closeModal() {
        videoModal.classList.remove("active");
        if (videoIframe) {
            // Buidem per parar el so immediatament i restaurem l'original
            videoIframe.src = "";
            videoIframe.src = originalSrc;
        }
    }

    if (btnCloseVideo) btnCloseVideo.addEventListener("click", closeModal);
    videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) closeModal();
    });
}

/* =========================================
   5. PARALLAX EFFECT
   ========================================= */
if (heroContent) {
    window.addEventListener("scroll", () => {
        const scrollPosition = window.pageYOffset;
        heroContent.style.transform = `translateY(-${scrollPosition * 0.5}px)`;
        heroContent.style.opacity = 1 - scrollPosition / 700; 
    });
}

/* =========================================
   6. TEXT REVEAL EFFECT (MÀSCARA SCROLL)
   ========================================= */
// Seleccionem el h2 de la secció d'intro
const introTitle = document.querySelector("#intro h2");

if (introTitle) {
    // 1. Configuració inicial d'estils per l'efecte màscara (CSS via JS)
    // El text serà transparent i el fons serà el que doni el color
    introTitle.style.color = "transparent";
    // Creem un degradat: Taronja (esquerra) | Blanc (dreta)
    introTitle.style.backgroundImage = "linear-gradient(to right, #ff6b00 50%, #ffffff 50%)"; 
    // Fem el fons el doble de gran perquè puguem desplaçar-lo
    introTitle.style.backgroundSize = "200% 100%";
    // Inicialment mostrem la part dreta (Blanc)
    introTitle.style.backgroundPosition = "100% 0"; 
    // Apliquem el background només al text
    introTitle.style.webkitBackgroundClip = "text";
    introTitle.style.backgroundClip = "text";
    // Assegurem display inline per a que el degradat s'ajusti al text
    introTitle.style.display = "inline-block"; 

    window.addEventListener("scroll", () => {
        const rect = introTitle.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // --- CÀLCUL DEL PROGRÉS ---
        // startPoint: Quan l'element entra pel 90% inferior de la pantalla
        const startPoint = windowHeight * 0.9;
        // endPoint: Quan l'element arriba al 40% superior (ja visible)
        const endPoint = windowHeight * 0.4;
        
        // Calculem el progrés entre 0 (inici) i 1 (final)
        let progress = (startPoint - rect.top) / (startPoint - endPoint);
        
        // Limitem el valor per no passar-nos (clamp)
        progress = Math.min(Math.max(progress, 0), 1);
        
        // --- MAPATGE A LA POSICIÓ DEL FONS ---
        // Volem anar de 100% (blanc) a 0% (taronja)
        const bgPosition = 100 - (progress * 100);
        
        // Apliquem el nou estil en temps real
        introTitle.style.backgroundPosition = `${bgPosition}% 0`;
    });
}