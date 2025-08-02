// js/utils/helpers.js

export class Particle {
    constructor(x, y, vx, vy, size, color, life) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.size = size; this.color = color; this.life = life || Infinity;
        this.opacity = 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    draw(context) {
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    }
}

export function drawClockOnCanvas(context, time, date) {
    const canvas = context.canvas;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const clockFontSize = canvas.width * 0.1;
    context.font = `bold ${clockFontSize}px Roboto`;
    context.fillText(time, canvas.width / 2, canvas.height / 2);
    const dateFontSize = canvas.width * 0.025;
    context.font = `normal ${dateFontSize}px Roboto`;
    context.fillText(date, canvas.width / 2, canvas.height / 2 + clockFontSize * 0.7);
}
