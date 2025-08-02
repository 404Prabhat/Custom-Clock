// js/animations/generative.js

export const generativeAnimations = {
    'fractal-tree': {
        draw(ctx) {
            function branch(x, y, len, angle, depth) {
                if (depth === 0) return;
                ctx.beginPath();
                ctx.moveTo(x, y);
                const x2 = x + len * Math.cos(angle);
                const y2 = y + len * Math.sin(angle);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                const angleOffset = Math.sin(Date.now() * 5e-4) * .4;
                branch(x2, y2, len * .8, angle - angleOffset, depth - 1);
                branch(x2, y2, len * .8, angle + angleOffset, depth - 1);
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            branch(ctx.canvas.width / 2, ctx.canvas.height, ctx.canvas.height / 6, -Math.PI / 2, 9);
        }
    },
    'mandelbrot-set': {
        setup() { this.zoom = 1; this.panX = -.5; this.panY = 0; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const id = ctx.createImageData(ctx.canvas.width, ctx.canvas.height), p = id.data;
            for (let x = 0; x < ctx.canvas.width; x++) {
                for (let y = 0; y < ctx.canvas.height; y++) {
                    let zx = 1.5 * (x - ctx.canvas.width / 2) / (.5 * this.zoom * ctx.canvas.width) + this.panX;
                    let zy = (y - ctx.canvas.height / 2) / (.5 * this.zoom * ctx.canvas.height) + this.panY;
                    let it = 50;
                    while (zx * zx + zy * zy < 4 && it > 0) {
                        let t = zx * zx - zy * zy + zx;
                        zy = 2 * zx * zy + zy;
                        zx = t;
                        it--;
                    }
                    const c = it > 0 ? it * 10 : 0, idx = (y * ctx.canvas.width + x) * 4;
                    p[idx] = c; p[idx + 1] = c / 2; p[idx + 2] = c * 2; p[idx + 3] = 255;
                }
            }
            ctx.putImageData(id, 0, 0);
            this.zoom *= 1.02;
            if (this.zoom > 1e6) this.zoom = 1;
        }
    },
    'recursive-patterns': {
        draw(ctx) {
            function drawCircle(x, y, r) {
                if (r < 5) return;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.stroke();
                const newR = r * .6;
                const angle = Date.now() * 5e-4;
                drawCircle(x + Math.cos(angle) * r, y + Math.sin(angle) * r, newR);
                drawCircle(x - Math.cos(angle) * r, y - Math.sin(angle) * r, newR);
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'white';
            drawCircle(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 4);
        }
    },
    'voronoi': {
        setup(ctx) { this.p = Array.from({ length: 50 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, c: `hsl(${Math.random() * 360},100%,50%)` })); },
        draw(ctx) {
            const id = ctx.createImageData(ctx.canvas.width, ctx.canvas.height), data = id.data;
            for (let x = 0; x < ctx.canvas.width; x += 5) {
                for (let y = 0; y < ctx.canvas.height; y += 5) {
                    let md = Infinity, cp = null;
                    for (const pt of this.p) {
                        const d = (x - pt.x) ** 2 + (y - pt.y) ** 2;
                        if (d < md) { md = d; cp = pt; }
                    }
                    const c = parseInt(cp.c.slice(4)), idx = (y * ctx.canvas.width + x) * 4;
                    data[idx] = c; data[idx + 1] = c; data[idx + 2] = c; data[idx + 3] = 255;
                }
            }
            ctx.putImageData(id, 0, 0);
        }
    },
    'lissajous-curves': {
        setup() { this.t = 0; },
        draw(ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            for (let i = 0; i < Math.PI * 2; i += .01) {
                const x = ctx.canvas.width / 2 + Math.sin(i * 3 + this.t) * ctx.canvas.width / 3;
                const y = ctx.canvas.height / 2 + Math.cos(i * 2) * ctx.canvas.height / 3;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            this.t += .01;
        }
    },
    'turing-pattern': {
        setup() { this.g = Array(100 * 100).fill(0).map(() => [1, Math.random() > .5 ? 1 : 0]); },
        draw(ctx) {
            let ng = this.g.map(c => [...c]);
            for (let i = 1; i < 99; i++) {
                for (let j = 1; j < 99; j++) {
                    let la = 0, lb = 0;
                    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) {
                        la += this.g[(i + x) * 100 + j + y][0];
                        lb += this.g[(i + x) * 100 + j + y][1];
                    }
                    la /= 9; lb /= 9;
                    const a = this.g[i * 100 + j][0], b = this.g[i * 100 + j][1];
                    ng[i * 100 + j][0] = a + (0.5 * (la - a) - a * b * b + 0.055 * (1 - a));
                    ng[i * 100 + j][1] = b + (0.25 * (lb - b) + a * b * b - (0.062 + 0.055) * b);
                }
            }
            this.g = ng;
            const id = ctx.createImageData(100, 100);
            for (let i = 0; i < this.g.length; i++) {
                const v = this.g[i][0] * 255;
                id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255;
            }
            ctx.imageSmoothingEnabled = false;
            createImageBitmap(id).then(bmp => ctx.drawImage(bmp, 0, 0, ctx.canvas.width, ctx.canvas.height));
        }
    },
    'game-of-life': {
        setup(ctx) { this.s = 30; this.w = Math.floor(ctx.canvas.width / this.s); this.h = Math.floor(ctx.canvas.height / this.s); this.g = Array(this.w * this.h).fill(0).map(() => Math.random() > .5 ? 1 : 0); this.isStatic = false; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = 'white';
            for (let x = 0; x < this.w; x++) for (let y = 0; y < this.h; y++) if (this.g[y * this.w + x]) ctx.fillRect(x * this.s, y * this.s, this.s - 1, this.s - 1);
            let ng = [...this.g];
            for (let x = 0; x < this.w; x++) for (let y = 0; y < this.h; y++) {
                let n = 0;
                for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (i || j) {
                    const nx = (x + i + this.w) % this.w, ny = (y + j + this.h) % this.h;
                    n += this.g[ny * this.w + nx];
                }
                const c = this.g[y * this.w + x];
                if (c && (n < 2 || n > 3)) ng[y * this.w + x] = 0;
                else if (!c && n === 3) ng[y * this.w + x] = 1;
            }
            this.g = ng;
        }
    },
    'phyllotaxis': {
        setup() { this.n = 0; this.c = 4; },
        draw(ctx) {
            const a = this.n * 137.5, r = this.c * Math.sqrt(this.n), x = r * Math.cos(a) + ctx.canvas.width / 2, y = r * Math.sin(a) + ctx.canvas.height / 2;
            ctx.fillStyle = `hsl(${this.n % 360},100%,50%)`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            this.n++;
            if (x > ctx.canvas.width || y > ctx.canvas.height) this.n = 0;
        }
    },
    'maze-generator': {
        setup(ctx) { this.s = 20; this.w = Math.floor(ctx.canvas.width / this.s); this.h = Math.floor(ctx.canvas.height / this.s); this.g = Array(this.w * this.h).fill(15); this.st = [0]; },
        draw(ctx) {
            if (this.st.length > 0) {
                const c = this.st[this.st.length - 1], x = c % this.w, y = Math.floor(c / this.w), ns = [];
                if (y > 0 && this.g[c - this.w] === 15) ns.push(c - this.w);
                if (y < this.h - 1 && this.g[c + this.w] === 15) ns.push(c + this.w);
                if (x > 0 && this.g[c - 1] === 15) ns.push(c - 1);
                if (x < this.w - 1 && this.g[c + 1] === 15) ns.push(c + 1);
                if (ns.length > 0) {
                    const n = ns[Math.floor(Math.random() * ns.length)];
                    if (n === c - this.w) { this.g[c] &= ~1; this.g[n] &= ~4; }
                    else if (n === c + this.w) { this.g[c] &= ~4; this.g[n] &= ~1; }
                    else if (n === c - 1) { this.g[c] &= ~8; this.g[n] &= ~2; }
                    else { this.g[c] &= ~2; this.g[n] &= ~8; }
                    this.st.push(n);
                } else this.st.pop();
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'white';
            for (let i = 0; i < this.g.length; i++) {
                const x = i % this.w * this.s, y = Math.floor(i / this.w) * this.s;
                if (this.g[i] & 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + this.s, y); ctx.stroke(); }
                if (this.g[i] & 2) { ctx.beginPath(); ctx.moveTo(x + this.s, y); ctx.lineTo(x + this.s, y + this.s); ctx.stroke(); }
                if (this.g[i] & 4) { ctx.beginPath(); ctx.moveTo(x, y + this.s); ctx.lineTo(x + this.s, y + this.s); ctx.stroke(); }
                if (this.g[i] & 8) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + this.s); ctx.stroke(); }
            }
        }
    },
};
