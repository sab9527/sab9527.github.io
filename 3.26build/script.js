// script.js - 從 index.html 拆出的 JavaScript
// ...existing code...
// 定義全域常數
const ASCENDANCY_CLASSES = {
    '野蠻人': ['勇士', '暴徒', '酋長'],
    '遊俠': ['守林人', '銳眼', '追獵者'],
    '女巫': ['秘術家', '元素使', '死靈師'],
    '決鬥者': ['處刑者', '衛士', '冠軍'],
    '聖騎士': ['判官', '聖宗', '守護者'],
    '暗影刺客': ['刺客', '詐欺師', '破壞者'],
    '貴族': ['昇華使徒']
};

const FIELD_MAP = ["流派名稱", "昇華", "擅長分類", "類型", "作者", "影片連結", "說明"];

const filterOptions = {
    '職業': Object.keys(ASCENDANCY_CLASSES),
    '昇華': [], // 這裡不直接顯示
    '擅長分類': ['打王','打圖','均衡','特化'],
    '類型': ['直擊','持續','召喚','圖騰','地雷陷阱','近戰','遠程']
};
function createModernFilters() {
    const filterGroup = document.getElementById('filter-group');
    filterGroup.innerHTML = '';
    // 主職業
    const ascendancyBlock = document.createElement('div');
    ascendancyBlock.className = 'filter-block';
    ascendancyBlock.innerHTML = '<span class="filter-label">昇華</span>';
    Object.keys(ASCENDANCY_CLASSES).forEach(mainClass => {
        const mainBtn = document.createElement('button');
        mainBtn.className = 'filter-btn main-class-btn';
        mainBtn.textContent = mainClass;
        mainBtn.dataset.field = '職業';
        mainBtn.dataset.value = mainClass;
        mainBtn.onclick = function() {
            const isActive = mainBtn.classList.contains('active');
            document.querySelectorAll('.filter-btn.active').forEach(btn => btn.classList.remove('active'));
            if (!isActive) {
                mainBtn.classList.add('active');
                showSubAscendancy(mainClass);
            } else {
                showSubAscendancy(null);
            }
            renderTable(window._gameData, getCurrentFilters());
        };
        ascendancyBlock.appendChild(mainBtn);
    });
    filterGroup.appendChild(ascendancyBlock);
    // 子昇華
    const subOuter = document.createElement('div');
    subOuter.className = 'sub-ascendancy-outer';
    subOuter.style.display = 'block';
    filterGroup.appendChild(subOuter);
    // 其他分類
    ['擅長分類', '類型'].forEach(field => {
        const block = document.createElement('div');
        block.className = 'filter-block' + (field === '類型' ? ' damage-type-block' : '');
        block.innerHTML = `<span class="filter-label">${field}</span>`;
        filterOptions[field].forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = opt;
            btn.dataset.field = field;
            btn.dataset.value = opt;
            btn.onclick = function() {
                btn.classList.toggle('active');
                renderTable(window._gameData, getCurrentFilters());
            };
            block.appendChild(btn);
        });
        filterGroup.appendChild(block);
    });
    function showSubAscendancy(mainClass) {
        subOuter.innerHTML = '';
        if (!mainClass) {
            subOuter.innerHTML = '<div class="filter-block sub-ascendancy-block"><span class="filter-label">子昇華</span><span style="color:#aaa;">請選擇昇華</span></div>';
            subOuter.style.maxHeight = subOuter.scrollHeight + 'px';
            subOuter.style.opacity = '1';
            setTimeout(() => {
                subOuter.style.maxHeight = subOuter.scrollHeight + 'px';
                subOuter.style.opacity = '1';
            }, 10);
            return;
        }
        const subBlock = document.createElement('div');
        subBlock.className = 'filter-block sub-ascendancy-block';
        subBlock.innerHTML = '<span class="filter-label">子昇華</span>';
        ASCENDANCY_CLASSES[mainClass].forEach(sub => {
            const subBtn = document.createElement('button');
            subBtn.className = 'filter-btn sub-ascendancy-btn';
            subBtn.textContent = sub;
            subBtn.dataset.field = '昇華';
            subBtn.dataset.value = sub;
            subBtn.onclick = function() {
                subBtn.classList.toggle('active');
                renderTable(window._gameData, getCurrentFilters());
            };
            subBlock.appendChild(subBtn);
        });
        subOuter.appendChild(subBlock);
        subOuter.style.display = 'block';
        subOuter.style.opacity = '0';
        subOuter.style.maxHeight = '0';
        setTimeout(() => {
            subOuter.style.maxHeight = subOuter.scrollHeight + 'px';
            subOuter.style.opacity = '1';
        }, 10);
    }
}
function getCurrentFilters() {
    const filters = {};
    // 主職業
    const mainBtn = document.querySelector('.main-class-btn.active');
    if (mainBtn) {
        filters['職業'] = [mainBtn.dataset.value];
    }
    // 子昇華
    const subBtns = Array.from(document.querySelectorAll('.sub-ascendancy-btn.active'));
    if (subBtns.length > 0) {
        filters['昇華'] = subBtns.map(btn => btn.dataset.value);
    }
    // 其他
    document.querySelectorAll('.filter-btn.active:not(.main-class-btn):not(.sub-ascendancy-btn)').forEach(btn => {
        if (!filters[btn.dataset.field]) filters[btn.dataset.field] = [];
        filters[btn.dataset.field].push(btn.dataset.value);
    });
    return filters;
}
function matchFilters(row, filters) {
    for (let key in filters) {
        if (key === '職業') {
            // 根據昇華名稱反查職業
            const ascendancy = (row['昇華'] || '').split(/,|、/).map(s => s.trim());
            const match = ascendancy.some(sub =>
                filters['職業'].some(main =>
                    ASCENDANCY_CLASSES[main] && ASCENDANCY_CLASSES[main].includes(sub)
                )
            );
            if (!match) return false;
        } else {
            // 支援多值（以, 或 、分隔）
            const cell = (row[key] || '').split(/,|、/).map(s => s.trim());
            if (!filters[key].some(val => cell.includes(val))) return false;
        }
    }
    return true;
}
// 1. 新增對應表（請將圖片網址換成你自己的）
const ASCENDANCY_IMAGES = {
    '勇士': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Juggernaut.png?key=9QcvWBwz82ssD8VPHWBMUA',
    '暴徒': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Berserker.png?key=wwrBpvaFm_G9pmy7yKtUGg',
    '酋長': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Chieftain.png?key=OigrIPPg6pUUcLD_h0uQFgimg/ascendancy_qiuzhang.png',
    '守林人': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Warden.png?key=41OaJS3vcJUhYFnvSRCfUw',
    '銳眼': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Deadeye.png?key=cXCSUiBfopA9ApEMtnYbLw',
    '追獵者': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Pathfinder.png?key=tdQf9JweYNzFfy3FgH9qpQ',
    '秘術家': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Occultist.png?key=mV3c0qbitkd9QJL1ZGZVXQ',
    '元素使': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Elementalist.png?key=xTQG41cKmhvNFrwu_cN7CQ',
    '死靈師': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Necromancer.png?key=elS-LvLYJzjIbJuOdVP5_g',
    '處刑者': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Slayer.png?key=GXdlR4sUMV-AsfrB9_hjHQ',
    '衛士': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Gladiator.png?key=09py0OfLrWjOVQIbfU1m6w',
    '冠軍': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Champion.png?key=tgo2quXqkaI3QGvIRJSi6Q',
    '判官': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Inquisitor.png?key=DhDuviNFcgwY_8QpofzRRg',
    '聖宗': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Hierophant.png?key=8QDOpgoGaZS0ksXADuoUKw',
    '守護者': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Guardian.png?key=dUCfULonJ5ihtjU8G0cDoA',
    '刺客': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Assassin.png?key=ZxaRbd_wAQJa1Ma_Yu-_cA',
    '詐欺師': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Trickster.png?key=xsXRx0faBRn5OiV5ghrnGQ',
    '破壞者': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Saboteur.png?key=j7PBS-x41WkhF32aQOT0bA',
    '昇華使徒': 'https://web.poecdn.com/protected/image/promo/ascendancy/classes/Ascendant.png?key=2-zRw53BEG3Ca-1BSn3_XQ'
};

// 2. 新增渲染函式
function renderAscendancyCell(text) {
    if (!text) return '';
    // 支援多個昇華（以, 或 、分隔）
    return text.split(/,|、/).map(name => {
        name = name.trim();
        if (ASCENDANCY_IMAGES[name]) {
            // 調整這裡的 height、width
            return `<img src="${ASCENDANCY_IMAGES[name]}" alt="${name}" title="${name}" style="height:80px;width:auto;vertical-align:middle;margin:0 2px;">`;
        }
        return name;
    }).join('');
}

// 3. 修改 renderTable
function renderBuildNameCell(name) {
    if (!name) return '';
    const url = `https://poedb.tw/tw/search?q=${encodeURIComponent(name)}`;
    return `<a href="${url}" class="build-link" target="_blank" rel="noopener">${name}</a>`;
}

function renderTable(data, filters) {
    const tbody = document.querySelector('#games-table tbody');
    // 動畫：先淡出
    tbody.classList.add('fade');
    setTimeout(() => {
        tbody.innerHTML = '';
        data.filter(row => {
            if (Object.keys(filters).length === 0) return true;
            return matchFilters(row, filters);
        }).forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${renderBuildNameCell(row['流派名稱'])}</td>
                <td>${renderAscendancyCell(row['昇華'])}</td>
                <td>${row['擅長分類']||''}</td>
                <td>${row['類型']||''}</td>
                <td>${row['作者']||''}</td>
                <td>${embedVideo(row['影片連結'])}</td>
                <td>${row['說明']||''}</td>
            `;
            tbody.appendChild(tr);
        });
        // 動畫：再淡入
        tbody.classList.remove('fade');
    }, 200);
}
function embedVideo(url) {
    if (!url) return '無影片連結';
    // 只支援 YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (!ytMatch) {
        return `<a href="${url}" target="_blank">查看影片</a>`;
    }
    const vid = ytMatch[1];
    const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
    // 直接顯示縮圖，點擊彈窗
    return `<img src="${thumb}" class="video-thumb" data-vid="${vid}" style="cursor:pointer;max-width:120px;border-radius:8px;box-shadow:0 2px 12px #000a;">`;
}

function parseCSV(text) {
    const FIELD_MAP = ["流派名稱", "昇華", "擅長分類", "類型", "作者", "影片連結", "說明"];
    return text.split(/\r?\n/).filter(line => line.trim()).slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        FIELD_MAP.forEach((key, idx) => obj[key] = values[idx] || '');
        return obj;
    });
}

async function loadCSVData() {
    try {
        const res = await fetch('data.csv?_=' + Date.now());
        if (!res.ok) throw new Error('無法載入 data.csv');
        const text = await res.text();
        const json = parseCSV(text);
        window._gameData = json;
        createModernFilters();
        renderTable(json, {});
    } catch (e) {
        console.error('載入 CSV 失敗', e);
        alert('載入 data.csv 失敗：' + e.message);
    }
}

// 初始化應用程序
window.addEventListener('load', () => {
    loadCSVData();
    initPOBHandler();
    initSideLinkHandlers();
});

// POB Pastebin 處理
function initPOBHandler() {
    document.getElementById('pob-url-btn').addEventListener('click', () => {
        const input = document.getElementById('pob-url-input');
        const url = input.value.trim();
        if (!url) {
            alert('請輸入 Pastebin.com 或 Pobb.in 網址');
            return;
        }
        const code = extractPOBCode(url);
        if (!code) {
            alert('無法解析網址，請確認格式');
            return;
        }
        window.open('https://poedb.tw/tw/pob?pastebin=' + code, '_blank');
    });
}

function extractPOBCode(url) {
    const match = url.match(/(pastebin\.com\/(?:raw\/)?([\w\d]+))|(pobb\.in\/([\w\d]+))/i);
    return match ? (match[2] || match[4]) : (/^[\w\d]{8,}$/.test(url) ? url : '');
}

// 側邊欄連結處理
function initSideLinkHandlers() {
    document.querySelectorAll('.side-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            if (url) window.open(url, '_blank');
        });
    });
};
// 彈窗播放影片
const modalMask = document.getElementById('video-modal-mask');
const modalIframe = document.getElementById('video-modal-iframe');
const modalClose = document.getElementById('video-modal-close');
document.addEventListener('click', function(e) {
    const thumb = e.target.closest('.video-thumb');
    if (thumb && thumb.dataset.vid) {
        modalMask.style.display = 'flex';
        modalIframe.src = `https://www.youtube.com/embed/${thumb.dataset.vid}?autoplay=1`;
    }
    if (e.target === modalMask || e.target === modalClose) {
        modalMask.style.display = 'none';
        modalIframe.src = '';
    }
});
// ...existing code...
