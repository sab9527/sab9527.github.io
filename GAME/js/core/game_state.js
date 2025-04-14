/**
 * game_state.js
 * 管理遊戲的全局狀態，包括玩家擁有的角色、資源、裝備等。
 */

class GameState {
    constructor() {
        // 初始化遊戲狀態
        this.characters = []; // 擁有的角色
        this.activeTeam = []; // 當前上場的角色（最多4個）
        this.resources = {}; // 資源
        this.lightCones = []; // 光錐
        this.relics = []; // 遺器（儀器）
        this.currentPlanet = null; // 當前選擇的星球
        this.currentStage = null; // 當前選擇的關卡
        this.stageProgress = {}; // 關卡進度 {planetId: {stageId: {completed: boolean, stars: number}}}
        this.shopItems = []; // 商店物品
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            language: 'zh-TW'
        };
        
        // 事件監聽器
        this.eventListeners = {};
    }

    /**
     * 初始化遊戲狀態
     */
    async init() {
        try {
            // 載入初始角色
            await this.loadCharacters();
            
            // 載入初始資源
            await this.loadResources();
            
            // 載入關卡資料
            await this.loadStages();
            
            // 載入光錐資料
            await this.loadLightCones();
            
            // 載入遺器資料
            await this.loadRelics();
            
            // 設定初始隊伍（如果有角色）
            if (this.characters.length > 0) {
                // 最多選擇4個角色作為初始隊伍
                this.activeTeam = this.characters.slice(0, Math.min(4, this.characters.length));
            }
            
            // 設定初始星球和關卡
            if (Object.keys(this.stageProgress).length > 0) {
                this.currentPlanet = Object.keys(this.stageProgress)[0];
                this.currentStage = '1'; // 從第一關開始
            }
            
            // 觸發初始化完成事件
            this.triggerEvent('gameInitialized');
            
            return true;
        } catch (error) {
            console.error('初始化遊戲狀態失敗:', error);
            return false;
        }
    }

    /**
     * 載入角色資料
     */
    async loadCharacters() {
        try {
            const response = await fetch('data/characters.json');
            const data = await response.json();
            
            // 初始時只解鎖部分角色
            this.characters = data.filter(char => char.isInitiallyUnlocked).map(char => ({
                ...char,
                level: 1,
                exp: 0,
                skills: char.skills.map(skill => ({ ...skill, level: 1 })),
                equippedLightCone: null,
                equippedRelics: []
            }));
            
            return this.characters;
        } catch (error) {
            console.error('載入角色資料失敗:', error);
            // 設定一些預設角色，以防資料載入失敗
            this.characters = [
                {
                    id: 'char001',
                    name: '初始角色',
                    path: '毀滅',
                    rarity: 4,
                    level: 1,
                    exp: 0,
                    skills: [
                        { id: 'skill001', name: '基本攻擊', description: '造成100%攻擊力的傷害', level: 1 }
                    ],
                    equippedLightCone: null,
                    equippedRelics: []
                }
            ];
            return this.characters;
        }
    }

    /**
     * 載入資源資料
     */
    async loadResources() {
        try {
            const response = await fetch('data/resources.json');
            const data = await response.json();
            
            // 設定初始資源
            this.resources = {};
            data.forEach(resource => {
                this.resources[resource.id] = resource.initialAmount || 0;
            });
            
            return this.resources;
        } catch (error) {
            console.error('載入資源資料失敗:', error);
            // 設定一些預設資源，以防資料載入失敗
            this.resources = {
                gold: 1000,
                exp: 0
            };
            return this.resources;
        }
    }

    /**
     * 載入關卡資料
     */
    async loadStages() {
        try {
            const response = await fetch('data/stages.json');
            const data = await response.json();
            
            // 初始化關卡進度
            this.stageProgress = {};
            
            // 對每個星球，初始化第一關為可用，其餘關卡鎖定
            Object.keys(data).forEach(planetId => {
                this.stageProgress[planetId] = {};
                Object.keys(data[planetId].stages).forEach(stageId => {
                    this.stageProgress[planetId][stageId] = {
                        completed: false,
                        stars: 0,
                        // 只有第一關是解鎖的
                        unlocked: stageId === '1'
                    };
                });
            });
            
            return this.stageProgress;
        } catch (error) {
            console.error('載入關卡資料失敗:', error);
            // 設定一些預設關卡進度，以防資料載入失敗
            this.stageProgress = {
                'planet1': {
                    '1': { completed: false, stars: 0, unlocked: true },
                    '2': { completed: false, stars: 0, unlocked: false }
                }
            };
            return this.stageProgress;
        }
    }

    /**
     * 載入光錐資料
     */
    async loadLightCones() {
        try {
            const response = await fetch('data/light_cones.json');
            const data = await response.json();
            
            // 初始時只解鎖部分光錐
            this.lightCones = data.filter(lc => lc.isInitiallyUnlocked).map(lc => ({
                ...lc,
                level: 1,
                exp: 0,
                equippedBy: null // 記錄哪個角色裝備了這個光錐
            }));
            
            return this.lightCones;
        } catch (error) {
            console.error('載入光錐資料失敗:', error);
            // 設定一些預設光錐，以防資料載入失敗
            this.lightCones = [
                {
                    id: 'lc001',
                    name: '初始光錐',
                    rarity: 3,
                    path: '毀滅',
                    level: 1,
                    exp: 0,
                    equippedBy: null
                }
            ];
            return this.lightCones;
        }
    }

    /**
     * 載入遺器資料
     */
    async loadRelics() {
        try {
            const response = await fetch('data/relics.json');
            const data = await response.json();
            
            // 初始時只解鎖部分遺器
            this.relics = data.filter(relic => relic.isInitiallyUnlocked).map(relic => ({
                ...relic,
                level: 1,
                exp: 0,
                equippedBy: null // 記錄哪個角色裝備了這個遺器
            }));
            
            return this.relics;
        } catch (error) {
            console.error('載入遺器資料失敗:', error);
            // 設定一些預設遺器，以防資料載入失敗
            this.relics = [
                {
                    id: 'relic001',
                    name: '初始遺器',
                    rarity: 3,
                    type: '頭部',
                    level: 1,
                    exp: 0,
                    equippedBy: null
                }
            ];
            return this.relics;
        }
    }

    /**
     * 設定當前上場隊伍
     * @param {Array} characterIds - 角色ID陣列
     */
    setActiveTeam(characterIds) {
        // 確保隊伍不超過4人
        if (characterIds.length > 4) {
            characterIds = characterIds.slice(0, 4);
        }
        
        // 確保所有角色都存在
        const validCharacters = characterIds.filter(id => 
            this.characters.some(char => char.id === id)
        );
        
        // 設定上場隊伍
        this.activeTeam = validCharacters.map(id => 
            this.characters.find(char => char.id === id)
        );
        
        // 觸發隊伍變更事件
        this.triggerEvent('teamChanged', this.activeTeam);
        
        return this.activeTeam;
    }

    /**
     * 獲取資源
     * @param {string} resourceId - 資源ID
     * @param {number} amount - 數量
     */
    addResource(resourceId, amount) {
        if (!this.resources[resourceId]) {
            this.resources[resourceId] = 0;
        }
        
        this.resources[resourceId] += amount;
        
        // 觸發資源變更事件
        this.triggerEvent('resourceChanged', { resourceId, amount, total: this.resources[resourceId] });
        
        return this.resources[resourceId];
    }

    /**
     * 消耗資源
     * @param {string} resourceId - 資源ID
     * @param {number} amount - 數量
     * @returns {boolean} - 是否成功消耗
     */
    useResource(resourceId, amount) {
        if (!this.resources[resourceId] || this.resources[resourceId] < amount) {
            return false;
        }
        
        this.resources[resourceId] -= amount;
        
        // 觸發資源變更事件
        this.triggerEvent('resourceChanged', { resourceId, amount: -amount, total: this.resources[resourceId] });
        
        return true;
    }

    /**
     * 解鎖關卡
     * @param {string} planetId - 星球ID
     * @param {string} stageId - 關卡ID
     */
    unlockStage(planetId, stageId) {
        if (!this.stageProgress[planetId] || !this.stageProgress[planetId][stageId]) {
            return false;
        }
        
        this.stageProgress[planetId][stageId].unlocked = true;
        
        // 觸發關卡解鎖事件
        this.triggerEvent('stageUnlocked', { planetId, stageId });
        
        return true;
    }

    /**
     * 完成關卡
     * @param {string} planetId - 星球ID
     * @param {string} stageId - 關卡ID
     * @param {number} stars - 獲得的星星數（0-3）
     */
    completeStage(planetId, stageId, stars) {
        if (!this.stageProgress[planetId] || !this.stageProgress[planetId][stageId]) {
            return false;
        }
        
        // 更新關卡完成狀態
        this.stageProgress[planetId][stageId].completed = true;
        this.stageProgress[planetId][stageId].stars = Math.max(this.stageProgress[planetId][stageId].stars, stars);
        
        // 解鎖下一關
        const nextStageId = String(parseInt(stageId) + 1);
        if (this.stageProgress[planetId][nextStageId]) {
            this.stageProgress[planetId][nextStageId].unlocked = true;
        }
        
        // 觸發關卡完成事件
        this.triggerEvent('stageCompleted', { planetId, stageId, stars });
        
        return true;
    }

    /**
     * 添加事件監聽器
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
    }

    /**
     * 移除事件監聽器
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    removeEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }

    /**
     * 觸發事件
     * @param {string} event - 事件名稱
     * @param {*} data - 事件資料
     */
    triggerEvent(event, data) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件處理器錯誤 (${event}):`, error);
            }
        });
    }

    /**
     * 保存遊戲狀態
     */
    saveGame() {
        const gameData = {
            characters: this.characters,
            activeTeam: this.activeTeam.map(char => char.id),
            resources: this.resources,
            lightCones: this.lightCones,
            relics: this.relics,
            currentPlanet: this.currentPlanet,
            currentStage: this.currentStage,
            stageProgress: this.stageProgress,
            settings: this.settings,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('starRailIdleGame', JSON.stringify(gameData));
            this.triggerEvent('gameSaved', { timestamp: gameData.timestamp });
            return true;
        } catch (error) {
            console.error('保存遊戲失敗:', error);
            return false;
        }
    }

    /**
     * 載入遊戲狀態
     */
    loadGame() {
        try {
            const savedData = localStorage.getItem('starRailIdleGame');
            if (!savedData) {
                return false;
            }
            
            const gameData = JSON.parse(savedData);
            
            // 載入角色資料
            this.characters = gameData.characters;
            
            // 載入上場隊伍
            this.activeTeam = gameData.activeTeam.map(id => 
                this.characters.find(char => char.id === id)
            ).filter(Boolean);
            
            // 載入資源
            this.resources = gameData.resources;
            
            // 載入光錐
            this.lightCones = gameData.lightCones;
            
            // 載入遺器
            this.relics = gameData.relics;
            
            // 載入關卡進度
            this.currentPlanet = gameData.currentPlanet;
            this.currentStage = gameData.currentStage;
            this.stageProgress = gameData.stageProgress;
            
            // 載入設定
            this.settings = gameData.settings;
            
            this.triggerEvent('gameLoaded', { timestamp: gameData.timestamp });
            return true;
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            return false;
        }
    }
}

// 創建全局遊戲狀態實例
const gameState = new GameState();

// 導出遊戲狀態實例
window.gameState = gameState;