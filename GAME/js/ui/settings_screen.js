/**
 * settings_screen.js
 * 遊戲設置界面，處理各種遊戲設置的調整。
 */

class SettingsScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.container = document.getElementById('settings-screen');
        this.settings = {
            bgmVolume: 0.7,
            sfxVolume: 0.8,
            battleSpeed: 1,
            graphicsQuality: 'high',
            language: 'zh_TW'
        };

        this.initialize();
    }

    initialize() {
        // 創建設置界面的HTML結構
        this.container.innerHTML = `
            <div class="settings-panel">
                <h2>遊戲設置</h2>
                <div class="settings-group">
                    <h3>音效設置</h3>
                    <div class="setting-item">
                        <label>背景音樂音量</label>
                        <input type="range" id="bgm-volume" min="0" max="1" step="0.1" value="${this.settings.bgmVolume}">
                    </div>
                    <div class="setting-item">
                        <label>音效音量</label>
                        <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="${this.settings.sfxVolume}">
                    </div>
                </div>
                <div class="settings-group">
                    <h3>遊戲設置</h3>
                    <div class="setting-item">
                        <label>戰鬥速度</label>
                        <select id="battle-speed">
                            <option value="1" ${this.settings.battleSpeed === 1 ? 'selected' : ''}>正常</option>
                            <option value="2" ${this.settings.battleSpeed === 2 ? 'selected' : ''}>2倍速</option>
                            <option value="3" ${this.settings.battleSpeed === 3 ? 'selected' : ''}>3倍速</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>畫面品質</label>
                        <select id="graphics-quality">
                            <option value="low" ${this.settings.graphicsQuality === 'low' ? 'selected' : ''}>低</option>
                            <option value="medium" ${this.settings.graphicsQuality === 'medium' ? 'selected' : ''}>中</option>
                            <option value="high" ${this.settings.graphicsQuality === 'high' ? 'selected' : ''}>高</option>
                        </select>
                    </div>
                </div>
                <div class="settings-group">
                    <h3>語言設置</h3>
                    <div class="setting-item">
                        <label>遊戲語言</label>
                        <select id="language">
                            <option value="zh_TW" ${this.settings.language === 'zh_TW' ? 'selected' : ''}>繁體中文</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        this.registerEventListeners();
    }

    registerEventListeners() {
        // 註冊各個設置項的事件監聽器
        const bgmVolume = document.getElementById('bgm-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const battleSpeed = document.getElementById('battle-speed');
        const graphicsQuality = document.getElementById('graphics-quality');
        const language = document.getElementById('language');

        bgmVolume.addEventListener('change', (e) => {
            this.settings.bgmVolume = parseFloat(e.target.value);
            this.gameState.emit('settingsChanged', { type: 'bgmVolume', value: this.settings.bgmVolume });
        });

        sfxVolume.addEventListener('change', (e) => {
            this.settings.sfxVolume = parseFloat(e.target.value);
            this.gameState.emit('settingsChanged', { type: 'sfxVolume', value: this.settings.sfxVolume });
        });

        battleSpeed.addEventListener('change', (e) => {
            this.settings.battleSpeed = parseInt(e.target.value);
            this.gameState.emit('settingsChanged', { type: 'battleSpeed', value: this.settings.battleSpeed });
        });

        graphicsQuality.addEventListener('change', (e) => {
            this.settings.graphicsQuality = e.target.value;
            this.gameState.emit('settingsChanged', { type: 'graphicsQuality', value: this.settings.graphicsQuality });
        });

        language.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.gameState.emit('settingsChanged', { type: 'language', value: this.settings.language });
        });
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    // 保存設置到本地存儲
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    // 從本地存儲加載設置
    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.initialize(); // 重新初始化界面以反映加載的設置
        }
    }
}