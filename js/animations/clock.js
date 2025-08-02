import { Particle, drawClockOnCanvas } from '../utils/helpers.js';

export const clockBasedAnimations = {
    'orbital': {
        setup() { this.angle = 0; },
        draw(ctx, settings, mouse, dom, appState) {
            const time = new Date();
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.rotate(this.angle);
            drawClockOnCanvas(ctx, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            ctx.restore();
            this.angle += 5e-4;
        }
    },
    'glitch-matrix': {
        draw(ctx) {
            ctx.fillStyle = 'rgba(0,20,0,0.2)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const time = new Date();
            ctx.font = `bold ${ctx.canvas.width * .1}px VT323`;
            ctx.fillStyle = '#0F0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), ctx.canvas.width / 2, ctx.canvas.height / 2);
            if (Math.random() > .9) {
                let h = Math.random() * ctx.canvas.height;
                let o = Math.random() * 20 - 10;
                ctx.drawImage(ctx.canvas, 0, h, ctx.canvas.width, 30, o, h, ctx.canvas.width, 30);
            }
        }
    },
    'ascii-art': {
        setup() { this.chars = '@%#*+=-:. '; this.fontSize = 10; },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const buffer = document.createElement('canvas');
            buffer.width = ctx.canvas.width;
            buffer.height = ctx.canvas.height;
            const bufferCtx = buffer.getContext('2d');
            const time = new Date();
            drawClockOnCanvas(bufferCtx, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            const id = bufferCtx.getImageData(0, 0, buffer.width, buffer.height).data;
            ctx.fillStyle = 'white';
            ctx.font = `${this.fontSize}px monospace`;
            for (let y = 0; y < ctx.canvas.height; y += this.fontSize) {
                for (let x = 0; x < ctx.canvas.width; x += this.fontSize) {
                    const i = (y * ctx.canvas.width + x) * 4;
                    const br = (id[i] + id[i + 1] + id[i + 2]) / 3 / 255;
                    const ci = Math.floor(br * (this.chars.length - 1));
                    ctx.fillText(this.chars[ci], x, y);
                }
            }
        }
    },
    'word-clock': {
        setup() {
            this.words = [
                ["IT", "IS", "HALF", "TEN"], ["A", "QUARTER", "TWENTY"], ["FIVE", "MINUTES", "PAST", "TO"],
                ["ONE", "TWO", "THREE", "FOUR"], ["FIVE", "SIX", "SEVEN", "EIGHT"],
                ["NINE", "TEN", "ELEVEN", "TWELVE"], ["O'CLOCK", "AM", "PM"]
            ];
        },
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.textAlign = 'center';
            ctx.font = `bold ${ctx.canvas.width * .05}px 'Share Tech Mono'`;
            const time = new Date(), h = time.getHours(), m = time.getMinutes();
            const activeWords = new Set(["IT", "IS"]);
            if (m >= 35) activeWords.add("TO"); else if (m >= 5) activeWords.add("PAST");
            const roundedM = Math.floor(m / 5) * 5;
            if (roundedM === 30) activeWords.add("HALF");
            else if (roundedM === 15 || roundedM === 45) activeWords.add("A").add("QUARTER");
            else if (roundedM === 20 || roundedM === 25 || roundedM === 35 || roundedM === 40) activeWords.add("TWENTY");
            if (roundedM === 5 || roundedM === 25 || roundedM === 35 || roundedM === 55) activeWords.add("FIVE");
            if (roundedM === 10 || roundedM === 50) activeWords.add("TEN");
            if (roundedM > 0 && roundedM !== 15 && roundedM !== 30 && roundedM !== 45) activeWords.add("MINUTES");
            const hourForWord = m >= 35 ? (h + 1) % 24 : h;
            const hourWord = [null, "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE"][hourForWord % 12 || 12];
            activeWords.add(hourWord);
            if (m < 5) activeWords.add("O'CLOCK");

            this.words.forEach((row, ri) => {
                row.forEach((word, ci) => {
                    ctx.fillStyle = activeWords.has(word) ? 'white' : '#444';
                    ctx.fillText(word, ctx.canvas.width / 2 - ctx.canvas.width * .3 + ci * ctx.canvas.width * .15, ctx.canvas.height / 2 - ctx.canvas.height * .3 + ri * ctx.canvas.height * .1);
                });
            });
        }
    },
    'sundial': {
        draw(ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2, r = Math.min(cx, cy) * .8, time = new Date();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            const sa = (time.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
            const ma = (time.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
            const ha = ((time.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sa) * r * .9, cy + Math.sin(sa) * r * .9); ctx.stroke();
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * r * .8, cy + Math.sin(ma) * r * .8); ctx.stroke();
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * r * .5, cy + Math.sin(ha) * r * .5); ctx.stroke();
        }
    },
};
