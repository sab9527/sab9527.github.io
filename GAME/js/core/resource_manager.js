/**
 * resource_manager.js
 * 管理資源的獲取、消耗和轉換。
 */

class ResourceManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.resourceTypes = {}; // 資源類型定義
        this.dropRates = {}; // 掉落率設定
        this.shopItems = []; // 商店物品
        
        // 初始化資源類型
        this.initResourceTypes();
        // 初始化掉落率
        this.initDropRates();
        // 初始化商店物品
        this.initShopItems();
    }

    /**
     * 初始化資源類型
     */
    async initResourceTypes() {
        try {
            const response = await fetch('data/resources.json');
            const data = await response.json();
            
            // 設定物品資源類型
            data.items.forEach(item => {
                this.resourceTypes[item.id] = {
                    name: item.name,
                    description: item.description,
                    type: item.type,
                    rarity: item.rarity,
                    maxStack: item.maxStack
                };
            });

            // 設定貨幣資源類型
            data.currencies.forEach(currency => {
                this.resourceTypes[currency.id] = {
                    name: currency.name,
                    description: currency.description,
                    type: 'currency',
                    maxAmount: currency.maxAmount
                };
            });
            
            return this.resourceTypes;
        } catch (error) {
            console.error('載入資源類型失敗:', error);
            // 設定一些預設資源類型，以防資料載入失敗
            this.resourceTypes = {
                gold: {
                    name: '信用點',
                    description: '通用貨幣',
                    icon: 'gold.png',
                    category: 'currency',
                    rarity: 1,
                    maxStack: 999999
                },
                exp: {
                    name: '經驗值',
                    description: '用於提升角色等級',
                    icon: 'exp.png',
                    category: 'exp',
                    rarity: 1,
                    maxStack: 999999
                },
                material_common: {
                    name: '普通材料',
                    description: '常見的升級材料',
                    icon: 'material_common.png',
                    category: 'material',
                    rarity: 1,
                    maxStack: 9999
                },
                material_rare: {
                    name: '稀有材料',
                    description: '較為稀有的升級材料',
                    icon: 'material_rare.png',
                    category: 'material',
                    rarity: 2,
                    maxStack: 9999
                },
                material_epic: {
                    name: '史詩材料',
                    description: '非常稀有的升級材料',
                    icon: 'material_epic.png',
                    category: 'material',
                    rarity: 3,
                    maxStack: 9999
                }
            };
            return this.resourceTypes;
        }
    }

    /**
     * 初始化掉落率
     */
    initDropRates() {
        // 設定各星球各關卡的掉落率
        // 格式: {planetId: {stageId: {resourceId: {min: number, max: number, chance: number}}}}
        this.dropRates = {
            'planet1': {
                // 第一星球的掉落率
                '1': { // 第一關
                    'gold': { min: 10, max: 30, chance: 1.0 },
                    'exp': { min: 5, max: 15, chance: 1.0 },
                    'material_common': { min: 1, max: 2, chance: 0.8 }
                },
                '2': { // 第二關
                    'gold': { min: 15, max: 40, chance: 1.0 },
                    'exp': { min: 8, max: 20, chance: 1.0 },
                    'material_common': { min: 1, max: 3, chance: 0.9 }
                },
                // ... 更多關卡
            },
            'planet2': {
                // 第二星球的掉落率
                '1': { // 第一關
                    'gold': { min: 30, max: 60, chance: 1.0 },
                    'exp': { min: 15, max: 30, chance: 1.0 },
                    'material_common': { min: 2, max: 4, chance: 1.0 },
                    'material_rare': { min: 1, max: 1, chance: 0.3 }
                },
                // ... 更多關卡
            },
            // ... 更多星球
        };
        
        return this.dropRates;
    }

    /**
     * 初始化商店物品
     */
    initShopItems() {
        // 設定商店物品
        this.shopItems = [
            {
                id: 'shop_item_1',
                name: '經驗藥水',
                description: '提供100點經驗值',
                icon: 'exp_potion.png',
                price: { gold: 100 },
                effect: { exp: 100 },
                limit: 10, // 每日購買限制
                purchased: 0 // 已購買數量
            },
            {
                id: 'shop_item_2',
                name: '普通材料包',
                description: '獲得5-10個普通材料',
                icon: 'material_pack.png',
                price: { gold: 200 },
                effect: { material_common: { min: 5, max: 10 } },
                limit: 5,
                purchased: 0
            },
            {
                id: 'shop_item_3',
                name: '稀有材料包',
                description: '獲得2-5個稀有材料',
                icon: 'material_pack_rare.png',
                price: { gold: 500 },
                effect: { material_rare: { min: 2, max: 5 } },
                limit: 3,
                purchased: 0
            },
            // ... 更多商店物品
        ];
        
        return this.shopItems;
    }

    /**
     * 重置商店（每日）
     */
    resetShop() {
        this.shopItems.forEach(item => {
            item.purchased = 0;
        });
        
        // 觸發商店重置事件
        this.gameState.triggerEvent('shopReset');
        
        return this.shopItems;
    }

    /**
     * 獲取關卡掉落物品
     * @param {string} planetId - 星球ID
     * @param {string} stageId - 關卡ID
     * @returns {Object} - 掉落物品 {resourceId: amount}
     */
    getStageDrop(planetId, stageId) {
        const drops = {};
        
        // 檢查是否有該關卡的掉落設定
        if (!this.dropRates[planetId] || !this.dropRates[planetId][stageId]) {
            console.warn(`找不到關卡掉落設定: ${planetId}-${stageId}`);
            return drops;
        }
        
        // 計算掉落物品
        const stageDrop = this.dropRates[planetId][stageId];
        for (const [resourceId, dropInfo] of Object.entries(stageDrop)) {
            // 根據機率決定是否掉落
            if (Math.random() <= dropInfo.chance) {
                // 計算掉落數量
                const amount = Math.floor(Math.random() * (dropInfo.max - dropInfo.min + 1)) + dropInfo.min;
                drops[resourceId] = amount;
                
                // 添加到玩家資源
                this.gameState.addResource(resourceId, amount);
            }
        }
        
        // 觸發掉落事件
        this.gameState.triggerEvent('resourceDropped', { planetId, stageId, drops });
        
        return drops;
    }

    /**
     * 購買商店物品
     * @param {string} itemId - 物品ID
     * @returns {Object} - 購買結果 {success, message, rewards}
     */
    purchaseShopItem(itemId) {
        // 找到商店物品
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '找不到指定物品' };
        }
        
        // 檢查購買限制
        if (item.purchased >= item.limit) {
            return { success: false, message: '已達購買限制' };
        }
        
        // 檢查資源是否足夠
        for (const [resourceId, amount] of Object.entries(item.price)) {
            if (!this.gameState.resources[resourceId] || this.gameState.resources[resourceId] < amount) {
                return { success: false, message: `資源不足: ${this.resourceTypes[resourceId]?.name || resourceId}` };
            }
        }
        
        // 扣除資源
        for (const [resourceId, amount] of Object.entries(item.price)) {
            this.gameState.useResource(resourceId, amount);
        }
        
        // 獲得獎勵
        const rewards = {};
        for (const [resourceId, effect] of Object.entries(item.effect)) {
            if (typeof effect === 'number') {
                // 固定數量
                rewards[resourceId] = effect;
                this.gameState.addResource(resourceId, effect);
            } else if (typeof effect === 'object' && effect.min !== undefined && effect.max !== undefined) {
                // 隨機數量
                const amount = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
                rewards[resourceId] = amount;
                this.gameState.addResource(resourceId, amount);
            }
        }
        
        // 更新購買次數
        item.purchased++;
        
        // 觸發購買事件
        this.gameState.triggerEvent('shopItemPurchased', { item, rewards });
        
        return { 
            success: true, 
            message: '購買成功', 
            rewards 
        };
    }

    /**
     * 獲取資源資訊
     * @param {string} resourceId - 資源ID
     * @returns {Object} - 資源資訊
     */
    getResourceInfo(resourceId) {
        return this.resourceTypes[resourceId] || null;
    }

    /**
     * 獲取所有資源類型
     * @returns {Object} - 所有資源類型
     */
    getAllResourceTypes() {
        return this.resourceTypes;
    }

    /**
     * 獲取所有商店物品
     * @returns {Array} - 所有商店物品
     */
    getAllShopItems() {
        return this.shopItems;
    }

    /**
     * 獲取玩家擁有的所有資源
     * @returns {Object} - 玩家資源 {resourceId: amount}
     */
    getPlayerResources() {
        return this.gameState.resources;
    }

    /**
     * 轉換資源（例如合成高級材料）
     * @param {string} fromResourceId - 源資源ID
     * @param {string} toResourceId - 目標資源ID
     * @param {number} amount - 轉換數量
     * @returns {Object} - 轉換結果 {success, message}
     */
    convertResource(fromResourceId, toResourceId, amount) {
        // 檢查源資源是否足夠
        if (!this.gameState.resources[fromResourceId] || this.gameState.resources[fromResourceId] < amount) {
            return { success: false, message: `資源不足: ${this.resourceTypes[fromResourceId]?.name || fromResourceId}` };
        }
        
        // 檢查目標資源是否存在
        if (!this.resourceTypes[toResourceId]) {
            return { success: false, message: `無效的目標資源: ${toResourceId}` };
        }
        
        // 定義轉換比率（這裡可以根據需求調整）
        const conversionRates = {
            'material_common_to_rare': 5, // 5個普通材料 = 1個稀有材料
            'material_rare_to_epic': 5, // 5個稀有材料 = 1個史詩材料
        };
        
        // 計算轉換比率
        let rate;
        if (fromResourceId === 'material_common' && toResourceId === 'material_rare') {
            rate = conversionRates.material_common_to_rare;
        } else if (fromResourceId === 'material_rare' && toResourceId === 'material_epic') {
            rate = conversionRates.material_rare_to_epic;
        } else {
            return { success: false, message: '不支援的轉換類型' };
        }
        
        // 計算可以獲得的目標資源數量
        const convertedAmount = Math.floor(amount / rate);
        if (convertedAmount <= 0) {
            return { success: false, message: `至少需要 ${rate} 個 ${this.resourceTypes[fromResourceId]?.name || fromResourceId} 才能轉換` };
        }
        
        // 扣除源資源
        this.gameState.useResource(fromResourceId, convertedAmount * rate);
        
        // 添加目標資源
        this.gameState.addResource(toResourceId, convertedAmount);
        
        // 觸發資源轉換事件
        this.gameState.triggerEvent('resourceConverted', { 
            fromResourceId, 
            toResourceId, 
            fromAmount: convertedAmount * rate, 
            toAmount: convertedAmount 
        });
        
        return { 
            success: true, 
            message: `成功將 ${convertedAmount * rate} 個 ${this.resourceTypes[fromResourceId]?.name || fromResourceId} 轉換為 ${convertedAmount} 個 ${this.resourceTypes[toResourceId]?.name || toResourceId}` 
        };
    }
}

// 創建全局資源管理器實例
const resourceManager = new ResourceManager(window.gameState);

// 導出資源管理器實例
window.resourceManager = resourceManager;