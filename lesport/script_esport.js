const cursorCircle = document.getElementById("cursor-circle");
const cursorDot = document.getElementById("cursor-dot");
const dynamicBg = document.getElementById("dynamic-bg"); 
const sectionTitle = document.getElementById("scramble-title"); 

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

/* línies fons */
function createPlayLine() {
    if (!dynamicBg) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "play-line-svg");
    
    svg.style.position = "absolute";
    svg.style.top = "0"; left: "0";
    svg.style.width = "100%"; height: "100%";
    svg.style.pointerEvents = "none";
    svg.style.overflow = "visible";

    const w = document.documentElement.scrollWidth;
    const h = document.documentElement.scrollHeight;

    // coordenades aleatories
    const sideStart = Math.floor(Math.random() * 4); 
    const margin = 200;
    
    const getEdgeCoord = (side) => {
        switch(side) {
            case 0: return { x: Math.random() * w, y: -margin }; // dalt
            case 1: return { x: w + margin, y: Math.random() * h }; // dreta
            case 2: return { x: Math.random() * w, y: h + margin }; // baix
            case 3: return { x: -margin, y: Math.random() * h }; // esq
        }
    };

    const start = getEdgeCoord(sideStart);
    let sideEnd = Math.floor(Math.random() * 4);
    while (sideEnd === sideStart) sideEnd = Math.floor(Math.random() * 4);
    const end = getEdgeCoord(sideEnd);

    // Corba de Bézier
    const ctrl1X = Math.random() * w; const ctrl1Y = Math.random() * h;
    const ctrl2X = Math.random() * w; const ctrl2Y = Math.random() * h;

    const path = document.createElementNS(svgNS, "path");
    const d = `M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`;
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ff6b00");
    path.setAttribute("stroke-width", "5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0");

    // Animació
    const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const length = dist * 1.5; 
    
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    const duration = 8; 
    path.style.transition = `stroke-dashoffset ${duration}s linear, opacity 1s ease-in-out`;

    svg.appendChild(path);
    dynamicBg.appendChild(svg);

    setTimeout(() => {
        path.setAttribute("opacity", "0.6"); 
        path.style.strokeDashoffset = "0"; 
        
        setTimeout(() => {
            path.style.opacity = "0";
        }, (duration - 1.5) * 1000);
    }, 100);

    setTimeout(() => { svg.remove(); }, (duration + 1) * 1000); 
}

if (dynamicBg) {
    setInterval(createPlayLine, 1500); 
    createPlayLine();
}

/* titol efecte scramble */
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

if (sectionTitle) {
    const fx = new TextScramble(sectionTitle);
    setTimeout(() => {
        fx.setText("NORMATIVA CLAU");
    }, 500);
}