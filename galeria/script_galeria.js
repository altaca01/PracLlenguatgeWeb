/* =========================================
   ELEMENTS DEL DOM
   ========================================= */
const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot");
const header = document.getElementById("main-header");
const galleryTitle = document.getElementById("scramble-title"); // Seleccionem el títol pel ID

/* =========================================
   1. CURSOR PERSONALITZAT
   ========================================= */
if (cursorCircle && cursorDot) {
    // Moviment del cursor
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        cursorCircle.style.left = `${mouseX}px`;
        cursorCircle.style.top = `${mouseY}px`;
        
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Elements interactius: Enllaços i IMATGES DE LA GALERIA
    // Afegim '.gallery-item' i '.lightbox-close' perquè el cursor reaccioni
    const interactiveElements = document.querySelectorAll("a, .gallery-item, .lightbox-close");
    
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
   2. HEADER SCROLL EFFECT
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
   3. LIGHTBOX (VISUALITZADOR D'IMATGES)
   ========================================= */
// 1. Creem l'HTML del lightbox dinàmicament
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
    <div class="lightbox-close">&times;</div>
    <img src="" alt="Zoom Image" class="lightbox-content">
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('.lightbox-content');
const lightboxClose = lightbox.querySelector('.lightbox-close');

// 2. Funció per obrir la imatge
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            // Agafem la font de la imatge clicada
            const src = img.getAttribute('src');
            // La posem al lightbox
            lightboxImg.setAttribute('src', src);
            // Mostrem el lightbox
            lightbox.classList.add('active');
        }
    });
});

// 3. Funcions per tancar
const closeLightbox = () => {
    lightbox.classList.remove('active');
    // Netejem la font després de l'animació per evitar parpellejos si es reobre ràpid
    setTimeout(() => {
        lightboxImg.setAttribute('src', '');
    }, 300);
};

// Tancar amb la X
lightboxClose.addEventListener('click', closeLightbox);

// Tancar clicant fora de la imatge (al fons fosc)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Tancar amb la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

/* =========================================
   4. SCRAMBLE TEXT EFFECT (MOMENTS SOBRE RODES)
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

// Activem l'efecte AMB UN OBSERVADOR (INTERSECTION OBSERVER)
// Això fa que es torni a executar cada cop que es veu el títol
if (galleryTitle) {
    const fx = new TextScramble(galleryTitle);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si l'element és visible (entra a la pantalla)
            if (entry.isIntersecting) {
                fx.setText("MOMENTS SOBRE RODES");
            } else {
                // Opcional: Si vols que es buidi quan surts de pantalla
                // per fer l'efecte més dramàtic al tornar:
                // galleryTitle.innerText = "";
            }
        });
    }, { threshold: 0.5 }); // S'activa quan el 50% de l'element és visible

    observer.observe(galleryTitle);
}