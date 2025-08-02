// js/animations/retro.js
import { drawClockOnCanvas } from '../utils/helpers.js';

export const retroAnimations = {
    'digital-rain': {
        setup(ctx) { this.f = 18; this.c = Math.ceil(ctx.canvas.width / this.f); this.d = Array(this.c).fill(1); this.h = '0123456789ABCDEF'; },
        draw(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.fillStyle = '#0F0'; ctx.font = `${this.f}px VT323`; for (let i = 0; i < this.d.length; i++) { const t = this.h.charAt(Math.floor(Math.random() * this.h.length)); ctx.fillText(t, i * this.f, this.d[i] * this.f); if (this.d[i] * this.f > ctx.canvas.height && Math.random() > .975) this.d[i] = 0; this.d[i]++; } }
    },
    'code-rain': {
        setup(ctx) { this.f = 16; this.c = Math.ceil(ctx.canvas.width / this.f); this.d = Array(this.c).fill(1); this.h = '01'; },
        draw(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.fillStyle = '#00FF00'; ctx.font = `${this.f}px monospace`; for (let i = 0; i < this.d.length; i++) { ctx.fillText(this.h.charAt(Math.floor(Math.random() * this.h.length)), i * this.f, this.d[i] * this.f); if (this.d[i] * this.f > ctx.canvas.height && Math.random() > .95) this.d[i] = 0; this.d[i]++; } }
    },
    'neon-grid': {
        setup() { this.t = 0; },
        draw(ctx) { ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.strokeStyle = '#FF00FF'; ctx.lineWidth = 1; for (let i = 0; i < 50; i++) { const p = i / 50, y = ctx.canvas.height / 2 + Math.pow(p, 2) * ctx.canvas.height / 2; ctx.globalAlpha = p; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke(); } ctx.globalAlpha = 1; this.t += .01; }
    },
    'waveform-animation': {
        setup() { this.t = 0; },
        draw(ctx) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.strokeStyle = 'cyan'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x < ctx.canvas.width; x++) { const y = ctx.canvas.height / 2 + Math.sin(x * .02 + this.t) * 100 * Math.sin(x * .001 + this.t); if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); this.t += .05; }
    },
    'audio-visualizer': {
        async setup(ctx, settings, startAnimation, appState) {
            if (!appState.audio.context) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    appState.audio.context = new (window.AudioContext || window.webkitAudioContext)();
                    appState.audio.analyser = appState.audio.context.createAnalyser();
                    appState.audio.source = appState.audio.context.createMediaStreamSource(stream);
                    appState.audio.source.connect(appState.audio.analyser);
                    appState.audio.analyser.fftSize = 256;
                    const bufferLength = appState.audio.analyser.frequencyBinCount;
                    appState.audio.dataArray = new Uint8Array(bufferLength);
                    appState.audio.enabled = true;
                } catch (e) {
                    appState.audio.enabled = false;
                }
            }
        },
        draw(ctx, settings, mouse, dom, appState) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const bufferLength = appState.audio.enabled ? appState.audio.analyser.frequencyBinCount : 64;
            const barWidth = ctx.canvas.width / bufferLength;
            if (appState.audio.enabled) appState.audio.analyser.getByteFrequencyData(appState.audio.dataArray);
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = appState.audio.enabled ? appState.audio.dataArray[i] * 2.5 : Math.sin(Date.now() * .005 + i * .2) * 50 + 100;
                ctx.fillStyle = `hsl(${i / bufferLength * 360},100%,50%)`;
                ctx.fillRect(i * barWidth, ctx.canvas.height - barHeight, barWidth - 1, barHeight);
            }
            const time = new Date();
            drawClockOnCanvas(ctx, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        }
    },
    'lightning-effect': {
        draw(ctx) {
            function l(x1, y1, x2, y2, s) {
                if (s < 1) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return; }
                const mx = (x1 + x2) / 2 + (Math.random() - .5) * 50, my = (y1 + y2) / 2 + (Math.random() - .5) * 50;
                l(x1, y1, mx, my, s - 1);
                l(mx, my, x2, y2, s - 1);
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (Math.random() > .95) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = Math.random() * 3 + 1;
                l(Math.random() * ctx.canvas.width, 0, Math.random() * ctx.canvas.width, ctx.canvas.height, 5);
            }
        }
    },
    'blueprint': {
        setup() { this.shape = null; },
        draw(ctx) {
            ctx.fillStyle = '#001f3f';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'rgba(0,116,217,0.5)';
            for (let i = 0; i < ctx.canvas.width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ctx.canvas.height); ctx.stroke(); }
            for (let i = 0; i < ctx.canvas.height; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(ctx.canvas.width, i); ctx.stroke(); }
            if (Math.random() > .99) { this.shape = { x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, w: Math.random() * 200, h: Math.random() * 200 }; }
            if (this.shape) { const s = this.shape; ctx.strokeStyle = 'white'; ctx.strokeRect(s.x, s.y, s.w, s.h); }
        }
    },
    'sonar-sweep': {
        setup(ctx) { this.p = Array.from({ length: 200 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, a: 0 })); this.a = 0; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
            this.p.forEach(pt => { if (pt.a > 0) { ctx.fillStyle = `rgba(0,255,0,${pt.a})`; ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill(); pt.a -= .01; } });
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.a);
            ctx.strokeStyle = 'rgba(0,255,0,0.5)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ctx.canvas.width, 0);
            ctx.stroke();
            ctx.restore();
            this.p.forEach(pt => { const dx = pt.x - cx, dy = pt.y - cy, pa = Math.atan2(dy, dx); if (Math.abs(pa - this.a) < .05) pt.a = 1; });
            this.a += .02;
        }
    },
    'circuit-board': {
        setup() { this.p = []; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (this.p.length < 500 && Math.random() > .5) {
                let x = Math.floor(Math.random() * 50) * 20, y = Math.floor(Math.random() * 50) * 20, d = Math.floor(Math.random() * 4);
                this.p.push({ x, y, d, l: 50 });
            }
            ctx.strokeStyle = 'green';
            this.p.forEach(pt => {
                const { x, y, d } = pt;
                let nx = x, ny = y;
                if (d === 0) ny -= 20; else if (d === 1) nx += 20; else if (d === 2) ny += 20; else nx -= 20;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.stroke();
                pt.x = nx; pt.y = ny; pt.l--;
                if (pt.l <= 0 || Math.random() > .9) pt.d = Math.floor(Math.random() * 4);
            });
            this.p = this.p.filter(pt => pt.l > 0);
        }
    },
    'halftone': {
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            for (let x = 0; x < ctx.canvas.width; x += 10) for (let y = 0; y < ctx.canvas.height; y += 10) {
                const s = Math.abs(Math.sin(x * .01 + Date.now() * .001) * Math.cos(y * .01 + Date.now() * .001)) * 5;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x, y, s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    'warp-drive': {
        setup(ctx) { this.s = Array.from({ length: 500 }, () => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, z: Math.random() * ctx.canvas.width })); },
        draw(ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = 'white';
            const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
            this.s.forEach(st => {
                st.z -= 5;
                if (st.z <= 0) st.z = ctx.canvas.width;
                const px = cx + (st.x - cx) / st.z * cx, py = cy + (st.y - cy) / st.z * cy, pz = cx / st.z;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + (px - cx) * .1, py + (py - cy) * .1);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = pz;
                ctx.stroke();
            });
        }
    },
    'bouncing-dvd': {
        setup() { this.s = { x: 50, y: 50, vx: 2, vy: 2, w: 100, h: 50, c: `hsl(${Math.random() * 360},100%,50%)` }; },
        draw(ctx) {
            const s = this.s;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            s.x += s.vx;
            s.y += s.vy;
            let hit = false;
            if (s.x <= 0 || s.x + s.w >= ctx.canvas.width) { s.vx *= -1; hit = true; }
            if (s.y <= 0 || s.y + s.h >= ctx.canvas.height) { s.vy *= -1; hit = true; }
            if (hit) s.c = `hsl(${Math.random() * 360},100%,50%)`;
            ctx.fillStyle = s.c;
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText("DVD", s.x + 20, s.y + 35);
        }
    },
};
