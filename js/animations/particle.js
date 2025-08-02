// js/animations/particle.js
import { Particle } from '../utils/helpers.js';

export const particleAnimations = {
    'particle-system': {
        setup(ctx) { this.particles = Array.from({ length: 150 }, () => new Particle(Math.random() * ctx.canvas.width, Math.random() * ctx.canvas.height, Math.random() * 1 - .5, Math.random() * 1 - .5, Math.random() * 2 + 1, `rgba(255,255,255,${Math.random()})`)); },
        draw(ctx) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); this.particles.forEach(p => { p.update(); if (p.x < 0 || p.x > ctx.canvas.width) p.vx *= -1; if (p.y < 0 || p.y > ctx.canvas.height) p.vy *= -1; p.draw(ctx); }); }
    },
    'starfield': {
        setup(ctx) { this.stars = Array.from({ length: 800 }, () => ({ x: Math.random() * ctx.canvas.width - ctx.canvas.width / 2, y: Math.random() * ctx.canvas.height - ctx.canvas.height / 2, z: Math.random() * ctx.canvas.width })); },
        draw(ctx) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.fillStyle = 'white'; ctx.save(); ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); this.stars.forEach(s => { s.z -= 2; if (s.z <= 0) { s.x = Math.random() * ctx.canvas.width - ctx.canvas.width / 2; s.y = Math.random() * ctx.canvas.height - ctx.canvas.height / 2; s.z = ctx.canvas.width; } const k = 128 / s.z, px = s.x * k, py = s.y * k, z = (1 - s.z / ctx.canvas.width) * 5; ctx.beginPath(); ctx.arc(px, py, z, 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); }
    },
    'fireworks': {
        setup() { this.fireworks = []; },
        draw(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); if (Math.random() < .02) { const x = Math.random() * ctx.canvas.width, c = `hsl(${Math.random() * 360},100%,50%)`; for (let i = 0; i < 50; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 5 + 2; this.fireworks.push(new Particle(x, ctx.canvas.height, Math.cos(a) * s, Math.sin(a) * s - 10, 2, c, 100)); } } this.fireworks = this.fireworks.filter(p => p.life > 0); this.fireworks.forEach(p => { p.vy += .2; p.update(); p.draw(ctx); }); }
    },
    'fluid-simulation': {
        setup() { this.t = 0; },
        draw(ctx) { for (let x = 0; x < ctx.canvas.width; x += 10) for (let y = 0; y < ctx.canvas.height; y += 10) { const r = Math.sin(x * .01 + this.t) * 128 + 128, g = Math.sin(y * .01 + this.t) * 128 + 128, b = Math.cos((x + y) * .01 + this.t) * 128 + 128; ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(x, y, 10, 10); } this.t += .01; }
    },
    'smoke-trails': {
        setup() { this.p = []; },
        draw(ctx, settings, mouse) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); if (mouse.x) this.p.push(new Particle(mouse.x, mouse.y, Math.random() - .5, Math.random() - .5, 20, 'white', 50)); this.p = this.p.filter(p => p.life > 0); this.p.forEach(p => { p.size *= .95; p.color = `rgba(255,255,255,${p.life / 50})`; p.update(); p.draw(ctx); }); }
    },
    'spiral-galaxy': {
        setup(ctx) { this.p = []; const a = 4; for (let i = 0; i < 1e3; i++) { const n = (i / 1e3) * Math.PI * 2 * a + Math.random() * .1, d = Math.random() * ctx.canvas.width * .4; this.p.push({ x: Math.cos(n) * d, y: Math.sin(n) * d, s: .001 / (d * .01 + 1) }); } },
        draw(ctx) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.save(); ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); this.p.forEach(p => { const a = Math.atan2(p.y, p.x) + p.s, d = Math.sqrt(p.x * p.x + p.y * p.y); p.x = Math.cos(a) * d; p.y = Math.sin(a) * d; ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); }
    },
    'glowing-particles': {
        setup(ctx) { this.p = Array.from({ length: 100 }, () => new Particle(Math.random() * ctx.canvas.width, Math.random() * ctx.canvas.height, 0, 0, Math.random() * 3 + 1, 'white')); },
        draw(ctx) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); this.p.forEach(p => { ctx.globalAlpha = Math.sin(Date.now() * .001 + p.x) * .5 + .5; p.draw(ctx); }); ctx.globalAlpha = 1; }
    },
    'interactive-dots': {
        setup(ctx) { this.p = Array.from({ length: 150 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, s: Math.random() * 2 + 1, d: Math.random() * 30 + 1 })); },
        draw(ctx, settings, mouse) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.fillStyle = 'white'; this.p.forEach(p => { if (mouse.x) { const dx = mouse.x - p.x, dy = mouse.y - p.y, di = Math.sqrt(dx * dx + dy * dy); if (di < 100) { p.x -= dx / (p.d * 5); p.y -= dy / (p.d * 5); } } ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); }); }
    },
    'metaballs': {
        setup(ctx) { this.b = Array.from({ length: 5 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, r: Math.random() * 50 + 50, vx: Math.random() * 4 - 2, vy: Math.random() * 4 - 2 })); },
        draw(ctx) { const id = ctx.createImageData(ctx.canvas.width, ctx.canvas.height), data = id.data; for (let i = 0; i < this.b.length; i++) { this.b[i].x += this.b[i].vx; this.b[i].y += this.b[i].vy; if (this.b[i].x < 0 || this.b[i].x > ctx.canvas.width) this.b[i].vx *= -1; if (this.b[i].y < 0 || this.b[i].y > ctx.canvas.height) this.b[i].vy *= -1; } for (let x = 0; x < ctx.canvas.width; x += 4) for (let y = 0; y < ctx.canvas.height; y += 4) { let s = 0; for (let i = 0; i < this.b.length; i++) { const dx = x - this.b[i].x, dy = y - this.b[i].y; s += this.b[i].r * this.b[i].r / (dx * dx + dy * dy); } if (s > 1) { const idx = (y * ctx.canvas.width + x) * 4; data[idx] = 255; data[idx + 1] = 255; data[idx + 2] = 255; data[idx + 3] = 255; } } ctx.putImageData(id, 0, 0); }
    },
    'rain-on-window': {
        setup(ctx) { this.r = Array.from({ length: 100 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, l: Math.random() * 2, s: Math.random() * 2 + 1 })); },
        draw(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.strokeStyle = 'rgba(200,200,255,0.5)'; this.r.forEach(p => { p.y += p.s; p.x -= p.s / 4; if (p.y > ctx.canvas.height) p.y = 0; if (p.x < 0) p.x = ctx.canvas.width; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.l, p.y - p.l * 4); ctx.stroke(); }); }
    },
};
