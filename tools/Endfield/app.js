/**
 * 武器圖鑑網站主程式
 * 依賴: data.js (必須先載入)
 */

// ==================== 工具函數 ====================

function getRarityClass(rarity) {
    const map = { "六星": 6, "五星": 5, "四星": 4, "三星": 3 };
    return `rarity-${map[rarity] || 3}`;
}

function getRarityBadge(rarity) {
    const map = { "六星": "r6", "五星": "r5", "四星": "r4", "三星": "r3" };
    return map[rarity] || "r3";
}

function getImagePath(weaponName) {
    const mappedName = imageNameMap[weaponName] || weaponName;
    return `weapon_images/${encodeURIComponent(mappedName)}.png`;
}

function sortByRarity(list) {
    const order = { "六星": 0, "五星": 1, "四星": 2, "三星": 3 };
    return list.sort((a, b) => order[a.rarity] - order[b.rarity]);
}

// ==================== 武器卡片（含詞條顯示） ====================

function createWeaponCard(weapon, onClick, index = 0) {
    const card = document.createElement('div');
    card.className = `weapon-card ${getRarityClass(weapon.rarity)}`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.05}s`;

    const subStatDisplay = weapon.subStat === "/" ? "-" : weapon.subStat.replace("提升", "");
    const mainStatDisplay = weapon.mainStat.replace("提升", "");
    card.innerHTML = `
        <img class="weapon-image" src="${getImagePath(weapon.name)}" alt="${weapon.name}" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22 fill=%22%23444%22><rect width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22>🗡️</text></svg>'">
        <div class="weapon-info">
            <div class="weapon-name">${weapon.name}</div>
            <div class="weapon-meta">
                <span class="weapon-rarity ${getRarityBadge(weapon.rarity)}">${weapon.rarity}</span>
                ${weapon.type}
            </div>
            <div class="weapon-stats-line">
                <span class="stat-main">${mainStatDisplay}</span> / 
                <span class="stat-sub">${subStatDisplay}</span> / 
                <span class="stat-skill">${weapon.skill}</span>
            </div>
        </div>
    `;
    card.addEventListener('click', () => onClick(weapon));

    // 觸發動畫
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 10);

    return card;
}

// ==================== 計算最佳刷取配置 ====================

function getBestFarmConfig(targetWeapon, stageName, stageData) {
    // 找出在此關卡符合2條的所有武器（包含目標武器）
    const eligibleWeapons = weapons.filter(w => {
        let match = 0;
        if (w.subStat !== "/" && stageData.subStats.includes(w.subStat)) match++;
        if (stageData.skills.includes(w.skill)) match++;
        return match >= 2;
    });

    if (eligibleWeapons.length === 0) return null;

    // 找出目標武器可用的附加屬性和技能
    const targetSubStat = targetWeapon.subStat !== "/" && stageData.subStats.includes(targetWeapon.subStat)
        ? targetWeapon.subStat : null;
    const targetSkill = stageData.skills.includes(targetWeapon.skill) ? targetWeapon.skill : null;

    if (!targetSubStat && !targetSkill) return null;

    // 嘗試所有可能的主屬性組合（3選組合）
    const allMainStats = ["敏捷提升", "力量提升", "意志提升", "智識提升", "主能力提升"];
    let bestConfig = null;
    let maxWeapons = 0;

    // 生成所有3個主屬性的組合
    for (let i = 0; i < allMainStats.length; i++) {
        for (let j = i + 1; j < allMainStats.length; j++) {
            for (let k = j + 1; k < allMainStats.length; k++) {
                const mainCombo = [allMainStats[i], allMainStats[j], allMainStats[k]];

                // 嘗試每種附加/技能組合
                const possibleSubSkills = [];
                if (targetSubStat) possibleSubSkills.push({ type: 'sub', value: targetSubStat });
                if (targetSkill) possibleSubSkills.push({ type: 'skill', value: targetSkill });

                for (const subSkill of possibleSubSkills) {
                    // 計算符合此配置的武器
                    const matchingWeapons = eligibleWeapons.filter(w => {
                        // 主屬性必須符合（或是主能力提升）
                        const mainMatch = mainCombo.includes(w.mainStat) || w.mainStat === "主能力提升";
                        if (!mainMatch) return false;

                        // 副詞條或技能必須符合選定的
                        if (subSkill.type === 'sub') {
                            return w.subStat === subSkill.value;
                        } else {
                            return w.skill === subSkill.value;
                        }
                    });

                    if (matchingWeapons.length > maxWeapons) {
                        maxWeapons = matchingWeapons.length;
                        bestConfig = {
                            mainStats: mainCombo,
                            subSkill: subSkill,
                            weapons: matchingWeapons,
                            count: matchingWeapons.length
                        };
                    }
                }
            }
        }
    }

    return bestConfig;
}

function getRecommendedStagesWithConfig(weapon) {
    const recommendations = [];

    for (const [stageName, stageData] of Object.entries(stages)) {
        // 檢查此武器在這個關卡是否符合2條
        let matchCount = 0;
        const matchDetails = [];

        if (weapon.subStat !== "/" && stageData.subStats.includes(weapon.subStat)) {
            matchCount++;
            matchDetails.push(`副詞條「${weapon.subStat}」`);
        }
        if (stageData.skills.includes(weapon.skill)) {
            matchCount++;
            matchDetails.push(`技能「${weapon.skill}」`);
        }

        if (matchCount >= 2) {
            const bestConfig = getBestFarmConfig(weapon, stageName, stageData);
            recommendations.push({
                name: stageName,
                matchDetails,
                bestConfig,
                stageData
            });
        }
    }

    return recommendations;
}

// ==================== Modal 顯示 ====================

function showWeaponModal(weapon) {
    // 每次開啟時先捲動回頂部
    document.getElementById('modal').scrollTop = 0;
    const modal = document.getElementById('modal');
    const recommendations = getRecommendedStagesWithConfig(weapon);

    document.getElementById('modalTitle').textContent = weapon.name;

    let recsHtml = '';
    if (recommendations.length === 0) {
        recsHtml = '<div class="no-results">無符合條件的關卡</div>';
    } else {
        recommendations.forEach(rec => {
            recsHtml += `
                <div class="stage-recommend-item">
                    <div class="stage-recommend-name">${rec.name}</div>
                    <div class="stage-recommend-reason">符合：${rec.matchDetails.join('、')}</div>
            `;

            if (rec.bestConfig) {
                recsHtml += `
                    <div class="best-config">
                        <div class="config-title">🎯 最佳定軌配置（可同時刷 ${rec.bestConfig.count} 把武器）</div>
                        <div class="config-detail">
                            <span class="config-label">主屬性：</span>
                            ${rec.bestConfig.mainStats.map(s => `<span class="config-tag main">${s.replace("提升", "")}</span>`).join('')}
                        </div>
                        <div class="config-detail">
                            <span class="config-label">${rec.bestConfig.subSkill.type === 'sub' ? '附加屬性' : '技能'}：</span>
                            <span class="config-tag">${rec.bestConfig.subSkill.value}</span>
                        </div>
                        <div class="config-weapons-title">可同時刷取的武器：</div>
                        <div class="config-weapons-grid">
                `;

                // 顯示可同時刷取的武器卡片（小型版）
                rec.bestConfig.weapons.forEach(w => {
                    const subStatDisplay = w.subStat === "/" ? "-" : w.subStat.replace("提升", "");
                    recsHtml += `
                        <div class="mini-weapon-card ${getRarityClass(w.rarity)}" onclick="showWeaponByName('${w.name}')" style="cursor: pointer;">
                            <img src="${getImagePath(w.name)}" alt="${w.name}" 
                                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗡️</text></svg>'">
                            <div class="mini-weapon-info">
                                <div class="mini-weapon-name">${w.name}</div>
                                <div class="mini-weapon-stats">${w.mainStat.replace("提升", "")} / ${subStatDisplay} / ${w.skill}</div>
                            </div>
                        </div>
                    `;
                });

                recsHtml += `</div></div>`;
            }

            recsHtml += `</div>`;
        });
    }

    document.getElementById('modalBody').innerHTML = `
        <img class="modal-weapon-image" src="${getImagePath(weapon.name)}" alt="${weapon.name}" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗡️</text></svg>'">
        <div class="modal-weapon-stats">
            <div class="stat-row">
                <span class="stat-label">稀有度</span>
                <span class="stat-value"><span class="weapon-rarity ${getRarityBadge(weapon.rarity)}">${weapon.rarity}</span></span>
            </div>
            <div class="stat-row">
                <span class="stat-label">種類</span>
                <span class="stat-value">${weapon.type}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">主詞條</span>
                <span class="stat-value">${weapon.mainStat}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">副詞條</span>
                <span class="stat-value">${weapon.subStat === "/" ? "無" : weapon.subStat}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">技能</span>
                <span class="stat-value">${weapon.skill}</span>
            </div>
        </div>
        <div class="recommended-stages">
            <h4>🎯 推薦刷取關卡</h4>
            ${recsHtml}
        </div>
    `;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function showWeaponByName(name) {
    const weapon = weapons.find(w => w.name === name);
    if (weapon) {
        showWeaponModal(weapon);
    }
}

// ==================== Tab 切換 ====================

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// ==================== 武器圖鑑篩選 ====================

// 定義選項
const rarities = ["六星", "五星", "四星", "三星"];
const weaponTypes = ["單手劍", "雙手劍", "長柄武器", "手銃", "施術單元"];

// 收集所有唯一的附加屬性和技能
const allSubStats = [...new Set(weapons.map(w => w.subStat).filter(s => s !== "/"))];
const allSkills = [...new Set(weapons.map(w => w.skill))];

// 篩選狀態
let filterRarities = [];
let filterTypes = [];
let filterMainStats = [];
let filterSubStats = [];
let filterSkills = [];

function initFilters() {
    // 稀有度篩選
    const rarityContainer = document.getElementById('rarityFilter');
    rarities.forEach(rarity => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${rarity}" class="rarity-filter-cb"> ${rarity}`;
        rarityContainer.appendChild(label);
    });

    // 種類篩選
    const typeContainer = document.getElementById('typeFilter');
    weaponTypes.forEach(type => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${type}" class="type-filter-cb"> ${type}`;
        typeContainer.appendChild(label);
    });

    // 主能力篩選
    const mainContainer = document.getElementById('mainStatFilter');
    mainStats.forEach(stat => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${stat}" class="main-filter-cb"> ${stat.replace("提升", "")}`;
        mainContainer.appendChild(label);
    });

    // 附加屬性篩選
    const subContainer = document.getElementById('subStatFilter');
    allSubStats.forEach(stat => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${stat}" class="sub-filter-cb"> ${stat.replace("提升", "")}`;
        subContainer.appendChild(label);
    });

    // 技能篩選
    const skillContainer = document.getElementById('skillFilter');
    allSkills.forEach(skill => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${skill}" class="skill-filter-cb"> ${skill}`;
        skillContainer.appendChild(label);
    });

    // 綁定事件
    document.querySelectorAll('.rarity-filter-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            filterRarities = Array.from(document.querySelectorAll('.rarity-filter-cb:checked')).map(c => c.value);
            applyFilters();
        });
    });

    document.querySelectorAll('.type-filter-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            filterTypes = Array.from(document.querySelectorAll('.type-filter-cb:checked')).map(c => c.value);
            applyFilters();
        });
    });

    document.querySelectorAll('.main-filter-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            filterMainStats = Array.from(document.querySelectorAll('.main-filter-cb:checked')).map(c => c.value);
            applyFilters();
        });
    });

    document.querySelectorAll('.sub-filter-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            filterSubStats = Array.from(document.querySelectorAll('.sub-filter-cb:checked')).map(c => c.value);
            applyFilters();
        });
    });

    document.querySelectorAll('.skill-filter-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            filterSkills = Array.from(document.querySelectorAll('.skill-filter-cb:checked')).map(c => c.value);
            applyFilters();
        });
    });
}

function applyFilters() {
    renderWeapons({
        search: document.getElementById('weaponSearch').value,
        rarities: filterRarities,
        types: filterTypes,
        mainStats: filterMainStats,
        subStats: filterSubStats,
        skills: filterSkills
    });
}

function renderWeapons(filter = {}) {
    const grid = document.getElementById('weaponGrid');
    grid.innerHTML = '';

    let list = weapons.filter(w => {
        if (filter.search && !w.name.includes(filter.search)) return false;
        if (filter.rarities && filter.rarities.length > 0 && !filter.rarities.includes(w.rarity)) return false;
        if (filter.types && filter.types.length > 0 && !filter.types.includes(w.type)) return false;
        if (filter.mainStats && filter.mainStats.length > 0 && !filter.mainStats.includes(w.mainStat)) return false;
        if (filter.subStats && filter.subStats.length > 0 && !filter.subStats.includes(w.subStat)) return false;
        if (filter.skills && filter.skills.length > 0 && !filter.skills.includes(w.skill)) return false;
        return true;
    });

    sortByRarity(list);

    if (list.length === 0) {
        grid.innerHTML = '<div class="no-results">沒有找到符合條件的武器</div>';
        return;
    }

    list.forEach((w, index) => grid.appendChild(createWeaponCard(w, showWeaponModal, index)));
}

// 武器圖鑑篩選事件
document.getElementById('weaponSearch').addEventListener('input', applyFilters);

// ==================== 關卡詞條 ====================

let selectedStage = null;
let selectedMainStats = [];
let selectedSubStat = null;
let selectedSkill = null;

function renderStages() {
    const grid = document.getElementById('stageGrid');
    grid.innerHTML = '';

    for (const name of Object.keys(stages)) {
        const card = document.createElement('div');
        card.className = 'stage-card';
        card.innerHTML = `<div class="stage-card-inner"><div class="stage-name">${name}</div></div>`;
        card.addEventListener('click', () => {
            selectedStage = name;
            showStageDetail(name, stages[name]);
            document.querySelectorAll('.stage-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
        grid.appendChild(card);
    }
}

function showStageDetail(name, data) {
    selectedMainStats = [];
    selectedSubStat = null;
    selectedSkill = null;

    const detail = document.getElementById('stageDetail');
    document.getElementById('stageDetailTitle').textContent = `${name} 可刷取的詞條`;

    document.getElementById('stageDetailContent').innerHTML = `
        <div class="stage-tag-group">
            <div class="stage-tag-label">基礎屬性（可選最多3種，用於定軌）</div>
            <div class="stage-tags" id="mainStatTags">
                ${mainStats.map(s => `<span class="tag main-stat" data-type="main" data-value="${s}">${s}</span>`).join('')}
            </div>
        </div>
        <div class="stage-tag-group">
            <div class="stage-tag-label">附加屬性（選1種）</div>
            <div class="stage-tags" id="subStatTags">
                ${data.subStats.map(s => `<span class="tag" data-type="sub" data-value="${s}">${s}</span>`).join('')}
            </div>
        </div>
        <div class="stage-tag-group">
            <div class="stage-tag-label">技能屬性（選1種）</div>
            <div class="stage-tags" id="skillTags">
                ${data.skills.map(s => `<span class="tag" data-type="skill" data-value="${s}">${s}</span>`).join('')}
            </div>
        </div>
    `;

    // 綁定標籤點擊事件
    document.querySelectorAll('#stageDetailContent .tag').forEach(tag => {
        tag.addEventListener('click', e => {
            e.stopPropagation();
            const type = tag.dataset.type;
            const value = tag.dataset.value;

            if (type === 'main') {
                if (tag.classList.contains('selected')) {
                    tag.classList.remove('selected');
                    selectedMainStats = selectedMainStats.filter(x => x !== value);
                } else if (selectedMainStats.length < 3) {
                    tag.classList.add('selected');
                    selectedMainStats.push(value);
                }
            } else if (type === 'sub') {
                document.querySelectorAll('#subStatTags .tag').forEach(t => t.classList.remove('selected'));
                if (selectedSubStat === value) {
                    selectedSubStat = null;
                } else {
                    tag.classList.add('selected');
                    selectedSubStat = value;
                }
            } else if (type === 'skill') {
                document.querySelectorAll('#skillTags .tag').forEach(t => t.classList.remove('selected'));
                if (selectedSkill === value) {
                    selectedSkill = null;
                } else {
                    tag.classList.add('selected');
                    selectedSkill = value;
                }
            }

            updateFilteredWeapons();
        });
    });

    detail.style.display = 'block';
    document.getElementById('tagWeapons').style.display = 'none';
}

function updateFilteredWeapons() {
    if (selectedMainStats.length === 0 && !selectedSubStat && !selectedSkill) {
        document.getElementById('tagWeapons').style.display = 'none';
        return;
    }

    let filtered = weapons.filter(w => {
        const mainMatch = selectedMainStats.length === 0 ||
            selectedMainStats.includes(w.mainStat) ||
            w.mainStat === "主能力提升";
        const subMatch = !selectedSubStat || w.subStat === selectedSubStat;
        const skillMatch = !selectedSkill || w.skill === selectedSkill;
        return mainMatch && subMatch && skillMatch;
    });

    sortByRarity(filtered);

    const panel = document.getElementById('tagWeapons');
    const grid = document.getElementById('tagWeaponGrid');

    document.getElementById('tagWeaponCount').textContent = filtered.length;
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">沒有符合條件的武器</div>';
    } else {
        filtered.forEach((w, index) => grid.appendChild(createWeaponCard(w, showWeaponModal, index)));
    }

    panel.style.display = 'block';
}

// ==================== Modal 關閉事件 ====================

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('active');
    document.body.classList.remove('modal-open');
});

document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) {
        document.getElementById('modal').classList.remove('active');
        document.body.classList.remove('modal-open');
    }
});

document.getElementById('coFarmModalClose').addEventListener('click', () => {
    document.getElementById('coFarmModal').classList.remove('active');
});

document.getElementById('coFarmModal').addEventListener('click', e => {
    if (e.target === document.getElementById('coFarmModal')) {
        document.getElementById('coFarmModal').classList.remove('active');
    }
});

// ==================== 初始化 ====================

initFilters();
renderWeapons();
renderStages();
