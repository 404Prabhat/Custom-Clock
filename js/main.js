import { animations } from './animations/index.js';
import { makeInteractive } from './interactive.js';

(function() {
    'use strict';

    // SECTION: DOM Element References
    const dom = {
        body: document.body,
        clock: { wrapper: document.getElementById('clock-wrapper'), hours: document.getElementById('hours'), minutes: document.getElementById('minutes'), seconds: document.getElementById('seconds-display'), amPm: document.getElementById('am-pm'), date: document.getElementById('date-display'), timeDisplay: document.getElementById('time-display') },
        settings: { button: document.getElementById('settings-button'), panel: document.getElementById('settings-panel'), content: document.querySelector('.panel-content'), backBtn: document.querySelector('.panel-back-button'), title: document.querySelector('.panel-title'), lockToggle: document.getElementById('lock-toggle'), snapToggle: document.getElementById('snap-toggle'), positionPreset: document.getElementById('position-preset'), sizeSlider: document.getElementById('size-slider'), sizePlus: document.getElementById('size-plus'), sizeMinus: document.getElementById('size-minus'), timeFont: document.getElementById('time-font'), timeColor: document.getElementById('time-color'), dateFont: document.getElementById('date-font'), dateColor: document.getElementById('date-color'), shadowPresets: document.getElementById('shadow-presets'), shadowColor: document.getElementById('shadow-color'), shadowBlur: document.getElementById('shadow-blur'), imageUploadInput: document.getElementById('image-upload-input'), imageUploadLabel: document.querySelector('label[for="image-upload-input"]') },
        fontLinks: { time: document.getElementById('google-font-time'), date: document.getElementById('google-font-date'), },
        canvas: document.getElementById('background-canvas'),
    };
    const ctx = dom.canvas.getContext('2d');

    // SECTION: Application State & Settings
    let settings;
    const defaultSettings = {
        theme: 'dark',
        clock: { format: '12h', position: { preset: 'center', custom: { x: '50%', y: '50%' } }, size: 50, snap: false, style: { time: { font: 'System Default', color: '#ffffff' }, date: { font: 'System Default', color: '#dddddd' }, shadow: { preset: 'soft', color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 5 } } },
        currentAnimation: 'none',
        isLocked: true,
        customBackgroundImage: null,
    };
    let animationFrameId = null;
    let panelHistory = ['page-main'];
    let mouse = { x: 0, y: 0, down: false };
    const availableFonts = [ 'System Default', 'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Code Pro', 'Raleway' ];
    let appState = { audio: { context: null, analyser: null, dataArray: null, source: null, enabled: false } };

    // SECTION: Core Clock Logic
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        dom.clock.minutes.textContent = String(now.getMinutes()).padStart(2, '0');
        dom.clock.seconds.textContent = `:${String(now.getSeconds()).padStart(2, '0')}`;
        dom.clock.amPm.style.display = settings.clock.format === '12h' ? 'inline' : 'none';
        if (settings.clock.format === '12h') { dom.clock.amPm.textContent = hours >= 12 ? 'PM' : 'AM'; hours = hours % 12 || 12; }
        dom.clock.hours.textContent = String(hours).padStart(2, '0');
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dom.clock.date.textContent = now.toLocaleDateString(navigator.language, dateOptions);
    }

    // SECTION: Settings Persistence & Application
    function saveSettings() { localStorage.setItem('clockSettingsV5', JSON.stringify(settings)); }
    function loadSettings() {
        let saved;
        try { saved = JSON.parse(localStorage.getItem('clockSettingsV5')); } catch (e) { saved = null; }
        settings = Object.assign({}, JSON.parse(JSON.stringify(defaultSettings)), saved);
        applyAllSettings();
    }
    function applyAllSettings() {
        dom.body.className = settings.theme === 'light' ? 'light-theme' : '';
        dom.settings.lockToggle.classList.toggle('active', settings.isLocked);
        dom.clock.wrapper.classList.toggle('edit-mode', !settings.isLocked);
        dom.settings.snapToggle.classList.toggle('active', settings.clock.snap);
        applyPosition();
        dom.settings.positionPreset.value = settings.clock.position.preset;

        // Use clamp() for responsive font sizes
        const sizeRatio = settings.clock.size / 50; // Base size is 50
        dom.clock.wrapper.style.width = `clamp(150px, ${settings.clock.size}vw, 1000px)`;
        dom.clock.timeDisplay.style.fontSize = `clamp(30px, ${8 * sizeRatio}vw, 150px)`;
        dom.clock.amPm.style.fontSize = `clamp(12px, ${3 * sizeRatio}vw, 40px)`;
        dom.clock.date.style.fontSize = `clamp(14px, ${2.5 * sizeRatio}vw, 50px)`;

        dom.settings.sizeSlider.value = settings.clock.size;
        applyStyle();
        applyCustomBackground();
        startAnimation(settings.currentAnimation);
    }
    function applyPosition() {
        const pos = settings.clock.position;
        const wrapperStyle = dom.clock.wrapper.style;
        wrapperStyle.top = wrapperStyle.bottom = wrapperStyle.left = wrapperStyle.right = wrapperStyle.transform = '';
        if (pos.preset === 'custom') {
            wrapperStyle.left = pos.custom.x;
            wrapperStyle.top = pos.custom.y;
        } else {
            const positions = {
                'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                'top-left': { top: '20px', left: '20px' },
                'top-right': { top: '20px', right: '20px' },
                'bottom-left': { bottom: '20px', left: '20px' },
                'bottom-right': { bottom: '20px', right: '20px' },
                'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
                'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
            };
            Object.assign(wrapperStyle, positions[pos.preset]);
        }
    }
    function applyStyle() {
        const style = settings.clock.style;
        updateFont('time', style.time.font);
        updateFont('date', style.date.font);
        dom.clock.timeDisplay.style.fontFamily = style.time.font === 'System Default' ? '' : `"${style.time.font}"`;
        dom.clock.date.style.fontFamily = style.date.font === 'System Default' ? '' : `"${style.date.font}"`;
        dom.clock.timeDisplay.style.color = style.time.color;
        dom.clock.date.style.color = style.date.color;
        const s = style.shadow;
        dom.clock.wrapper.style.textShadow = s.preset === 'none' ? 'none' : `${s.x}px ${s.y}px ${s.blur}px ${s.color}`;
        dom.settings.timeFont.value = style.time.font;
        dom.settings.timeColor.value = style.time.color;
        dom.settings.dateFont.value = style.date.font;
        dom.settings.dateColor.value = style.date.color;
        dom.settings.shadowColor.value = s.color;
        dom.settings.shadowBlur.value = s.blur;
        document.querySelectorAll('#shadow-presets button').forEach(b => b.classList.remove('active'));
        const activePreset = document.querySelector(`#shadow-presets button[data-preset="${s.preset}"]`);
        if (activePreset) activePreset.classList.add('active');
    }
    function updateFont(type, fontName) {
        const linkElement = dom.fontLinks[type];
        if (fontName === 'System Default' || !availableFonts.includes(fontName)) { linkElement.href = ''; }
        else { const fontQuery = fontName.replace(/ /g, '+'); linkElement.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;600&display=swap`; }
    }
    function applyCustomBackground() {
        if (settings.customBackgroundImage && settings.currentAnimation === 'none') {
            dom.body.style.backgroundImage = `url(${settings.customBackgroundImage})`;
        } else {
            dom.body.style.backgroundImage = '';
        }
    }

    // SECTION: Settings Panel Navigation & Actions
    function navigateTo(pageId) {
        const nextPage = document.getElementById(pageId);
        if (!nextPage) return;
        document.querySelector('.panel-page.active').classList.remove('active');
        nextPage.classList.add('active');
        panelHistory.push(pageId);
        updatePanelHeader();
    }
    function navigateBack() {
        if (panelHistory.length <= 1) return;
        document.getElementById(panelHistory.pop()).classList.remove('active');
        document.getElementById(panelHistory[panelHistory.length - 1]).classList.add('active');
        updatePanelHeader();
    }
    function updatePanelHeader() {
        const pageId = panelHistory[panelHistory.length - 1];
        dom.settings.backBtn.style.visibility = panelHistory.length > 1 ? 'visible' : 'hidden';
        const titleMap = { 'page-main': 'Settings', 'page-themes': 'Themes', 'page-render-themes': 'Custom Animations', 'page-custom-theme': 'Custom Background Image', 'page-preferences': 'Preferences' };
        dom.settings.title.textContent = titleMap[pageId] || 'Settings';
    }
    function handleAction(action, value) {
        switch (action) {
            case 'toggle-lock': settings.isLocked = !settings.isLocked; break;
            case 'toggle-snap': settings.clock.snap = !settings.clock.snap; break;
            case 'set-theme': settings.theme = value; break;
            case 'set-animation':
                settings.customBackgroundImage = null;
                startAnimation(value);
                dom.settings.panel.classList.remove('open');
                break;
            case 'remove-custom-bg':
                settings.customBackgroundImage = null;
                applyCustomBackground();
                break;
        }
        applyAllSettings();
        saveSettings();
    }

    // SECTION: Animation Engine
    function stopCurrentAnimation() {
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        if (appState.audio.source) { appState.audio.source.disconnect(); appState.audio.enabled = false; appState.audio.source = null; }
        ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
        dom.canvas.style.display = 'none';
        dom.clock.wrapper.style.visibility = 'visible';
    }
    function startAnimation(name) {
        stopCurrentAnimation();
        settings.currentAnimation = name;
        const anim = animations[name];

        applyCustomBackground();

        if (name === 'none' || !anim) return;

        dom.body.style.backgroundImage = '';
        dom.canvas.style.display = 'block';
        setupCanvas();

        const clockDrawingThemes = ['orbital', 'glitch-matrix', 'ascii-art', 'word-clock', 'sundial', 'audio-visualizer'];
        dom.clock.wrapper.style.visibility = clockDrawingThemes.includes(name) ? 'hidden' : 'visible';

        const loop = () => {
            try {
                if (anim.draw) anim.draw(ctx, settings, mouse, dom, appState);
                animationFrameId = requestAnimationFrame(loop);
            } catch (e) {
                console.error(`Error in animation loop for "${name}":`, e);
                stopCurrentAnimation();
            }
        };

        try {
            if (anim.setup) anim.setup(ctx, settings, startAnimation, appState);
            loop();
        } catch (e) {
            console.error(`Error starting animation "${name}":`, e);
            stopCurrentAnimation();
        }
    }
    function setupCanvas() { dom.canvas.width = window.innerWidth; dom.canvas.height = window.innerHeight; }

    // SECTION: Event Listeners
    function setupEventListeners() {
        dom.settings.button.addEventListener('click', () => dom.settings.panel.classList.toggle('open'));
        dom.settings.backBtn.addEventListener('click', navigateBack);
        dom.settings.content.addEventListener('click', (e) => {
            const item = e.target.closest('.setting-item');
            if (item) { const { action, target, value } = item.dataset; if (target) navigateTo(target); else if (action) handleAction(action, value); }
        });
        dom.settings.positionPreset.addEventListener('change', (e) => { settings.clock.position.preset = e.target.value; applyPosition(); saveSettings(); });
        dom.settings.sizeSlider.addEventListener('input', (e) => { settings.clock.size = e.target.value; applyAllSettings(); });
        dom.settings.sizeSlider.addEventListener('change', saveSettings);
        dom.settings.sizePlus.addEventListener('click', () => { dom.settings.sizeSlider.value++; dom.settings.sizeSlider.dispatchEvent(new Event('input')); dom.settings.sizeSlider.dispatchEvent(new Event('change')); });
        dom.settings.sizeMinus.addEventListener('click', () => { dom.settings.sizeSlider.value--; dom.settings.sizeSlider.dispatchEvent(new Event('input')); dom.settings.sizeSlider.dispatchEvent(new Event('change')); });
        const styleChangeHandler = () => {
            settings.clock.style.time.font = dom.settings.timeFont.value;
            settings.clock.style.time.color = dom.settings.timeColor.value;
            settings.clock.style.date.font = dom.settings.dateFont.value;
            settings.clock.style.date.color = dom.settings.dateColor.value;
            settings.clock.style.shadow.color = dom.settings.shadowColor.value;
            settings.clock.style.shadow.blur = dom.settings.shadowBlur.value;
            settings.clock.style.shadow.preset = 'custom';
            applyStyle();
            saveSettings();
        };
        ['timeFont', 'timeColor', 'dateFont', 'dateColor', 'shadowColor', 'shadowBlur'].forEach(id => { dom.settings[id].addEventListener('input', styleChangeHandler); });
        dom.settings.shadowPresets.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const preset = e.target.dataset.preset;
                settings.clock.style.shadow.preset = preset;
                if (preset === 'none') { settings.clock.style.shadow.blur = 0; }
                if (preset === 'soft') { settings.clock.style.shadow.blur = 10; settings.clock.style.shadow.x = 0; settings.clock.style.shadow.y = 5; }
                if (preset === 'hard') { settings.clock.style.shadow.blur = 0; settings.clock.style.shadow.x = 5; settings.clock.style.shadow.y = 5; }
                applyStyle();
                saveSettings();
            }
        });

        dom.settings.imageUploadLabel.addEventListener('click', (e) => {
            e.preventDefault();
            dom.settings.imageUploadInput.click();
        });
        dom.settings.imageUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                settings.customBackgroundImage = event.target.result;
                settings.currentAnimation = 'none';
                saveSettings();
                applyAllSettings();
                dom.settings.panel.classList.remove('open');
            };
            reader.readAsDataURL(file);
        });

        window.addEventListener('resize', () => { if (settings.currentAnimation !== 'none') startAnimation(settings.currentAnimation); });

        // --- ENHANCED INTERACTIVITY LISTENERS ---
        document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        document.addEventListener('mousedown', () => mouse.down = true);
        document.addEventListener('mouseup', () => mouse.down = false);

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 's') {
                dom.settings.panel.classList.toggle('open');
            }
            if (e.key === 'Escape') {
                dom.settings.panel.classList.remove('open');
            }
        });

        // Swipe Gestures for Mobile
        let touchStartX = 0;
        let touchEndX = 0;
        dom.body.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        dom.body.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }, { passive: true });
        function handleSwipeGesture() {
            if (touchEndX < touchStartX - 50) { // Swipe Left
                dom.settings.panel.classList.add('open');
            }
            if (touchEndX > touchStartX + 50) { // Swipe Right
                dom.settings.panel.classList.remove('open');
            }
        }

        makeInteractive(dom, settings, applyPosition, applyAllSettings, saveSettings);
    }

    // SECTION: Initialization
    function init() {
        availableFonts.forEach(font => {
            dom.settings.timeFont.innerHTML += `<option value="${font}">${font}</option>`;
            dom.settings.dateFont.innerHTML += `<option value="${font}">${font}</option>`;
        });
        loadSettings();
        updateTime();
        setInterval(updateTime, 1000);
        setupEventListeners();

        // --- PWA SERVICE WORKER REGISTRATION ---
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
