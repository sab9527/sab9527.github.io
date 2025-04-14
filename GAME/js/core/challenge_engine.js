/**
 * challenge_engine.js
 * 處理關卡挑戰和戰鬥系統的邏輯。
 */

class ChallengeEngine {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentBattle = null; // 當前戰鬥
        this.enemies = {}; // 敵人資料
        this.stages = {}; // 關卡資料
        this.battleSpeed = 1; // 戰鬥速度倍率
        this.autoBattle = false; // 自動戰鬥
        this.battleInterval = null; // 戰鬥計時器
        
        // 初始化敵人資料
        this.initEnemies();
        // 初始化關卡資料
        this.initStages();
    }

    /**
     * 初始化敵人資料
     */
    async initEnemies() {
        try {
            const response = await fetch('data/enemies.json');
            const data = await response.json();
            
            // 設定敵人資料
            this.enemies = data;
            
            return this.enemies;
        } catch (error) {
            console.error('載入敵人資料失敗:', error);
            // 設定一些預設敵人，以防資料載入失敗
            this.enemies = {
                'enemy001': {
                    id: 'enemy001',
                    name: '基礎敵人',
                    hp: 100,
                    attack: 10,
                    defense: 5,
                    speed: 100,
                    skills: [
                        { id: 'skill001', name: '基本攻擊', damage: 1.0, cooldown: 3 }
                    ]
                }
            };
            return this.enemies;
        }
    }

    /**
     * 初始化關卡資料
     */
    async initStages() {
        try {
            const response = await fetch('data/stages.json');
            const data = await response.json();
            
            // 將planets數組轉換為以id為鍵的對象
            this.stages = {};
            data.planets.forEach(planet => {
                this.stages[planet.id] = planet;
            });
            
            return this.stages;
        } catch (error) {
            console.error('載入關卡資料失敗:', error);
            // 設定一些預設關卡，以防資料載入失敗
            this.stages = {
                'planet1': {
                    id: 'planet1',
                    name: '第一星球',
                    stages: {
                        '1': {
                            id: '1',
                            name: '第一關',
                            enemies: ['enemy001'],
                            rewards: {
                                gold: { min: 10, max: 30 },
                                exp: { min: 5, max: 15 }
                            }
                        }
                    }
                }
            };
            return this.stages;
        }
    }

    /**
     * 開始戰鬥
     * @param {string} planetId - 星球ID
     * @param {string} stageId - 關卡ID
     * @returns {Object} - 戰鬥初始狀態
     */
    startBattle(planetId, stageId) {
        // 檢查關卡是否存在
        if (!this.stages[planetId] || !this.stages[planetId].stages[stageId]) {
            return { success: false, message: '找不到指定關卡' };
        }
        
        // 檢查隊伍是否有角色
        if (this.gameState.activeTeam.length === 0) {
            return { success: false, message: '隊伍中沒有角色' };
        }
        
        // 獲取關卡資料
        const stage = this.stages[planetId].stages[stageId];
        
        // 創建敵人實例
        const battleEnemies = stage.enemies.map(enemyId => {
            const enemyTemplate = this.enemies[enemyId];
            if (!enemyTemplate) {
                console.warn(`找不到敵人資料: ${enemyId}`);
                return null;
            }
            
            return {
                ...enemyTemplate,
                currentHp: enemyTemplate.hp,
                cooldown: 0, // 初始冷卻時間
                effects: [] // 狀態效果
            };
        }).filter(Boolean);
        
        // 創建角色實例
        const battleCharacters = this.gameState.activeTeam.map(character => {
            return {
                ...character,
                currentHp: this.calculateCharacterStat(character, 'hp'),
                cooldown: 0, // 初始冷卻時間
                effects: [] // 狀態效果
            };
        });
        
        // 創建戰鬥狀態
        this.currentBattle = {
            planetId,
            stageId,
            characters: battleCharacters,
            enemies: battleEnemies,
            logs: [`開始挑戰 ${this.stages[planetId].name} - ${stage.name}`],
            turn: 0,
            status: 'active', // active, victory, defeat
            rewards: null
        };
        
        // 觸發戰鬥開始事件
        this.gameState.triggerEvent('battleStarted', { battle: this.currentBattle });
        
        // 開始戰鬥循環
        this.startBattleLoop();
        
        return { 
            success: true, 
            battle: this.currentBattle 
        };
    }

    /**
     * 開始戰鬥循環
     */
    startBattleLoop() {
        // 清除之前的計時器
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
        }
        
        // 設定計時器，每100毫秒更新一次戰鬥狀態
        this.battleInterval = setInterval(() => {
            this.updateBattle();
            
            // 檢查戰鬥是否結束
            if (this.currentBattle.status !== 'active') {
                clearInterval(this.battleInterval);
                this.battleInterval = null;
                
                // 處理戰鬥結果
                this.processBattleResult();
            }
        }, 100 / this.battleSpeed);
    }

    /**
     * 更新戰鬥狀態
     */
    updateBattle() {
        if (!this.currentBattle || this.currentBattle.status !== 'active') {
            return;
        }
        
        // 更新角色冷卻時間
        this.currentBattle.characters.forEach(character => {
            if (character.currentHp <= 0) return; // 跳過已倒下的角色
            
            // 計算角色速度值對冷卻時間的影響
            const speedModifier = 1 - (character.speed / 1000); // 每50點速度縮短5%冷卻時間
            const cooldownRate = 0.1 * (1 - Math.min(0.8, Math.max(0, speedModifier))); // 最多縮短80%
            
            character.cooldown -= cooldownRate;
            
            // 冷卻結束，執行攻擊
            if (character.cooldown <= 0) {
                this.characterAttack(character);
                // 重置冷卻時間（基礎3秒）
                character.cooldown = 3 * (1 - Math.min(0.8, Math.max(0, speedModifier)));
            }
        });
        
        // 更新敵人冷卻時間
        this.currentBattle.enemies.forEach(enemy => {
            if (enemy.currentHp <= 0) return; // 跳過已倒下的敵人
            
            // 計算敵人速度值對冷卻時間的影響
            const speedModifier = 1 - (enemy.speed / 1000); // 每50點速度縮短5%冷卻時間
            const cooldownRate = 0.1 * (1 - Math.min(0.8, Math.max(0, speedModifier))); // 最多縮短80%
            
            enemy.cooldown -= cooldownRate;
            
            // 冷卻結束，執行攻擊
            if (enemy.cooldown <= 0) {
                this.enemyAttack(enemy);
                // 重置冷卻時間（基礎3秒）
                enemy.cooldown = 3 * (1 - Math.min(0.8, Math.max(0, speedModifier)));
            }
        });
        
        // 檢查戰鬥是否結束
        this.checkBattleEnd();
        
        // 更新回合數
        this.currentBattle.turn++;
        
        // 觸發戰鬥更新事件
        this.gameState.triggerEvent('battleUpdated', { battle: this.currentBattle });
    }

    /**
     * 角色攻擊
     * @param {Object} character - 角色資料
     */
    characterAttack(character) {
        // 檢查是否有存活的敵人
        const aliveEnemies = this.currentBattle.enemies.filter(enemy => enemy.currentHp > 0);
        if (aliveEnemies.length === 0) {
            return;
        }
        
        // 選擇一個隨機敵人作為目標
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        // 選擇一個技能使用
        const skill = character.skills[Math.floor(Math.random() * character.skills.length)];
        
        // 計算傷害
        const attackStat = this.calculateCharacterStat(character, 'attack');
        const damage = Math.max(1, Math.floor(attackStat * skill.damage - target.defense / 2));
        
        // 造成傷害
        target.currentHp = Math.max(0, target.currentHp - damage);
        
        // 記錄戰鬥日誌
        this.currentBattle.logs.push(`${character.name} 使用 ${skill.name} 對 ${target.name} 造成 ${damage} 點傷害`);        
        
        // 檢查目標是否倒下
        if (target.currentHp <= 0) {
            this.currentBattle.logs.push(`${target.name} 被擊敗了！`);
        }
    }

    /**
     * 敵人攻擊
     * @param {Object} enemy - 敵人資料
     */
    enemyAttack(enemy) {
        // 檢查是否有存活的角色
        const aliveCharacters = this.currentBattle.characters.filter(character => character.currentHp > 0);
        if (aliveCharacters.length === 0) {
            return;
        }
        
        // 選擇一個隨機角色作為目標
        const target = aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)];
        
        // 選擇一個技能使用
        const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
        
        // 計算傷害
        const defenseStat = this.calculateCharacterStat(target, 'defense');
        const damage = Math.max(1, Math.floor(enemy.attack * skill.damage - defenseStat / 2));
        
        // 造成傷害
        target.currentHp = Math.max(0, target.currentHp - damage);
        
        // 記錄戰鬥日誌
        this.currentBattle.logs.push(`${enemy.name} 使用 ${skill.name} 對 ${target.name} 造成 ${damage} 點傷害`);
        
        // 檢查目標是否倒下
        if (target.currentHp <= 0) {
            this.currentBattle.logs.push(`${target.name} 被擊敗了！`);
        }
    }

    /**
     * 檢查戰鬥是否結束
     */
    checkBattleEnd() {
        // 檢查所有敵人是否都已倒下
        const allEnemiesDefeated = this.currentBattle.enemies.every(enemy => enemy.currentHp <= 0);
        if (allEnemiesDefeated) {
            this.currentBattle.status = 'victory';
            this.currentBattle.logs.push('戰鬥勝利！');
            return;
        }
        
        // 檢查所有角色是否都已倒下
        const allCharactersDefeated = this.currentBattle.characters.every(character => character.currentHp <= 0);
        if (allCharactersDefeated) {
            this.currentBattle.status = 'defeat';
            this.currentBattle.logs.push('戰鬥失敗！');
            return;
        }
    }

    /**
     * 處理戰鬥結果
     */
    processBattleResult() {
        if (!this.currentBattle) {
            return;
        }
        
        // 如果戰鬥勝利，獲得獎勵
        if (this.currentBattle.status === 'victory') {
            // 獲取關卡資料
            const stage = this.stages[this.currentBattle.planetId].stages[this.currentBattle.stageId];
            
            // 計算獎勵
            const rewards = {};
            
            // 計算金幣獎勵
            if (stage.rewards.gold) {
                const goldAmount = Math.floor(Math.random() * (stage.rewards.gold.max - stage.rewards.gold.min + 1)) + stage.rewards.gold.min;
                rewards.gold = goldAmount;
                this.gameState.addResource('gold', goldAmount);
            }
            
            // 計算經驗值獎勵
            if (stage.rewards.exp) {
                const expAmount = Math.floor(Math.random() * (stage.rewards.exp.max - stage.rewards.exp.min + 1)) + stage.rewards.exp.min;
                rewards.exp = expAmount;
                
                // 將經驗值平均分配給隊伍中的角色
                const expPerCharacter = Math.floor(expAmount / this.gameState.activeTeam.length);
                this.gameState.activeTeam.forEach(character => {
                    window.progressionManager.upgradeCharacter(character.id, expPerCharacter);
                });
            }
            
            // 獲取掉落物品
            const drops = window.resourceManager.getStageDrop(this.currentBattle.planetId, this.currentBattle.stageId);
            Object.assign(rewards, drops);
            
            // 設定獎勵
            this.currentBattle.rewards = rewards;
            
            // 更新關卡進度
            this.gameState.completeStage(this.currentBattle.planetId, this.currentBattle.stageId, 3); // 暫時都給3星
            
            // 記錄獎勵日誌
            this.currentBattle.logs.push('獲得獎勵：');
            for (const [resourceId, amount] of Object.entries(rewards)) {
                const resourceInfo = window.resourceManager.getResourceInfo(resourceId);
                const resourceName = resourceInfo ? resourceInfo.name : resourceId;
                this.currentBattle.logs.push(`- ${resourceName}: ${amount}`);
            }
        }
        
        // 觸發戰鬥結束事件
        this.gameState.triggerEvent('battleEnded', { 
            battle: this.currentBattle, 
            result: this.currentBattle.status, 
            rewards: this.currentBattle.rewards 
        });
    }

    /**
     * 計算角色屬性值（考慮裝備加成）
     * @param {Object} character - 角色資料
     * @param {string} statName - 屬性名稱 (hp, attack, defense, speed)
     * @returns {number} - 計算後的屬性值
     */
    calculateCharacterStat(character, statName) {
        // 基礎屬性值（根據等級計算）
        let baseStat;
        switch (statName) {
            case 'hp':
                baseStat = 100 + character.level * 10;
                break;
            case 'attack':
                baseStat = 10 + character.level * 2;
                break;
            case 'defense':
                baseStat = 5 + character.level * 1;
                break;
            case 'speed':
                baseStat = character.speed || 0;
                break;
            default:
                baseStat = 0;
        }
        
        // 光錐加成
        let lightConeBonus = 0;
        if (character.equippedLightCone) {
            const lightCone = this.gameState.lightCones.find(lc => lc.id === character.equippedLightCone);
            if (lightCone && lightCone.stats && lightCone.stats[statName]) {
                lightConeBonus = lightCone.stats[statName] * lightCone.level;
            }
        }
        
        // 遺器加成
        let relicBonus = 0;
        if (character.equippedRelics && character.equippedRelics.length > 0) {
            character.equippedRelics.forEach(relicId => {
                const relic = this.gameState.relics.find(r => r.id === relicId);
                if (relic && relic.stats && relic.stats[statName]) {
                    relicBonus += relic.stats[statName] * relic.level;
                }
            });
        }
        
        // 總屬性值
        return Math.floor(baseStat + lightConeBonus + relicBonus);
    }

    /**
     * 設定戰鬥速度
     * @param {number} speed - 速度倍率 (0.5, 1, 2, 4)
     */
    setBattleSpeed(speed) {
        // 檢查速度值是否有效
        const validSpeeds = [0.5, 1, 2, 4];
        if (!validSpeeds.includes(speed)) {
            console.warn(`無效的戰鬥速度: ${speed}，使用預設值 1`);
            speed = 1;
        }
        
        this.battleSpeed = speed;
        
        // 如果正在戰鬥中，重新啟動戰鬥循環以應用新速度
        if (this.currentBattle && this.currentBattle.status === 'active' && this.battleInterval) {
            this.startBattleLoop();
        }
        
        // 觸發戰鬥速度變更事件
        this.gameState.triggerEvent('battleSpeedChanged', { speed });
        
        return this.battleSpeed;
    }

    /**
     * 設定自動戰鬥
     * @param {boolean} auto - 是否自動戰鬥
     */
    setAutoBattle(auto) {
        this.autoBattle = auto;
        
        // 觸發自動戰鬥變更事件
        this.gameState.triggerEvent('autoBattleChanged', { auto });
        
        return this.autoBattle;
    }

    /**
     * 獲取關卡資訊
     * @param {string} planetId - 星球ID
     * @param {string} stageId - 關卡ID
     * @returns {Object} - 關卡資訊
     */
    getStageInfo(planetId, stageId) {
        if (!this.stages[planetId] || !this.stages[planetId].stages[stageId]) {
            return null;
        }
        
        return this.stages[planetId].stages[stageId];
    }

    /**
     * 獲取星球資訊
     * @param {string} planetId - 星球ID
     * @returns {Object} - 星球資訊
     */
    getPlanetInfo(planetId) {
        if (!this.stages[planetId]) {
            return null;
        }
        
        return {
            id: this.stages[planetId].id,
            name: this.stages[planetId].name,
            description: this.stages[planetId].description,
            stageCount: this.stages[planetId].stages.length
        };
    }

    /**
     * 獲取所有星球資訊
     * @returns {Array} - 所有星球資訊
     */
    getAllPlanets() {
        return Object.keys(this.stages).map(planetId => this.getPlanetInfo(planetId));
    }

    /**
     * 獲取星球的所有關卡資訊
     * @param {string} planetId - 星球ID
     * @returns {Array} - 關卡資訊陣列
     */
    getPlanetStages(planetId) {
        if (!this.stages[planetId]) {
            return [];
        }
        
        return Object.keys(this.stages[planetId].stages).map(stageId => ({
            id: stageId,
            name: this.stages[planetId].stages[stageId].name,
            // 添加關卡進度資訊
            progress: this.gameState.stageProgress[planetId] && this.gameState.stageProgress[planetId][stageId] ?
                this.gameState.stageProgress[planetId][stageId] : { completed: false, stars: 0, unlocked: false }
        }));
    }
}

// 創建全局戰鬥引擎實例
const challengeEngine = new ChallengeEngine(window.gameState);

// 導出戰鬥引擎實例
window.challengeEngine = challengeEngine;