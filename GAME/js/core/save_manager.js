/**
 * save_manager.js
 * 處理遊戲存檔和讀檔的邏輯。
 */

class SaveManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.autoSaveInterval = null;
        this.saveKey = 'starRailIdleGame';
        this.maxSaveSlots = 3;
    }

    /**
     * 初始化存檔管理器
     */
    init() {
        // 檢查是否有自動存檔
        this.checkAutoSave();
        
        // 設定自動存檔（每5分鐘）
        this.startAutoSave(5 * 60 * 1000);
        
        // 監聽頁面關閉事件，自動存檔
        window.addEventListener('beforeunload', () => {
            this.saveGame('autosave');
        });
    }

    /**
     * 檢查是否有自動存檔
     */
    checkAutoSave() {
        const autosave = this.getSaveData('autosave');
        if (autosave) {
            // 提示玩家是否要載入自動存檔
            const loadAutosave = confirm('發現自動存檔，是否載入？');
            if (loadAutosave) {
                this.loadGame('autosave');
            }
        }
    }

    /**
     * 開始自動存檔
     * @param {number} interval - 自動存檔間隔（毫秒）
     */
    startAutoSave(interval) {
        // 清除之前的自動存檔計時器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // 設定新的自動存檔計時器
        this.autoSaveInterval = setInterval(() => {
            this.saveGame('autosave');
            console.log('遊戲已自動存檔');
        }, interval);
    }

    /**
     * 停止自動存檔
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * 保存遊戲
     * @param {string} slotName - 存檔槽名稱
     * @returns {boolean} - 是否成功保存
     */
    saveGame(slotName = 'slot1') {
        try {
            // 獲取遊戲狀態
            const gameData = {
                characters: this.gameState.characters,
                activeTeam: this.gameState.activeTeam.map(char => char.id),
                resources: this.gameState.resources,
                lightCones: this.gameState.lightCones,
                relics: this.gameState.relics,
                currentPlanet: this.gameState.currentPlanet,
                currentStage: this.gameState.currentStage,
                stageProgress: this.gameState.stageProgress,
                settings: this.gameState.settings,
                timestamp: Date.now(),
                saveVersion: '1.0.0' // 存檔版本，用於未來兼容性檢查
            };
            
            // 保存到 localStorage
            localStorage.setItem(`${this.saveKey}_${slotName}`, JSON.stringify(gameData));
            
            // 更新存檔列表
            this.updateSaveList(slotName, gameData.timestamp);
            
            // 觸發存檔事件
            this.gameState.triggerEvent('gameSaved', { slotName, timestamp: gameData.timestamp });
            
            return true;
        } catch (error) {
            console.error('保存遊戲失敗:', error);
            return false;
        }
    }

    /**
     * 載入遊戲
     * @param {string} slotName - 存檔槽名稱
     * @returns {boolean} - 是否成功載入
     */
    loadGame(slotName = 'slot1') {
        try {
            // 從 localStorage 獲取存檔
            const savedData = localStorage.getItem(`${this.saveKey}_${slotName}`);
            if (!savedData) {
                console.warn(`找不到存檔: ${slotName}`);
                return false;
            }
            
            const gameData = JSON.parse(savedData);
            
            // 檢查存檔版本兼容性
            if (!this.checkSaveCompatibility(gameData.saveVersion)) {
                console.warn(`存檔版本不兼容: ${gameData.saveVersion}`);
                return false;
            }
            
            // 載入角色資料
            this.gameState.characters = gameData.characters;
            
            // 載入上場隊伍
            this.gameState.activeTeam = gameData.activeTeam.map(id => 
                this.gameState.characters.find(char => char.id === id)
            ).filter(Boolean);
            
            // 載入資源
            this.gameState.resources = gameData.resources;
            
            // 載入光錐
            this.gameState.lightCones = gameData.lightCones;
            
            // 載入遺器
            this.gameState.relics = gameData.relics;
            
            // 載入關卡進度
            this.gameState.currentPlanet = gameData.currentPlanet;
            this.gameState.currentStage = gameData.currentStage;
            this.gameState.stageProgress = gameData.stageProgress;
            
            // 載入設定
            this.gameState.settings = gameData.settings;
            
            // 觸發載入事件
            this.gameState.triggerEvent('gameLoaded', { slotName, timestamp: gameData.timestamp });
            
            return true;
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            return false;
        }
    }

    /**
     * 刪除存檔
     * @param {string} slotName - 存檔槽名稱
     * @returns {boolean} - 是否成功刪除
     */
    deleteSave(slotName) {
        try {
            // 從 localStorage 刪除存檔
            localStorage.removeItem(`${this.saveKey}_${slotName}`);
            
            // 更新存檔列表
            this.updateSaveList(slotName, null, true);
            
            // 觸發刪除事件
            this.gameState.triggerEvent('saveDeleted', { slotName });
            
            return true;
        } catch (error) {
            console.error('刪除存檔失敗:', error);
            return false;
        }
    }

    /**
     * 獲取存檔資料
     * @param {string} slotName - 存檔槽名稱
     * @returns {Object|null} - 存檔資料
     */
    getSaveData(slotName) {
        try {
            const savedData = localStorage.getItem(`${this.saveKey}_${slotName}`);
            if (!savedData) {
                return null;
            }
            
            return JSON.parse(savedData);
        } catch (error) {
            console.error('獲取存檔資料失敗:', error);
            return null;
        }
    }

    /**
     * 獲取所有存檔列表
     * @returns {Array} - 存檔列表
     */
    getAllSaves() {
        try {
            // 從 localStorage 獲取存檔列表
            const saveListJson = localStorage.getItem(`${this.saveKey}_saveList`);
            if (!saveListJson) {
                return [];
            }
            
            return JSON.parse(saveListJson);
        } catch (error) {
            console.error('獲取存檔列表失敗:', error);
            return [];
        }
    }

    /**
     * 更新存檔列表
     * @param {string} slotName - 存檔槽名稱
     * @param {number} timestamp - 存檔時間戳
     * @param {boolean} isDelete - 是否為刪除操作
     */
    updateSaveList(slotName, timestamp, isDelete = false) {
        try {
            // 獲取現有存檔列表
            let saveList = this.getAllSaves();
            
            // 如果是刪除操作，從列表中移除
            if (isDelete) {
                saveList = saveList.filter(save => save.slot !== slotName);
            } else {
                // 檢查是否已存在該存檔槽
                const existingIndex = saveList.findIndex(save => save.slot === slotName);
                
                if (existingIndex >= 0) {
                    // 更新現有存檔資訊
                    saveList[existingIndex].timestamp = timestamp;
                    saveList[existingIndex].date = new Date(timestamp).toLocaleString();
                } else {
                    // 添加新存檔資訊
                    saveList.push({
                        slot: slotName,
                        timestamp: timestamp,
                        date: new Date(timestamp).toLocaleString()
                    });
                }
            }
            
            // 保存更新後的列表
            localStorage.setItem(`${this.saveKey}_saveList`, JSON.stringify(saveList));
            
            return saveList;
        } catch (error) {
            console.error('更新存檔列表失敗:', error);
            return [];
        }
    }

    /**
     * 檢查存檔版本兼容性
     * @param {string} saveVersion - 存檔版本
     * @returns {boolean} - 是否兼容
     */
    checkSaveCompatibility(saveVersion) {
        // 目前簡單檢查，未來可以根據需要擴展
        const currentVersion = '1.0.0';
        
        // 如果沒有版本號，假設是舊版本
        if (!saveVersion) {
            return false;
        }
        
        // 簡單比較版本號的第一個數字（主版本號）
        const saveMainVersion = saveVersion.split('.')[0];
        const currentMainVersion = currentVersion.split('.')[0];
        
        return saveMainVersion === currentMainVersion;
    }

    /**
     * 導出存檔（用於備份）
     * @param {string} slotName - 存檔槽名稱
     * @returns {string} - 存檔數據（JSON字符串）
     */
    exportSave(slotName = 'slot1') {
        const saveData = this.getSaveData(slotName);
        if (!saveData) {
            return null;
        }
        
        return JSON.stringify(saveData);
    }

    /**
     * 導入存檔（用於恢復備份）
     * @param {string} saveData - 存檔數據（JSON字符串）
     * @param {string} slotName - 存檔槽名稱
     * @returns {boolean} - 是否成功導入
     */
    importSave(saveData, slotName = 'slot1') {
        try {
            // 解析存檔數據
            const gameData = JSON.parse(saveData);
            
            // 檢查存檔版本兼容性
            if (!this.checkSaveCompatibility(gameData.saveVersion)) {
                console.warn(`存檔版本不兼容: ${gameData.saveVersion}`);
                return false;
            }
            
            // 保存到指定槽位
            localStorage.setItem(`${this.saveKey}_${slotName}`, saveData);
            
            // 更新存檔列表
            this.updateSaveList(slotName, gameData.timestamp);
            
            // 觸發導入事件
            this.gameState.triggerEvent('saveImported', { slotName, timestamp: gameData.timestamp });
            
            return true;
        } catch (error) {
            console.error('導入存檔失敗:', error);
            return false;
        }
    }
}

// 創建全局存檔管理器實例
const saveManager = new SaveManager(window.gameState);

// 導出存檔管理器實例
window.saveManager = saveManager;

// 頁面載入完成後初始化存檔管理器
document.addEventListener('DOMContentLoaded', () => {
    saveManager.init();
});