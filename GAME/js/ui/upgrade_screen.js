/**
 * upgrade_screen.js
 * 處理角色和技能升級的界面邏輯。
 */

class UpgradeScreen {
    constructor(gameState) {
        this.gameState = gameState;
        this.container = document.getElementById('upgrade-screen');
        this.selectedCharacter = null;
        this.selectedSkill = null;
        
        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="upgrade-panel">
                <div class="character-list">
                    <h2>角色列表</h2>
                    <div id="character-grid" class="grid-container"></div>
                </div>
                <div class="upgrade-details">
                    <div class="character-stats">
                        <h3>角色屬性</h3>
                        <div id="stats-container"></div>
                    </div>
                    <div class="skill-list">
                        <h3>技能列表</h3>
                        <div id="skills-container"></div>
                    </div>
                    <div class="upgrade-resources">
                        <h3>升級材料</h3>
                        <div id="resources-container"></div>
                    </div>
                </div>
            </div>
        `;

        this.registerEventListeners();
        this.updateCharacterList();
    }

    updateCharacterList() {
        const characterGrid = document.getElementById('character-grid');
        const characters = this.gameState.getCharacters();

        characterGrid.innerHTML = characters.map(char => `
            <div class="character-card" data-id="${char.id}">
                <div class="character-avatar">
                    <img src="${char.avatar}" alt="${char.name}">
                    <span class="level">Lv.${char.level}</span>
                </div>
                <div class="character-info">
                    <h4>${char.name}</h4>
                    <p>等級上限：${char.maxLevel}</p>
                </div>
            </div>
        `).join('');
    }

    updateCharacterStats() {
        if (!this.selectedCharacter) return;

        const statsContainer = document.getElementById('stats-container');
        const char = this.selectedCharacter;
        const nextLevel = char.level + 1;
        const canUpgrade = this.checkUpgradeResources(char);

        statsContainer.innerHTML = `
            <div class="stat-row">
                <span>當前等級</span>
                <span>${char.level} → ${nextLevel}</span>
            </div>
            <div class="stat-row">
                <span>生命值</span>
                <span>${char.hp} → ${this.calculateNextLevelStat(char.hp, nextLevel)}</span>
            </div>
            <div class="stat-row">
                <span>攻擊力</span>
                <span>${char.attack} → ${this.calculateNextLevelStat(char.attack, nextLevel)}</span>
            </div>
            <div class="stat-row">
                <span>防禦力</span>
                <span>${char.defense} → ${this.calculateNextLevelStat(char.defense, nextLevel)}</span>
            </div>
            <button class="upgrade-btn" ${canUpgrade ? '' : 'disabled'}>升級</button>
        `;
    }

    updateSkillList() {
        if (!this.selectedCharacter) return;

        const skillsContainer = document.getElementById('skills-container');
        const skills = this.selectedCharacter.skills;

        skillsContainer.innerHTML = skills.map(skill => `
            <div class="skill-item" data-id="${skill.id}">
                <div class="skill-icon">
                    <img src="${skill.icon}" alt="${skill.name}">
                    <span class="level">Lv.${skill.level}</span>
                </div>
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <p>${skill.description}</p>
                    <div class="skill-stats">
                        <span>威力：${skill.power}</span>
                        <span>冷卻：${skill.cooldown}回合</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateResourceList() {
        const resourcesContainer = document.getElementById('resources-container');
        const requiredResources = this.getRequiredResources();

        resourcesContainer.innerHTML = requiredResources.map(resource => `
            <div class="resource-item ${resource.sufficient ? 'sufficient' : 'insufficient'}">
                <img src="${resource.icon}" alt="${resource.name}">
                <span class="resource-name">${resource.name}</span>
                <span class="resource-amount">${resource.current}/${resource.required}</span>
            </div>
        `).join('');
    }

    getRequiredResources() {
        if (!this.selectedCharacter) return [];

        const char = this.selectedCharacter;
        const resources = this.gameState.getResources();
        
        return [
            {
                id: '5001',
                name: '機械零件',
                icon: 'icons/mechanical_parts.png',
                current: resources['5001'] || 0,
                required: Math.ceil(char.level * 1.5),
                sufficient: (resources['5001'] || 0) >= Math.ceil(char.level * 1.5)
            },
            {
                id: 'credits',
                name: '信用點',
                icon: 'icons/credits.png',
                current: resources['credits'] || 0,
                required: char.level * 1000,
                sufficient: (resources['credits'] || 0) >= char.level * 1000
            }
        ];
    }

    checkUpgradeResources(character) {
        const requiredResources = this.getRequiredResources();
        return requiredResources.every(resource => resource.sufficient);
    }

    calculateNextLevelStat(baseStat, nextLevel) {
        return Math.floor(baseStat * (1 + nextLevel * 0.1));
    }

    registerEventListeners() {
        // 角色選擇
        document.getElementById('character-grid').addEventListener('click', (e) => {
            const charCard = e.target.closest('.character-card');
            if (charCard) {
                const charId = charCard.dataset.id;
                this.selectedCharacter = this.gameState.getCharacter(charId);
                this.updateCharacterStats();
                this.updateSkillList();
                this.updateResourceList();
            }
        });

        // 技能選擇
        document.getElementById('skills-container').addEventListener('click', (e) => {
            const skillItem = e.target.closest('.skill-item');
            if (skillItem) {
                const skillId = skillItem.dataset.id;
                this.selectedSkill = this.selectedCharacter.skills.find(s => s.id === skillId);
                this.updateResourceList();
            }
        });

        // 升級按鈕
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-btn') && !e.target.disabled) {
                this.upgradeCharacter();
            }
        });
    }

    upgradeCharacter() {
        if (!this.selectedCharacter || !this.checkUpgradeResources(this.selectedCharacter)) return;

        const success = this.gameState.upgradeCharacter(this.selectedCharacter.id);
        if (success) {
            this.updateCharacterStats();
            this.updateResourceList();
            this.gameState.emit('characterUpgraded', this.selectedCharacter);
        }
    }

    show() {
        this.container.style.display = 'block';
        this.updateCharacterList();
    }

    hide() {
        this.container.style.display = 'none';
    }
}