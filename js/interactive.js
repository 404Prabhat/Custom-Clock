// js/interactive.js
export function makeInteractive(dom, settings, applyPosition, applyAllSettings, saveSettings) {
    let dragInfo = {};
    let pinchInfo = {};

    const startDrag = (e) => {
        if (settings.isLocked) return;
        e.preventDefault();
        dom.clock.wrapper.classList.add('dragging');
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        dragInfo = {
            offsetX: clientX - dom.clock.wrapper.offsetLeft,
            offsetY: clientY - dom.clock.wrapper.offsetTop
        };
    };

    const doDrag = (e) => {
        if (!dom.clock.wrapper.classList.contains('dragging')) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        let newX = clientX - dragInfo.offsetX;
        let newY = clientY - dragInfo.offsetY;
        if (settings.clock.snap) {
            newX = Math.round(newX / 25) * 25;
            newY = Math.round(newY / 25) * 25;
        }
        settings.clock.position.custom.x = `${newX}px`;
        settings.clock.position.custom.y = `${newY}px`;
        settings.clock.position.preset = 'custom';
        applyPosition();
        dom.settings.positionPreset.value = 'custom';
    };

    const stopDrag = () => {
        if (!dom.clock.wrapper.classList.contains('dragging')) return;
        dom.clock.wrapper.classList.remove('dragging');
        saveSettings();
    };

    const startPinch = (e) => {
        if (settings.isLocked || e.touches.length < 2) return;
        e.preventDefault();
        let dx = e.touches[0].clientX - e.touches[1].clientX;
        let dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchInfo = {
            dist: Math.sqrt(dx * dx + dy * dy),
            size: settings.clock.size
        };
    };

    const doPinch = (e) => {
        if (!pinchInfo.dist || e.touches.length < 2) return;
        e.preventDefault();
        let dx = e.touches[0].clientX - e.touches[1].clientX;
        let dy = e.touches[0].clientY - e.touches[1].clientY;
        let newDist = Math.sqrt(dx * dx + dy * dy);
        let scale = newDist / pinchInfo.dist;
        let newSize = Math.max(10, Math.min(100, pinchInfo.size * scale));
        settings.clock.size = newSize;
        applyAllSettings();
    };

    const stopPinch = () => {
        if (!pinchInfo.dist) return;
        pinchInfo = {};
        saveSettings();
    };

    // Mouse events
    dom.clock.wrapper.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    // Touch events
    dom.clock.wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) startDrag(e);
        else if (e.touches.length === 2) startPinch(e);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && dom.clock.wrapper.classList.contains('dragging')) doDrag(e);
        else if (e.touches.length === 2) doPinch(e);
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        stopDrag();
        stopPinch();
    });
}
