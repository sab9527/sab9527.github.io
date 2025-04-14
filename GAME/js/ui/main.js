/**
 * main.js
 * 遊戲主入口文件，負責初始化遊戲狀態和UI管理。
 */

class Game {
    constructor() {
        this.gameState = new GameState();
        this.screens = {};
        this.currentScreen = null;
        
        // 初始化遊戲狀態
        this.initializeGame();
    }

    async initializeGame() {
        try {
            // 等待遊戲狀態初始化完成
            await this.gameState.initialize();
            
            // 初始化各個遊戲界面
            this.screens = {
                main: new MainScreen(this.gameState),
                combat: new CombatScreen(this.gameState),
                character: new CharacterScreen(this.gameState),
                inventory: new InventoryScreen(this.gameState),
                settings: new SettingsScreen(this.gameState),
                upgrade: new UpgradeScreen(this.gameState)
            };

            // 顯示主界面
            this.showScreen('main');

            // 註冊事件監聽器
            this.registerEventListeners();
        } catch (error) {
            console.error('遊戲初始化失敗:', error);
        }
    }

    showScreen(screenId) {
        // 隱藏當前界面
        if (this.currentScreen) {
            this.currentScreen.hide();
        }

        // 顯示新界面
        const screen = this.screens[screenId];
        if (screen) {
            screen.show();
            this.currentScreen = screen;
            // 觸發界面切換事件
            this.gameState.emit('screenChanged', screenId);
        }
    }

    registerEventListeners() {
        // 註冊全局事件監聽器
        document.addEventListener('keydown', (event) => {
            // ESC鍵返回主界面
            if (event.key === 'Escape') {
                this.showScreen('main');
            }
        });
    }
}

// 當文檔加載完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});