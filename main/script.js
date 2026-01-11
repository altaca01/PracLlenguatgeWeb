const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot");
const header = document.getElementById("main-header");
const scrambleTitle = document.getElementById("scramble-title");
const heroContent = document.querySelector(".hero-content"); 
const scrollIndicator = document.querySelector(".scroll-indicator");

const btnOpenVideo = document.getElementById("btn-open-video");
const btnCloseVideo = document.getElementById("btn-close-video");
const videoModal = document.getElementById("video-modal");
const youtubeIframe = document.getElementById("youtube-iframe");
const localAudio = document.getElementById("my-music");


/* cursor propi */
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

    const interactiveElements = document.querySelectorAll("a, button, .close-modal");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursorCircle.classList.add("hovered"); 
        });
        el.addEventListener("mouseleave", () => {
            cursorCircle.classList.remove("hovered"); 
        });
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


let lastScroll = 0;
let indicatorTimeout; 
let isLoopRunning = false; 

const TIME_VISIBLE = 2000;
const TIME_HIDDEN = 6000;

if (header) header.classList.add("scrolled");

function startIndicatorLoop() {
    if (!scrollIndicator) return;
    if (window.pageYOffset > 50) return;
    
    isLoopRunning = true;
    scrollIndicator.style.transition = "opacity 1s ease"; 
    scrollIndicator.style.opacity = "0.7";
    
    clearTimeout(indicatorTimeout);
    indicatorTimeout = setTimeout(() => {
        if (window.pageYOffset > 50) return; 
        scrollIndicator.style.transition = "opacity 1s ease"; 
        scrollIndicator.style.opacity = "0";
        
        indicatorTimeout = setTimeout(() => {
            if (window.pageYOffset < 50) {
                startIndicatorLoop(); 
            }
        }, TIME_HIDDEN); 
    }, TIME_VISIBLE); 
}

startIndicatorLoop();

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    // amagar/mostrar header
    if (header) {
        if (currentScroll > lastScroll && !header.classList.contains("scroll-down")) {
            header.style.transform = "translateY(-100%)";
        } else if (currentScroll < lastScroll && header.style.transform === "translateY(-100%)") {
            header.style.transform = "translateY(0)";
        }
    }
    
    // indicador scroll
    if (scrollIndicator) {
        if (currentScroll > 50) {
            scrollIndicator.style.transition = "opacity 0.3s ease"; 
            scrollIndicator.style.opacity = "0";
            clearTimeout(indicatorTimeout); 
            isLoopRunning = false;
        } else {
            if (!isLoopRunning) {
                startIndicatorLoop();
            }
        }
    }
    lastScroll = currentScroll;
});


/* video de highlight */
if (videoModal && btnOpenVideo) {

    const youtubeLink = "https://www.youtube.com/embed/no9-tLhO-bQ?autoplay=1&mute=1"; // video del meu yt mutejat

    // obrir
    btnOpenVideo.addEventListener("click", () => {
        videoModal.classList.add("active");
        
        // posa el vídeo de YouTube
        if (youtubeIframe) {
            youtubeIframe.src = youtubeLink;
        }

        // començár la música
        if (localAudio) {
            localAudio.currentTime = 0;
            localAudio.volume = 0.05; 
            localAudio.play().catch(e => console.log("Error àudio:", e));
        }
    });

    // tancar
    function closeModal() {
        videoModal.classList.remove("active");
        
        // treu el vídeo 
        if (youtubeIframe) {
            youtubeIframe.src = ""; 
        }

        // atura la música
        if (localAudio) {
            localAudio.pause();
            localAudio.currentTime = 0;
        }
    }

    if (btnCloseVideo) btnCloseVideo.addEventListener("click", closeModal);
    videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) closeModal();
    });
}


/* text que s'emplena */
const introTitle = document.querySelector("#intro h2");

window.addEventListener("scroll", () => {
    const scrollPosition = window.pageYOffset;

    
    if (heroContent) {
        heroContent.style.transform = `translateY(-${scrollPosition * 0.5}px)`;
        heroContent.style.opacity = 1 - scrollPosition / 700; 
    }

    // omplir Text
    if (introTitle) {
        const rect = introTitle.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const startPoint = windowHeight * 0.9;
        const endPoint = windowHeight * 0.4;
        
        let progress = (startPoint - rect.top) / (startPoint - endPoint);
        progress = Math.min(Math.max(progress, 0), 1);
        
        const bgPosition = 100 - (progress * 100);
        introTitle.style.backgroundPosition = `${bgPosition}% 0`;
    }
});