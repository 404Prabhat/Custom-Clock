// js/animations/artistic.js
import { Particle } from '../utils/helpers.js';

export const artisticAnimations = {
    'aurora-borealis': {
        setup() { this.t = 0; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, ctx.canvas.height);
                for (let x = 0; x < ctx.canvas.width; x++) {
                    const y = Math.sin(x * .005 + this.t + i * 2) * 100 + Math.sin(x * .01 + this.t + i * 2) * 50 + ctx.canvas.height / 2;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
                ctx.closePath();
                const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
                g.addColorStop(0, `hsla(${120 + i * 40},50%,50%,0)`);
                g.addColorStop(1, `hsla(${120 + i * 40},50%,50%,0.2)`);
                ctx.fillStyle = g;
                ctx.fill();
            }
            this.t += .01;
        }
    },
    'caustic-light': {
        setup() { this.t = 0; },
        draw(ctx) {
            const id = ctx.createImageData(ctx.canvas.width, ctx.canvas.height), data = id.data;
            for (let x = 0; x < ctx.canvas.width; x++) {
                for (let y = 0; y < ctx.canvas.height; y++) {
                    const v = Math.abs(Math.sin(x * .02 + this.t) + Math.cos(y * .02 + this.t)) * 128;
                    const idx = (y * ctx.canvas.width + x) * 4;
                    data[idx] = v; data[idx + 1] = v * 1.2; data[idx + 2] = v * 1.5; data[idx + 3] = 255;
                }
            }
            ctx.putImageData(id, 0, 0);
            this.t += .02;
        }
    },
    'blooming-flowers': {
        setup(ctx) { this.f = []; ctx.canvas.onclick = e => { this.f.push({ x: e.clientX, y: e.clientY, s: 0, a: Math.random() * Math.PI * 2 }); }; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.f.forEach(f => {
                if (f.s < 100) f.s += .5;
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.a);
                for (let i = 0; i < 6; i++) {
                    ctx.fillStyle = `hsl(${f.s * 2},100%,50%)`;
                    ctx.beginPath();
                    ctx.ellipse(f.s / 2, 0, f.s / 2, f.s / 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.rotate(Math.PI / 3);
                }
                ctx.restore();
            });
        }
    },
    'ink-bleed': {
        setup(ctx) { this.p = []; ctx.canvas.onclick = e => { for (let i = 0; i < 50; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 5; this.p.push(new Particle(e.clientX, e.clientY, Math.cos(a) * s, Math.sin(a) * s, Math.random() * 10 + 5, 'white', 100)); } }; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.p = this.p.filter(p => p.life > 0);
            this.p.forEach(p => { p.vx *= .95; p.vy *= .95; p.opacity = p.life / 100; p.update(); p.draw(ctx); });
        }
    },
    'stained-glass': {
        setup(ctx) { this.p = Array.from({ length: 30 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, c: `hsl(${Math.random() * 360},70%,50%)` })); },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            this.p.forEach(p => {
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }
    },
    'kaleidoscope': {
        setup() { this.s = 6; },
        draw(ctx, settings, mouse) {
            ctx.save();
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            if (mouse.down && mouse.x) {
                const mx = mouse.x - ctx.canvas.width / 2, my = mouse.y - ctx.canvas.height / 2;
                for (let i = 0; i < this.s; i++) {
                    ctx.rotate(Math.PI * 2 / this.s);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(mx, my);
                    ctx.strokeStyle = `hsl(${Date.now() * .1 % 360},100%,50%)`;
                    ctx.stroke();
                }
            }
            ctx.restore();
        }
    },
    'light-pen': {
        setup() { this.p = []; },
        draw(ctx, settings, mouse) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (mouse.x) this.p.push(new Particle(mouse.x, mouse.y, 0, 0, 3, 'white', 50));
            this.p = this.p.filter(pt => pt.life > 0);
            this.p.forEach(pt => { pt.opacity = pt.life / 50; pt.update(); pt.draw(ctx); });
        }
    },
    'confetti': {
        setup() { this.p = []; },
        draw(ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (Math.random() > .8) this.p.push(new Particle(Math.random() * ctx.canvas.width, 0, Math.random() * 4 - 2, Math.random() * 5 + 2, 5, `hsl(${Math.random() * 360},100%,50%)`, 200));
            this.p = this.p.filter(p => p.y < ctx.canvas.height);
            this.p.forEach(p => { p.vy += .1; p.update(); p.draw(ctx); });
        }
    },
    'hyperspace': {
        setup(ctx) { this.s = Array.from({ length: 200 }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 50 + 1, s: Math.random() * 2 + 1 })); },
        draw(ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
            this.s.forEach(st => {
                const x1 = cx + Math.cos(st.a) * st.d, y1 = cy + Math.sin(st.a) * st.d, x2 = cx + Math.cos(st.a) * (st.d + 10), y2 = cy + Math.sin(st.a) * (st.d + 10);
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                st.d += st.s;
                if (st.d > ctx.canvas.width) st.d = 1;
            });
        }
    },
    'terrain-flyover': {
        setup() { this.t = 0; },
        draw(ctx) {
            const id = ctx.createImageData(ctx.canvas.width, ctx.canvas.height), data = id.data;
            for (let x = 0; x < ctx.canvas.width; x++) {
                let y_proj = ctx.canvas.height;
                for (let y = ctx.canvas.height - 1; y >= 0; y--) {
                    const v = Math.sin(x * .01) * Math.cos(y * .01 + this.t) * 50 + 50, py = y + v;
                    if (py < y_proj) {
                        for (let k = Math.floor(py); k < y_proj; k++) {
                            const idx = (k * ctx.canvas.width + x) * 4;
                            data[idx] = v * 2; data[idx + 1] = v * 2.5; data[idx + 2] = v * 3; data[idx + 3] = 255;
                        }
                        y_proj = py;
                    }
                }
            }
            ctx.putImageData(id, 0, 0);
            this.t += .05;
        }
    },
};
