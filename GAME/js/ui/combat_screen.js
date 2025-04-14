/**
 * combat_screen.js
 * 戰鬥/關卡介面的邏輯，顯示當前挑戰和進度。
 */

class CombatScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.currentPlanet = null;
        this.currentStage = null;
        this.battleSpeed = 1;
        this.autoBattle = false;
        
        // 初始化元素引用
        this.initElements();
        // 初始化事件監聽
        this.initEventListeners();
    }

    /**
     * 初始化元素引用
     */
    initElements() {
        // 戰鬥畫面元素
        this.elements.combatScreen = document.getElementById('combat-screen');
        this.elements.teamSelection = document.getElementById('team-selection');
        this.elements.battleDisplay = document.getElementById('battle-display');
        this.elements.battleControls = document.getElementById('battle-controls');
    }

    /**
     * 初始化事件監聽
     */
    initEventListeners() {
        // 監聽戰鬥事件
        this.gameState.addEventListener('battleStarted', (data) => {
            this.updateBattleDisplay(data.battle);
        });
        
        this.gameState.addEventListener('battleUpdated', (data) => {
            this.updateBattleDisplay(data.battle);
        });
        
        this.gameState.addEventListener('battleEnded', (data) => {
            this.updateBattleDisplay(data.battle);
            this.showBattleResult(data.battle);
        });
        
        // 監聽隊伍變更事件
        this.gameState.addEventListener('teamChanged', () => {
            this.updateTeamSelection();
        });
        
        // 監聽畫面切換事件
        this.gameState.addEventListener('screenChanged', (data) => {
            if (data.screen === 'combat') {
                this.initialize();
            }
        });
        
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
     * 初始化戰鬥畫面
     */
    initialize() {
        // 更新隊伍選擇
        this.updateTeamSelection();
        
        // 更新戰鬥控制
        this.updateBattleControls();
        
        // 如果有當前星球和關卡，更新戰鬥顯示
        if (this.gameState.currentPlanet && this.gameState.currentStage) {
            this.currentPlanet = this.gameState.currentPlanet;
            this.currentStage = this.gameState.currentStage;
            
            // 如果有正在進行的戰鬥，更新戰鬥顯示
            if (window.challengeEngine.currentBattle) {
                this.updateBattleDisplay(window.challengeEngine.currentBattle);
            }
        }
    }

    /**
     * 更新隊伍選擇
     */
    updateTeamSelection() {
        // 清空隊伍選擇區域
        this.elements.teamSelection.innerHTML = '';
        
        // 創建隊伍選擇標題
        const titleElement = document.createElement('h3');
        titleElement.textContent = '隊伍選擇';
        this.elements.teamSelection.appendChild(titleElement);
        
        // 創建當前隊伍顯示
        const teamElement = document.createElement('div');
        teamElement.className = 'team-members';
        
        // 顯示當前隊伍
        if (this.gameState.activeTeam.length > 0) {
            this.gameState.activeTeam.forEach(character => {
                const characterElement = document.createElement('div');
                characterElement.className = 'team-character';
                characterElement.innerHTML = `
                    <div class="character-icon">
                        <img src="assets/images/characters/${character.id}.png" alt="${character.name}" onerror="this.src='assets/images/characters/default.png'">
                    </div>
                    <div class="character-info">
                        <div class="character-name">${character.name}</div>
                        <div class="character-level">Lv.${character.level}</div>
                    </div>
                    <button class="btn btn-danger btn-remove-character" data-character-id="${character.id}">移除</button>
                `;
                
                teamElement.appendChild(characterElement);
            });
        } else {
            // 如果隊伍為空，顯示提示
            const emptyElement = document.createElement('div');
            emptyElement.className = 'team-empty';
            emptyElement.textContent = '隊伍中沒有角色，請先選擇角色加入隊伍！';
            teamElement.appendChild(emptyElement);
        }
        
        this.elements.teamSelection.appendChild(teamElement);
        
        // 創建可選角色列表
        const availableElement = document.createElement('div');
        availableElement.className = 'available-characters';
        
        // 創建可選角色標題
        const availableTitleElement = document.createElement('h4');
        availableTitleElement.textContent = '可選角色';
        availableElement.appendChild(availableTitleElement);
        
        // 獲取所有未在隊伍中的角色
        const availableCharacters = this.gameState.characters.filter(character => {
            return !this.gameState.activeTeam.some(c => c.id === character.id);
        });
        
        // 顯示可選角色
        if (availableCharacters.length > 0) {
            const charactersListElement = document.createElement('div');
            charactersListElement.className = 'characters-list';
            
            availableCharacters.forEach(character => {
                const characterElement = document.createElement('div');
                characterElement.className = 'available-character';
                characterElement.innerHTML = `
                    <div class="character-icon">
                        <img src="assets/images/characters/${character.id}.png" alt="${character.name}" onerror="this.src='assets/images/characters/default.png'">
                    </div>
                    <div class="character-info">
                        <div class="character-name">${character.name}</div>
                        <div class="character-level">Lv.${character.level}</div>
                    </div>
                    <button class="btn btn-primary btn-add-character" data-character-id="${character.id}">${this.gameState.activeTeam.length < 4 ? '加入隊伍' : '隊伍已滿'}</button>
                `;
                
                charactersListElement.appendChild(characterElement);
            });
            
            availableElement.appendChild(charactersListElement);
        } else {
            // 如果沒有可選角色，顯示提示
            const emptyElement = document.createElement('div');
            emptyElement.className = 'available-empty';
            emptyElement.textContent = '沒有可選角色！';
            availableElement.appendChild(emptyElement);
        }
        
        this.elements.teamSelection.appendChild(availableElement);
        
        // 添加事件監聽
        this.addTeamSelectionEventListeners();
    }

    /**
     * 添加隊伍選擇的事件監聽
     */
    addTeamSelectionEventListeners() {
        // 移除角色按鈕
        const removeButtons = document.querySelectorAll('.btn-remove-character');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const characterId = button.getAttribute('data-character-id');
                this.removeCharacterFromTeam(characterId);
            });
        });
        
        // 添加角色按鈕
        const addButtons = document.querySelectorAll('.btn-add-character');
        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 如果隊伍已滿，禁用按鈕
                if (this.gameState.activeTeam.length >= 4) {
                    return;
                }
                
                const characterId = button.getAttribute('data-character-id');
                this.addCharacterToTeam(characterId);
            });
        });
    }

    /**
     * 從隊伍中移除角色
     * @param {string} characterId - 角色ID
     */
    removeCharacterFromTeam(characterId) {
        // 從隊伍中移除角色
        this.gameState.activeTeam = this.gameState.activeTeam.filter(character => character.id !== characterId);
        
        // 觸發隊伍變更事件
        this.gameState.triggerEvent('teamChanged', this.gameState.activeTeam);
        
        // 更新隊伍選擇
        this.updateTeamSelection();
    }

    /**
     * 添加角色到隊伍
     * @param {string} characterId - 角色ID
     */
    addCharacterToTeam(characterId) {
        // 檢查隊伍是否已滿
        if (this.gameState.activeTeam.length >= 4) {
            alert('隊伍已滿！');
            return;
        }
        
        // 獲取角色資料
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) {
            return;
        }
        
        // 添加到隊伍
        this.gameState.activeTeam.push(character);
        
        // 觸發隊伍變更事件
        this.gameState.triggerEvent('teamChanged', this.gameState.activeTeam);
        
        // 更新隊伍選擇
        this.updateTeamSelection();
    }

    /**
     * 更新戰鬥顯示
     * @param {Object} battle - 戰鬥狀態
     */
    updateBattleDisplay(battle) {
        if (!battle) {
            return;
        }
        
        // 清空戰鬥顯示區域
        this.elements.battleDisplay.innerHTML = '';
        
        // 創建戰鬥顯示元素
        const battleElement = document.createElement('div');
        battleElement.className = 'battle-content';
        
        // 獲取關卡資訊
        const stage = window.challengeEngine.getStageInfo(battle.planetId, battle.stageId);
        const planet = window.challengeEngine.getPlanetInfo(battle.planetId);
        
        // 創建戰鬥標題
        const titleElement = document.createElement('div');
        titleElement.className = 'battle-title';
        titleElement.textContent = `${planet ? planet.name : '未知星球'} - ${stage ? stage.name : '未知關卡'}`;
        battleElement.appendChild(titleElement);
        
        // 創建戰鬥狀態
        const statusElement = document.createElement('div');
        statusElement.className = 'battle-status';
        statusElement.textContent = `狀態: ${battle.status === 'active' ? '戰鬥中' : battle.status === 'victory' ? '勝利' : '失敗'}`;
        battleElement.appendChild(statusElement);
        
        // 創建角色顯示
        const charactersElement = document.createElement('div');
        charactersElement.className = 'battle-characters';
        
        // 顯示角色
        battle.characters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'battle-character';
            
            // 如果角色已倒下，添加倒下樣式
            if (character.currentHp <= 0) {
                characterElement.classList.add('defeated');
            }
            
            // 計算生命值百分比
            const maxHp = window.challengeEngine.calculateCharacterStat(character, 'hp');
            const hpPercent = Math.max(0, Math.min(100, (character.currentHp / maxHp) * 100));
            
            characterElement.innerHTML = `
                <div class="character-icon">
                    <img src="assets/images/characters/${character.id}.png" alt="${character.name}" onerror="this.src='assets/images/characters/default.png'">
                </div>
                <div class="character-info">
                    <div class="character-name">${character.name}</div>
                    <div class="character-hp">
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${hpPercent}%"></div>
                        </div>
                        <div class="hp-text">${character.currentHp} / ${maxHp}</div>
                    </div>
                </div>
            `;
            
            charactersElement.appendChild(characterElement);
        });
        
        battleElement.appendChild(charactersElement);
        
        // 創建敵人顯示
        const enemiesElement = document.createElement('div');
        enemiesElement.className = 'battle-enemies';
        
        // 顯示敵人
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
                <div class="enemy-icon">
                    <img src="assets/images/enemies/${enemy.id}.png" alt="${enemy.name}" onerror="this.src='assets/images/enemies/default.png'">
                </div>
                <div class="enemy-info">
                    <div class="enemy-name">${enemy.name}</div>
                    <div class="enemy-hp">
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${hpPercent}%"></div>
                        </div>
                        <div class="hp-text">${enemy.currentHp} / ${enemy.hp}</div>
                    </div>
                </div>
            `;
            
            enemiesElement.appendChild(enemyElement);
        });
        
        battleElement.appendChild(enemiesElement);
        
        // 創建戰鬥日誌
        const logElement = document.createElement('div');
        logElement.className = 'battle-log';
        
        // 顯示最近的10條日誌
        battle.logs.slice(-10).forEach(log => {
            const logEntryElement = document.createElement('div');
            logEntryElement.className = 'log-entry';
            logEntryElement.textContent = log;
            logElement.appendChild(logEntryElement);
        });
        
        battleElement.appendChild(logElement);
        
        this.elements.battleDisplay.appendChild(battleElement);
    }

    /**
     * 更新戰鬥控制
     */
    updateBattleControls() {
        // 清空戰鬥控制區域
        this.elements.battleControls.innerHTML = '';
        
        // 創建戰鬥控制元素
        const controlsElement = document.createElement('div');
        controlsElement.className = 'battle-controls-content';
        
        // 創建星球選擇
        const planetSelectElement = document.createElement('div');
        planetSelectElement.className = 'planet-select';
        planetSelectElement.innerHTML = `
            <label for="planet-select">選擇星球:</label>
            <select id="planet-select">
                ${window.challengeEngine.getAllPlanets().map(planet => `
                    <option value="${planet.id}" ${planet.id === this.currentPlanet ? 'selected' : ''}>
                        ${planet.name}
                    </option>
                `).join('')}
            </select>
        `;
        controlsElement.appendChild(planetSelectElement);
        
        // 創建關卡選擇
        const stageSelectElement = document.createElement('div');
        stageSelectElement.className = 'stage-select';
        stageSelectElement.innerHTML = `
            <label for="stage-select">選擇關卡:</label>
            <select id="stage-select">
                ${this.currentPlanet ? window.challengeEngine.getPlanetStages(this.currentPlanet)
                    .filter(stage => stage.progress.unlocked)
                    .map(stage => `
                        <option value="${stage.id}" ${stage.id === this.currentStage ? 'selected' : ''}>
                            ${stage.name} ${stage.progress.completed ? '(已完成)' : ''}
                        </option>
                    `).join('') : '<option value="">請先選擇星球</option>'}
            </select>
        `;
        controlsElement.appendChild(stageSelectElement);
        
        // 創建戰鬥速度控制
        const speedControlElement = document.createElement('div');
        speedControlElement.className = 'speed-control';
        speedControlElement.innerHTML = `
            <label for="battle-speed">戰鬥速度:</label>
            <select id="battle-speed">
                <option value="0.5" ${this.battleSpeed === 0.5 ? 'selected' : ''}>0.5x</option>
                <option value="1" ${this.battleSpeed === 1 ? 'selected' : ''}>1x</option>
                <option value="2" ${this.battleSpeed === 2 ? 'selected' : ''}>2x</option>
                <option value="4" ${this.battleSpeed === 4 ? 'selected' : ''}>4x</option>
            </select>
        `;
        controlsElement.appendChild(speedControlElement);
        
        // 創建自動戰鬥控制
        const autoBattleElement = document.createElement('div');
        autoBattleElement.className = 'auto-battle';
        autoBattleElement.innerHTML = `
            <label for="auto-battle">自動戰鬥:</label>
            <input type="checkbox" id="auto-battle" ${this.autoBattle ? 'checked' : ''}>
        `;
        controlsElement.appendChild(autoBattleElement);
        
        // 創建開始戰鬥按鈕
        const startBattleElement = document.createElement('div');
        startBattleElement.className = 'start-battle';
        startBattleElement.innerHTML = `
            <button id="btn-start-battle" class="btn btn-primary">開始戰鬥</button>
        `;
        controlsElement.appendChild(startBattleElement);
        
        this.elements.battleControls.appendChild(controlsElement);
        
        // 添加事件監聽
        this.addBattleControlsEventListeners();
    }

    /**
     * 添加戰鬥控制的事件監聽
     */
    addBattleControlsEventListeners() {
        // 星球選擇
        const planetSelect = document.getElementById('planet-select');
        if (planetSelect) {
            planetSelect.addEventListener('change', () => {
                this.currentPlanet = planetSelect.value;
                this.currentStage = null; // 重置關卡選擇
                this.updateBattleControls();
            });
        }
        
        // 關卡選擇
        const stageSelect = document.getElementById('stage-select');
        if (stageSelect) {
            stageSelect.addEventListener('change', () => {
                this.currentStage = stageSelect.value;
            });
        }
        
        // 戰鬥速度
        const battleSpeed = document.getElementById('battle-speed');
        if (battleSpeed) {
            battleSpeed.addEventListener('change', () => {
                this.battleSpeed = parseFloat(battleSpeed.value);
                window.challengeEngine.setBattleSpeed(this.battleSpeed);
            });
        }
        
        // 自動戰鬥
        const autoBattle = document.getElementById('auto-battle');
        if (autoBattle) {
            autoBattle.addEventListener('change', () => {
                this.autoBattle = autoBattle.checked;
                window.challengeEngine.setAutoBattle(this.autoBattle);
            });
        }
        
        // 開始戰鬥
        const startBattle = document.getElementById('btn-start-battle');
        if (startBattle) {
            startBattle.addEventListener('click', () => {
                this.startBattle();
            });
        }
    }

    /**
     * 開始戰鬥
     */
    startBattle() {
        if (!this.currentPlanet || !this.currentStage) {
            alert('請先選擇星球和關卡！');
            return;
        }
        
        // 檢查隊伍是否有角色
        if (this.gameState.activeTeam.length === 0) {
            alert('請先選擇角色加入隊伍！');
            return;
        }
        
        // 設定當前星球和關卡
        this.gameState.currentPlanet = this.currentPlanet;
        this.gameState.currentStage = this.currentStage;
        
        // 設定戰鬥速度和自動戰鬥
        window.challengeEngine.setBattleSpeed(this.battleSpeed);
        window.challengeEngine.setAutoBattle(this.autoBattle);
        
        // 開始戰鬥
        window.challengeEngine.startBattle(this.currentPlanet, this.currentStage);
    }

    /**
     * 顯示戰鬥結果
     * @param {Object} battle - 戰鬥狀態
     */
    showBattleResult(battle) {
        if (!battle) {
            return;
        }
        
        // 創建結果訊息
        let message = '';
        
        if (battle.status === 'victory') {
            message = '戰鬥勝利！\n\n獲得獎勵：\n';
            
            // 顯示獎勵
            if (battle.rewards) {
                for (const [resourceId, amount] of Object.entries(battle.rewards)) {
                    const resourceInfo = window.resourceManager.getResourceInfo(resourceId);
                    const resourceName = resourceInfo ? resourceInfo.name : resourceId;
                    message += `${resourceName}: ${amount}\n`;
                }
            }
        } else {
            message = '戰鬥失敗！\n\n請調整隊伍或提升角色等級後再試。';
        }
        
        // 顯示結果
        alert(message);
        
        // 如果勝利且自動戰鬥開啟，自動開始下一場戰鬥
        if (battle.status === 'victory' && this.autoBattle) {
            setTimeout(() => {
                this.startBattle();
            }, 1000);
        }
    }
}

// 創建全局戰鬥畫面實例
const combatScreen = new CombatScreen(window.gameState);

// 導出戰鬥畫面實例
window.combatScreen = combatScreen;