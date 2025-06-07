// script.js - 最佳化與現代化語法，減少全域污染與重複操作
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
    '昇華': [],
    '擅長分類': ['打王','打圖','均衡','特化'],
    '類型': ['直擊','持續','召喚','圖騰','地雷陷阱','近戰','遠程']
};
const ASCENDANCY_IMAGES = {
    '勇士': 'pic/勇士.png', '暴徒': 'pic/暴徒.png', '酋長': 'pic/酋長.png',
    '守林人': 'pic/守林人.png', '銳眼': 'pic/銳眼.png', '追獵者': 'pic/追獵者.png',
    '秘術家': 'pic/秘術家.png', '元素使': 'pic/元素使.png', '死靈師': 'pic/死靈師.png',
    '處刑者': 'pic/處刑者.png', '衛士': 'pic/衛士.png', '冠軍': 'pic/冠軍.png',
    '判官': 'pic/判官.png', '聖宗': 'pic/聖宗.png', '守護者': 'pic/守護者.png',
    '刺客': 'pic/刺客.png', '詐欺師': 'pic/詐欺師.png', '破壞者': 'pic/破壞者.png',
    '昇華使徒': 'pic/昇華使徒.png'
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
    const mainBtn = document.querySelector('.main-class-btn.active');
    if (mainBtn) filters['職業'] = [mainBtn.dataset.value];
    const subBtns = Array.from(document.querySelectorAll('.sub-ascendancy-btn.active'));
    if (subBtns.length > 0) filters['昇華'] = subBtns.map(btn => btn.dataset.value);
    document.querySelectorAll('.filter-btn.active:not(.main-class-btn):not(.sub-ascendancy-btn)').forEach(btn => {
        if (!filters[btn.dataset.field]) filters[btn.dataset.field] = [];
        filters[btn.dataset.field].push(btn.dataset.value);
    });
    return filters;
}
function matchFilters(row, filters) {
    for (let key in filters) {
        if (key === '職業') {
            const ascendancy = (row['昇華'] || '').split(/,|、/).map(s => s.trim());
            const match = ascendancy.some(sub =>
                filters['職業'].some(main =>
                    ASCENDANCY_CLASSES[main] && ASCENDANCY_CLASSES[main].includes(sub)
                )
            );
            if (!match) return false;
        } else {
            const cell = (row[key] || '').split(/,|、/).map(s => s.trim());
            if (!filters[key].some(val => cell.includes(val))) return false;
        }
    }
    return true;
}
function renderAscendancyCell(text) {
    if (!text) return '';
    return text.split(/,|、/).map(name => {
        name = name.trim();
        if (ASCENDANCY_IMAGES[name]) {
            return `<img src="${ASCENDANCY_IMAGES[name]}" alt="${name}" title="${name}" style="height:80px;width:auto;vertical-align:middle;margin:0 2px;" class="ascendancy-glow">`;
        }
        return name;
    }).join('');
}
function renderBuildNameCell(name) {
    if (!name) return '';
    const url = `https://poedb.tw/tw/search?q=${encodeURIComponent(name)}`;
    return `<a href="${url}" class="build-link" target="_blank" rel="noopener">${name}</a>`;
}
function linkify(text) {
    if (!text) return '';
    // 將網址轉成可點擊超連結
    return text.replace(/(https?:\/\/[\w\-\.\/?&=+#%:,;~@!$'()*\[\]]+)/g, function(url) {
        return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    });
}
function renderTable(data, filters) {
    const tbody = document.querySelector('#games-table tbody');
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
                <td>${linkify(row['說明'])}</td>
            `;
            tbody.appendChild(tr);
        });
        tbody.classList.remove('fade');
    }, 200);
}
function embedVideo(url) {
    if (!url) return '無連結';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (!ytMatch) {
        return `<a href="${url}" target="_blank">查看影片</a>`;
    }
    const vid = ytMatch[1];
    const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
    return `<img src="${thumb}" class="video-thumb" data-vid="${vid}" style="cursor:pointer;max-width:120px;border-radius:8px;box-shadow:0 2px 12px #000a;">`;
}
function parseCSV(text) {
    // 支援欄位內逗號（簡易處理，若需完整支援建議用 CSV 解析器）
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.slice(1).map(line => {
        const values = [], regex = /(?:"([^"]*)")|([^,]+)/g;
        let match, i = 0;
        while ((match = regex.exec(line)) && i < FIELD_MAP.length) {
            values.push(match[1] !== undefined ? match[1] : match[2]);
            i++;
        }
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
window.addEventListener('load', () => {
    loadCSVData();
    initPOBHandler();
    initSideLinkHandlers();
});
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
function initSideLinkHandlers() {
    document.querySelectorAll('.side-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            if (url) window.open(url, '_blank');
        });
    });
}
// 彈窗播放影片（事件委派最佳化）
(() => {
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
})();
// 免責聲明彈窗處理
document.addEventListener('DOMContentLoaded', function() {
    var disclaimerMask = document.getElementById('disclaimer-modal-mask');
    var disclaimerBtn = document.getElementById('disclaimer-confirm-btn');
    // 新增：檢查 localStorage
    if (localStorage.getItem('disclaimerConfirmed') === 'yes') {
        if (disclaimerMask) disclaimerMask.style.display = 'none';
        return;
    }
    if (disclaimerMask && disclaimerBtn) {
        disclaimerBtn.addEventListener('click', function() {
            disclaimerMask.style.display = 'none';
            // 新增：寫入 localStorage
            localStorage.setItem('disclaimerConfirmed', 'yes');
        });
    }
});
