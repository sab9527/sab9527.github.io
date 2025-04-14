/**
 * main_screen.js
 * 主介面的邏輯，顯示資源、進度和導航按鈕。
 */

class MainScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.currentPlanet = null;
        this.currentStage = null;
        
        // 初始化元素引用
        this.initElements();
        // 初始化事件監聽
        this.initEventListeners();
    }

    /**
     * 初始化元素引用
     */
    initElements() {
        // 主畫面元素
        this.elements.mainScreen = document.getElementById('main-screen');
        this.elements.resourceSummary = document.querySelector('.resource-summary');
        this.elements.resourceDisplay = document.getElementById('resource-display');
        
        // 戰鬥顯示區域
        this.elements.combatArea = document.getElementById('combat-area');
        this.elements.teamDisplay = document.getElementById('team-display');
        this.elements.enemyDisplay = document.getElementById('enemy-display');
        this.elements.combatLog = document.getElementById('combat-log');
        
        // 關卡選擇區域
        this.elements.planetsList = document.getElementById('planets-list');
        this.elements.stagesList = document.getElementById('stages-list');
        
        // 導航按鈕
        this.elements.navButtons = {
            town: document.getElementById('btn-town'),
            characters: document.getElementById('btn-characters'),
            combat: document.getElementById('btn-combat'),
            inventory: document.getElementById('btn-inventory'),
            shop: document.getElementById('btn-shop'),
            settings: document.getElementById('btn-settings')
        };
    }

    /**
     * 初始化事件監聽
     */
    initEventListeners() {
        // 監聽資源變更事件
        this.gameState.addEventListener('resourceChanged', () => {
            this.updateResourceDisplay();
        });
        
        // 監聽戰鬥事件
        this.gameState.addEventListener('battleStarted', (data) => {
            this.updateBattleDisplay(data.battle);
        });
        
        this.gameState.addEventListener('battleUpdated', (data) => {
            this.updateBattleDisplay(data.battle);
        });
        
        this.gameState.addEventListener('battleEnded', (data) => {
            this.updateBattleDisplay(data.battle);
            // 戰鬥結束後更新關卡列表（可能有新關卡解鎖）
            this.updateStagesList();
        });
        
        // 監聽關卡解鎖事件
        this.gameState.addEventListener('stageUnlocked', () => {
            this.updateStagesList();
        });
        
        // 監聽導航按鈕點擊事件
        for (const [screen, button] of Object.entries(this.elements.navButtons)) {
            button.addEventListener('click', () => {
                this.navigateTo(screen);
            });
        }
        
        // 監聽遊戲初始化完成事件
        this.gameState.addEventListener('gameInitialized', () => {
            this.initialize();
        });
        
        // 監聽遊戲載入事件
        this.gameState.addEventListener('gameLoaded', () => {
            this.initialize();
        });
    }

    /**
     * 初始化主畫面
     */
    initialize() {
        // 更新資源顯示
        this.updateResourceDisplay();
        
        // 更新星球列表
        this.updatePlanetsList();
        
        // 如果有當前星球，更新關卡列表
        if (this.gameState.currentPlanet) {
            this.currentPlanet = this.gameState.currentPlanet;
            this.updateStagesList();
        }
        
        // 如果有當前關卡，更新戰鬥顯示
        if (this.gameState.currentPlanet && this.gameState.currentStage) {
            this.currentStage = this.gameState.currentStage;
            this.startBattle();
        }
    }

    /**
     * 更新資源顯示
     */
    updateResourceDisplay() {
        // 清空資源顯示區域
        this.elements.resourceDisplay.innerHTML = '';
        this.elements.resourceSummary.innerHTML = '';
        
        // 獲取資源類型資訊
        const resourceTypes = window.resourceManager.getAllResourceTypes();
        
        // 獲取玩家資源
        const playerResources = this.gameState.resources;
        
        // 顯示主要資源（金幣、經驗值等）
        const mainResources = ['gold', 'exp'];
        mainResources.forEach(resourceId => {
            if (playerResources[resourceId] !== undefined && resourceTypes[resourceId]) {
                const resourceInfo = resourceTypes[resourceId];
                
                // 創建資源顯示元素
                const resourceElement = document.createElement('div');
                resourceElement.className = 'resource-item';
                resourceElement.innerHTML = `
                    <img class="resource-icon" src="assets/images/items/${resourceInfo.icon || 'default.png'}" alt="${resourceInfo.name}">
                    <span>${resourceInfo.name}: ${playerResources[resourceId]}</span>
                `;
                
                this.elements.resourceDisplay.appendChild(resourceElement);
            }
        });
        
        // 在資源摘要中顯示所有資源
        for (const [resourceId, amount] of Object.entries(playerResources)) {
            if (resourceTypes[resourceId]) {
                const resourceInfo = resourceTypes[resourceId];
                
                // 創建資源摘要元素
                const resourceElement = document.createElement('div');
                resourceElement.className = 'resource-summary-item';
                resourceElement.innerHTML = `
                    <img class="resource-icon" src="assets/images/items/${resourceInfo.icon || 'default.png'}" alt="${resourceInfo.name}">
                    <span>${resourceInfo.name}: ${amount}</span>
                `;
                
                this.elements.resourceSummary.appendChild(resourceElement);
            }
        }
    }

    /**
     * 更新星球列表
     */
    updatePlanetsList() {
        // 清空星球列表
        this.elements.planetsList.innerHTML = '';
        
        // 獲取所有星球資訊
        const planets = window.challengeEngine.getAllPlanets();
        
        // 顯示星球列表
        planets.forEach(planet => {
            const planetElement = document.createElement('div');
            planetElement.className = 'planet-item';
            if (planet.id === this.currentPlanet) {
                planetElement.classList.add('active');
            }
            planetElement.textContent = planet.name;
            
            // 點擊星球切換當前星球
            planetElement.addEventListener('click', () => {
                this.currentPlanet = planet.id;
                
                // 更新星球選中狀態
                document.querySelectorAll('.planet-item').forEach(el => {
                    el.classList.remove('active');
                });
                planetElement.classList.add('active');
                
                // 更新關卡列表
                this.updateStagesList();
            });
            
            this.elements.planetsList.appendChild(planetElement);
        });
    }

    /**
     * 更新關卡列表
     */
    updateStagesList() {
        // 清空關卡列表
        this.elements.stagesList.innerHTML = '';
        
        if (!this.currentPlanet) {
            return;
        }
        
        // 獲取當前星球的關卡資訊
        const stages = window.challengeEngine.getPlanetStages(this.currentPlanet);
        
        // 顯示關卡列表
        stages.forEach(stage => {
            const stageElement = document.createElement('div');
            stageElement.className = 'stage-item';
            
            // 如果關卡未解鎖，添加鎖定樣式
            if (!stage.progress.unlocked) {
                stageElement.classList.add('locked');
                stageElement.innerHTML = `
                    <span>${stage.name}</span>
                    <span class="stage-lock">🔒</span>
                `;
            } else {
                // 如果是當前選中的關卡，添加選中樣式
                if (stage.id === this.currentStage) {
                    stageElement.classList.add('active');
                }
                
                // 顯示關卡名稱和星星數
                stageElement.innerHTML = `
                    <span>${stage.name}</span>
                    <span class="stage-stars">${'★'.repeat(stage.progress.stars)}${'☆'.repeat(3 - stage.progress.stars)}</span>
                `;
                
                // 點擊關卡開始戰鬥
                stageElement.addEventListener('click', () => {
                    if (stage.progress.unlocked) {
                        this.currentStage = stage.id;
                        
                        // 更新關卡選中狀態
                        document.querySelectorAll('.stage-item').forEach(el => {
                            el.classList.remove('active');
                        });
                        stageElement.classList.add('active');
                        
                        // 開始戰鬥
                        this.startBattle();
                    }
                });
            }
            
            this.elements.stagesList.appendChild(stageElement);
        });
    }

    /**
     * 開始戰鬥
     */
    startBattle() {
        if (!this.currentPlanet || !this.currentStage) {
            return;
        }
        
        // 檢查隊伍是否有角色
        if (this.gameState.activeTeam.length === 0) {
            alert('請先選擇角色加入隊伍！');
            this.navigateTo('characters');
            return;
        }
        
        // 開始戰鬥
        window.challengeEngine.startBattle(this.currentPlanet, this.currentStage);
    }

    /**
     * 更新戰鬥顯示
     * @param {Object} battle - 戰鬥狀態
     */
    updateBattleDisplay(battle) {
        if (!battle) {
            return;
        }
        
        // 更新隊伍顯示
        this.elements.teamDisplay.innerHTML = '';
        battle.characters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'battle-character';
            
            // 如果角色已倒下，添加倒下樣式
            if (character.currentHp <= 0) {
                characterElement.classList.add('defeated');
            }
            
            // 計算生命值百分比
            const hpPercent = Math.max(0, Math.min(100, (character.currentHp / this.calculateCharacterStat(character, 'hp')) * 100));
            
            characterElement.innerHTML = `
                <div class="battle-character-name">${character.name}</div>
                <div class="battle-character-hp">
                    <div class="hp-bar">
                        <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="hp-text">${character.currentHp} / ${this.calculateCharacterStat(character, 'hp')}</div>
                </div>
                <div class="battle-character-cooldown">
                    <div class="cooldown-bar">
                        <div class="cooldown-fill" style="width: ${Math.max(0, Math.min(100, (character.cooldown / 3) * 100))}%"></div>
                    </div>
                </div>
            `;
            
            this.elements.teamDisplay.appendChild(characterElement);
        });
        
        // 更新敵人顯示
        this.elements.enemyDisplay.innerHTML = '';
        battle.enemies.forEach(enemy => {
            const enemyElement = document.createElement('div');
            enemyElement.className = 'battle-enemy';
            
            // 如果敵人已倒下，添加倒下樣式
            if (enemy.currentHp <= 0) {
                enemyElement.classList.add('defeated');
            }
            
            // 計算生命值百分比
            const hpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.hp) * 100));
            
            enemyElement.innerHTML = `
                <div class="battle-enemy-name">${enemy.name}</div>
                <div class="battle-enemy-hp">
                    <div class="hp-bar">
                        <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="hp-text">${enemy.currentHp} / ${enemy.hp}</div>
                </div>
                <div class="battle-enemy-cooldown">
                    <div class="cooldown-bar">
                        <div class="cooldown-fill" style="width: ${Math.max(0, Math.min(100, (enemy.cooldown / 3) * 100))}%"></div>
                    </div>
                </div>
            `;
            
            this.elements.enemyDisplay.appendChild(enemyElement);
        });
        
        // 更新戰鬥日誌
        this.elements.combatLog.innerHTML = '';
        battle.logs.slice(-10).forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'combat-log-entry';
            logElement.textContent = log;
            this.elements.combatLog.appendChild(logElement);
        });
        
        // 自動滾動到最新日誌
        this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;
    }

    /**
     * 計算角色屬性值（考慮裝備加成）
     * @param {Object} character - 角色資料
     * @param {string} statName - 屬性名稱 (hp, attack, defense, speed)
     * @returns {number} - 計算後的屬性值
     */
    calculateCharacterStat(character, statName) {
        return window.challengeEngine.calculateCharacterStat(character, statName);
    }

    /**
     * 導航到指定畫面
     * @param {string} screenName - 畫面名稱
     */
    navigateTo(screenName) {
        // 隱藏所有畫面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 顯示指定畫面
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // 觸發畫面切換事件
        this.gameState.triggerEvent('screenChanged', { screen: screenName });
    }
}

// 創建全局主畫面實例
const mainScreen = new MainScreen(window.gameState);

// 導出主畫面實例
window.mainScreen = mainScreen;