/**
 * progression_manager.js
 * 處理遊戲進度相關邏輯，包括角色升級、技能解鎖等。
 */

class ProgressionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.expRequirements = {}; // 各等級所需經驗值
        this.skillUpgradeCosts = {}; // 技能升級所需資源
        this.characterUpgradeCosts = {}; // 角色升級所需資源
        this.lightConeUpgradeCosts = {}; // 光錐升級所需資源
        this.relicUpgradeCosts = {}; // 遺器升級所需資源
        
        // 初始化升級需求
        this.initExpRequirements();
        this.initUpgradeCosts();
    }

    /**
     * 初始化各等級所需經驗值
     */
    initExpRequirements() {
        // 角色等級經驗需求
        this.expRequirements.character = {};
        for (let level = 1; level <= 80; level++) {
            // 使用公式計算：基礎值 * 等級的平方
            this.expRequirements.character[level] = Math.floor(100 * Math.pow(level, 2));
        }
        
        // 光錐等級經驗需求
        this.expRequirements.lightCone = {};
        for (let level = 1; level <= 80; level++) {
            this.expRequirements.lightCone[level] = Math.floor(80 * Math.pow(level, 1.8));
        }
        
        // 遺器等級經驗需求
        this.expRequirements.relic = {};
        for (let level = 1; level <= 20; level++) {
            this.expRequirements.relic[level] = Math.floor(50 * Math.pow(level, 1.5));
        }
        
        // 技能等級經驗需求
        this.expRequirements.skill = {};
        for (let level = 1; level <= 10; level++) {
            this.expRequirements.skill[level] = Math.floor(150 * Math.pow(level, 1.7));
        }
    }

    /**
     * 初始化升級所需資源
     */
    initUpgradeCosts() {
        // 角色升級所需資源
        this.characterUpgradeCosts = {};
        for (let level = 1; level <= 80; level++) {
            this.characterUpgradeCosts[level] = {
                gold: Math.floor(100 * Math.pow(level, 1.5)),
                materials: {
                    common: Math.floor(level / 5) + 1,
                    rare: Math.floor(level / 10) + 1,
                    epic: Math.floor(level / 20) + 1
                }
            };
        }
        
        // 技能升級所需資源
        this.skillUpgradeCosts = {};
        for (let level = 1; level <= 10; level++) {
            this.skillUpgradeCosts[level] = {
                gold: Math.floor(200 * Math.pow(level, 1.8)),
                materials: {
                    common: Math.floor(level) + 2,
                    rare: Math.floor(level / 2) + 1,
                    epic: Math.floor(level / 4) + 1
                }
            };
        }
        
        // 光錐升級所需資源
        this.lightConeUpgradeCosts = {};
        for (let level = 1; level <= 80; level++) {
            this.lightConeUpgradeCosts[level] = {
                gold: Math.floor(80 * Math.pow(level, 1.4)),
                materials: {
                    common: Math.floor(level / 5) + 1,
                    rare: Math.floor(level / 15) + 1,
                    epic: Math.floor(level / 30) + 1
                }
            };
        }
        
        // 遺器升級所需資源
        this.relicUpgradeCosts = {};
        for (let level = 1; level <= 20; level++) {
            this.relicUpgradeCosts[level] = {
                gold: Math.floor(50 * Math.pow(level, 1.3)),
                materials: {
                    common: Math.floor(level / 2) + 1,
                    rare: Math.floor(level / 5) + 1,
                    epic: Math.floor(level / 10) + 1
                }
            };
        }
    }

    /**
     * 升級角色
     * @param {string} characterId - 角色ID
     * @param {number} expAmount - 經驗值數量
     * @returns {Object} - 升級結果 {success, newLevel, expRemaining}
     */
    upgradeCharacter(characterId, expAmount) {
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) {
            return { success: false, message: '找不到指定角色' };
        }
        
        let currentExp = character.exp + expAmount;
        let currentLevel = character.level;
        let leveledUp = false;
        
        // 檢查是否可以升級
        while (currentLevel < 80 && currentExp >= this.expRequirements.character[currentLevel]) {
            // 消耗經驗值升級
            currentExp -= this.expRequirements.character[currentLevel];
            currentLevel++;
            leveledUp = true;
        }
        
        // 更新角色等級和經驗值
        character.level = currentLevel;
        character.exp = currentExp;
        
        // 觸發角色升級事件
        if (leveledUp) {
            this.gameState.triggerEvent('characterLevelUp', { 
                character, 
                oldLevel: character.level - 1, 
                newLevel: character.level 
            });
        }
        
        return { 
            success: true, 
            leveledUp, 
            newLevel: currentLevel, 
            expRemaining: currentExp 
        };
    }

    /**
     * 升級技能
     * @param {string} characterId - 角色ID
     * @param {string} skillId - 技能ID
     * @returns {Object} - 升級結果 {success, newLevel}
     */
    upgradeSkill(characterId, skillId) {
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) {
            return { success: false, message: '找不到指定角色' };
        }
        
        const skill = character.skills.find(s => s.id === skillId);
        if (!skill) {
            return { success: false, message: '找不到指定技能' };
        }
        
        // 檢查技能是否已達最高等級
        if (skill.level >= 10) {
            return { success: false, message: '技能已達最高等級' };
        }
        
        // 檢查升級所需資源
        const cost = this.skillUpgradeCosts[skill.level];
        
        // 檢查金幣是否足夠
        if (this.gameState.resources.gold < cost.gold) {
            return { success: false, message: '金幣不足' };
        }
        
        // 檢查材料是否足夠
        for (const [materialType, amount] of Object.entries(cost.materials)) {
            const resourceId = `material_${materialType}`;
            if (!this.gameState.resources[resourceId] || this.gameState.resources[resourceId] < amount) {
                return { success: false, message: `材料不足: ${materialType}` };
            }
        }
        
        // 消耗資源
        this.gameState.useResource('gold', cost.gold);
        for (const [materialType, amount] of Object.entries(cost.materials)) {
            const resourceId = `material_${materialType}`;
            this.gameState.useResource(resourceId, amount);
        }
        
        // 升級技能
        const oldLevel = skill.level;
        skill.level++;
        
        // 觸發技能升級事件
        this.gameState.triggerEvent('skillLevelUp', { 
            character, 
            skill, 
            oldLevel, 
            newLevel: skill.level 
        });
        
        return { 
            success: true, 
            newLevel: skill.level 
        };
    }

    /**
     * 升級光錐
     * @param {string} lightConeId - 光錐ID
     * @param {number} expAmount - 經驗值數量
     * @returns {Object} - 升級結果 {success, newLevel, expRemaining}
     */
    upgradeLightCone(lightConeId, expAmount) {
        const lightCone = this.gameState.lightCones.find(lc => lc.id === lightConeId);
        if (!lightCone) {
            return { success: false, message: '找不到指定光錐' };
        }
        
        let currentExp = lightCone.exp + expAmount;
        let currentLevel = lightCone.level;
        let leveledUp = false;
        
        // 檢查是否可以升級
        while (currentLevel < 80 && currentExp >= this.expRequirements.lightCone[currentLevel]) {
            // 消耗經驗值升級
            currentExp -= this.expRequirements.lightCone[currentLevel];
            currentLevel++;
            leveledUp = true;
        }
        
        // 更新光錐等級和經驗值
        lightCone.level = currentLevel;
        lightCone.exp = currentExp;
        
        // 觸發光錐升級事件
        if (leveledUp) {
            this.gameState.triggerEvent('lightConeLevelUp', { 
                lightCone, 
                oldLevel: lightCone.level - 1, 
                newLevel: lightCone.level 
            });
        }
        
        return { 
            success: true, 
            leveledUp, 
            newLevel: currentLevel, 
            expRemaining: currentExp 
        };
    }

    /**
     * 升級遺器
     * @param {string} relicId - 遺器ID
     * @param {number} expAmount - 經驗值數量
     * @returns {Object} - 升級結果 {success, newLevel, expRemaining}
     */
    upgradeRelic(relicId, expAmount) {
        const relic = this.gameState.relics.find(r => r.id === relicId);
        if (!relic) {
            return { success: false, message: '找不到指定遺器' };
        }
        
        let currentExp = relic.exp + expAmount;
        let currentLevel = relic.level;
        let leveledUp = false;
        
        // 檢查是否可以升級
        while (currentLevel < 20 && currentExp >= this.expRequirements.relic[currentLevel]) {
            // 消耗經驗值升級
            currentExp -= this.expRequirements.relic[currentLevel];
            currentLevel++;
            leveledUp = true;
        }
        
        // 更新遺器等級和經驗值
        relic.level = currentLevel;
        relic.exp = currentExp;
        
        // 觸發遺器升級事件
        if (leveledUp) {
            this.gameState.triggerEvent('relicLevelUp', { 
                relic, 
                oldLevel: relic.level - 1, 
                newLevel: relic.level 
            });
        }
        
        return { 
            success: true, 
            leveledUp, 
            newLevel: currentLevel, 
            expRemaining: currentExp 
        };
    }

    /**
     * 裝備光錐
     * @param {string} characterId - 角色ID
     * @param {string} lightConeId - 光錐ID
     * @returns {Object} - 裝備結果 {success, message}
     */
    equipLightCone(characterId, lightConeId) {
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) {
            return { success: false, message: '找不到指定角色' };
        }
        
        const lightCone = this.gameState.lightCones.find(lc => lc.id === lightConeId);
        if (!lightCone) {
            return { success: false, message: '找不到指定光錐' };
        }
        
        // 檢查命途是否匹配
        if (lightCone.path && lightCone.path !== character.path) {
            return { success: false, message: '光錐命途與角色不匹配' };
        }
        
        // 如果光錐已被其他角色裝備，先卸下
        if (lightCone.equippedBy) {
            const equippedCharacter = this.gameState.characters.find(c => c.id === lightCone.equippedBy);
            if (equippedCharacter) {
                equippedCharacter.equippedLightCone = null;
            }
        }
        
        // 如果角色已裝備其他光錐，先卸下
        if (character.equippedLightCone) {
            const oldLightCone = this.gameState.lightCones.find(lc => lc.id === character.equippedLightCone);
            if (oldLightCone) {
                oldLightCone.equippedBy = null;
            }
        }
        
        // 裝備新光錐
        character.equippedLightCone = lightCone.id;
        lightCone.equippedBy = character.id;
        
        // 觸發裝備變更事件
        this.gameState.triggerEvent('lightConeEquipped', { character, lightCone });
        
        return { success: true, message: '成功裝備光錐' };
    }

    /**
     * 裝備遺器
     * @param {string} characterId - 角色ID
     * @param {string} relicId - 遺器ID
     * @returns {Object} - 裝備結果 {success, message}
     */
    equipRelic(characterId, relicId) {
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) {
            return { success: false, message: '找不到指定角色' };
        }
        
        const relic = this.gameState.relics.find(r => r.id === relicId);
        if (!relic) {
            return { success: false, message: '找不到指定遺器' };
        }
        
        // 如果遺器已被其他角色裝備，先卸下
        if (relic.equippedBy) {
            const equippedCharacter = this.gameState.characters.find(c => c.id === relic.equippedBy);
            if (equippedCharacter) {
                equippedCharacter.equippedRelics = equippedCharacter.equippedRelics.filter(id => id !== relic.id);
            }
        }
        
        // 如果角色已裝備同類型的遺器，先卸下
        const sameTypeRelicId = character.equippedRelics.find(id => {
            const equippedRelic = this.gameState.relics.find(r => r.id === id);
            return equippedRelic && equippedRelic.type === relic.type;
        });
        
        if (sameTypeRelicId) {
            const oldRelic = this.gameState.relics.find(r => r.id === sameTypeRelicId);
            if (oldRelic) {
                oldRelic.equippedBy = null;
                character.equippedRelics = character.equippedRelics.filter(id => id !== sameTypeRelicId);
            }
        }
        
        // 裝備新遺器
        character.equippedRelics.push(relic.id);
        relic.equippedBy = character.id;
        
        // 觸發裝備變更事件
        this.gameState.triggerEvent('relicEquipped', { character, relic });
        
        return { success: true, message: '成功裝備遺器' };
    }

    /**
     * 解鎖新角色
     * @param {string} characterId - 角色ID
     * @returns {Object} - 解鎖結果 {success, character}
     */
    unlockCharacter(characterId) {
        // 檢查角色是否已解鎖
        if (this.gameState.characters.some(c => c.id === characterId)) {
            return { success: false, message: '角色已解鎖' };
        }
        
        // 從資料中獲取角色資訊
        return fetch('data/characters.json')
            .then(response => response.json())
            .then(characters => {
                const characterData = characters.find(c => c.id === characterId);
                if (!characterData) {
                    return { success: false, message: '找不到指定角色資料' };
                }
                
                // 創建新角色
                const newCharacter = {
                    ...characterData,
                    level: 1,
                    exp: 0,
                    skills: characterData.skills.map(skill => ({ ...skill, level: 1 })),
                    equippedLightCone: null,
                    equippedRelics: []
                };
                
                // 添加到角色列表
                this.gameState.characters.push(newCharacter);
                
                // 觸發角色解鎖事件
                this.gameState.triggerEvent('characterUnlocked', { character: newCharacter });
                
                return { success: true, character: newCharacter };
            })
            .catch(error => {
                console.error('解鎖角色失敗:', error);
                return { success: false, message: '解鎖角色失敗' };
            });
    }

    /**
     * 解鎖新光錐
     * @param {string} lightConeId - 光錐ID
     * @returns {Object} - 解鎖結果 {success, lightCone}
     */
    unlockLightCone(lightConeId) {
        // 檢查光錐是否已解鎖
        if (this.gameState.lightCones.some(lc => lc.id === lightConeId)) {
            return { success: false, message: '光錐已解鎖' };
        }
        
        // 從資料中獲取光錐資訊
        return fetch('data/light_cones.json')
            .then(response => response.json())
            .then(lightCones => {
                const lightConeData = lightCones.find(lc => lc.id === lightConeId);
                if (!lightConeData) {
                    return { success: false, message: '找不到指定光錐資料' };
                }
                
                // 創建新光錐
                const newLightCone = {
                    ...lightConeData,
                    level: 1,
                    exp: 0,
                    equippedBy: null
                };
                
                // 添加到光錐列表
                this.gameState.lightCones.push(newLightCone);
                
                // 觸發光錐解鎖事件
                this.gameState.triggerEvent('lightConeUnlocked', { lightCone: newLightCone });
                
                return { success: true, lightCone: newLightCone };
            })
            .catch(error => {
                console.error('解鎖光錐失敗:', error);
                return { success: false, message: '解鎖光錐失敗' };
            });
    }

    /**
     * 解鎖新遺器
     * @param {string} relicId - 遺器ID
     * @returns {Object} - 解鎖結果 {success, relic}
     */
    unlockRelic(relicId) {
        // 檢查遺器是否已解鎖
        if (this.gameState.relics.some(r => r.id === relicId)) {
            return { success: false, message: '遺器已解鎖' };
        }
        
        // 從資料中獲取遺器資訊
        return fetch('data/relics.json')
            .then(response => response.json())
            .then(relics => {
                const relicData = relics.find(r => r.id === relicId);
                if (!relicData) {
                    return { success: false, message: '找不到指定遺器資料' };
                }
                
                // 創建新遺器
                const newRelic = {
                    ...relicData,
                    level: 1,
                    exp: 0,
                    equippedBy: null
                };
                
                // 添加到遺器列表
                this.gameState.relics.push(newRelic);
                
                // 觸發遺器解鎖事件
                this.gameState.triggerEvent('relicUnlocked', { relic: newRelic });
                
                return { success: true, relic: newRelic };
            })
            .catch(error => {
                console.error('解鎖遺器失敗:', error);
                return { success: false, message: '解鎖遺器失敗' };
            });
    }
}

// 創建全局進度管理器實例
const progressionManager = new ProgressionManager(window.gameState);

// 導出進度管理器實例
window.progressionManager = progressionManager;