const statueLinks = {
    次要: "https://poedb.tw/tw/Minor_Idol",
    傳奇: "https://poedb.tw/tw/Minor_Idol#%E5%82%B3%E5%A5%87",
    高貴: "https://poedb.tw/tw/Noble_Idol",
    卡瑪薩: "https://poedb.tw/tw/Kamasan_Idol",
    埋葬: "https://poedb.tw/tw/Burial_Idol",
    圖騰: "https://poedb.tw/tw/Totemic_Idol",
    征服者: "https://poedb.tw/tw/Conqueror_Idol"
};
const prefixOptions = {
    "1x1": [
        "你地圖中的深淵保險箱和冥河之尖，增加 (15~25)% 機率含有或掉落 1 個深淵珠寶 ",
        "你地圖中的深淵保險箱和冥河之尖，有 (6~10)% 機率掉落 1 個有 1 個深淵插槽的稀有物品 ",
        "增加 (300~350)% 你地圖中深淵保險箱和冥河之尖掉落的物品稀有度 ",
        "你地圖中的穿越增加 (4~6)% 怪物群大小 ",
        "(5~10)% 機率在你的地圖製造已捕捉野獸的複製體 ",
        "你地圖中的紅色野獸增加 (40~60)% 機率來自深潭 ",
        "你地圖中的紅色野獸增加 (40~60)% 機率來自獸性 ",
        "你地圖中的紅色野獸增加 (40~60)% 機率來自洞窟 ",
        "你地圖中的紅色野獸增加 (40~60)% 機率來自飛沙 ",
        "你地圖中的超越惡魔，增加 (35~45)% 機率為克塔什的信徒 ",
        "你地圖中的超越惡魔，增加 (35~45)% 機率為貝達特的信徒 ",
        "你地圖中的超越惡魔，增加 (35~45)% 機率為戈沃的信徒 ",
        "減少 (15~20)% 建造和升級防守塔的消耗 ",
        "你地圖中的凋落保險箱有 (15~25)% 更多機率含有凋落地圖 ",
        "你地圖中的裂痕增加產生 (15~20)% 魔法怪物 ",
        "你地圖中的逐夢者‧夏烏拉有 (20~30)% 機率被複製 ",
        "你地圖中的異念‧艾許有 (20~30)% 機率被複製 ",
        "你地圖中的截載者‧烏爾尼多有 (20~30)% 機率被複製 ",
        "你地圖中的黑暗餘燼‧索伏有 (20~30)% 機率被複製 ",
        "你地圖中的崩雪‧托沃有 (20~30)% 機率被複製 ",
        "你地圖中的裂痕增加 (35~45)% 機率含有 1 個裂痕頭目的抑制之手 ",
        "你地圖中被灼烙總督勢力影響的怪物群增加 (4~6)% 怪物群大小 ",
        "你地圖中的譫妄事件有 (6~10)% 機率產生 1 個額外獎勵類型 ",
        "你地圖中的譫妄事件有 (35~50)% 更高機率產生傳奇頭目 ",
        "你地圖中的譫妄頭目增加掉落 (20~30)% 幻像斷片 ",
        "你地圖中擊殺的譫妄怪物，增加 (10~20)% 獎勵進度 ",
        "你地圖中的譫妄怪物增加 (5~10)% 怪物群大小 ",
        "你地圖中的硫酸礦脈和保險箱有 (3~5)% 機率同時含有等量的碧藍礦 ",
        "增加 (30~40)% 你地圖中玩家身上神殿效果的持續時間 ",
        "你地圖中被禁錮的怪物有 (40~60)% 機率掉落 1 個有精髓詞綴的稀有物品 ",
        "你地圖中被禁錮的怪物有 (8~12)% 機率有 1 個額外精髓 ",
        "增加 (15~20)% 你的地圖內的爆炸範圍 ",
        "增加 (15~25)% 你的地圖內符文怪物掉落探險日誌的數量 ",
        "你地圖中的神諭增加 (20~30)% 冷卻時間恢復速度 ",
        "你地圖中的豐收怪物增加 (70~90)% 經驗 ",
        "你地圖中收割作物減少 (10~15)% 機率成長為黃色作物 ",
        "你地圖中收割作物減少 (10~15)% 機率成長為藍色作物 ",
        "你地圖中收割作物減少 (10~15)% 機率成長為紫色作物 ",
        "你地圖中走私者的祕寶增加 (35~45)% 機率掉落藍圖 ",
        "你地圖中掉落的劫盜契約書有 (40~60)% 更多機會需要開鎖、蠻力或洞察力 ",
        "你地圖中掉落的劫盜契約書有 (40~60)% 更多機會需要拆除、解咒師或陷阱解除 ",
        "你地圖中掉落的劫盜契約書有 (40~60)% 更多機會需要靈敏、詐欺或工程 ",
        "你地圖中的密教成員有 (40~60)% 更高機率伴隨他們的首領 ",
        "你地圖中處決的永生密教成員，有 (40~60)% 機率獲得 1 層額外階級 ",
        "你地圖中的戰亂中士有 (6~10)% 額外機率有獎勵 ",
        "你地圖中的戰亂事件有 (25~35)% 更高機率含有 1 個將軍 ",
        "你地圖中從靜止釋放的戰亂保險箱，增加 (35~50)% 範圍釋放其它怪物和保險箱 ",
        "你地圖中的最後通牒事件，增加 (15~20)% 最終回合有 1 個頭目的機率 ",
        "你地圖中的通諜事件，增加 (40~60)% 機率要求你保護神壇 ",
        "你地圖中的通牒獎勵，增加 (20~30)% 機率為傳奇物品 ",
        "你地圖中的通牒獎勵，增加 (20~30)% 機率為飾品 ",
        "你地圖中的通牒獎勵，增加 (20~30)% 機率為通貨 ",
        "你地圖中的通諜事件，增加 (40~60)% 機率要求你擊敗數波怪物 ",
        "你地圖中的通諜事件，增加 (40~60)% 機率要求你站在石陣內 ",
        "你地圖中的通牒獎勵，增加 (20~30)% 機率為命運卡 ",
        "你地圖中的通牒獎勵，增加 (20~30)% 機率為寶石 ",
        "你地圖中的通諜事件，增加 (40~60)% 機率只要求你存活 ",
        "你地圖中在祭祀神壇重骰恩賜之物，減少 (8~12)% 貢禮消耗 ",
        "你地圖中在祭祀神壇延遲恩賜之物，再次出現會加速 (20~30)% ",
        "你地圖中的傳奇怪物在祭祀神壇被擊殺時，獲得的貢禮增加 (40~60)% ",
        "你地圖中的傳奇怪物增加 (75~100)% 的機率掉落聖甲蟲 ",
        "你地圖中的保險箱增加 (50~70)% 機率為奧術師的保險箱 ",
        "你地圖中的保險箱增加 (50~70)% 機率為製圖師的保險箱",
        "你地圖中的保險箱增加 (50~70)% 機率為命運的保險箱",
        "你地圖中的保險箱增加 (40~60)% 機率為珠寶匠的保險箱",
        "你的地圖有 (4~6)% 機率獎勵 2 倍吞噬天地事件的進度",
        "在吞噬天地勢力你的地圖掉落的異能靈液有 (4~6)% 機率被複製 ",
        "你地圖中的罪魂增加 (40~60)% 持續時間",
        "在你已汙染地圖中掉落的物品有 (1~2)% 機率為已汙染",
        "稀有怪物掉落的物品有 (3~5)% 機率為已汙染 ",
        "你地圖中掉落的偵查報告有 (2~4)% 機率改為掉落超凡偵查報告",
        "你地圖中的偵查報告有 (2~4)% 機率改為掉落譫妄偵查報告 ",
        "你地圖中的偵查報告有 (6~10)% 機率改為掉落全面偵查報告 ",
        "你地圖中掉落的偵查報告有 (4~6)% 機率改為掉落瓦爾偵查報告",
        "你地圖中的偵查報告有 (3~5)% 機率改為掉落技工偵查報告",
        "你地圖中掉落的偵查報告有 (4~6)% 機率改為掉落卓越偵查報告 ",
    ],
    "1x2": [
        "你地圖中的深淵增加 (12~18)% 怪物生成",
        "你地圖中的深淵怪物增加 (30~40)% 經驗",
        "你地圖中的深淵裂縫有 (8~12)% 機率增加 100% 產生怪物",
        "你地圖中的深淵坑洞有 (8~12)% 機率增加 100% 產生的怪物",
        "你地圖中每個該深淵先前坑洞的深淵裂縫有 (3~5)% 機率產生的全部怪物至少都是魔法",
        "你地圖中的穿越有 (15~25)% 機率讓全部怪物至少為魔法",
        "增加 (30~40)% 你地圖野生盜賊流亡者的掉落物品稀有度",
        "你地圖中的盜賊流亡者有 (15~20)% 機率掉落 1 個額外通貨",
        "含有野獸的你的地圖有 (12~18)% 機率含有 1 個額外紅色野獸",
        "埃哈在你地圖中對傳奇怪物造成 (600~800)% 更多傷害",
        "埃哈在你地圖中增加 (60~80)% 冷卻時間恢復速度",
        "你地圖中的超越傳送門，增加 (20~25)% 合併範圍",
        "增加 (10~15)% 你地圖中超越惡魔掉落玷污通貨的數量",
        "你地圖中凋落事件的路線有 (6~8)% 機率有 1 個額外獎勵保險箱",
        "凋落保險箱有 (15~25)% 機率掉落 1 個額外獎勵",
        "你地圖中的凋落頭目被擊敗時有 (14~18)% 機率附加 1 個額外的獎勵保險箱",
        "你地圖中的凋落保險箱增加 (25~35)% 含有 1 瓶油瓶",
        "你地圖中凋落怪物產生比平常快 (40~60)%",
        "你地圖中的裂痕頭目有 (12~16)% 機率掉落 2 倍裂痕裂片",
        "增加 (20~25)% 你地圖中裂痕之手掉落裂痕裂片的數量",
        "你地圖中的裂痕增加 (80~120)% 機率為索伏",
        "你地圖中的裂痕增加 (80~120)% 機率為托沃",
        "你地圖中的裂痕增加 (80~120)% 機率為艾許",
        "你地圖中的裂痕增加 (70~100)% 機率為烏爾尼多",
        "你地圖中的裂痕增加 (60~80)% 機率為夏烏拉",
        "增加 (20~25)% 你地圖中裂痕怪物掉落裂痕裂片的數量",
        "你地圖的裂痕怪物增加 (3~7)% 機率掉落 1 個裂痕傳奇物品",
        "你地圖中被灼烙總督影響的怪物有 (0.5~0.7)% 機率掉落有 1 個灼烙總督固定詞綴的物品",
        "你地圖中被征服者勢力影響的怪物增加 (8~12)% 怪物群大小",
        "你地圖中的譫妄迷霧消散比平常慢 (2~5)%",
        "你地圖中的譫妄頭目增加 (30~40)% 機率掉落傳奇星團珠寶",
        "你地圖中的譫妄怪物增加 (15~25)% 機率掉落星團珠寶",
        "來自譫妄獎勵的星團珠寶，有 (6~8)% 機率為稀有或已汙染",
        "增加 (8~10)% 你地圖中的魔暴硫酸礦脈和寶箱含有的硫酸",
        "每層醉硫酸會使你的移動速度增加 (8~12)%",
        "增加 (25~35)% 你地圖中玩家身上神殿的增益效果",
        "被精髓囚禁的怪物有 (20~25)% 機率含有 1 個遺忘的污染器皿",
        "增加 (10~15)% 怪物掉落文物的數量",
        "增加 (6~10)% 你的地圖內爆裂物的數量",
        "增加 (15~20)% 你地圖中怪物掉落刷新商人的通貨數量",
        "你地圖中的探險爆炸連鎖減緩 (12~18)%",
        "你地圖中的神諭有 (40~60)% 機率掉落 1 個額外有疊層的通貨碎片",
        "你地圖中收割作物增加 (35~45)% 機率成長至階級 4 的作物",
        "你地圖中收割的作物增加 (25~35)% 機率含有階級 3 的作物",
        "你地圖中掉落的劫盜契約書有 (75~125)% 更多機會需要等級 3 的工作",
        "你地圖中掉落的劫盜契約書有 (75~125)% 更多機會需要等級 4 的工作",
        "你地圖中掉落的劫盜契約書有 (75~125)% 更多機會需要等級 5 的工作",
        "你含有走私者的祕寶的地圖，有 (25~35)% 機率含有 1 個額外走私者的祕寶",
        "你地圖中的永生密教成員有 (120~160)% 更多機率交涉物品",
        "在你的地圖中擊敗密教成員時根據其擁有的每項裝備增加 (16~24)% 物品稀有度",
        "增加 (100~150)% 你地圖中戰亂中士掉落物品的稀有度",
        "你地圖中的戰亂事件增加 (40~60)% 持續時間",
        "你地圖中的戰亂怪物靜止時增加承受 (30~40)% 傷害",
        "你地圖中的戰亂怪物增加 (10~15)% 怪物群大小",
        "你地圖中的通牒神壇，增加 (30~40)% 生命",
        "你地圖中的通牒石陣，增加 (15~20)% 範圍",
        "你地圖中的通牒獎勵，增加 (25~35)% 機率為最後通牒雕刻",
        "你地圖中只要求你存活的通諜事件，減少 (3~5)% 持續時間",
        "你地圖中要求你擊敗數波怪物的通諜事件，減少 (3~5)% 擊殺怪物的數量",
        "增加 (50~75)% 特殊獎勵出現於祭祀神壇的機率",
        "你地圖中在祭祀神壇重骰恩賜之物，有 (0.8~1.2)% 機率不消耗貢禮",
        "你地圖中的祭祀神壇可以同時增加 (15~25)% 產生怪物的數量",
        "你地圖中祭祀神壇給予的祭祀碎片，增加 (20~25)% 堆疊大小",
        "你的地圖中掉落的聖甲蟲為製圖聖甲蟲的機率增加 (60~80)%",
        "你地圖中的保險箱有 (40~60)% 機率被額外 1 群怪物守衛",
        "增加 (15~20)% 你地圖中保險箱的物品數量",
        "擊殺被附身的怪物時有 (1~2)% 機率釋放罪魂",
    ],
    "1x3": [
        "你的地圖中不會前往絕望深淵的深淵，增加 (40~60)% 機率前往冥河之尖",
        "你的地圖中的深淵增加 (40~60)% 機率引導至絕望深淵",
        "你的地圖中的深淵裂縫有 (10~20)% 機率產生的全部怪物至少都是魔法",
        "你的地圖中的深淵坑洞有 (10~20)% 機率產生的全部怪物至少都是魔法",
        "擊殺你的地圖中非居住的建造者，有 (30~50)% 機率將 1 額外提升階級加至存活建造者的房間",
        "你的地圖中的野生盜賊流亡者有 (75~100)% 機率被罪魂附身",
        "你含有可捕捉野獸的地圖，含有 (3~4) 隻額外黃色野獸",
        "你的地圖中捕獲的紅色野獸有 (40~60)% 機率獲得 1 個詞綴，使其在血腥神壇獻祭時有一定機率不會被消耗",
        "你的地圖中的紅色野獸有 (16~24)% 機率成對出現",
        "你的地圖中的超越怪物增加 (20~30)% 經驗值",
        "你的地圖的超越傳送門增加 (25~35)% 機率產生傳奇頭目",
        "你的地圖中克塔什的信徒超越惡魔，掉落 (20~25)% 更多命運卡",
        "你的地圖中貝達特的信徒超越惡魔，掉落 (20~25)% 更多基礎通貨",
        "的地圖中戈沃的信徒超越惡魔，掉落 (20~25)% 更多傳奇物品",
        "你的地圖中的凋落事件產生 (25~35)% 更多非傳奇怪物",
        "你的地圖掉落的油瓶有 (20~25)% 機率高 1 階",
        "你的地圖中的凋落怪物增加承受 (30~40)% 傷害",
        "你的地圖中的裂痕增加 (35~45)% 機率含有 1 個頭目",
        "你的地圖中裂痕頭目掉落的裂痕石有 (3~5)% 機率為無暇的",
        "你的地圖中的裂痕開啟和關閉比平常快 #%",
        "你的地圖中的裂痕開啟和關閉比平常慢 #%",
        "你的地圖中的裂痕有 (10~15)% 機率含有 1 隻烈許烏拉之手",
        "你的地圖中的裂痕增加 (8~12)% 怪物密度",
        "當灼烙總督的勢力第一次出現在你的地圖上時，有 (40~60)% 機率產生 1 個灼烙總督祭壇",
        "你的地圖中的鏡子遠方的譫妄強化比平常快 (35~50)%",
        "你的地圖中的譫妄迷霧在消散前持續額外 (10~15) 秒",
        "你的地圖中的譫妄獎勵增加 (8~12)% 機率給予譫妄玉",
        "你的地圖中的魔暴硫酸礦脈和寶箱，有 (4~6)% 機率含有 2 倍硫酸",
        "每層醉硫酸會使你的傷害增加 (30~40)%",
        "你的地圖中的神殿有 (40~60)% 機率被 1 群額外怪物守護",
        "你的地圖中被塑者勢力影響的怪物群，增加 (15~25)% 怪物群大小",
        "475781你的地圖中被尊師勢力影響的怪物增加 (15~25)% 怪物群大小",
        "你的地圖中被禁錮的怪物有 (12~17)% 機率有 3 個額外精髓",
        "你的地圖中的遺跡有 (25~35)% 機率有 1 個額外後綴",
        "你的地圖中的探險增加 (80~100)% 機率被圖貞領導",
        "你的地圖中的探險增加 (50~60)% 機率被丹尼格領導",
        "你的地圖中的探險怪物以額外 (6~10)% 失去的生命產生",
        "你的地圖中的探險增加 (80~100)% 機率被羅格領導",
        "你的地圖中的探險增加 (80~100)% 機率被關南領導",
        "你的地圖中的神諭有 (20~25)% 機率被 1 個強大的神諭頭目取代",
        "你的地圖中的豐收怪物增加 (12~18)% 生靈之力的數量",
        "你的地圖中的豐收有 (8~12)% 機率使未被選中的作物不枯萎",
        "你的地圖中的聖殿密園有 (40~60)% 機率含有 1 次額外豐收",
        "你的地圖中的走私者的祕寶增加 (40~60)% 機率掉落契約書",
        "你的地圖中的走私者的祕寶根據區域中每個開啟的走私者的祕寶，掉落 (8~12)% 更多盜賊之印",
        "你的地圖中掉落的劫盜契約書有 (70~90)% 更多機會瞄準高價值的目標",
        "你的地圖中掉落的劫盜契約書有 (45~65)% 更多機會瞄準珍貴的目標",
        "你的地圖中的永生密教成員增加 (20~25)% 機率會有支援",
        "你的地圖中永生密教成員有 (40~60)% 機率掉落 1 個額外隱匿物品",
        "你的地圖中永生密教成員掉落物品增加 (40~60)% 稀有度",
        "你的地圖中戰亂事件增加 (100~150)% 機率含有 1 支卡魯軍隊",
        "你的地圖中戰亂事件增加 (100~150)% 機率含有 1 支不朽帝國軍隊",
        "你的地圖中戰亂事件增加 (80~120)% 機率含有 1 支瓦爾軍隊",
        "你的地圖中戰亂事件增加 (75~100)% 機率含有 1 支聖宗軍隊",
        "你的地圖中戰亂事件增加 (60~80)% 機率含有 1 支馬拉克斯軍隊",
        "你的地圖中戰亂怪物或戰亂保險箱掉落的裂片有 (15~20)% 機率被複製",
        "你的地圖中戰亂保險箱掉落的裂片有 (20~25)% 機率被複製",
        "你的地圖中戰亂怪物掉落的裂片有 (20~25)% 機率被複製",
        "你的地圖中的有獎勵的戰亂怪物有 (8~12)% 機率獲得 2 個額外獎勵，若沒有則有 (15~20)% 機率獲得 1 個額外獎勵",
        "你的地圖中被天佑勇者影響的怪物群，增加 (5~10)% 怪物群大小",
        "你的地圖中被天佑勇者影響的物品掉落，增加 (5~10)% 物品數量",
        "你的地圖中被天佑勇者影響的物品掉落，增加 (10~20)% 物品稀有度",
        "你的地圖中的通諜事件，增加 (15~20)% 產生怪物的數量",
        "你的地圖中的通牒怪物，減少 (40~60)% 經驗",
        "你的地圖中掉落的最後通牒雕刻，增加 (40~60)% 機率為傳奇物品",
        "你的地圖中掉落的最後通牒雕刻，增加 (40~60)% 機率為通貨",
        "你的地圖中掉落的最後通牒雕刻，增加 (40~60)% 機率為命運卡",
        "你的地圖中被獻祭至祭祀神壇的怪物，增加 (20~25)% 貢禮",
        "你的地圖中的祭祀神壇產生怪物，加速 (15~20)%",
        "你的地圖中在祭祀神壇延遲恩賜之物，減少 (15~20)% 貢禮消耗",
        "你的地圖中的最終地圖頭目有 (20~25)% 機率掉落 1 個額外聖甲蟲",
        "你的地圖中的稀有怪物有 (40~60)% 機率根據所受影響的怪物詞綴掉落聖甲蟲",
        "你的地圖中來自保險箱的通貨掉落為 2 倍",
        "你的地圖中來自保險箱的地圖掉落為 2 倍",
        "你的地圖中來自保險箱的命運卡掉落為 2 倍",
        "你的地圖中來自保險箱的寶石掉落為 2 倍",
        "你的地圖中吞噬天地影響的怪物有 (0.8~1.2)% 機率掉落有 1 個吞噬天地固定詞綴的物品",
        "你的地圖中發現吞噬天地祭壇，增加 (15~20)% 機率",
        "你的地圖中傳奇怪物掉落的物品有 (10~15)% 機率為已汙染",
        "你的地圖中的瓦爾區域，瓦爾容器的獎勵有 (15~20)% 機率被複製",
        "你的地圖中掉落的地圖，增加 (25~35)% 稀有度",
    ],
    "2x2": [
        "你的地圖中深淵保險箱或冥河之尖掉落的深淵珠寶，有 (15~25)% 機率為已汙染且有 5 或 6 個隨機詞綴",
        "你的地圖中深淵保險箱和冥河之尖掉落的深淵珠寶，有 1% 機率為稀有和已汙染",
        "你的地圖中的深淵坑洞有 (14~20)% 機率產生 5 個額外稀有怪物",
        "你的地圖中的深淵保險箱和冥河之尖，有 (0.03~0.05)% 機率掉落 1 個深淵聖甲蟲",
        "你的地圖中不會前往絕望深淵的深淵，如果可以會導向 4 個坑洞",
        "你的地圖中不會前往絕望深淵的深淵，如果可以會導向至少 3 個坑洞",
        "你的地圖中的深淵根據該深淵每個先前坑洞，增加 (8~12)% 怪物",
        "你的地圖中擊殺居住的建造者，將提升他們的階級加至存活建造者的房間",
        "你的地圖中的穿越含有 1 個瓦爾鮮肉商",
        "你的地圖有穿越必定有 4 個穿越",
        "你的地圖中穿越擊殺所獲得的時間加倍",
        "你的地圖中的穿越含有受詛咒的寶藏",
        "你的地圖中的野生盜賊流亡者有 (40~60)% 機率有額外獎勵",
        "你的地圖中的野獸有更高機率為罕見的品種",
        "你的地圖中完成埃哈的任務後，他會持續留在你地圖中",
        "你的地圖中的黃色野獸有 (12~18)% 機率被紅色野獸取代",
        "你的地圖中的野獸有 (15~20)% 機率掙脫",
        "你的地圖中掙脫的野獸獲得野獸盛怒",
        "你的地圖中擊敗野獸後會根據野獸身上擁有的野獸盛怒獲得獵人的狡猾",
        "你的地圖中擊殺怪物，增加 (12~18)% 機率產生超越傳送門",
        "你的地圖中擊敗超越頭目時獲得惡魔能量",
        "你的地圖中 (3~5) 個凋落保險箱內含物品的種類很幸運",
        "你的地圖中的凋落保險箱有 (5~10)% 機率可以再度開啟",
        "你的地圖中完成一個凋落事件會賦予所有玩家凋落之境",
        "你的地圖中的凋落塔在凋落事件後可以被回收",
        "你的地圖中更高階級的塔會給予更好的回收獎勵",
        "你的地圖中回收獎勵會因為事件期間建造每座不同的塔而優化",
        "你的地圖中被擊敗的裂痕頭目有 (3~5)% 機率掉落 1 顆裂痕石",
        "你的地圖中的裂痕含有 (2~3) 個額外抑制之手",
        "你的地圖中的裂痕有 (2~3)% 機率含有佈施者．烈許烏拉",
        "你的地圖中的抑制之手開啟時，有 (3~5)% 機率產生 1 個裂痕頭目",
        "你的地圖有 (10~15)% 機率獎勵 2 倍灼烙總督事件的進度",
        "你的地圖在灼烙總督勢力下掉落的異能灰燼有 (10~15)% 機率被複製",
        "你的地圖中的譫妄事件有 (8~12)% 機率產生 3 個額外獎勵類型",
        "你的地圖中掉落幻像斷片的堆疊數量增加 (20~30)%",
        "你的地圖中的譫妄傳奇怪物有 (1~2)% 機率掉落 1 個額外譫妄玉",
        "你的地圖中的譫妄傳奇怪物有 (2~3)% 機率掉落 1 個額外星團珠寶",
        "你的地圖中的魔暴硫酸礦脈和保險箱被硫酸堆積怪物守衛",
        "你的地圖中每層醉硫酸會使你獲得 +(2~3)% 所有最大元素抗性",
        "你的地圖中發現的魔暴硫酸礦脈和保險箱含有災難靈魂",
        "你的地圖中的神殿至少被 1 群魔法怪物守護",
        "你的地圖中的神殿給予 1 個額外隨機神殿效果",
        "你的地圖中的神殿有 (8~12)% 機率為貪婪神殿",
        "你的地圖中被禁錮的怪物擁有至少 1 個最高可能階級的精髓",
        "你的地圖中掉落的精髓有 (25~35)% 機率高 1 階",
        "你的地圖中對被禁錮的怪物使用腐化遺駭，將所有精髓以被禁錮的怪物身上的精髓之一取代",
        "你的地圖中爆裂物的放置距離增加 (80~120)%",
        "你的地圖中的探險有 +(1~2) 個遺跡",
        "你的地圖增加 (20~25)% 符文怪物印記的數量",
        "你的地圖中神諭掉落的通貨碎片可能掉落為通貨",
        "你的地圖中收割的作物有 (4~8)% 機率產生複製的怪物",
        "你的地圖中收割的作物有 (10~15)% 機率產生 1 個額外怪物",
        "你的地圖中豐收怪物掉落的生靈之力有 (10~15)% 機率被複製",
        "你的地圖中掉落的藍圖有 (10~15)% 機率為全部揭露",
        "你的地圖含有走私者的祕寶，有 (4~6)% 機率含有 6 個額外走私者的祕寶",
        "你的地圖中走私者的祕寶根據每個開啟的走私者的祕寶，增加 (10~15)% 機率含有藍圖",
        "你的每張地圖，哈克會在你開啟第一個走私者的祕寶時伴隨你",
        "你的地圖中與密教成員交涉物品時，掉落 200% 更多物品",
        "你的地圖完成時，獲得 1 個隨機永生密教藏匿處的 (10~15) 情報",
        "你的地圖中的試煉迷宮有 (20~25)% 機率給予優化的女神祭品",
        "你的地圖中的戰亂事件含有 2 個額外中士",
        "你的地圖中有 1 個將軍的戰亂事件有 2 個將軍",
        "你的地圖中的永恆裂片有 (0.5~0.75)% 機率改為掉落永恆徽印",
        "你的地圖中最後通牒事件給予的獎勵，有如你完成 1 額外回合",
        "你的地圖中通牒頭目掉落滿疊層的隨機催化劑",
        "你的地圖中的通牒獎勵，有 (20~25)% 機率被複製",
        "你的地圖有祭祀神壇必定有 4 個祭祀神壇",
        "你的地圖中的祭祀神壇可以重骰恩賜之物額外 1 次",
        "你的地圖中完成最後一個祭祀神壇，有 (15~20)% 機率掉落 1 個浸血碑器",
        "你的地圖裝置有 (3~5)% 機率不消耗聖甲蟲",
        "你的地圖中掉落的聖甲蟲有更高機率為罕見的品種",
        "你的地圖中的保險箱至少為稀有",
        "你的地圖內的保險箱已汙染",
        "你的地圖中的保險箱有 (5~9)% 機率可再次被開啟",
        "你的追憶地圖中的追憶怪物增加 (20~30)% 怪物群大小",
        "你的地圖中被吞噬天地勢力影響的怪物群增加 (25~35)% 怪物群大小",
        "你的地圖中的罪魂有更高機率為罕見的品種",
        "你的地圖在釋界的見證下擊敗地圖頭目時，有 (10~15)% 機率視為見證 1 個額外隨機地圖頭目",
    ]
};
const legendSuffixOptions = {
    "1x1": [
        "巨靈之眼 次要魔偶-你的地圖上的聖甲蟲效果會根據每個空地圖裝置欄位增加 50%",
        "孤獨冒險者 次要魔偶-增加 10% 怪物群大小、你的每張地圖只會開啟 1 個傳送門",
        "命運的轉折 次要魔偶、你的已汙染稀有地圖和任何套用的地圖工藝選項、在打開時會隨機調整、因此受影響的地圖會有 1 到 3 個隨機地圖詞綴",
        "創造之泉 次要魔偶-你地圖中的怪物造成 (25~30)% 更少傷害、你地圖中的怪物有 (40~50)% 更多生命",
        "毀滅之舞 次要魔偶-你地圖中的怪物造成 (20~25)% 更多傷害、你地圖中的怪物有 (25~30)% 更少生命",
        "單一焦點 次要魔偶-掉落的地圖有 (200~220)% 更多機率為幸運地圖、你地圖中掉落的非幸運地圖改為掉落基礎通貨",
        "異能凝視 次要魔偶-被吞噬天地影響的異能祭壇有 1 個額外劣勢、被吞噬天地影響的異能祭壇增加 (50~60)% 優勢效果",
        "宇宙之怒 次要魔偶-被灼烙總督影響的異能祭壇有 (50~60)% 機率有 1 個額外優勢、被灼烙總督影響且有 1 個額外優勢的異能祭壇，增加 (80~100)% 劣勢的效果",
        "陰影塑造 次要魔偶-掉落的地圖不是你的幸運地圖、你的每個不同幸運地圖，使你地圖中掉落的地圖 +1% 機率有 1 個特殊固定詞綴",
        "極限考古學 次要魔偶-增加 (200~250)% 你的地圖內的爆炸範圍、增加 (100~150)% 你地圖中爆裂物的放置距離、你地圖中的探險怪物以額外 (10~15)% 失去的生命產生、爆裂物數量為 1",
        "作物輪作 次要魔偶-你地圖中的豐收作物只會含有階級 1 的作物、豐收你地圖中的作物，有機率升級不同顏色的作物階級",
        "永恆鬥爭 次要魔偶-你地圖中的戰亂事件沒有計時器、打破處於靜止狀態的怪物和保險箱會導致碎裂、你地圖中的戰亂事件開始於碎裂發生",
        "無盡惡夢 次要魔偶-你地圖中的譫妄迷霧永不消散、你地圖中的譫妄難度為雙倍，且隨著與鏡子的距離增加、你的地圖不會掉落幻像斷片、你的地圖不會掉落譫妄玉",
        "不變教義 次要魔偶-不能重骰你地圖中祭祀神壇的恩賜之物、你地圖中被獻祭至祭祀神壇的怪物，獲得 (100~150)% 更多貢禮",
        "武斷原則 次要魔偶-你地圖中祭祀神壇的恩賜之物花費，隨機 90% 更少至 80% 更多",
        "無盡潮汐 次要魔偶-你地圖中的超越傳送門不能產生傳奇頭目、你地圖中的超越傳送門，有 (40~50)% 更小合併範圍",
        "死者之言 次要魔偶-你地圖中的罪魂可以附身玩家 20 秒、你地圖中的罪魂不能附身怪物",
        "卡西亞的驕傲 次要魔偶-你地圖中的凋落怪物，承受 (65~75)% 更少來自玩家和他們召喚物的傷害、你地圖中的凋落防守塔和它們的召喚物造成 (300~400)% 更多傷害",
        "細膩鑑定師 次要魔偶-你地圖的物品掉落數量詞綴，以 300% 它們的值套用至物品掉落稀有度",
        "清醒夢境 次要魔偶-你地區的瓦爾區域不再被汙染",
        "毀滅遊戲 次要魔偶-當見證地圖頭目時，釋界施放災害上升，召喚 1 至 3 個額外輿圖頭目、地圖中剩餘的怪物較少時、召喚的額外頭目數量較多、每張地圖最終地圖頭目的詞綴，同時套用至這些召喚的頭目",
        "大膽行動 次要魔偶-天佑勇者套用 1 個額外隨機工藝、天佑勇者工藝選項 100% 更多消耗",
        "困苦關卡 次要魔偶-玩家不能選擇每回合套用的通牒詞綴、你地圖中的通諜事件最多持續 13 回合、最終回合不會有頭目",
        "毀滅賭注 次要魔偶-你地圖中的通牒怪物使用它們特殊能力套用毀滅、到達 7 層毀滅時失敗、你地圖中的通牒怪物和詞綴，造成 (50~60)% 更少傷害",
        "整體勘探 次要魔偶-你地圖中剩餘的怪物少於 50 時，最終地圖頭目受荒林妖精強化",
        "黑指 次要魔偶-你的地圖不會含有聖殿密園、你的地圖不會掉落豐收聖甲蟲、你的地圖有 +5% 機率含有可以透過、輿圖天賦關閉的其他額外內容",
        "太陽寵愛 次要魔偶-你的地圖不會含有深淵、你的地圖不會掉落深淵聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "次元壁壘 次要魔偶-你的地圖不會含有裂痕、你的地圖不會掉落裂痕聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "貿易禁令 次要魔偶-你的地圖不會含有探險事件、你的地圖不會掉落探險聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "領域封鎖 次要魔偶-你的地圖不會含有戰亂事件、你的地圖不會掉落戰亂聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "道德審查 次要魔偶-你的地圖不會含有最後通牒、你的地圖不會掉落通牒聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "細菌解方 次要魔偶-你的地圖不會含有凋落事件、你的地圖不會掉落凋落聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "世俗目光 次要魔偶-你的地圖不會含有祭祀神壇、你的地圖不會掉落祭祀聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "筆直窄道 次要魔偶-你的地圖不會掉落盜賊之印、契約書和藍圖、你的地圖不會含有走私者的祕寶、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "不祥的寂靜 次要魔偶-你的地圖不會含有譫妄之鏡、你的地圖不會掉落譫妄聖甲蟲、你的地圖有 +5% 機率含有可以透過輿圖天賦關閉的其他額外內容",
        "打砸搶 次要魔偶-你地圖中的每個戰亂含有 1 個額外征戰儲物箱、你地圖中的戰亂保險箱含有 1 個額外隨機獎勳、你地圖中的戰亂事件增加 (-80~-60)% 持續時間",
        "晶化之力 次要魔偶-根據你地圖中殺死的任何被禁錮的怪物，給予地圖頭目 1 種隨機精髓詞綴",
        "補給充足 次要魔偶-密教成員出現在你的地圖中時會獲得一個額外裝備、增加 (30~50)% 你地圖中永生密教目標事件獲取的情報、你地圖中密教首領掉落 1 個額外隱匿物品",
        "感知的偉大 次要魔偶-你地圖中的譫妄獎勳類型，在地圖完成時獲得 +1 數量、你地圖中擊殺的譫妄怪物。增加 (-30~-20)% 獎勳進度",
        "扭曲之願 次要魔偶-你地圖中的通牒詞綴，如果可能以高 1 階級開始、你地圖中的最後通牒事件，每回合減少 3% 範圍",
    ],
    "1x2": ["傳奇效果A", "傳奇效果B"],
    "1x3": ["傳奇效果C", "傳奇效果D"],
    "2x2": ["傳奇效果E", "傳奇效果F"]
};
const blocks = [
    { w: 1, h: 1, label: "次要", type: "minor" },
    { w: 1, h: 1, label: "傳奇", type: "legend" },
    { w: 2, h: 1, label: "高貴", type: "normal" },
    { w: 1, h: 2, label: "卡瑪薩", type: "normal" },
    { w: 3, h: 1, label: "埋葬", type: "normal" },
    { w: 1, h: 3, label: "圖騰", type: "normal" },
    { w: 2, h: 2, label: "征服者", type: "normal" }
];

// 用於儲存已放置神像的效果
const placedStatues = new Map();

// 初始化下拉選單
function initializeStatueSelects() {
    const statueCards = document.querySelectorAll('.bg-gray-800\\/80');
    
    statueCards.forEach((card, index) => {
        const title = card.querySelector('a').textContent;
        const selects = card.querySelectorAll('select');
        const searchInput = card.querySelector('input[type="text"]');
        
        // 清空所有選單
        selects.forEach(select => {
            select.innerHTML = '<option value="">選擇效果</option>';
        });

        // 傳奇神像使用 legendSuffixOptions
        if (title === '傳奇') {
            const select = selects[0];
            legendSuffixOptions['1x1'].forEach(effect => {
                const option = document.createElement('option');
                option.value = effect;
                option.textContent = effect;
                select.appendChild(option);
            });
        } else {
            // 其他神像使用 prefixOptions
            const sizes = ['1x1', '1x2', '1x3', '2x2'];
            selects.forEach((select, i) => {
                if (i < sizes.length) {
                    prefixOptions[sizes[i]].forEach(effect => {
                        const option = document.createElement('option');
                        option.value = effect;
                        option.textContent = effect;
                        select.appendChild(option);
                    });
                }
            });
        }

        // 為搜尋框添加事件監聽器
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchText = e.target.value.toLowerCase();
                
                // 遍歷該神像的所有下拉選單
                selects.forEach(select => {
                    const options = Array.from(select.options);
                    options.forEach(option => {
                        const text = option.text.toLowerCase();
                        
                        // 保留預設選項
                        if (option.value === '') {
                            option.style.display = '';
                            return;
                        }

                        // 根據搜尋文字顯示或隱藏選項
                        option.style.display = text.includes(searchText) ? '' : 'none';
                    });
                });
            });
        }

        // 為每個 select 添加 change 事件監聽器
        selects.forEach(select => {
            select.addEventListener('change', updateEffectStats);
        });
    });
}

// 當頁面載入時初始化下拉選單
document.addEventListener('DOMContentLoaded', () => {
    // 初始化神像選擇區的下拉選單
    initializeStatueSelects();

    // 初始化格子座標
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        if (!cell.classList.contains('cell-disabled')) {
            const [_, row, col] = cell.id.match(/cell-(\d+)-(\d+)/);
            const coordSpan = document.createElement('span');
            coordSpan.textContent = `${col},${row}`;
            coordSpan.className = 'absolute text-gray-500/50 text-sm pointer-events-none select-none';
            cell.style.position = 'relative';
            cell.appendChild(coordSpan);
        }
    });

    // 初始化拖放功能
    initializeDragAndDrop();

    // 載入儲存的神像配置
    loadStatuesFromLocalStorage();

    // 顯示神像資料按鈕功能
    const showDataButton = document.querySelector('button:first-child');
    showDataButton.addEventListener('click', showStatueData);

    // 115模式按鈕功能
    const mode115Button = document.querySelector('button:nth-child(2)');
    let is115ModeActive = false;

    mode115Button.addEventListener('click', () => {
        const cell = document.getElementById('cell-0-5');
        
        // 檢查是否要啟用 115 模式
        if (!is115ModeActive) {
            // 檢查該格是否已放置神像
            if (cell.classList.contains('occupied')) {
                showNotification('該座標 (5,0) 已存在神像，請先移除神像後再啟用 115 模式');
                return;
            }
        }
        
        is115ModeActive = !is115ModeActive;

        if (is115ModeActive) {
            cell.classList.add('cell-disabled');
            mode115Button.style.background = 'linear-gradient(to bottom, #ffd700, #b8860b)';
            // 移除座標顯示
            const coordSpan = cell.querySelector('span');
            if (coordSpan) coordSpan.remove();
        } else {
            cell.classList.remove('cell-disabled');
            mode115Button.style.background = 'linear-gradient(to bottom, #d4af37, #a67c00)';
            // 重新添加座標顯示
            const coordSpan = document.createElement('span');
            coordSpan.textContent = '5,0';
            coordSpan.className = 'absolute text-gray-500/50 text-sm pointer-events-none select-none';
            cell.style.position = 'relative';
            cell.appendChild(coordSpan);
        }
    });

    // 重設放置區按鈕功能
    const resetButton = document.querySelector('button:nth-child(3)');
    resetButton.addEventListener('click', resetPlacementArea);

    // 使用說明按鈕功能
    const helpButton = document.querySelector('button:nth-child(4)');
    helpButton.addEventListener('click', showHelp);
});

// 添加響應式布局處理函數
function handleResponsiveLayout() {
    const container = document.querySelector('.flex.flex-wrap.gap-4'); // 主容器
    const placementArea = container.querySelector('div:first-child'); // 放置區
    const selectionArea = container.querySelector('div:nth-child(2)'); // 選擇區
    const statsArea = container.querySelector('div:last-child'); // 效果統計區

    const screenWidth = window.innerWidth;
    const placementAreaWidth = placementArea.offsetWidth;
    const containerPadding = 32; // 假設容器左右各有 16px 的 padding
    const availableWidth = screenWidth - containerPadding;

    if (screenWidth >= 1920) {
        // 寬螢幕布局：三區域分別佔 30% 30% 40%
        placementArea.style.width = '20%';  // 直接設定寬度
        selectionArea.style.width = '40%';
        statsArea.style.width = '40%';
        
        // 移除其他寬度相關的類別
        statsArea.classList.remove('w-full', 'xl:w-[250px]');
        selectionArea.classList.remove('w-full', 'flex-1');
        
        // 調整神像卡片布局回到水平排列
        const statueCards = document.querySelectorAll('.bg-gray-800\\/80');
        statueCards.forEach(card => {
            card.style.width = '';
            card.style.marginBottom = '';
        });
    } else if (availableWidth < placementAreaWidth) {
        // 窄螢幕布局：垂直堆疊
        placementArea.style.width = '100%';
        selectionArea.style.width = '100%';
        statsArea.style.width = '100%';
        
        // 調整神像卡片布局
        const statueCards = document.querySelectorAll('.bg-gray-800\\/80');
        statueCards.forEach(card => {
            card.style.width = '100%';
            card.style.marginBottom = '1rem';
        });
    } else {
        // 中等螢幕布局：效果統計在下方
        placementArea.style.width = '30%';
        selectionArea.style.width = '';  // 清除寬度讓 flex-1 生效
        statsArea.style.width = '100%';
        
        // 重設神像卡片布局
        const statueCards = document.querySelectorAll('.bg-gray-800\\/80');
        statueCards.forEach(card => {
            card.style.width = '';
            card.style.marginBottom = '';
        });
    }
}

// 修改重設函數以保留座標顯示
function resetPlacementArea() {
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        // 保留原有的 cell-disabled 類別和座標顯示
        const isDisabled = cell.classList.contains('cell-disabled');
        const coordSpan = cell.querySelector('span');
        
        // 移除所有類別和樣式
        cell.className = 'grid-cell bg-white/20 hover:bg-white/40 transition-colors duration-200';
        cell.style.backgroundColor = '';
        cell.style.color = '';
        cell.style.display = '';
        cell.style.alignItems = '';
        cell.style.justifyContent = '';
        cell.style.fontWeight = '';
        cell.textContent = '';
        
        // 如果原本是禁用的格子，保持禁用狀態
        if (isDisabled) {
            cell.classList.add('cell-disabled');
        } else {
            // 重新添加座標顯示
            if (coordSpan) cell.appendChild(coordSpan);
        }
    });

    // 清空已放置神像的效果
    placedStatues.clear();
    updateEffectStats();
    
    // 清除 localStorage
    localStorage.removeItem('devMemoStatues');
    showNotification('已重設放置區並清除儲存的配置');
}

// 初始化拖曳功能
function initializeDragAndDrop() {
    const statueCards = document.querySelectorAll('.bg-gray-800\\/80');
    
    statueCards.forEach((card, index) => {
        const titleContainer = card.querySelector('.flex.items-center');
        const sizeIndicator = card.querySelector('.size-indicator');
        
        sizeIndicator.draggable = true;
        sizeIndicator.setAttribute('data-statue-index', index);
        
        // 檢查下拉選單的變化來更新拖曳狀態
        const selects = card.querySelectorAll('select');
        const updateDraggable = () => {
            const hasSelectedEffect = Array.from(selects).some(select => select.value !== '');
            sizeIndicator.draggable = hasSelectedEffect;
            sizeIndicator.style.opacity = hasSelectedEffect ? '1' : '0.5';
            sizeIndicator.style.cursor = hasSelectedEffect ? 'grab' : 'not-allowed';
        };

        // 初始檢查
        updateDraggable();

        // 為每個下拉選單添加變化監聽
        selects.forEach(select => {
            select.addEventListener('change', updateDraggable);
        });
        
        sizeIndicator.addEventListener('dragstart', (e) => {
            const hasSelectedEffect = Array.from(selects).some(select => select.value !== '');
            if (!hasSelectedEffect) {
                e.preventDefault();
                return;
            }
            const statueData = blocks[index];
            e.dataTransfer.setData('application/json', JSON.stringify(statueData));
            e.dataTransfer.effectAllowed = 'move';
        });
    });

    // 設置放置區域的拖曳事件
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        cell.addEventListener('dragover', (e) => {
            if (!cell.classList.contains('cell-disabled')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });

        cell.addEventListener('drop', handleDrop);
    });

    // 設置顯示神像資料按鈕功能
    const showStatueDataButton = document.querySelector('button:nth-child(1)');
    showStatueDataButton.addEventListener('click', showStatueData);
}

// 處理放置事件
function handleDrop(e) {
    e.preventDefault();
    
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const cellId = e.target.id;
    const [_, row, col] = cellId.match(/cell-(\d+)-(\d+)/);
    
    // 判斷是新的神像還是已放置的神像
    const statueData = data.statue || data;
    
    // 檢查是否可以放置（包含檢查禁用格子和其他條件）
    if (!canPlaceStatue(parseInt(row), parseInt(col), statueData.w, statueData.h)) {
        // 如果無法放置，則恢復原位
        if (data.originalPosition) {
            const { row, col } = data.originalPosition;
            const statueKey = `${row}-${col}-${statueData.label}`;
            placedStatues.set(statueKey, data.effects);
            placeStatue(parseInt(row), parseInt(col), statueData);
            updateEffectStats();
            showNotification(`${statueData.label} 神像已還原至原始位置`);
        }
        return;
    }
    
    // 可以放置的情況
    if (data.effects) {
        // 如果是已放置的神像，直接使用原本的效果
        const statueKey = `${row}-${col}-${statueData.label}`;
        placedStatues.set(statueKey, data.effects);
        placeStatue(parseInt(row), parseInt(col), statueData);
        showNotification(`${statueData.label} 神像已移動至新位置 (${col}, ${row})`);
    } else {
        // 如果是新的神像，從選單獲取效果
        const statueCard = document.querySelectorAll('.bg-gray-800\\/80')[blocks.findIndex(b => b.label === statueData.label)];
        const selectedEffects = Array.from(statueCard.querySelectorAll('select'))
            .map(select => select.value)
            .filter(value => value !== '');

        const statueKey = `${row}-${col}-${statueData.label}`;
        placedStatues.set(statueKey, selectedEffects);
        placeStatue(parseInt(row), parseInt(col), statueData);
        showNotification(`${statueData.label} 神像已成功放置於 (${col}, ${row})`);
    }
    updateEffectStats();
}

// 新增恢復神像位置的函數
function restoreStatue(jsonData) {
    const data = JSON.parse(jsonData);
    if (data.originalPosition) {
        const { row, col } = data.originalPosition;
        const statueData = data.statue;
        const statueKey = `${row}-${col}-${statueData.label}`;
        placedStatues.set(statueKey, data.effects);
        placeStatue(row, col, statueData);
        updateEffectStats();
    }
}

// 檢查是否可以放置神像
function canPlaceStatue(startRow, startCol, width, height) {
    // 檢查是否超出邊界
    if (startRow + height > 7 || startCol + width > 6) {
        showNotification('無法放置神像：超出放置區域範圍');
        return false;
    }

    // 檢查目標區域是否有被占用或禁用的格子
    for (let row = startRow; row < startRow + height; row++) {
        for (let col = startCol; col < startCol + width; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (!cell) {
                showNotification('無法放置神像：目標位置無效');
                return false;
            }
            if (cell.classList.contains('cell-disabled')) {
                showNotification('無法放置神像：目標位置已被禁用');
                return false;
            }
            if (cell.classList.contains('occupied')) {
                showNotification('無法放置神像：目標位置已被占用');
                return false;
            }
        }
    }

    return true;
}

// 修改放置神像函數以保留座標顯示
function placeStatue(startRow, startCol, statueData) {
    // 標記占用的格子
    for (let row = startRow; row < startRow + statueData.h; row++) {
        for (let col = startCol; col < startCol + statueData.w; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            
            const coordSpan = cell.querySelector('span');
            if (coordSpan) {
                coordSpan.remove();
            }
            
            cell.classList.add('occupied');
            cell.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
            
            // 添加邊框類別
            if (row === startRow) cell.classList.add('top');
            if (col === startCol) cell.classList.add('left');
            if (row === startRow + statueData.h - 1) cell.classList.add('bottom');
            if (col === startCol + statueData.w - 1) cell.classList.add('right');
            
            // 只在第一個格子顯示神像名稱
            if (row === startRow && col === startCol) {
                cell.textContent = statueData.label;
                cell.style.color = '#ffd700';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.fontWeight = 'bold';
                
                // 添加拖曳功能
                cell.draggable = true;
                cell.addEventListener('dragstart', (e) => {
                    // 儲存神像資料和效果
                    const statueKey = `${startRow}-${startCol}-${statueData.label}`;
                    const effects = placedStatues.get(statueKey);
                    const dragData = {
                        statue: statueData,
                        effects: effects,
                        originalPosition: { row: startRow, col: startCol }
                    };
                    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                    
                    // 設定延遲移除原本的神像
                    setTimeout(() => {
                        removeStatue(startRow, startCol, statueData.w, statueData.h);
                    }, 0);
                });
            }
        }
    }
    // 儲存到 localStorage
    saveStatuesToLocalStorage();
}

// 新增移除神像的函數
function removeStatue(startRow, startCol, width, height) {
    // 找到要移除的神像名稱
    const cell = document.getElementById(`cell-${startRow}-${startCol}`);
    const statueName = Array.from(cell.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join('');
    
    // 使用正確的 key 格式移除神像效果記錄
    const statueKey = `${startRow}-${startCol}-${statueName}`;
    placedStatues.delete(statueKey);
    
    // 移除格子上的神像
    for (let row = startRow; row < startRow + height; row++) {
        for (let col = startCol; col < startCol + width; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            
            // 重設格子狀態
            cell.className = 'grid-cell bg-white/20 hover:bg-white/40 transition-colors duration-200';
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.style.display = '';
            cell.style.alignItems = '';
            cell.style.justifyContent = '';
            cell.style.fontWeight = '';
            cell.textContent = '';
            cell.draggable = false;
            
            // 重新添加座標顯示
            const coordSpan = document.createElement('span');
            coordSpan.textContent = `${col},${row}`;
            coordSpan.className = 'absolute text-gray-500/50 text-sm pointer-events-none select-none';
            cell.style.position = 'relative';
            cell.appendChild(coordSpan);
        }
    }
    
    // 更新效果統計
    updateEffectStats();
    
    // 儲存到 localStorage
    saveStatuesToLocalStorage();
}

// 更新效果統計
function updateEffectStats() {
    const effectCounts = new Map();
    
    // 統計所有已放置神像的效果
    for (const effects of placedStatues.values()) {
        effects.forEach(effect => {
            effectCounts.set(effect, (effectCounts.get(effect) || 0) + 1);
        });
    }

    // 更新統計顯示
    const statsBody = document.getElementById('effectStatsBody');
    statsBody.innerHTML = '';

    if (effectCounts.size === 0) {
        statsBody.innerHTML = '<tr><td colspan="2" class="px-4 py-2 text-center">尚未放置任何神像或選擇效果</td></tr>';
        return;
    }

    // 將效果按照數量排序
    const sortedEffects = Array.from(effectCounts.entries())
        .sort((a, b) => b[1] - a[1]);

    sortedEffects.forEach(([effect, count]) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-yellow-600/30 hover:bg-white/10';
        row.innerHTML = `
            <td class="px-4 py-2 font-bold">${count}x</td>
            <td class="px-4 py-2">${effect}</td>
        `;
        statsBody.appendChild(row);
    });
}

// 顯示神像資料
function showStatueData() {
    const gridCells = document.querySelectorAll('.grid-cell');
    const occupiedCells = new Map();

    // 收集所有被占用的格子資訊
    gridCells.forEach(cell => {
        if (cell.classList.contains('occupied')) {
            const [_, row, col] = cell.id.match(/cell-(\d+)-(\d+)/);
            // 獲取神像名稱時排除座標顯示的 span 元素
            const statueName = Array.from(cell.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join('');
            
            if (statueName) {
                occupiedCells.set(`${row}-${col}`, statueName);
            }
        }
    });

    // 如果沒有放置任何神像
    if (occupiedCells.size === 0) {
        showNotification('目前放置區沒有任何神像');
        return;
    }

    // 準備顯示的資料
    let displayData = [];
    for (const [position, statueName] of occupiedCells) {
        const [row, col] = position.split('-');
        const statueKey = `${row}-${col}-${statueName}`;
        const effects = placedStatues.get(statueKey) || [];
        
        // 獲取神像的尺寸
        const statueData = blocks.find(b => b.label === statueName);
        const positionText = statueData.w === 1 && statueData.h === 1 
            ? `(${col}, ${row})`
            : `(${col}, ${row}) 到 (${parseInt(col) + statueData.w - 1}, ${parseInt(row) + statueData.h - 1})`;
        
        displayData.push({
            name: statueName,
            position: positionText,
            effects: effects
        });
    }

    // 創建顯示視窗
    const modalHTML = `
        <div id="statueDataModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto relative">
                <!-- 關閉按鈕 -->
                <button id="closeModal" class="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 gold-gradient text-white font-semibold w-8 h-24 rounded-l-lg transition duration-200 flex items-center justify-center">
                    <span class="transform -rotate-90">關閉</span>
                </button>
                
                <h2 class="text-xl font-bold text-yellow-400 mb-4 text-center">已放置神像資料</h2>
                <div class="space-y-4">
                    ${displayData.map(statue => `
                        <div class="border border-yellow-600 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-yellow-400 font-bold">${statue.name}</span>
                                <span class="text-yellow-400">位置: ${statue.position}</span>
                            </div>
                            <div class="space-y-2">
                                ${statue.effects.length > 0 ? 
                                    statue.effects.map(effect => `
                                        <div class="text-yellow-400 pl-4 border-l-2 border-yellow-600">${effect}</div>
                                    `).join('') : 
                                    '<div class="text-yellow-400 italic">未選擇效果</div>'
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // 添加視窗到頁面
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 添加關閉功能
    const modal = document.getElementById('statueDataModal');
    const closeButton = document.getElementById('closeModal');

    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 顯示提示訊息的函數
function showNotification(message) {
    // 移除任何現有的提示
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 判斷是成功還是失敗訊息
    const isError = message.includes('無法') || message.includes('尚未');
    const bgColor = isError ? 'bg-red-500/80' : 'bg-green-500/80';
    const hoverColor = isError ? 'hover:text-red-200' : 'hover:text-green-200';

    // 創建新的提示元素
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    notification.style.opacity = '0';
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button class="ml-4 text-white ${hoverColor} focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;

    // 添加到頁面
    document.body.appendChild(notification);

    // 淡入效果
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
    });

    // 3秒後自動淡出
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 

// 顯示使用說明的函數
function showHelp() {
    const helpModalHTML = `
        <div id="helpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto relative">
                <!-- 關閉按鈕 -->
                <button id="closeHelpModal" class="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 gold-gradient text-white font-semibold w-8 h-24 rounded-l-lg transition duration-200 flex items-center justify-center">
                    <span class="transform -rotate-90">關閉</span>
                </button>
                
                <h2 class="text-xl font-bold text-yellow-400 mb-4 text-center">使用說明</h2>
                <div class="space-y-4 text-yellow-400">
                    <div class="border border-yellow-600 rounded-lg p-4">
                        <h3 class="font-bold mb-2">基本操作</h3>
                        <ul class="list-disc pl-6 space-y-2">
                            <li>從右側選擇神像效果後，即可拖曳神像圖示到左側放置區</li>
                            <li>已放置的神像可以拖曳移動位置</li>
                            <li>拖曳神像到放置區外或禁用區域，可以將其刪除</li>
                            <li>點擊「顯示神像資料」可查看目前已放置的神像及其效果</li>
                            <li>點擊「重設放置區」可清除所有已放置的神像</li>
                        </ul>
                    </div>

                    <div class="border border-yellow-600 rounded-lg p-4">
                        <h3 class="font-bold mb-2">115 模式</h3>
                        <ul class="list-disc pl-6 space-y-2">
                            <li>點擊「115 模式」按鈕可切換模式</li>
                            <li>啟用後會禁用座標 (5,0) 的格子</li>
                            <li>若該格子已有神像，需先移除才能啟用此模式</li>
                        </ul>
                    </div>

                    <div class="border border-yellow-600 rounded-lg p-4">
                        <h3 class="font-bold mb-2">效果統計</h3>
                        <ul class="list-disc pl-6 space-y-2">
                            <li>下方效果統計區會顯示目前已放置神像的效果總和</li>
                            <li>相同效果會疊加並顯示總數</li>
                            <li>效果依照數量由多到少排序</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 添加視窗到頁面
    document.body.insertAdjacentHTML('beforeend', helpModalHTML);

    // 添加關閉功能
    const modal = document.getElementById('helpModal');
    const closeButton = document.getElementById('closeHelpModal');

    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
} 

// 儲存神像放置資料到 localStorage
function saveStatuesToLocalStorage() {
    const statuesData = {
        placedStatues: Array.from(placedStatues.entries()),
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('devMemoStatues', JSON.stringify(statuesData));
}

// 從 localStorage 讀取神像放置資料
function loadStatuesFromLocalStorage() {
    const savedData = localStorage.getItem('devMemoStatues');
    if (!savedData) return false;

    try {
        const { placedStatues: savedStatues, timestamp } = JSON.parse(savedData);
        
        // 清空現有放置區
        resetPlacementArea();
        
        // 重新放置已儲存的神像
        savedStatues.forEach(([key, effects]) => {
            const [row, col, label] = key.split('-');
            const statueData = blocks.find(b => b.label === label);
            if (statueData) {
                placedStatues.set(key, effects);
                placeStatue(parseInt(row), parseInt(col), statueData);
            }
        });
        
        updateEffectStats();
        showNotification(`已載入儲存的神像配置 (${new Date(timestamp).toLocaleString()})`);
        return true;
    } catch (error) {
        console.error('載入儲存的神像資料時發生錯誤:', error);
        return false;
    }
}