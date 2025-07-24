// regex-tool.js
// 將原本 index.html 內的 JS 移至此檔案

let currentModFile = 'mod.txt';
let modsCache = {};
// 新增：記錄所有頁籤的勾選狀態
let allChecked = {
    'mod.txt': [],
    't17mod.txt': []
};
let allMods = {
    'mod.txt': [],
    't17mod.txt': []
};
let allRegexKeys = {
    'mod.txt': [],
    't17mod.txt': []
};
// 搜尋框內容只保留一組
let searchText = '';

'use strict';
function renderModList(mods, regexKeys, modFile, filter = '') {
    const modList = document.getElementById('modList');
    modList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    mods.forEach((mod, index) => {
        if (filter && !mod.includes(filter)) return;
        const div = document.createElement('div');
        div.className = 'mod-card';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `mod-${index}`;
        checkbox.value = mod;
        checkbox.setAttribute('data-key', regexKeys[index]);
        checkbox.checked = (allChecked[modFile] || []).includes(index);
        checkbox.addEventListener('change', (e) => {
            if (checkbox.checked) {
                if (!allChecked[modFile].includes(index)) allChecked[modFile].push(index);
            } else {
                allChecked[modFile] = allChecked[modFile].filter(i => i !== index);
            }
            updateRegex();
        });
        const label = document.createElement('label');
        label.htmlFor = `mod-${index}`;
        label.textContent = mod;
        const keySpan = document.createElement('span');
        keySpan.style.cssText = 'color:#ffe066;font-size:0.95em;margin-left:8px;opacity:0.7;';
        keySpan.textContent = `【${regexKeys[index]}】`;
        label.appendChild(keySpan);
        div.appendChild(checkbox);
        div.appendChild(label);
        div.addEventListener('click', function(e) {
            if (e.target === checkbox) return;
            if (window.getSelection && window.getSelection().toString()) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
            if (window.getSelection) window.getSelection().removeAllRanges();
            e.preventDefault();
        });
        fragment.appendChild(div);
    });
    modList.appendChild(fragment);
}

const allFragments = {};

async function loadMods(modFile) {
    const modList = document.getElementById('modList');
    let mods = [];
    try {
        if (modsCache[modFile]) {
            mods = modsCache[modFile];
        } else {
            const res = await fetch(modFile);
            const txt = await res.text();
            mods = txt.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
            modsCache[modFile] = mods;
        }
    } catch (e) {
        modList.innerHTML = `<div style="color:red;">無法讀取 ${modFile}，請確認檔案存在！</div>`;
        return Promise.reject(e);
    }
    allMods[modFile] = mods;
    // 依第一個中文字排序，提升 UI 可讀性
    mods.sort((a, b) => {
        const ca = a.match(/[\u4e00-\u9fa5]/)?.[0] ?? '';
        const cb = b.match(/[\u4e00-\u9fa5]/)?.[0] ?? '';
        return ca.localeCompare(cb, 'zh-Hant');
    });

    // 產生所有 2~6 字片段，並統計出現次數
    const fragments = {};
    const modFragments = mods.map(mod => {
        let frags = [];
        for (let n = 2; n <= 6; n++) {
            const arr = mod.match(new RegExp(`[\u4e00-\u9fa5]{${n}}`, 'g')) ?? [];
            frags = frags.concat(arr);
        }
        return frags;
    });
    // 計算當前檔案的片段出現次數
    modFragments.flat().forEach(frag => {
        fragments[frag] = (fragments[frag] ?? 0) + 1;
    });
    // 如果是批次載入（非當前模組），只更新 allFragments
    if (modFile !== currentModFile) {
        Object.entries(fragments).forEach(([frag, count]) => {
            allFragments[frag] = count;
        });
    } else {
        // 如果是當前模組，重置並重新計算所有片段
        Object.keys(allFragments).forEach(key => delete allFragments[key]);
        Object.entries(fragments).forEach(([frag, count]) => {
            allFragments[frag] = count;
        });
    }

    // 統一特殊條目寫法
    const specialCases = [
        { re: /玩家 \(-12–-9\)% 全部最大抗性/, key: '大抗' },
        { re: /玩家減少 40% 格擋率/, key: '少.*格' },
        { re: /玩家減少 60% 來自技能的非詛咒光環效果/, key: '非詛' },
        { re: /玩家身上的增益效果加速 70% 失效/, key: '的增' },
        { re: /怪物身上的減益效果消逝加速 100%/, key: '的減' },
        { re: /區域內有數道增加 50% 承受傷害的感電地面/, key: '的感' },
        { re: /全部怪物傷害可以點燃、冰凍和感電/, key: '以點' },
        { re: /怪物 \+50% 攻擊傷害格擋率/, key: '害格' },
        { re: /怪物獲得 \(180–200\)% 物理傷害的額外 1 個隨機元素傷害/, key: '機元' },
        { re: /怪物暴擊球上限 \+1 怪物擊中時獲得 1 顆暴擊球/, key: '擊球' },
        { re: /怪物狂怒球上限 \+1 怪物擊中時獲得 1 顆狂怒球/, key: '怒球' },
        { re: /怪物耐力球上限 \+1 怪物擊中時獲得 1 顆耐力球/, key: '力球' },
        { re: /怪物不能受到詛咒/, key: '到詛' },
        { re: /玩家圖騰受到攻擊時承受傷害的 15% 改由召喚者承受/, key: '家圖' },
        { re: /玩家減少 \(50–60\)% 最大總生命、魔力和偷取每秒能量護盾恢復/, key: '和偷' },
        { re: /怪物擊中時造成 2 層緩速藤蔓/, key: '藤蔓' },
        { re: /區域有數道奉獻地面/, key: '奉獻' },
        { re: /地圖含有腐化地面/, key: '腐化' },
        { re: /地圖含有冰緩地面/, key: '冰緩' },
        { re: /地圖含有兩個傳奇頭目/, key: '兩個' },
        { re: /地圖含有燃燒地面/, key: '燃燒' },
        { re: /玩家使用藥劑時被隕石瞄準/, key: '隕石' },
        { re: /玩家的召喚物減少 50% 攻擊速度 玩家的召喚物減少 50% 施放速度 玩家的召喚物減少 50% 移動速度/, key: '的召' },
        { re: /區域含有數道喚醒者的荒蕪/, key: '荒蕪' },
        { re: /擊中時，怪物點燃、冰凍和感電/, key: '物點' },
        { re: /怪物的攻擊擊中時造成穿刺，當玩家被施加第 5 層穿刺時，移除穿刺並將物理傷害乘以其剩餘層數的傷害，反射給該玩家及其 1\.8 公尺內的友方/, key: '擊擊' },
        { re: /擊中時，怪物有 20% 機率點燃、冰凍和感電/, key: '率點' },
        { re: /怪物有 50% 機率避免中毒、穿刺和流血/, key: '刺和' },
        { re: /反射.*物理傷害/, key: '射.*物理', byIndex: true },
        { re: /反射.*元素傷害/, key: '射.*元', byIndex: true },
        { re: /傳奇頭目增加\s*\d{1,3}%\s*傷害/, key: '目增加.*傷', byIndex: true },
        { re: /傳奇頭目增加\s*\d{1,3}%\s*攻擊速度及施放速度/, key: '目增加.*攻', byIndex: true },
        { re: /傳奇頭目增加\s*\d{1,3}%\s*生命/, key: '目增加.*生', byIndex: true },
        { re: /增加\s*\(\d{1,3}–\d{1,3}\)%\s*怪物傷害/, key: '加.*怪物傷', byIndex: true },
        { re: /增加\s*\(\d{1,3}–\d{1,3}\)%\s*怪物移動速度/, key: '加.*怪物移', byIndex: true },
        { re: /增加\s*\(\d{1,3}–\d{1,3}\)%\s*怪物攻擊速度/, key: '加.*怪物攻', byIndex: true },
        { re: /增加\s*\(\d{1,3}–\d{1,3}\)%\s*怪物施放速度/, key: '加.*怪物施', byIndex: true },
        { re: /增加怪物\s*\d{1,3}%\s*範圍效果/, key: '物.*範', byIndex: true },
        { re: /^\(\d{1,3}–\d{1,3}\)% 更多怪物生命$/, key: '.*更多怪', byIndex: true },
    ];
    // 預先計算 byIndex 的特殊條目 index
    const specialIndexMap = {};
    specialCases.forEach(item => {
        if (item.byIndex) {
            const idx = mods.findIndex(m => item.re.test(m));
            if (idx !== -1) specialIndexMap[idx] = item.key;
        }
    });
    // 產生唯一正則 key，特殊條目優先處理，其餘自動唯一化
    const regexKeys = mods.map((mod, idx) => {
        // 先判斷 byIndex
        if (specialIndexMap[idx]) return specialIndexMap[idx];
        // 內容比對
        for (const item of specialCases) {
            if (!item.byIndex && item.re.test(mod)) return item.key;
        }
        // 其餘自動唯一化
        const frags = modFragments[idx];
        let pick = '';
        for (let n = 2; n <= 6; n++) {
            for (let frag of frags.filter(f => f.length === n)) {
                if (allFragments[frag] === 1) {
                    pick = frag;
                    break;
                }
            }
            if (pick) break;
        }
        if (!pick) pick = mod.replace(/[^\u4e00-\u9fa5]/g, '');
        return pick;
    });
    allRegexKeys[modFile] = regexKeys;
    
    // 只在非批次載入時更新 UI
    if (modFile === currentModFile) {
        renderModList(mods, regexKeys, modFile, searchText || '');
        // 搜尋框事件
        const searchInput = document.getElementById('modSearch');
        if (searchInput) {
            searchInput.value = searchText || '';
            if (!searchInput._bound) {
                searchInput.addEventListener('input', function() {
                    searchText = this.value.trim();
                    renderModList(mods, regexKeys, modFile, searchText);
                });
                searchInput._bound = true;
            }
        }
    }
    
    return Promise.resolve({ mods, regexKeys });
}

function updateAllChecked(modFile) {
    const modList = document.getElementById('modList');
    const checkboxes = Array.from(modList.querySelectorAll('input[type="checkbox"]'));
    allChecked[modFile] = checkboxes.map((cb, idx) => cb.checked ? idx : -1).filter(idx => idx !== -1);
    updateRegex();
}

// 合併所有勾選計算正則
const updateRegex = () => {
  let keys = [];
  Object.keys(allChecked).forEach(modFile => {
    (allChecked[modFile] || []).forEach(idx => {
      keys.push(allRegexKeys[modFile][idx]);
    });
  });
  keys = keys.filter(Boolean);
  if (keys.length === 0) {
    document.getElementById('regexOutput').textContent = '請選擇至少一個詞條';
    updateNegativeRegex();
    return;
  }
  let uniqueParts = [...new Set(keys)];
  const hasReflectPhysical = uniqueParts.includes('反射.*物理傷害');
  const hasReflectElemental = uniqueParts.includes('反射.*元素傷害');
  if (hasReflectPhysical && hasReflectElemental) {
    uniqueParts = uniqueParts.filter(k => k !== '反射.*物理傷害' && k !== '反射.*元素傷害');
    uniqueParts.push('反射');
  }
  const regex = uniqueParts.join('|');
  const output = document.getElementById('regexOutput');
  output.textContent = regex;
  output.classList.remove('animate');
  void output.offsetWidth;
  output.classList.add('animate');
  updateNegativeRegex();
};

// 新增：不能出現正則區塊
const updateNegativeRegex = () => {
  let keys = [];
  Object.keys(allChecked).forEach(modFile => {
    (allChecked[modFile] || []).forEach(idx => {
      keys.push(allRegexKeys[modFile][idx]);
    });
  });
  keys = keys.filter(Boolean);
  let negative = '';
  if (keys.length > 0) {
    negative = '!' + keys.join('|');
  }
  const filterStr = document.getElementById('filterRegexOutput').textContent;
  let result = negative;
  if (filterStr) {
    result += (negative ? ' ' : '') + filterStr;
  }
  document.getElementById('negativeRegexOutput').textContent = result || '';
}

function handleCopy(btn, text) {
    if (!text || text === '請選擇至少一個詞條') return;
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        const oldText = btn.textContent;
        btn.textContent = '已複製!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = oldText;
        }, 1200);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copyBtn');
    const regexOutput = document.getElementById('regexOutput');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            handleCopy(copyBtn, regexOutput.textContent);
        });
    }
    const filterCopyBtn = document.getElementById('filterCopyBtn');
    const filterRegexOutput = document.getElementById('filterRegexOutput');
    if (filterCopyBtn) {
        filterCopyBtn.addEventListener('click', function() {
            handleCopy(filterCopyBtn, filterRegexOutput.textContent);
        });
    }
    const negativeCopyBtn = document.getElementById('negativeCopyBtn');
    const negativeRegexOutput = document.getElementById('negativeRegexOutput');
    if (negativeCopyBtn) {
        negativeCopyBtn.addEventListener('click', function() {
            handleCopy(negativeCopyBtn, negativeRegexOutput.textContent);
            launchEasterEgg();
// 彩蛋功能：複製時噴出圖片拋物線動畫
function launchEasterEgg() {
    // 5%機率：連續射出20個神聖石
    if (Math.random() < 0.05) {
        launchDivineRain();
        return;
    }
    // 25%機率：射出超高DIV.webp
    if (Math.random() < 0.25) {
        launchFlyingImage({
            imgSrc: 'DIV.webp',
            high: true
        });
        return;
    }
    // 其餘：正常DIV.webp
    launchFlyingImage({
        imgSrc: 'DIV.webp',
        high: false
    });
}

// 單一圖片拋物線動畫，high=true時高度超高
function launchFlyingImage({imgSrc, high}) {
    const btn = document.getElementById('negativeCopyBtn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.position = 'fixed';
    img.style.width = '64px';
    img.style.height = '64px';
    img.style.left = (rect.left + rect.width/2 - 32) + 'px';
    img.style.top = (rect.top + rect.height/2 - 32) + 'px';
    img.style.zIndex = 9999;
    img.style.pointerEvents = 'none';
    img.style.transition = 'filter 0.2s';
    document.body.appendChild(img);

    // 角度與速度
    let angle, speed;
    if (high) {
        angle = (Math.random() * Math.PI/6) + Math.PI/2.1; // 100~130度，幾乎垂直
        speed = 22 + Math.random() * 8; // 更大初速度
    } else {
        angle = (Math.random() * Math.PI/2) + Math.PI/4; // 45~135度
        speed = 12 + Math.random() * 6;
    }
    let vx = Math.cos(angle) * speed;
    let vy = -Math.sin(angle) * speed;
    let x = rect.left + rect.width/2 - 32;
    let y = rect.top + rect.height/2 - 32;
    const gravity = high ? (0.5 + Math.random()*0.2) : (0.7 + Math.random()*0.3);
    let frame = 0;
    function animate() {
        frame++;
        x += vx;
        y += vy;
        vy += gravity;
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        img.style.transform = `rotate(${frame*12}deg)`;
        if (y > window.innerHeight || x < -80 || x > window.innerWidth+80) {
            img.remove();
            return;
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// 連續射出20個神聖石 Divine.webp
function launchDivineRain() {
    let count = 0;
    function shoot() {
        launchFlyingImage({imgSrc: 'DIV.webp', high: false});
        count++;
        if (count < 20) {
            setTimeout(shoot, 60 + Math.random()*60);
        }
    }
    shoot();
}
        });
    }
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentModFile = this.getAttribute('data-modfile');
            // 切換頁籤時，載入對應搜尋內容
            loadMods(currentModFile);
        });
    });
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            Object.keys(allChecked).forEach(modFile => allChecked[modFile] = []);
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateRegex();
        });
    }
    const filterResetBtn = document.getElementById('filterResetBtn');
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', function() {
            ['filter-quantity','filter-rarity','filter-pack','filter-map','filter-scarab','filter-currency'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            document.getElementById('filterRegexOutput').textContent = '';
        });
    }
    // ===== 儲存組合功能區 =====
    const saveSection = document.querySelector('.save-section');
    const saveList = document.getElementById('saveList');
    const saveCurrentBtn = document.getElementById('saveCurrentBtn');
    const saveDialog = document.getElementById('saveDialog');
    const saveDialogCloseBtn = document.getElementById('saveDialogCloseBtn');
    const saveDialogSaveBtn = document.getElementById('saveDialogSaveBtn');
    const saveNameInput = document.getElementById('saveNameInput');
    const loadDialog = document.getElementById('loadDialog');
    const loadDialogCloseBtn = document.getElementById('loadDialogCloseBtn');
    const loadDialogLoadBtn = document.getElementById('loadDialogLoadBtn');
    const loadDialogDeleteBtn = document.getElementById('loadDialogDeleteBtn');
    const loadDialogTitle = document.getElementById('loadDialogTitle');
    let currentLoadKey = '';

    // ====== 新增：提示按鈕功能 ======
    const filterHintBtn = document.getElementById('filterHintBtn');
    const filterHintDialog = document.getElementById('filterHintDialog');
    const filterHintCloseBtn = document.getElementById('filterHintCloseBtn');
    if (filterHintBtn && filterHintDialog) {
        filterHintBtn.addEventListener('click', function() {
            filterHintDialog.style.display = 'flex';
        });
    }
    if (filterHintCloseBtn && filterHintDialog) {
        filterHintCloseBtn.addEventListener('click', function() {
            filterHintDialog.style.display = 'none';
        });
    }
    // 點擊遮罩區域關閉提示
    if (filterHintDialog) {
        filterHintDialog.addEventListener('click', function(e) {
            if (e.target === filterHintDialog) filterHintDialog.style.display = 'none';
        });
    }

    function getSaveData() {
        // 儲存所有勾選、進階篩選
        return {
            allChecked: JSON.parse(JSON.stringify(allChecked)),
            filter: {
                quantity: document.getElementById('filter-quantity').value,
                rarity: document.getElementById('filter-rarity').value,
                pack: document.getElementById('filter-pack').value,
                map: document.getElementById('filter-map').value,
                scarab: document.getElementById('filter-scarab').value,
                currency: document.getElementById('filter-currency').value
            },
            tab: currentModFile
        };
    }
    async function setSaveData(data) {
        // 載入所有勾選、進階篩選
        if (!data) return;
        if (data.allChecked) {
            Object.keys(allChecked).forEach(k => {
                allChecked[k] = data.allChecked[k] || [];
            });
            // 先載入所有 mod 檔案，確保 allMods 和 allRegexKeys 都已經準備好
            // 暫時禁用 UI 更新
            const originalModFile = currentModFile;
            currentModFile = null;
            try {
                // 依序載入每個模組，確保片段計算的正確性
                for (const modFile of Object.keys(allMods)) {
                    const result = await loadMods(modFile);
                    allMods[modFile] = result.mods;
                    allRegexKeys[modFile] = result.regexKeys;
                }
                // 恢復當前模組並一次性更新 UI
                currentModFile = originalModFile;
                Object.keys(allMods).forEach(modFile => {
                    renderModList(allMods[modFile], allRegexKeys[modFile], modFile, searchText || '');
                });
                updateRegex();
            } catch (error) {
                console.error('載入儲存組合失敗:', error);
                currentModFile = originalModFile;
            }
        }
        if (data.filter) {
            document.getElementById('filter-quantity').value = data.filter.quantity || '';
            document.getElementById('filter-rarity').value = data.filter.rarity || '';
            document.getElementById('filter-pack').value = data.filter.pack || '';
            document.getElementById('filter-map').value = data.filter.map || '';
            document.getElementById('filter-scarab').value = data.filter.scarab || '';
            document.getElementById('filter-currency').value = data.filter.currency || '';
            updateFilterRegex();
        }
        if (data.tab) {
            currentModFile = data.tab;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-modfile') === currentModFile);
            });
        }
    }
    function getAllSaves() {
        const saves = JSON.parse(localStorage.getItem('poeRegexSaves') || '{}');
        return saves;
    }
    function setAllSaves(saves) {
        localStorage.setItem('poeRegexSaves', JSON.stringify(saves));
    }
    function renderSaveList() {
        const saves = getAllSaves();
        saveList.innerHTML = '';
        Object.keys(saves).forEach(key => {
            const div = document.createElement('div');
            div.className = 'save-item';
            div.textContent = key;
            div.addEventListener('click', function() {
                currentLoadKey = key;
                loadDialogTitle.textContent = key;
                loadDialog.style.display = 'flex';
            });
            saveList.appendChild(div);
        });
    }
    // 儲存目前組合
    if (saveCurrentBtn) {
        saveCurrentBtn.addEventListener('click', function() {
            saveDialog.style.display = 'flex';
            saveNameInput.value = '';
            setTimeout(() => saveNameInput.focus(), 100);
        });
    }
    // 關閉儲存彈窗
    if (saveDialogCloseBtn) {
        saveDialogCloseBtn.addEventListener('click', function() {
            saveDialog.style.display = 'none';
        });
    }
    // 儲存彈窗遮罩點擊關閉
    if (saveDialog) {
        saveDialog.addEventListener('click', function(e) {
            if (e.target === saveDialog) saveDialog.style.display = 'none';
        });
    }
    // 儲存組合
    if (saveDialogSaveBtn) {
        saveDialogSaveBtn.addEventListener('click', function() {
            const name = saveNameInput.value.trim();
            if (!name) {
                saveNameInput.focus();
                return;
            }
            const saves = getAllSaves();
            saves[name] = getSaveData();
            setAllSaves(saves);
            saveDialog.style.display = 'none';
            renderSaveList();
        });
    }
    // 關閉載入/刪除彈窗
    if (loadDialogCloseBtn) {
        loadDialogCloseBtn.addEventListener('click', function() {
            loadDialog.style.display = 'none';
        });
    }
    if (loadDialog) {
        loadDialog.addEventListener('click', function(e) {
            if (e.target === loadDialog) loadDialog.style.display = 'none';
        });
    }
    // 載入組合
    if (loadDialogLoadBtn) {
        loadDialogLoadBtn.addEventListener('click', function() {
            const saves = getAllSaves();
            if (saves[currentLoadKey]) {
                setSaveData(saves[currentLoadKey]);
            }
            loadDialog.style.display = 'none';
        });
    }
    // 刪除組合
    if (loadDialogDeleteBtn) {
        loadDialogDeleteBtn.addEventListener('click', function() {
            const saves = getAllSaves();
            delete saves[currentLoadKey];
            setAllSaves(saves);
            renderSaveList();
            loadDialog.style.display = 'none';
        });
    }
    renderSaveList();
});
// 頁面初始載入
window.onload = async function() {
    try {
        await loadMods(currentModFile);
    } catch (e) {
        console.error('初始載入失敗:', e);
    }
}
// ====== 新增：進階篩選功能 ======
function updateFilterRegex() {
    // 結構性產生大於等於 n 的正則，避免字符集誤用
    function buildRegex(label, val) {
        if (!val || isNaN(val)) return '';
        const n = parseInt(val, 10);
        if (n <= 0) return '';
        const nStr = n.toString();
        const len = nStr.length;
        let parts = [];
        // 處理更高位數的所有數字
        parts.push(`[1-9]\\d{${len},}`);

        // 處理同位數且大於等於 n 的所有數字
        for (let i = 0; i < len; i++) {
            let prefix = nStr.slice(0, i);
            let curDigit = parseInt(nStr[i], 10);

            // 處理目前位數大於 n 的情況
            if (curDigit < 9) {
                let from = curDigit + 1;
                let range = `[${from}-9]`;
                let pattern = prefix + range + (i + 1 < len ? `\\d{${len - i - 1}}` : '');
                parts.push(pattern);
            }
            // 將目前位數加入前綴，繼續處理下一位
            prefix += curDigit;
        }
        parts.push(nStr); // 包含等於 n 的情況
        let regex = `\\b(?:${parts.join('|')})\\b`;
        return `${label}.*${regex}`;
    }
    const q = document.getElementById('filter-quantity').value;
    const r = document.getElementById('filter-rarity').value;
    const p = document.getElementById('filter-pack').value;
    const m = document.getElementById('filter-map').value;
    const s = document.getElementById('filter-scarab').value;
    const c = document.getElementById('filter-currency').value;
    let regexArr = [];
    if (q) regexArr.push(buildRegex('品數量', q));
    if (r) regexArr.push(buildRegex('有度', r));
    if (p) regexArr.push(buildRegex('大小', p));
    if (m) regexArr.push(buildRegex('多地圖', m));
    if (s) regexArr.push(buildRegex('蟲', s));
    if (c) regexArr.push(buildRegex('貨', c));
    document.getElementById('filterRegexOutput').textContent = regexArr.filter(Boolean).join(' | ');
}
// 進階篩選 input 綁定
['filter-quantity','filter-rarity','filter-pack','filter-map','filter-scarab','filter-currency'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function() {
        updateFilterRegex();
        updateNegativeRegex();
    });
});
