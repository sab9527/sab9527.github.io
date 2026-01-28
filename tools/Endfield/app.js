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

function getBestFarmConfigs(targetWeapon, stageName, stageData) {
    // 找出在此關卡符合2條的所有武器（包含目標武器）
    const eligibleWeapons = weapons.filter(w => {
        let match = 0;
        if (w.subStat !== "/" && stageData.subStats.includes(w.subStat)) match++;
        if (stageData.skills.includes(w.skill)) match++;
        return match >= 2;
    });

    if (eligibleWeapons.length === 0) return [];

    // 找出目標武器可用的附加屬性和技能
    const targetSubStat = targetWeapon.subStat !== "/" && stageData.subStats.includes(targetWeapon.subStat)
        ? targetWeapon.subStat : null;
    const targetSkill = stageData.skills.includes(targetWeapon.skill) ? targetWeapon.skill : null;

    if (!targetSubStat && !targetSkill) return [];

    // 嘗試所有可能的主屬性組合（3選組合）
    const allMainStats = ["敏捷提升", "力量提升", "意志提升", "智識提升", "主能力提升"];
    let rawConfigs = [];

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
                        // 主屬性必須符合
                        const mainMatch = mainCombo.includes(w.mainStat);
                        if (!mainMatch) return false;

                        // 副詞條或技能必須符合選定的
                        if (subSkill.type === 'sub') {
                            return w.subStat === subSkill.value;
                        } else {
                            return w.skill === subSkill.value;
                        }
                    });

                    if (matchingWeapons.length > 0) {
                        // 檢查是否已經存在相同的配置（主屬性組合相同且副屬性/技能相同）
                        // 雖然三層迴圈本身保證主屬性組合唯一，但同一組主屬性配不同subSkill可能產生不同結果
                        // 這裡先收集原始資料，後續處理合併
                        rawConfigs.push({
                            mainStats: mainCombo,
                            subSkill: subSkill,
                            weapons: matchingWeapons,
                            count: matchingWeapons.length,
                            weaponIds: matchingWeapons.map(w => w.name).sort().join(',') // 用於快速比較
                        });
                    }
                }
            }
        }
    }

    // 步驟 1: 過濾子集 (Subset Filtering)
    // 如果方案 A 的武器列表是方案 B 的嚴格子集 (A < B)，則移除 A
    // 先按數量降序排序，這樣可以用較大的集合去過濾較小的
    rawConfigs.sort((a, b) => b.count - a.count);

    let filteredConfigs = rawConfigs.filter((config, index, self) => {
        // 檢查是否存在一個更好的方案 (betterConfig)
        // 條件: betterConfig 的武器數量 > config 的數量，且 config 的所有武器都在 betterConfig 中
        // 注意：如果數量相等但內容不同，不算子集，兩者都保留
        // 如果數量相等且內容相同，稍後會合併，這裡先不處理
        const isSubset = self.some(otherConfig => {
            if (otherConfig === config) return false;
            if (otherConfig.count <= config.count) return false; // 只檢查比自己大的

            // 檢查是否所有 config 的武器都在 otherConfig 裡
            const otherWeaponSet = new Set(otherConfig.weapons.map(w => w.name));
            return config.weapons.every(w => otherWeaponSet.has(w.name));
        });
        return !isSubset;
    });

    // 步驟 2: 合併相同方案 (Merging)
    // 將結果相同的方案合併
    const mergedConfigsMap = new Map();

    filteredConfigs.forEach(config => {
        // 建立一個唯一鍵：武器列表 + 副詞條/技能類型與數值
        // 因為"達成同樣武器列表"但"使用不同副詞條/技能"應該視為不同策略（雖然結果武器一樣，但達成條件不同）
        // 但根據用戶需求：「刷的內容都是一樣的...這種情況應該把不影響的能力以其他形式表現」
        // 這意味著即使 subSkill 不同，只要武器結果一樣，也可以考慮？
        // 不，用戶的例子是 "敏捷/力量切換不影響"，這是主屬性變化。
        // 如果是 subSkill 變化導致武器一樣，通常是因為那些武器剛好都同時滿足兩個條件。
        // 保險起見，我們將 "武器列表 + subSkill" 作為唯一鍵，只合併 "主屬性" 的差異。
        const key = `${config.weaponIds}|${config.subSkill.type}|${config.subSkill.value}`;

        if (!mergedConfigsMap.has(key)) {
            mergedConfigsMap.set(key, {
                mainStatsOptions: [config.mainStats], // 存入這組主屬性
                subSkill: config.subSkill,
                weapons: config.weapons,
                count: config.count
            });
        } else {
            mergedConfigsMap.get(key).mainStatsOptions.push(config.mainStats);
        }
    });

    // 轉換回陣列並計算顯示用的主屬性
    let finalConfigs = Array.from(mergedConfigsMap.values()).map(merged => {
        // 計算交集 (Fixed) 和 聯集 (All)
        // 例如: [A, B, C] 和 [A, B, D] -> Fixed: [A, B], Flexible: [C, D]

        if (merged.mainStatsOptions.length === 1) {
            return {
                mainStats: merged.mainStatsOptions[0],
                flexibleStats: [],
                isMerged: false,
                subSkill: merged.subSkill,
                weapons: merged.weapons,
                count: merged.count
            };
        }

        // 找出所有方案都出現的屬性
        const firstOption = merged.mainStatsOptions[0];
        const fixedStats = firstOption.filter(stat =>
            merged.mainStatsOptions.every(option => option.includes(stat))
        );

        // 找出所有出現過但不固定的屬性
        const allStats = new Set();
        merged.mainStatsOptions.flat().forEach(s => allStats.add(s));
        const flexibleStats = Array.from(allStats).filter(s => !fixedStats.includes(s));

        return {
            mainStats: fixedStats,      // 必選屬性
            flexibleStats: flexibleStats, // 可選/替換屬性
            isMerged: true,
            subSkill: merged.subSkill,
            weapons: merged.weapons,
            count: merged.count
        };
    });

    // 最後再按數量排序一次確保順序
    finalConfigs.sort((a, b) => b.count - a.count);

    return finalConfigs;
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
            const bestConfigs = getBestFarmConfigs(weapon, stageName, stageData);
            recommendations.push({
                name: stageName,
                matchDetails,
                bestConfigs,
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
        recommendations.forEach((rec, stageIdx) => {
            recsHtml += `
                <div class="stage-recommend-item" id="stage-${stageIdx}">
                    <div class="stage-recommend-name">${rec.name}</div>
                    <div class="stage-recommend-reason">符合：${rec.matchDetails.join('、')}</div>
            `;

            if (rec.bestConfigs && rec.bestConfigs.length > 0) {
                // 預設只顯示第一個（最好的）配置
                recsHtml += `
                    <div id="config-display-${stageIdx}">
                        ${renderSingleConfigHtml(rec.bestConfigs[0])}
                    </div>
                `;

                // 如果有其他方案（不含 1 把），顯示查看更多按鈕
                const extraConfigs = rec.bestConfigs.filter((c, i) => i > 0 && c.count > 1);
                if (extraConfigs.length > 0) {
                    recsHtml += `
                        <button class="view-others-btn" onclick="showOtherConfigs(${stageIdx})">
                            🔍 查看其他方案 (${extraConfigs.length})
                        </button>
                    `;
                }
            }

            recsHtml += `</div>`;
        });
    }

    // 將資料暫存到全域以便切換
    window.currentRecs = recommendations;

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

// ==================== 定軌配置切換邏輯 ====================

function renderSingleConfigHtml(config) {
    const subStatDisplayTitle = config.subSkill.type === 'sub' ? '附加屬性' : '技能';

    let html = `
        <div class="best-config">
            <div class="config-title">🎯 定軌配置（可同時刷 ${config.count} 把武器）</div>
            <div class="config-detail">
                <span class="config-label">主屬性：</span>
                ${config.mainStats.map(s => `<span class="config-tag main">${s.replace("提升", "")}</span>`).join('')}
                ${config.flexibleStats && config.flexibleStats.length > 0 ?
            `<span class="config-flex-separator"> | </span>` +
            config.flexibleStats.map(s => `<span class="config-tag main flex">${s.replace("提升", "")}</span>`).join('<span class="flex-or">/</span>')
            : ''}
            </div>
            <div class="config-detail">
                <span class="config-label">${subStatDisplayTitle}：</span>
                <span class="config-tag">${config.subSkill.value}</span>
            </div>
            <div class="config-weapons-title">可同時刷取的武器：</div>
            <div class="config-weapons-grid">
    `;

    sortByRarity(config.weapons).forEach(w => {
        const subStatDisplay = w.subStat === "/" ? "-" : w.subStat.replace("提升", "");
        html += `
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

    html += `</div></div>`;
    return html;
}

window.switchConfig = function (stageIdx, configIdx) {
    const rec = window.currentRecs[stageIdx];
    const config = rec.bestConfigs[parseInt(configIdx)];
    const displayArea = document.getElementById(`config-display-${stageIdx}`);
    if (displayArea && config) {
        displayArea.innerHTML = renderSingleConfigHtml(config);
    }
};

window.showOtherConfigs = function (stageIdx) {
    const rec = window.currentRecs[stageIdx];
    if (!rec) return;

    const modal = document.getElementById('coFarmModal');
    const title = document.getElementById('coFarmModalTitle');
    const body = document.getElementById('coFarmModalBody');

    title.textContent = `${rec.name} - 其他定軌方案`;

    // 過濾掉第一個（已顯示的）和數量為 1 的配置
    const filteredConfigs = rec.bestConfigs.filter((c, i) => i > 0 && c.count > 1);

    let html = `<div class="other-configs-list">`;
    if (filteredConfigs.length === 0) {
        html += `<div class="no-results">沒有多於 1 把武器的其他方案</div>`;
    } else {
        filteredConfigs.forEach((config, idx) => {
            html += `
                <div class="other-config-item">
                    <div class="config-num-badge">方案 ${idx + 2}</div>
                    ${renderSingleConfigHtml(config)}
                </div>
            `;
        });
    }
    html += `</div>`;

    body.innerHTML = html;
    modal.classList.add('active');
};

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
            selectedMainStats.includes(w.mainStat);
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
