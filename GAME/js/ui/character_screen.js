/**
 * character_screen.js
 * 角色介面的邏輯，顯示角色列表和詳細資訊。
 */

class CharacterScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.selectedCharacter = null;
        
        // 初始化元素引用
        this.initElements();
        // 初始化事件監聽
        this.initEventListeners();
    }

    /**
     * 初始化元素引用
     */
    initElements() {
        // 角色畫面元素
        this.elements.characterScreen = document.getElementById('character-screen');
        this.elements.characterList = document.getElementById('character-list');
        this.elements.characterDetail = document.getElementById('character-detail');
    }

    /**
     * 初始化事件監聽
     */
    initEventListeners() {
        // 監聽角色變更事件
        this.gameState.addEventListener('characterLevelUp', () => {
            this.updateCharacterList();
            if (this.selectedCharacter) {
                this.showCharacterDetail(this.selectedCharacter);
            }
        });
        
        this.gameState.addEventListener('skillLevelUp', () => {
            if (this.selectedCharacter) {
                this.showCharacterDetail(this.selectedCharacter);
            }
        });
        
        this.gameState.addEventListener('characterUnlocked', () => {
            this.updateCharacterList();
        });
        
        this.gameState.addEventListener('lightConeEquipped', () => {
            if (this.selectedCharacter) {
                this.showCharacterDetail(this.selectedCharacter);
            }
        });
        
        this.gameState.addEventListener('relicEquipped', () => {
            if (this.selectedCharacter) {
                this.showCharacterDetail(this.selectedCharacter);
            }
        });
        
        // 監聽畫面切換事件
        this.gameState.addEventListener('screenChanged', (data) => {
            if (data.screen === 'characters') {
                this.updateCharacterList();
            }
        });
        
        // 監聽遊戲初始化完成事件
        this.gameState.addEventListener('gameInitialized', () => {
            this.updateCharacterList();
        });
        
        // 監聽遊戲載入事件
        this.gameState.addEventListener('gameLoaded', () => {
            this.updateCharacterList();
        });
    }

    /**
     * 更新角色列表
     */
    updateCharacterList() {
        // 清空角色列表
        this.elements.characterList.innerHTML = '';
        
        // 獲取所有角色
        const characters = this.gameState.characters;
        
        // 顯示角色列表
        characters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'character-item';
            
            // 如果是當前選中的角色，添加選中樣式
            if (this.selectedCharacter && character.id === this.selectedCharacter.id) {
                characterElement.classList.add('active');
            }
            
            // 如果角色在當前隊伍中，添加隊伍樣式
            if (this.gameState.activeTeam.some(c => c.id === character.id)) {
                characterElement.classList.add('in-team');
            }
            
            characterElement.innerHTML = `
                <div class="character-icon">
                    <img src="assets/images/characters/${character.id}.png" alt="${character.name}" onerror="this.src='assets/images/characters/default.png'">
                </div>
                <div class="character-info">
                    <div class="character-name">${character.name}</div>
                    <div class="character-level">Lv.${character.level}</div>
                    <div class="character-path">${character.path}</div>
                </div>
            `;
            
            // 點擊角色顯示詳細資訊
            characterElement.addEventListener('click', () => {
                // 更新角色選中狀態
                document.querySelectorAll('.character-item').forEach(el => {
                    el.classList.remove('active');
                });
                characterElement.classList.add('active');
                
                // 顯示角色詳細資訊
                this.selectedCharacter = character;
                this.showCharacterDetail(character);
            });
            
            this.elements.characterList.appendChild(characterElement);
        });
        
        // 如果沒有選中的角色但有角色，選中第一個
        if (!this.selectedCharacter && characters.length > 0) {
            this.selectedCharacter = characters[0];
            this.showCharacterDetail(characters[0]);
            // 選中第一個角色元素
            const firstCharacterElement = this.elements.characterList.querySelector('.character-item');
            if (firstCharacterElement) {
                firstCharacterElement.classList.add('active');
            }
        }
    }

    /**
     * 顯示角色詳細資訊
     * @param {Object} character - 角色資料
     */
    showCharacterDetail(character) {
        // 清空角色詳細資訊
        this.elements.characterDetail.innerHTML = '';
        
        // 創建角色詳細資訊元素
        const detailElement = document.createElement('div');
        detailElement.className = 'character-detail-content';
        
        // 計算角色屬性
        const hp = window.challengeEngine.calculateCharacterStat(character, 'hp');
        const attack = window.challengeEngine.calculateCharacterStat(character, 'attack');
        const defense = window.challengeEngine.calculateCharacterStat(character, 'defense');
        const speed = window.challengeEngine.calculateCharacterStat(character, 'speed');
        
        // 獲取裝備的光錐
        let lightConeHtml = '<div class="detail-section-title">光錐</div><div class="detail-light-cone">未裝備</div>';
        if (character.equippedLightCone) {
            const lightCone = this.gameState.lightCones.find(lc => lc.id === character.equippedLightCone);
            if (lightCone) {
                lightConeHtml = `
                    <div class="detail-section-title">光錐</div>
                    <div class="detail-light-cone">
                        <div class="light-cone-icon">
                            <img src="assets/images/items/${lightCone.id}.png" alt="${lightCone.name}" onerror="this.src='assets/images/items/default.png'">
                        </div>
                        <div class="light-cone-info">
                            <div class="light-cone-name">${lightCone.name}</div>
                            <div class="light-cone-level">Lv.${lightCone.level}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        // 獲取裝備的遺器
        let relicsHtml = '<div class="detail-section-title">遺器</div><div class="detail-relics">未裝備</div>';
        if (character.equippedRelics && character.equippedRelics.length > 0) {
            const relics = character.equippedRelics.map(relicId => {
                return this.gameState.relics.find(r => r.id === relicId);
            }).filter(Boolean);
            
            if (relics.length > 0) {
                relicsHtml = `
                    <div class="detail-section-title">遺器</div>
                    <div class="detail-relics">
                        ${relics.map(relic => `
                            <div class="relic-item">
                                <div class="relic-icon">
                                    <img src="assets/images/items/${relic.id}.png" alt="${relic.name}" onerror="this.src='assets/images/items/default.png'">
                                </div>
                                <div class="relic-info">
                                    <div class="relic-name">${relic.name}</div>
                                    <div class="relic-level">Lv.${relic.level}</div>
                                    <div class="relic-type">${relic.type}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        // 獲取角色技能
        const skillsHtml = `
            <div class="detail-section-title">技能</div>
            <div class="detail-skills">
                ${character.skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-icon">
                            <img src="assets/images/items/${skill.id}.png" alt="${skill.name}" onerror="this.src='assets/images/items/default.png'">
                        </div>
                        <div class="skill-info">
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-level">Lv.${skill.level}</div>
                            <div class="skill-description">${skill.description}</div>
                        </div>
                        <button class="btn btn-upgrade-skill" data-skill-id="${skill.id}">升級</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 計算經驗值進度
        const expRequired = window.progressionManager.expRequirements.character[character.level] || 1000;
        const expPercent = Math.min(100, (character.exp / expRequired) * 100);
        
        // 組合角色詳細資訊
        detailElement.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">
                    <img src="assets/images/characters/${character.id}.png" alt="${character.name}" onerror="this.src='assets/images/characters/default.png'">
                </div>
                <div class="detail-info">
                    <div class="detail-name">${character.name}</div>
                    <div class="detail-level">Lv.${character.level}</div>
                    <div class="detail-path">${character.path}</div>
                    <div class="detail-exp">
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expPercent}%"></div>
                        </div>
                        <div class="exp-text">${character.exp} / ${expRequired}</div>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-upgrade" id="btn-upgrade-character">升級</button>
                    <button class="btn ${this.gameState.activeTeam.some(c => c.id === character.id) ? 'btn-danger' : 'btn-primary'}" id="btn-toggle-team">
                        ${this.gameState.activeTeam.some(c => c.id === character.id) ? '移出隊伍' : '加入隊伍'}
                    </button>
                </div>
            </div>
            
            <div class="detail-stats">
                <div class="stat-item">
                    <div class="stat-label">生命值</div>
                    <div class="stat-value">${hp}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">攻擊力</div>
                    <div class="stat-value">${attack}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">防禦力</div>
                    <div class="stat-value">${defense}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">速度</div>
                    <div class="stat-value">${speed}</div>
                </div>
            </div>
            
            ${lightConeHtml}
            
            ${relicsHtml}
            
            ${skillsHtml}
        `;
        
        this.elements.characterDetail.appendChild(detailElement);
        
        // 添加事件監聽
        this.addDetailEventListeners(character);
    }

    /**
     * 添加詳細資訊的事件監聽
     * @param {Object} character - 角色資料
     */
    addDetailEventListeners(character) {
        // 升級角色按鈕
        const upgradeButton = document.getElementById('btn-upgrade-character');
        if (upgradeButton) {
            upgradeButton.addEventListener('click', () => {
                this.upgradeCharacter(character);
            });
        }
        
        // 切換隊伍按鈕
        const toggleTeamButton = document.getElementById('btn-toggle-team');
        if (toggleTeamButton) {
            toggleTeamButton.addEventListener('click', () => {
                this.toggleTeam(character);
            });
        }
        
        // 升級技能按鈕
        const upgradeSkillButtons = document.querySelectorAll('.btn-upgrade-skill');
        upgradeSkillButtons.forEach(button => {
            button.addEventListener('click', () => {
                const skillId = button.getAttribute('data-skill-id');
                this.upgradeSkill(character, skillId);
            });
        });
    }

    /**
     * 升級角色
     * @param {Object} character - 角色資料
     */
    upgradeCharacter(character) {
        // 檢查是否有足夠的經驗值
        if (!this.gameState.resources.exp || this.gameState.resources.exp <= 0) {
            alert('經驗值不足！');
            return;
        }
        
        // 使用所有可用的經驗值
        const expAmount = this.gameState.resources.exp;
        this.gameState.useResource('exp', expAmount);
        
        // 升級角色
        const result = window.progressionManager.upgradeCharacter(character.id, expAmount);
        
        // 顯示升級結果
        if (result.leveledUp) {
            alert(`${character.name} 升級到 Lv.${result.newLevel}！`);
        } else {
            alert(`${character.name} 獲得了 ${expAmount} 點經驗值！`);
        }
        
        // 更新角色列表和詳細資訊
        this.updateCharacterList();
        this.showCharacterDetail(character);
    }

    /**
     * 升級技能
     * @param {Object} character - 角色資料
     * @param {string} skillId - 技能ID
     */
    upgradeSkill(character, skillId) {
        // 升級技能
        const result = window.progressionManager.upgradeSkill(character.id, skillId);
        
        // 顯示升級結果
        if (result.success) {
            const skill = character.skills.find(s => s.id === skillId);
            alert(`${character.name} 的技能 ${skill.name} 升級到 Lv.${result.newLevel}！`);
        } else {
            alert(`升級失敗：${result.message}`);
        }
        
        // 更新角色詳細資訊
        this.showCharacterDetail(character);
    }

    /**
     * 切換角色是否在隊伍中
     * @param {Object} character - 角色資料
     */
    toggleTeam(character) {
        // 檢查角色是否在隊伍中
        const inTeam = this.gameState.activeTeam.some(c => c.id === character.id);
        
        if (inTeam) {
            // 從隊伍中移除
            this.gameState.activeTeam = this.gameState.activeTeam.filter(c => c.id !== character.id);
        } else {
            // 檢查隊伍是否已滿
            if (this.gameState.activeTeam.length >= 4) {
                alert('隊伍已滿！請先移除一名角色。');
                return;
            }
            
            // 加入隊伍
            this.gameState.activeTeam.push(character);
        }
        
        // 觸發隊伍變更事件
        this.gameState.triggerEvent('teamChanged', this.gameState.activeTeam);
        
        // 更新角色列表和詳細資訊
        this.updateCharacterList();
        this.showCharacterDetail(character);
    }
}

// 創建全局角色畫面實例
const characterScreen = new CharacterScreen(window.gameState);

// 導出角色畫面實例
window.characterScreen = characterScreen;