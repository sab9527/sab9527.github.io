/**
 * inventory_screen.js
 * 背包介面的邏輯，顯示和管理物品。
 */

class InventoryScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.selectedItem = null;
        this.itemCategories = ['all', 'material', 'exp', 'lightCone', 'relic'];
        this.currentCategory = 'all';
        
        // 初始化元素引用
        this.initElements();
        // 初始化事件監聽
        this.initEventListeners();
    }

    /**
     * 初始化元素引用
     */
    initElements() {
        // 背包畫面元素
        this.elements.inventoryScreen = document.getElementById('inventory-screen');
        this.elements.itemsList = document.getElementById('items-list');
        this.elements.itemDetail = document.getElementById('item-detail');
    }

    /**
     * 初始化事件監聽
     */
    initEventListeners() {
        // 監聽資源變更事件
        this.gameState.addEventListener('resourceChanged', () => {
            this.updateItemsList();
        });
        
        // 監聽物品獲得事件
        this.gameState.addEventListener('resourceDropped', () => {
            this.updateItemsList();
        });
        
        // 監聽光錐變更事件
        this.gameState.addEventListener('lightConeUnlocked', () => {
            this.updateItemsList();
        });
        
        // 監聽遺器變更事件
        this.gameState.addEventListener('relicUnlocked', () => {
            this.updateItemsList();
        });
        
        // 監聽畫面切換事件
        this.gameState.addEventListener('screenChanged', (data) => {
            if (data.screen === 'inventory') {
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
     * 初始化背包畫面
     */
    initialize() {
        // 創建分類標籤
        this.createCategoryTabs();
        
        // 更新物品列表
        this.updateItemsList();
        
        // 清空物品詳細資訊
        this.elements.itemDetail.innerHTML = '<div class="item-detail-placeholder">選擇一個物品查看詳細資訊</div>';
    }

    /**
     * 創建分類標籤
     */
    createCategoryTabs() {
        // 檢查是否已經創建
        if (document.querySelector('.inventory-categories')) {
            return;
        }
        
        // 創建分類標籤容器
        const categoriesElement = document.createElement('div');
        categoriesElement.className = 'inventory-categories';
        
        // 創建分類標籤
        this.itemCategories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-tab';
            if (category === this.currentCategory) {
                categoryElement.classList.add('active');
            }
            
            // 設定分類名稱
            let categoryName;
            switch (category) {
                case 'all':
                    categoryName = '全部';
                    break;
                case 'material':
                    categoryName = '材料';
                    break;
                case 'exp':
                    categoryName = '經驗';
                    break;
                case 'lightCone':
                    categoryName = '光錐';
                    break;
                case 'relic':
                    categoryName = '遺器';
                    break;
                default:
                    categoryName = category;
            }
            
            categoryElement.textContent = categoryName;
            
            // 點擊分類標籤切換分類
            categoryElement.addEventListener('click', () => {
                this.currentCategory = category;
                
                // 更新分類標籤選中狀態
                document.querySelectorAll('.category-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                categoryElement.classList.add('active');
                
                // 更新物品列表
                this.updateItemsList();
            });
            
            categoriesElement.appendChild(categoryElement);
        });
        
        // 插入到物品列表前
        this.elements.inventoryScreen.insertBefore(categoriesElement, this.elements.itemsList);
    }

    /**
     * 更新物品列表
     */
    updateItemsList() {
        // 清空物品列表
        this.elements.itemsList.innerHTML = '';
        
        // 獲取資源類型資訊
        const resourceTypes = window.resourceManager.getAllResourceTypes();
        
        // 獲取玩家資源
        const playerResources = this.gameState.resources;
        
        // 顯示資源物品
        for (const [resourceId, amount] of Object.entries(playerResources)) {
            // 跳過數量為0的資源
            if (amount <= 0) {
                continue;
            }
            
            // 獲取資源資訊
            const resourceInfo = resourceTypes[resourceId];
            if (!resourceInfo) {
                continue;
            }
            
            // 根據當前分類過濾
            if (this.currentCategory !== 'all' && resourceInfo.category !== this.currentCategory) {
                continue;
            }
            
            // 創建物品元素
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.setAttribute('data-item-id', resourceId);
            itemElement.setAttribute('data-item-type', 'resource');
            
            // 設定物品圖示和數量
            itemElement.innerHTML = `
                <div class="item-icon">
                    <img src="assets/images/items/${resourceInfo.icon || 'default.png'}" alt="${resourceInfo.name}" onerror="this.src='assets/images/items/default.png'">
                </div>
                <div class="item-count">${amount}</div>
            `;
            
            // 點擊物品顯示詳細資訊
            itemElement.addEventListener('click', () => {
                // 更新物品選中狀態
                document.querySelectorAll('.item').forEach(item => {
                    item.classList.remove('active');
                });
                itemElement.classList.add('active');
                
                // 顯示物品詳細資訊
                this.selectedItem = {
                    id: resourceId,
                    type: 'resource',
                    info: resourceInfo,
                    amount: amount
                };
                this.showItemDetail(this.selectedItem);
            });
            
            this.elements.itemsList.appendChild(itemElement);
        }
        
        // 顯示光錐
        if (this.currentCategory === 'all' || this.currentCategory === 'lightCone') {
            this.gameState.lightCones.forEach(lightCone => {
                // 創建物品元素
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.setAttribute('data-item-id', lightCone.id);
                itemElement.setAttribute('data-item-type', 'lightCone');
                
                // 如果光錐已裝備，添加裝備樣式
                if (lightCone.equippedBy) {
                    itemElement.classList.add('equipped');
                }
                
                // 設定物品圖示和等級
                itemElement.innerHTML = `
                    <div class="item-icon">
                        <img src="assets/images/items/${lightCone.id}.png" alt="${lightCone.name}" onerror="this.src='assets/images/items/default.png'">
                    </div>
                    <div class="item-level">Lv.${lightCone.level}</div>
                `;
                
                // 點擊物品顯示詳細資訊
                itemElement.addEventListener('click', () => {
                    // 更新物品選中狀態
                    document.querySelectorAll('.item').forEach(item => {
                        item.classList.remove('active');
                    });
                    itemElement.classList.add('active');
                    
                    // 顯示物品詳細資訊
                    this.selectedItem = {
                        id: lightCone.id,
                        type: 'lightCone',
                        info: lightCone
                    };
                    this.showItemDetail(this.selectedItem);
                });
                
                this.elements.itemsList.appendChild(itemElement);
            });
        }
        
        // 顯示遺器
        if (this.currentCategory === 'all' || this.currentCategory === 'relic') {
            this.gameState.relics.forEach(relic => {
                // 創建物品元素
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.setAttribute('data-item-id', relic.id);
                itemElement.setAttribute('data-item-type', 'relic');
                
                // 如果遺器已裝備，添加裝備樣式
                if (relic.equippedBy) {
                    itemElement.classList.add('equipped');
                }
                
                // 設定物品圖示和等級
                itemElement.innerHTML = `
                    <div class="item-icon">
                        <img src="assets/images/items/${relic.id}.png" alt="${relic.name}" onerror="this.src='assets/images/items/default.png'">
                    </div>
                    <div class="item-level">Lv.${relic.level}</div>
                `;
                
                // 點擊物品顯示詳細資訊
                itemElement.addEventListener('click', () => {
                    // 更新物品選中狀態
                    document.querySelectorAll('.item').forEach(item => {
                        item.classList.remove('active');
                    });
                    itemElement.classList.add('active');
                    
                    // 顯示物品詳細資訊
                    this.selectedItem = {
                        id: relic.id,
                        type: 'relic',
                        info: relic
                    };
                    this.showItemDetail(this.selectedItem);
                });
                
                this.elements.itemsList.appendChild(itemElement);
            });
        }
        
        // 如果沒有物品，顯示提示
        if (this.elements.itemsList.children.length === 0) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'items-empty';
            emptyElement.textContent = '沒有物品！';
            this.elements.itemsList.appendChild(emptyElement);
        }
    }

    /**
     * 顯示物品詳細資訊
     * @param {Object} item - 物品資料
     */
    showItemDetail(item) {
        // 清空物品詳細資訊
        this.elements.itemDetail.innerHTML = '';
        
        // 創建物品詳細資訊元素
        const detailElement = document.createElement('div');
        detailElement.className = 'item-detail-content';
        
        // 根據物品類型顯示不同的詳細資訊
        switch (item.type) {
            case 'resource':
                this.showResourceDetail(detailElement, item);
                break;
            case 'lightCone':
                this.showLightConeDetail(detailElement, item);
                break;
            case 'relic':
                this.showRelicDetail(detailElement, item);
                break;
            default:
                detailElement.textContent = '未知物品類型';
        }
        
        this.elements.itemDetail.appendChild(detailElement);
    }

    /**
     * 顯示資源詳細資訊
     * @param {HTMLElement} detailElement - 詳細資訊元素
     * @param {Object} item - 物品資料
     */
    showResourceDetail(detailElement, item) {
        // 創建資源詳細資訊
        detailElement.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon">
                    <img src="assets/images/items/${item.info.icon || 'default.png'}" alt="${item.info.name}" onerror="this.src='assets/images/items/default.png'">
                </div>
                <div class="detail-info">
                    <div class="detail-name">${item.info.name}</div>
                    <div class="detail-category">${this.getCategoryName(item.info.category)}</div>
                    <div class="detail-amount">數量: ${item.amount}</div>
                </div>
            </div>
            <div class="detail-description">${item.info.description || '無描述'}</div>
        `;
        
        // 如果是材料，添加轉換按鈕
        if (item.info.category === 'material') {
            const actionsElement = document.createElement('div');
            actionsElement.className = 'detail-actions';
            
            // 根據材料稀有度添加不同的轉換按鈕
            if (item.id === 'material_common') {
                actionsElement.innerHTML = `
                    <button class="btn btn-convert" data-from="material_common" data-to="material_rare">轉換為稀有材料</button>
                `;
            } else if (item.id === 'material_rare') {
                actionsElement.innerHTML = `
                    <button class="btn btn-convert" data-from="material_rare" data-to="material_epic">轉換為史詩材料</button>
                `;
            }
            
            detailElement.appendChild(actionsElement);
            
            // 添加轉換按鈕事件監聽
            const convertButtons = actionsElement.querySelectorAll('.btn-convert');
            convertButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const fromResourceId = button.getAttribute('data-from');
                    const toResourceId = button.getAttribute('data-to');
                    this.convertResource(fromResourceId, toResourceId);
                });
            });
        }
    }

    /**
     * 顯示光錐詳細資訊
     * @param {HTMLElement} detailElement - 詳細資訊元素
     * @param {Object} item - 物品資料
     */
    showLightConeDetail(detailElement, item) {
        // 獲取光錐資訊
        const lightCone = item.info;
        
        // 檢查光錐是否已裝備
        let equippedByHtml = '';
        if (lightCone.equippedBy) {
            const character = this.gameState.characters.find(c => c.id === lightCone.equippedBy);
            if (character) {
                equippedByHtml = `
                    <div class="detail-equipped">
                        <span>裝備中: </span>
                        <span class="equipped-character">${character.name}</span>
                    </div>
                `;
            }
        }
        
        // 計算經驗值進度
        const expRequired = window.progressionManager.expRequirements.lightCone[lightCone.level] || 1000;
        const expPercent = Math.min(100, (lightCone.exp / expRequired) * 100);
        
        // 創建光錐詳細資訊
        detailElement.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon">
                    <img src="assets/images/items/${lightCone.id}.png" alt="${lightCone.name}" onerror="this.src='assets/images/items/default.png'">
                </div>
                <div class="detail-info">
                    <div class="detail-name">${lightCone.name}</div>
                    <div class="detail-rarity">${'★'.repeat(lightCone.rarity)}</div>
                    <div class="detail-path">命途: ${lightCone.path}</div>
                    <div class="detail-level">Lv.${lightCone.level}</div>
                    <div class="detail-exp">
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expPercent}%"></div>
                        </div>
                        <div class="exp-text">${lightCone.exp} / ${expRequired}</div>
                    </div>
                    ${equippedByHtml}
                </div>
            </div>
            <div class="detail-stats">
                <div class="detail-section-title">屬性</div>
                ${lightCone.stats ? Object.entries(lightCone.stats).map(([statName, value]) => `
                    <div class="detail-stat">
                        <span class="stat-name">${this.getStatName(statName)}</span>
                        <span class="stat-value">+${value}</span>
                    </div>
                `).join('') : '<div class="detail-stat">無屬性加成</div>'}
            </div>
            <div class="detail-description">
                <div class="detail-section-title">效果</div>
                <div class="detail-effect">${lightCone.effect || '無特殊效果'}</div>
            </div>
        `;
        
        // 添加操作按鈕
        const actionsElement = document.createElement('div');
        actionsElement.className = 'detail-actions';
        
        // 如果有經驗值，添加升級按鈕
        if (this.gameState.resources.exp && this.gameState.resources.exp > 0) {
            actionsElement.innerHTML += `
                <button class="btn btn-upgrade" data-item-id="${lightCone.id}">升級</button>
            `;
        }
        
        // 如果未裝備，添加裝備按鈕
        if (!lightCone.equippedBy) {
            actionsElement.innerHTML += `
                <button class="btn btn-equip" data-item-id="${lightCone.id}">裝備</button>
            `;
        } else {
            // 如果已裝備，添加卸下按鈕
            actionsElement.innerHTML += `
                <button class="btn btn-unequip" data-item-id="${lightCone.id}">卸下</button>
            `;
        }
        
        detailElement.appendChild(actionsElement);
        
        // 添加按鈕事件監聽
        const upgradeButton = actionsElement.querySelector('.btn-upgrade');
        if (upgradeButton) {
            upgradeButton.addEventListener('click', () => {
                this.upgradeLightCone(lightCone.id);
            });
        }
        
        const equipButton = actionsElement.querySelector('.btn-equip');
        if (equipButton) {
            equipButton.addEventListener('click', () => {
                this.showEquipLightConeDialog(lightCone.id);
            });
        }
        
        const unequipButton = actionsElement.querySelector('.btn-unequip');
        if (unequipButton) {
            unequipButton.addEventListener('click', () => {
                this.unequipLightCone(lightCone.id);
            });
        }
    }

    /**
     * 顯示遺器詳細資訊
     * @param {HTMLElement} detailElement - 詳細資訊元素
     * @param {Object} item - 物品資料
     */
    showRelicDetail(detailElement, item) {
        // 獲取遺器資訊
        const relic = item.info;
        
        // 檢查遺器是否已裝備
        let equippedByHtml = '';
        if (relic.equippedBy) {
            const character = this.gameState.characters.find(c => c.id === relic.equippedBy);
            if (character) {
                equippedByHtml = `
                    <div class="detail-equipped">
                        <span>裝備中: </span>
                        <span class="equipped-character">${character.name}</span>
                    </div>
                `;
            }
        }
        
        // 計算經驗值進度
        const expRequired = window.progressionManager.expRequirements.relic[relic.level] || 1000;
        const expPercent = Math.min(100, (relic.exp / expRequired) * 100);
        
        // 創建遺器詳細資訊
        detailElement.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon">
                    <img src="assets/images/items/${relic.id}.png" alt="${relic.name}" onerror="this.src='assets/images/items/default.png'">
                </div>
                <div class="detail-info">
                    <div class="detail-name">${relic.name}</div>
                    <div class="detail-rarity">${'★'.repeat(relic.rarity)}</div>
                    <div class="detail-type">類型: ${relic.type}</div>
                    <div class="detail-level">Lv.${relic.level}</div>
                    <div class="detail-exp">
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expPercent}%"></div>
                        </div>
                        <div class="exp-text">${relic.exp} / ${expRequired}</div>
                    </div>
                    ${equippedByHtml}
                </div>
            </div>
            <div class="detail-stats">
                <div class="detail-section-title">屬性</div>
                ${relic.stats ? Object.entries(relic.stats).map(([statName, value]) => `
                    <div class="detail-stat">
                        <span class="stat-name">${this.getStatName(statName)}</span>
                        <span class="stat-value">+${value}</span>
                    </div>
                `).join('') : '<div class="detail-stat">無屬性加成</div>'}
            </div>
            <div class="detail-description">
                <div class="detail-section-title">效果</div>
                <div class="detail-effect">${relic.effect || '無特殊效果'}</div>
            </div>
        `;
        
        // 添加操作按鈕
        const actionsElement = document.createElement('div');
        actionsElement.className = 'detail-actions';
        
        // 如果有經驗值，添加升級按鈕
        if (this.gameState.resources.exp && this.gameState.resources.exp > 0) {
            actionsElement.innerHTML += `
                <button class="btn btn-upgrade" data-item-id="${relic.id}">升級</button>
            `;
        }
        
        // 如果未裝備，添加裝備按鈕
        if (!relic.equippedBy) {
            actionsElement.innerHTML += `
                <button class="btn btn-equip" data-item-id="${relic.id}">裝備</button>
            `;
        } else {
            // 如果已裝備，添加卸下按鈕
            actionsElement.innerHTML += `
                <button class="btn btn-unequip" data-item-id="${relic.id}">卸下</button>
            `;
        }
        
        detailElement.appendChild(actionsElement);
        
        // 添加按鈕事件監聽
        const upgradeButton = actionsElement.querySelector('.btn-upgrade');
        if (upgradeButton) {
            upgradeButton.addEventListener('click', () => {
                this.upgradeRelic(relic.id);
            });
        }
        
        const equipButton = actionsElement.querySelector('.btn-equip');
        if (equipButton) {
            equipButton.addEventListener('click', () => {
                this.showEquipRelicDialog(relic.id);
            });
        }
        
        const unequipButton = actionsElement.querySelector('.btn-unequip');
        if (unequipButton) {
            unequipButton.addEventListener('click', () => {
                this.unequipRelic(relic.id);
            });
        }
    }

    /**
     * 轉換資源
     * @param {string} fromResourceId - 源資源ID
     * @param {string} toResourceId - 目標資源ID
     */
    convertResource(fromResourceId, toResourceId) {
        // 獲取資源資訊
        const fromResourceInfo = window.resourceManager.getResourceInfo(fromResourceId);
        const toResourceInfo = window.resourceManager.getResourceInfo(toResourceId);
        
        // 獲取資源數量
        const fromAmount = this.gameState.resources[fromResourceId] || 0;
        
        // 詢問轉換數量
        const amount = parseInt(prompt(`請輸入要轉換的${fromResourceInfo.name}數量 (最多 ${fromAmount}):`));
        
        // 檢查輸入是否有效
        if (isNaN(amount) || amount <= 0) {
            alert('請輸入有效的數量！');
            return;
        }
        
        // 檢查數量是否足夠
        if (amount > fromAmount) {
            alert(`${fromResourceInfo.name}數量不足！`);
            return;
        }
        
        // 執行轉換
        const result = window.resourceManager.convertResource(fromResourceId, toResourceId, amount);
        
        // 顯示轉換結果
        if (result.success) {
            alert(result.message);
            
            // 更新物品列表
            this.updateItemsList();
            
            // 如果當前選中的是被轉換的資源，更新詳細資訊
            if (this.selectedItem && this.selectedItem.type === 'resource' && this.selectedItem.id === fromResourceId) {
                this.selectedItem.amount = this.gameState.resources[fromResourceId] || 0;
                this.showItemDetail(this.selectedItem);
            }
        } else {
            alert(`轉換失敗：${result.message}`);
        }
    }

    /**
     * 升級光錐
     * @param {string} lightConeId - 光錐ID
     */
    upgradeLightCone(lightConeId) {
        // 檢查是否有足夠的經驗值
        if (!this.gameState.resources.exp || this.gameState.resources.exp <= 0) {
            alert('經驗值不足！');
            return;
        }
        
        // 詢問使用多少經驗值
        const maxExp = this.gameState.resources.exp;
        const expAmount = parseInt(prompt(`請輸入要使用的經驗值數量 (最多 ${maxExp}):`));
        
        // 檢查輸入是否有效
        if (isNaN(expAmount) || expAmount <= 0) {
            alert('請輸入有效的數量！');
            return;
        }
        
        // 檢查數量是否足夠
        if (expAmount > maxExp) {
            alert('經驗值不足！');
            return;
        }
        
        // 消耗經驗值
        this.gameState.useResource('exp', expAmount);
        
        // 升級光錐
        const result = window.progressionManager.upgradeLightCone(lightConeId, expAmount);
        
        // 顯示升級結果
        if (result.leveledUp) {
            alert(`光錐升級到 Lv.${result.newLevel}！`);
        } else {
            alert(`光錐獲得了 ${expAmount} 點經驗值！`);
        }
        
        // 更新物品列表和詳細資訊
        this.updateItemsList();
        if (this.selectedItem && this.selectedItem.type === 'lightCone' && this.selectedItem.id === lightConeId) {
            this.selectedItem.info = this.gameState.lightCones.find(lc => lc.id === lightConeId);
            this.showItemDetail(this.selectedItem);
        }
    }

    /**
     * 升級遺器
     * @param {string} relicId - 遺器ID
     */
    upgradeRelic(relicId) {
        // 檢查是否有足夠的經驗值
        if (!this.gameState.resources.exp || this.gameState.resources.exp <= 0) {
            alert('經驗值不足！');
            return;
        }
        
        // 詢問使用多少經驗值
        const maxExp = this.gameState.resources.exp;
        const expAmount = parseInt(prompt(`請輸入要使用的經驗值數量 (最多 ${maxExp}):`));
        
        // 檢查輸入是否有效
        if (isNaN(expAmount) || expAmount <= 0) {
            alert('請輸入有效的數量！');
            return;
        }
        
        // 檢查數量是否足夠
        if (expAmount > maxExp) {
            alert('經驗值不足！');
            return;
        }
        
        // 消耗經驗值
        this.gameState.useResource('exp', expAmount);
        
        // 升級遺器
        const result = window.progressionManager.upgradeRelic(relicId, expAmount);
        
        // 顯示升級結果
        if (result.leveledUp) {
            alert(`遺器升級到 Lv.${result.newLevel}！`);
        } else {
            alert(`遺器獲得了 ${expAmount} 點經驗值！`);
        }
        
        // 更新物品列表和詳細資訊
        this.updateItemsList();
        if (this.selectedItem && this.selectedItem.type === 'relic' && this.selectedItem.id === relicId) {
            this.selectedItem.info = this.gameState.relics.find(r => r.id === relicId);
            this.showItemDetail(this.selectedItem);
        }
    }

    /**
     * 顯示裝備光錐對話框
     * @param {string} lightConeId - 光錐ID
     */
    showEquipLightConeDialog(lightConeId) {
        // 獲取光錐資訊
        const lightCone = this.gameState.lightCones.find(lc => lc.id === lightConeId);
        if (!lightCone) {
            return;
        }
        
        // 獲取可裝備的角色（命途匹配）
        const compatibleCharacters = this.gameState.characters.filter(character => {
            return character.path === lightCone.path;
        });
        
        if (compatibleCharacters.length === 0) {
            alert('沒有可裝備此光錐的角色！');
            return;
        }
        
        // 創建角色選擇列表
        let characterOptions = '';
        compatibleCharacters.forEach(character => {
            characterOptions += `<option value="${character.id}">${character.name} (Lv.${character.level})</option>`;
        });
        
        // 創建對話框
        const dialogHtml = `
            <div class="modal" id="equip-light-cone-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">選擇角色裝備 ${lightCone.name}</div>
                        <div class="modal-close" id="close-dialog">×</div>
                    </div>
                    <div class="modal-body">
                        <select id="character-select">
                            ${characterOptions}
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="confirm-equip">確認</button>
                        <button class="btn" id="cancel-equip">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加對話框到頁面
        const dialogElement = document.createElement('div');
        dialogElement.innerHTML = dialogHtml;
        document.body.appendChild(dialogElement.firstElementChild);
        
        // 顯示對話框
        const dialog = document.getElementById('equip-light-cone-dialog');
        dialog.style.display = 'block';
        
        // 添加事件監聽
        document.getElementById('close-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('cancel-equip').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('confirm-equip').addEventListener('click', () => {
            const characterId = document.getElementById('character-select').value;
            this.equipLightCone(characterId, lightConeId);
            dialog.remove();
        });
    }

    /**
     * 裝備光錐
     * @param {string} characterId - 角色ID
     * @param {string} lightConeId - 光錐ID
     */
    equipLightCone(characterId, lightConeId) {
        // 裝備光錐
        const result = window.progressionManager.equipLightCone(characterId, lightConeId);
        
        // 顯示裝備結果
        if (result.success) {
            alert(result.message);
            
            // 更新物品列表和詳細資訊
            this.updateItemsList();
            if (this.selectedItem && this.selectedItem.type === 'lightCone' && this.selectedItem.id === lightConeId) {
                this.selectedItem.info = this.gameState.lightCones.find(lc => lc.id === lightConeId);
                this.showItemDetail(this.selectedItem);
            }
        } else {
            alert(`裝備失敗：${result.message}`);
        }
    }

    /**
     * 卸下光錐
     * @param {string} lightConeId - 光錐ID
     */
    unequipLightCone(lightConeId) {
        // 獲取光錐資訊
        const lightCone = this.gameState.lightCones.find(lc => lc.id === lightConeId);
        if (!lightCone || !lightCone.equippedBy) {
            return;
        }
        
        // 獲取裝備角色
        const character = this.gameState.characters.find(c => c.id === lightCone.equippedBy);
        if (!character) {
            return;
        }
        
        // 卸下光錐
        character.equippedLightCone = null;
        lightCone.equippedBy = null;
        
        // 觸發裝備變更事件
        this.gameState.triggerEvent('lightConeEquipped', { character, lightCone: null });
        
        // 顯示卸下結果
        alert(`已從 ${character.name} 卸下 ${lightCone.name}`);
        
        // 更新物品列表和詳細資訊
        this.updateItemsList();
        if (this.selectedItem && this.selectedItem.type === 'lightCone' && this.selectedItem.id === lightConeId) {
            this.selectedItem.info = lightCone;
            this.showItemDetail(this.selectedItem);
        }
    }

    /**
     * 顯示裝備遺器對話框
     * @param {string} relicId - 遺器ID
     */
    showEquipRelicDialog(relicId) {
        // 獲取遺器資訊
        const relic = this.gameState.relics.find(r => r.id === relicId);
        if (!relic) {
            return;
        }
        
        // 獲取可裝備的角色
        const characters = this.gameState.characters;
        
        if (characters.length === 0) {
            alert('沒有可裝備此遺器的角色！');
            return;
        }
        
        // 創建角色選擇列表
        let characterOptions = '';
        characters.forEach(character => {
            characterOptions += `<option value="${character.id}">${character.name} (Lv.${character.level})</option>`;
        });
        
        // 創建對話框
        const dialogHtml = `
            <div class="modal" id="equip-relic-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">選擇角色裝備 ${relic.name}</div>
                        <div class="modal-close" id="close-dialog">×</div>
                    </div>
                    <div class="modal-body">
                        <select id="character-select">
                            ${characterOptions}
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="confirm-equip">確認</button>
                        <button class="btn" id="cancel-equip">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加對話框到頁面
        const dialogElement = document.createElement('div');
        dialogElement.innerHTML = dialogHtml;
        document.body.appendChild(dialogElement.firstElementChild);
        
        // 顯示對話框
        const dialog = document.getElementById('equip-relic-dialog');
        dialog.style.display = 'block';
        
        // 添加事件監聽
        document.getElementById('close-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('cancel-equip').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('confirm-equip').addEventListener('click', () => {
            const characterId = document.getElementById('character-select').value;
            this.equipRelic(characterId, relicId);
            dialog.remove();
        });
    }

    /**
     * 裝備遺器
     * @param {string} characterId - 角色ID
     * @param {string} relicId - 遺器ID
     */
    equipRelic(characterId, relicId) {
        // 裝備遺器
        const result = window.progressionManager.equipRelic(characterId, relicId);
        
        // 顯示裝備結果
        if (result.success) {
            alert(result.message);
            
            // 更新物品列表和詳細資訊
            this.updateItemsList();
            if (this.selectedItem && this.selectedItem.type === 'relic' && this.selectedItem.id === relicId) {
                this.selectedItem.info = this.gameState.relics.find(r => r.id === relicId);
                this.showItemDetail(this.selectedItem);
            }
        } else {
            alert(`裝備失敗：${result.message}`);
        }
    }

    /**
     * 卸下遺器
     * @param {string} relicId - 遺器ID
     */
    unequipRelic(relicId) {
        // 獲取遺器資訊
        const relic = this.gameState.relics.find(r => r.id === relicId);
        if (!relic || !relic.equippedBy) {
            return;
        }
        
        // 獲取裝備角色
        const character = this.gameState.characters.find(c => c.id === relic.equippedBy);
        if (!character) {
            return;
        }
        
        // 卸下遺器
        character.equippedRelics = character.equippedRelics.filter(id => id !== relicId);
        relic.equippedBy = null;
        
        // 觸發裝備變更事件
        this.gameState.triggerEvent('relicEquipped', { character, relic: null });
        
        // 顯示卸下結果
        alert(`已從 ${character.name} 卸下 ${relic.name}`);
        
        // 更新物品列表和詳細資訊
        this.updateItemsList();
        if (this.selectedItem && this.selectedItem.type === 'relic' && this.selectedItem.id === relicId) {
            this.selectedItem.info = relic;
            this.showItemDetail(this.selectedItem);
        }
    }

    /**
     * 獲取分類名稱
     * @param {string} category - 分類ID
     * @returns {string} - 分類名稱
     */
    getCategoryName(category) {
        switch (category) {
            case 'material':
                return '材料';
            case 'exp':
                return '經驗';
            case 'currency':
                return '貨幣';
            case 'lightCone':
                return '光錐';
            case 'relic':
                return '遺器';
            default:
                return category;
        }
    }

    /**
     * 獲取屬性名稱
     * @param {string} statName - 屬性ID
     * @returns {string} - 屬性名稱
     */
    getStatName(statName) {
        switch (statName) {
            case 'hp':
                return '生命值';
            case 'attack':
                return '攻擊力';
            case 'defense':
                return '防禦力';
            case 'speed':
                return '速度';
            default:
                return statName;
        }
    }
}

// 創建全局背包畫面實例
const inventoryScreen = new InventoryScreen(window.gameState);

// 導出背包畫面實例
window.inventoryScreen = inventoryScreen;