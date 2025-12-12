/* =========================================
   ELEMENTS DEL DOM
   ========================================= */
const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot");
const header = document.getElementById("main-header");
const dynamicBg = document.getElementById("dynamic-bg"); 
const sectionTitle = document.querySelector(".section-title"); // Seleccionem el títol "NORMATIVA CLAU"

/* =========================================
   1. CURSOR PERSONALITZAT
   ========================================= */
if (cursorCircle && cursorDot) {
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        cursorCircle.style.left = `${mouseX}px`;
        cursorCircle.style.top = `${mouseY}px`;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    const interactiveElements = document.querySelectorAll("a, button, .rule-ball");
    
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
   2. HEADER SCROLL EFFECT (CANVI D'ESTIL)
   ========================================= */
if (header) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

/* =========================================
   3. FONS DINÀMIC: JUGADES TÀCTIQUES (SVG)
   ========================================= */
function createPlayLine() {
    if (!dynamicBg) return;

    // Espai de noms SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "play-line-svg");
    
    // Estils per posicionar l'SVG
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.overflow = "visible";

    // Dimensions totals del document (per cobrir tota la pàgina)
    const w = document.documentElement.scrollWidth;
    const h = document.documentElement.scrollHeight;

    // --- CÀLCUL DE COORDENADES (Inici i Final fora de pantalla) ---
    const sideStart = Math.floor(Math.random() * 4); // 0:Top, 1:Right, 2:Bottom, 3:Left
    let startX, startY, endX, endY;

    const getEdgeCoord = (side) => {
        const margin = 200; // Marge extra perquè neixin fora
        switch(side) {
            case 0: return { x: Math.random() * w, y: -margin }; // Top
            case 1: return { x: w + margin, y: Math.random() * h }; // Right
            case 2: return { x: Math.random() * w, y: h + margin }; // Bottom
            case 3: return { x: -margin, y: Math.random() * h }; // Left
        }
    };

    const start = getEdgeCoord(sideStart);
    // El final ha d'estar en un costat diferent per creuar la pantalla
    let sideEnd = Math.floor(Math.random() * 4);
    while (sideEnd === sideStart) {
        sideEnd = Math.floor(Math.random() * 4);
    }
    const end = getEdgeCoord(sideEnd);

    // Punts de control per a la corba de Bézier (per fer l'arc)
    const ctrl1X = Math.random() * w;
    const ctrl1Y = Math.random() * h;
    const ctrl2X = Math.random() * w;
    const ctrl2Y = Math.random() * h;

    // Creem el path
    const path = document.createElementNS(svgNS, "path");
    const d = `M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`;
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ff6b00"); // Color Taronja
    path.setAttribute("stroke-width", "5"); // Grosor
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0"); // Invisible inicialment

    // --- ANIMACIÓ ---
    // Calculem la llargada aproximada del camí per fer l'efecte "dibuixar"
    const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const length = dist * 1.5; 
    
    // Inicialment la línia està "amagada" (dashoffset = length)
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    // Durada fixa i lenta (8 segons)
    const duration = 8; 
    
    // Definim la transició CSS
    path.style.transition = `stroke-dashoffset ${duration}s linear, opacity 1s ease-in-out`;

    svg.appendChild(path);
    dynamicBg.appendChild(svg);

    // Forçar reflow i iniciar animació
    setTimeout(() => {
        // 1. Fem visible la línia (semitransparent)
        path.setAttribute("opacity", "0.6"); 
        
        // 2. Comença a dibuixar-se
        path.style.strokeDashoffset = "0"; 
        
        // --- DESAPARICIÓ PROGRESSIVA ---
        // Quan falti 1.5 segons per acabar, comencem a baixar l'opacitat a 0
        const fadeOutTime = (duration - 1.5) * 1000; 
        
        setTimeout(() => {
            path.style.opacity = "0";
        }, fadeOutTime);

    }, 100);

    // Neteja de l'element SVG del DOM quan acaba tot
    setTimeout(() => {
        svg.remove();
    }, (duration + 1) * 1000); 
}

// Generem "jugades" periòdicament
if (dynamicBg) {
    // Crea una línia nova cada 1.5 segons
    setInterval(createPlayLine, 1500); 
    // Creem la primera immediatament
    createPlayLine();
}

/* =========================================
   4. SCRAMBLE TEXT EFFECT (NORMATIVA CLAU)
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

// Activem l'efecte quan el títol entra a la pantalla
if (sectionTitle) {
    const fx = new TextScramble(sectionTitle);
    let hasScrambled = false; // Perquè només ho faci una vegada

    window.addEventListener("scroll", () => {
        const rect = sectionTitle.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Si l'element és visible i encara no hem fet l'efecte
        if (rect.top < windowHeight * 0.8 && !hasScrambled) {
            hasScrambled = true;
            // Fem l'efecte Scramble per revelar el text "NORMATIVA CLAU"
            fx.setText("NORMATIVA CLAU");
            
            // Opcional: Si vols mantenir també l'efecte de color reveal, el pots deixar
            // Però normalment l'scramble ja crida prou l'atenció.
            // Si vols els dos, el codi de sota (color reveal) també funcionarà.
        }
    });
}

/* =========================================
   5. TEXT REVEAL EFFECT (COLOR - OPCIONAL)
   ========================================= */
// Mantinc aquest codi per si vols que A MÉS A MÉS s'ompli de color al fer scroll
if (sectionTitle) {
    window.addEventListener("scroll", () => {
        const rect = sectionTitle.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const startPoint = windowHeight * 0.8;
        const endPoint = windowHeight * 0.4;
        
        let progress = (startPoint - rect.top) / (startPoint - endPoint);
        progress = Math.min(Math.max(progress, 0), 1);
        const percentage = progress * 100;
        
        sectionTitle.style.backgroundSize = `${percentage}% 100%`;
    });
}