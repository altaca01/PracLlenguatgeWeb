const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot");
const galleryTitle = document.getElementById("scramble-title");

/* cursor personalitzat */
if (cursorCircle) {
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        cursorCircle.style.left = `${mouseX}px`;
        cursorCircle.style.top = `${mouseY}px`;
        
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    const interactiveElements = document.querySelectorAll("a, .gallery-item");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => cursorCircle.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursorCircle.classList.remove("hovered"));
    });
}

let currentIndex = 0;
const galleryItems = document.querySelectorAll('.gallery-item img');
const imagesList = []; 

galleryItems.forEach((img, index) => {
    imagesList.push(img.getAttribute('src'));
    img.setAttribute('data-index', index);
});

// Crear l'HTML del lightbox
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
    <div class="lightbox-close">&times;</div>
    <button class="lightbox-prev">&#10094;</button>
    <button class="lightbox-next">&#10095;</button>
    <img src="" alt="Zoom Image" class="lightbox-content">
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('.lightbox-content');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const btnPrev = lightbox.querySelector('.lightbox-prev');
const btnNext = lightbox.querySelector('.lightbox-next');

// mostrar img
const showImage = (index) => {
    if (index < 0) index = imagesList.length - 1; 
    if (index >= imagesList.length) index = 0;    
    
    currentIndex = index;
    lightboxImg.setAttribute('src', imagesList[currentIndex]);
};

const items = document.querySelectorAll('.gallery-item');
items.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            const index = parseInt(img.getAttribute('data-index'));
            showImage(index);
            lightbox.classList.add('active');
        }
    });
});

// botons per moures entre imgs
btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
});

btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
});

// noures entre imgs amb les fletxes del teclat
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape') closeLightbox();
});

// tancar
const closeLightbox = () => {
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightboxImg.setAttribute('src', '');
    }, 300);
};

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});



if (cursorCircle) {
    const controls = [lightboxClose, btnPrev, btnNext];
    controls.forEach(el => {
        el.addEventListener("mouseenter", () => cursorCircle.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursorCircle.classList.remove("hovered"));
    });
}

/* efecte scrambler del títol */
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

if (galleryTitle) {
    const fx = new TextScramble(galleryTitle);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fx.setText("MOMENTS SOBRE RODES");
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.5 });

    observer.observe(galleryTitle);
}