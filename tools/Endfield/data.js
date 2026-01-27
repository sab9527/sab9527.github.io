/**
 * 武器圖鑑資料檔案
 * 此檔案包含所有武器和關卡資料，方便維護和編輯
 */

// ==================== 武器資料 ====================
// 格式: { name: 名稱, mainStat: 主詞條, subStat: 副詞條, skill: 技能, rarity: 稀有度, type: 種類 }
// 副詞條為 "/" 表示無副詞條（三星武器）

const weapons = [
    // ===== 三星武器 =====
    { name: "塔爾11", mainStat: "主能力提升", subStat: "/", skill: "強攻", rarity: "三星", type: "單手劍" },
    { name: "吉米尼12", mainStat: "主能力提升", subStat: "/", skill: "強攻", rarity: "三星", type: "施術單元" },
    { name: "佩科5", mainStat: "主能力提升", subStat: "/", skill: "強攻", rarity: "三星", type: "手銃" },
    { name: "達爾霍夫7", mainStat: "主能力提升", subStat: "/", skill: "強攻", rarity: "三星", type: "雙手劍" },
    { name: "奧佩羅77", mainStat: "主能力提升", subStat: "/", skill: "強攻", rarity: "三星", type: "長柄武器" },

    // ===== 四星武器 =====
    { name: "應急手段", mainStat: "敏捷提升", subStat: "物理傷害提升", skill: "壓制", rarity: "四星", type: "單手劍" },
    { name: "浪潮", mainStat: "智識提升", subStat: "攻擊提升", skill: "追襲", rarity: "四星", type: "單手劍" },
    { name: "全自動駭新星", mainStat: "智識提升", subStat: "法術提升", skill: "昂揚", rarity: "四星", type: "施術單元" },
    { name: "熒光雷羽", mainStat: "意志提升", subStat: "攻擊提升", skill: "壓制", rarity: "四星", type: "施術單元" },
    { name: "呼嘯守衛", mainStat: "智識提升", subStat: "攻擊提升", skill: "壓制", rarity: "四星", type: "手銃" },
    { name: "長路", mainStat: "力量提升", subStat: "法術提升", skill: "追襲", rarity: "四星", type: "手銃" },
    { name: "工業零點一", mainStat: "力量提升", subStat: "攻擊提升", skill: "壓制", rarity: "四星", type: "雙手劍" },
    { name: "淬火者", mainStat: "意志提升", subStat: "生命提升", skill: "粉碎", rarity: "四星", type: "雙手劍" },
    { name: "導師者道標", mainStat: "敏捷提升", subStat: "攻擊提升", skill: "昂揚", rarity: "四星", type: "長柄武器" },
    { name: "天使殺手", mainStat: "意志提升", subStat: "法術提升", skill: "壓制", rarity: "四星", type: "長柄武器" },

    // ===== 五星武器 =====
    { name: "鋼鐵餘音", mainStat: "敏捷提升", subStat: "物理傷害提升", skill: "巧技", rarity: "五星", type: "單手劍" },
    { name: "堅城鑄造者", mainStat: "智識提升", subStat: "終結技充能效率提升", skill: "昂揚", rarity: "五星", type: "單手劍" },
    { name: "逐鱗3.0", mainStat: "力量提升", subStat: "寒冷傷害提升", skill: "壓制", rarity: "五星", type: "單手劍" },
    { name: "十二問", mainStat: "敏捷提升", subStat: "攻擊提升", skill: "附術", rarity: "五星", type: "單手劍" },
    { name: "O.B.J.輕芒", mainStat: "敏捷提升", subStat: "攻擊提升", skill: "流轉", rarity: "五星", type: "單手劍" },
    { name: "仰止", mainStat: "敏捷提升", subStat: "物理傷害提升", skill: "夜幕", rarity: "五星", type: "單手劍" },
    { name: "悼亡詩", mainStat: "智識提升", subStat: "攻擊提升", skill: "夜幕", rarity: "五星", type: "施術單元" },
    { name: "莫奈何", mainStat: "意志提升", subStat: "終結技充能效率提升", skill: "昂揚", rarity: "五星", type: "施術單元" },
    { name: "迷失荒野", mainStat: "智識提升", subStat: "電磁傷害提升", skill: "附術", rarity: "五星", type: "施術單元" },
    { name: "布道自由", mainStat: "意志提升", subStat: "治療效率提升", skill: "醫療", rarity: "五星", type: "施術單元" },
    { name: "O.B.J.術識", mainStat: "智識提升", subStat: "源石技藝強度提升", skill: "追襲", rarity: "五星", type: "施術單元" },
    { name: "作品：眾生", mainStat: "敏捷提升", subStat: "法術提升", skill: "附術", rarity: "五星", type: "手銃" },
    { name: "O.B.J.迅極", mainStat: "敏捷提升", subStat: "終結技充能效率提升", skill: "迸發", rarity: "五星", type: "手銃" },
    { name: "理性告別", mainStat: "力量提升", subStat: "灼熱傷害提升", skill: "追襲", rarity: "五星", type: "手銃" },
    { name: "探驪", mainStat: "力量提升", subStat: "終結技充能效率提升", skill: "迸發", rarity: "五星", type: "雙手劍" },
    { name: "古渠", mainStat: "力量提升", subStat: "源石技藝強度提升", skill: "殘暴", rarity: "五星", type: "雙手劍" },
    { name: "終點之聲", mainStat: "力量提升", subStat: "生命提升", skill: "醫療", rarity: "五星", type: "雙手劍" },
    { name: "O.B.J.重荷", mainStat: "力量提升", subStat: "生命提升", skill: "效益", rarity: "五星", type: "雙手劍" },
    { name: "嵌合正義", mainStat: "力量提升", subStat: "終結技充能效率提升", skill: "殘暴", rarity: "五星", type: "長柄武器" },
    { name: "O.B.J.尖峰", mainStat: "意志提升", subStat: "物理傷害提升", skill: "附術", rarity: "五星", type: "長柄武器" },
    { name: "向心之引", mainStat: "意志提升", subStat: "電磁傷害提升", skill: "壓制", rarity: "五星", type: "長柄武器" },

    // ===== 六星武器 =====
    { name: "宏願", mainStat: "敏捷提升", subStat: "攻擊提升", skill: "附術", rarity: "六星", type: "單手劍" },
    { name: "不知歸", mainStat: "意志提升", subStat: "攻擊提升", skill: "流轉", rarity: "六星", type: "單手劍" },
    { name: "熔鑄火焰", mainStat: "智識提升", subStat: "攻擊提升", skill: "夜幕", rarity: "六星", type: "單手劍" },
    { name: "黯色火炬", mainStat: "智識提升", subStat: "灼熱傷害提升", skill: "附術", rarity: "六星", type: "單手劍" },
    { name: "扶搖", mainStat: "主能力提升", subStat: "暴擊率提升", skill: "夜幕", rarity: "六星", type: "單手劍" },
    { name: "熱熔切割器", mainStat: "意志提升", subStat: "攻擊提升", skill: "流轉", rarity: "六星", type: "單手劍" },
    { name: "顯赫聲明", mainStat: "主能力提升", subStat: "物理傷害提升", skill: "殘暴", rarity: "六星", type: "單手劍" },
    { name: "白夜新星", mainStat: "主能力提升", subStat: "源石技藝強度提升", skill: "附術", rarity: "六星", type: "單手劍" },
    { name: "使命必達", mainStat: "意志提升", subStat: "終結技充能效率提升", skill: "追襲", rarity: "六星", type: "施術單元" },
    { name: "滄溟星夢", mainStat: "智識提升", subStat: "治療效率提升", skill: "附術", rarity: "六星", type: "施術單元" },
    { name: "作品：蝕跡", mainStat: "意志提升", subStat: "自然傷害提升", skill: "壓制", rarity: "六星", type: "施術單元" },
    { name: "爆破單元", mainStat: "主能力提升", subStat: "源石技藝強度提升", skill: "迸發", rarity: "六星", type: "施術單元" },
    { name: "遺忘", mainStat: "智識提升", subStat: "法術提升", skill: "夜幕", rarity: "六星", type: "施術單元" },
    { name: "騎士精神", mainStat: "意志提升", subStat: "生命提升", skill: "醫療", rarity: "六星", type: "施術單元" },
    { name: "藝術暴君", mainStat: "智識提升", subStat: "暴擊率提升", skill: "切骨", rarity: "六星", type: "手銃" },
    { name: "領航者", mainStat: "智識提升", subStat: "寒冷傷害提升", skill: "附術", rarity: "六星", type: "手銃" },
    { name: "楔子", mainStat: "主能力提升", subStat: "暴擊率提升", skill: "附術", rarity: "六星", type: "手銃" },
    { name: "同類相食", mainStat: "主能力提升", subStat: "法術提升", skill: "附術", rarity: "六星", type: "手銃" },
    { name: "大雷斑", mainStat: "力量提升", subStat: "生命提升", skill: "醫療", rarity: "六星", type: "雙手劍" },
    { name: "赫拉芬格", mainStat: "力量提升", subStat: "攻擊提升", skill: "迸發", rarity: "六星", type: "雙手劍" },
    { name: "典範", mainStat: "主能力提升", subStat: "攻擊提升", skill: "壓制", rarity: "六星", type: "雙手劍" },
    { name: "昔日精品", mainStat: "意志提升", subStat: "生命提升", skill: "效益", rarity: "六星", type: "雙手劍" },
    { name: "破碎君王", mainStat: "力量提升", subStat: "暴擊率提升", skill: "粉碎", rarity: "六星", type: "雙手劍" },
    { name: "負山", mainStat: "敏捷提升", subStat: "物理傷害提升", skill: "效益", rarity: "六星", type: "長柄武器" },
    { name: "驍勇", mainStat: "敏捷提升", subStat: "物理傷害提升", skill: "巧技", rarity: "六星", type: "長柄武器" },
    { name: "J.E.T.", mainStat: "主能力提升", subStat: "攻擊提升", skill: "壓制", rarity: "六星", type: "長柄武器" }
];


// ==================== 基礎屬性（可用於定軌選擇三種） ====================

const mainStats = [
    "敏捷提升",
    "力量提升", 
    "意志提升",
    "智識提升",
    "主能力提升"
];


// ==================== 關卡資料 ====================
// 每個關卡有 8 種附加屬性 + 8 種技能屬性

const stages = {
    "樞紐區": {
        subStats: [
            "攻擊提升",
            "灼熱傷害提升",
            "電磁傷害提升",
            "寒冷傷害提升",
            "自然傷害提升",
            "源石技藝強度提升",
            "終結技充能效率提升",
            "法術提升"
        ],
        skills: [
            "強攻",
            "壓制",
            "追襲",
            "粉碎",
            "巧技",
            "迸發",
            "流轉",
            "效益"
        ]
    },
    "源石研究園": {
        subStats: [
            "攻擊提升",
            "物理傷害提升",
            "電磁傷害提升",
            "寒冷傷害提升",
            "自然傷害提升",
            "暴擊率提升",
            "終結技充能效率提升",
            "法術提升"
        ],
        skills: [
            "壓制",
            "追襲",
            "昂揚",
            "巧技",
            "附術",
            "醫療",
            "切骨",
            "效益"
        ]
    },
    "礦脈源區": {
        subStats: [
            "生命提升",
            "物理傷害提升",
            "灼熱傷害提升",
            "寒冷傷害提升",
            "自然傷害提升",
            "暴擊率提升",
            "源石技藝強度提升",
            "治療效率提升"
        ],
        skills: [
            "強攻",
            "壓制",
            "巧技",
            "殘暴",
            "附術",
            "迸發",
            "夜幕",
            "效益"
        ]
    },
    "供能高地": {
        subStats: [
            "攻擊提升",
            "生命提升",
            "物理傷害提升",
            "灼熱傷害提升",
            "自然傷害提升",
            "暴擊率提升",
            "源石技藝強度提升",
            "治療效率提升"
        ],
        skills: [
            "追襲",
            "粉碎",
            "昂揚",
            "殘暴",
            "附術",
            "醫療",
            "切骨",
            "流轉"
        ]
    },
    "武陵城": {
        subStats: [
            "攻擊提升",
            "生命提升",
            "電磁傷害提升",
            "寒冷傷害提升",
            "暴擊率提升",
            "終結技充能效率提升",
            "法術提升",
            "治療效率提升"
        ],
        skills: [
            "強攻",
            "粉碎",
            "殘暴",
            "醫療",
            "切骨",
            "迸發",
            "夜幕",
            "流轉"
        ]
    }
};


// ==================== 圖片名稱映射 ====================
// 用於處理武器名稱與圖片檔名不一致的情況
// 格式: "武器名稱": "圖片檔名（不含.png）"

const imageNameMap = {
    "布道自由": "佈道自由",
    "作品：蝕跡": "作品：蝕象",
    "作品：眾生": "作品：衆生",
    "O.B.J.尖峰": "O.B.J.尖峯",
    "導師者道標": "尋路者道標",
    "顯赫聲明": "顯赫聲名"
};
