// 偵測非桌面設備自動隱藏倒數計時
(function () {
    var isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    if (isMobile) {
        var timerSection = document.getElementById("timer-section");
        if (timerSection) timerSection.style.display = "none";
    }
})();

// 倒數計時器（改為 2025/6/14 04:00:00）
const targetDate = new Date("2025-06-14T04:00:00+08:00");
const countdownEl = document.getElementById("countdown");
function updateCountdown() {
    if (!countdownEl) return; // 防呆：元素不存在不執行
    const now = new Date();
    let diff = targetDate - now;
    if (diff < 0) {
        countdownEl.textContent = "改版已開始！";
        return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= d * 1000 * 60 * 60 * 24;
    const h = Math.floor(diff / (1000 * 60 * 60));
    diff -= h * 1000 * 60 * 60;
    const m = Math.floor(diff / (1000 * 60));
    diff -= m * 1000 * 60;
    const s = Math.floor(diff / 1000);
    countdownEl.textContent = `${d}天 ${h}時 ${m}分 ${s}秒`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 目錄自動生成
function buildTOC() {
    const tocList = document.getElementById("toc-list");
    if (!tocList) return; // 防呆
    tocList.innerHTML = "";
    document.querySelectorAll(".info-block .block-title").forEach((title) => {
        const block = title.closest(".info-block");
        if (!block || !block.id) return; // 防呆
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${block.id}`;
        a.textContent = title.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
}
buildTOC();

// 區塊展開/收合動畫（事件委派最佳化）
document.addEventListener("click", function (e) {
    const title = e.target.closest(".block-title");
    if (title) {
        const block = title.closest(".info-block");
        if (block) block.classList.toggle("collapsed");
    }
});

// 回到頂部按鈕
const backToTop = document.getElementById("back-to-top");
if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.style.display = window.scrollY > 300 ? "block" : "none";
    });
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// 主題切換
const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
function setTheme(light) {
    if (light) {
        document.body.classList.add("light");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.remove("light");
        localStorage.setItem("theme", "dark");
    }
}
if (themeToggle) {
    if (localStorage.getItem("theme")) {
        setTheme(localStorage.getItem("theme") === "light");
    } else {
        setTheme(!prefersDark);
    }
    themeToggle.addEventListener("click", () => {
        setTheme(!document.body.classList.contains("light"));
    });
}

// 連結自動轉換為影片播放器或圖片顯示
function autoLinkify() {
    const selector = ".info-links li, .block-content, li, p";
    document.querySelectorAll(selector).forEach((el) => {
        // 將每個純文字節點的網址轉成 <a>
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }
        textNodes.forEach((node) => {
            // 更嚴謹的網址正則
            const replaced = node.textContent.replace(
                /(https?:\/\/[\w\-\.\/?&=+#%:,;~@!$'()*\[\]]+)/g,
                function (url) {
                    return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
                }
            );
            if (replaced !== node.textContent) {
                const span = document.createElement("span");
                span.innerHTML = replaced;
                node.parentNode.replaceChild(span, node);
            }
        });
    });
}

function createStyledImage(url) {
    const container = document.createElement("div");
    container.className = "auto-image-container";

    const img = document.createElement("img");
    img.src = url;
    img.className = "auto-image";
    img.alt = "圖片";

    container.appendChild(img);
    return container;
}

function convertLinks() {
    autoLinkify();

    // 針對 .block-content 內純文字節點遇到 * 自動換行
    document.querySelectorAll(".block-content").forEach((block) => {
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }
        textNodes.forEach((node) => {
            if (node.parentNode && node.textContent.includes("*")) {
                // 將 * 轉換為 <br>
                const html = node.textContent.replace(/\*/g, "<br>");
                const span = document.createElement("span");
                span.innerHTML = html;
                node.parentNode.replaceChild(span, node);
            }
        });
    });

    // 處理自動轉換純文字圖片連結為圖片
    document.querySelectorAll(".block-content").forEach((block) => {
        const textNodes = Array.from(block.childNodes).filter(
            (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
        );

        textNodes.forEach((node) => {
            const text = node.textContent.trim();
            if (/https?:\/\/.*\.(jpg|jpeg|png|gif|webp)/i.test(text)) {
                const container = createStyledImage(text);
                node.replaceWith(container);
            }
        });
    });

    // 處理已經是連結的內容
    document.querySelectorAll(".info-links a, .block-content a").forEach((a) => {
        const url = a.href;
        // YouTube 影片處理
        const ytMatch = url.match(
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
        );
        if (ytMatch && ytMatch[1]) {
            const container = document.createElement("div");
            container.style.marginTop = "1rem";
            container.style.marginBottom = "1rem";
            const iframe = document.createElement("iframe");
            iframe.className = "youtube-embed";
            iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}`;
            iframe.frameBorder = "0";
            iframe.allow =
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            container.appendChild(iframe);
            const li = a.closest("li");
            if (li) {
                const text = li.textContent.split(":")[0];
                li.innerHTML = "";
                if (text && text !== url) {
                    li.appendChild(document.createTextNode(text + "："));
                }
                li.appendChild(container);
            } else {
                a.replaceWith(container);
            }
        }
        // 圖片連結處理
        else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
            const container = createStyledImage(url);
            const li = a.closest("li");
            if (li) {
                const text = li.textContent.split(":")[0];
                li.innerHTML = "";
                if (text && text !== url) {
                    li.appendChild(document.createTextNode(text + "："));
                }
                li.appendChild(container);
            } else {
                a.replaceWith(container);
            }
        }
    });
}

function processYouTubeIframes() {
    document.querySelectorAll("iframe").forEach((iframe) => {
        if (iframe.src && iframe.src.includes("youtube.com/embed")) {
            iframe.removeAttribute("width");
            iframe.removeAttribute("height");
            iframe.classList.add("youtube-embed");
            if (!iframe.parentElement.classList.contains("youtube-container")) {
                const container = document.createElement("div");
                container.className = "youtube-container";
                iframe.parentNode.insertBefore(container, iframe);
                container.appendChild(iframe);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    convertLinks();
    processYouTubeIframes();
});

// MutationObserver 監聽動態加入的內容（效能最佳化）
const observer = new MutationObserver((mutations) => {
    let needProcess = false;
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            needProcess = true;
        }
    });
    if (needProcess) processYouTubeIframes();
});
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
});
