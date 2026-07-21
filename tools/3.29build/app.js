(function () {
  "use strict";

  const SHEET_ID = "144qCjaZPTZalqZ96NvHRV-a7-M0pKoqypbb-Anpm4SU";
  const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx&gid=0`;
  const TAGS = {
    "🏹": "弓流派", "🔪": "近戰", "💪": "坦克", "🔮": "直擊法術",
    "💎": "綁傳奇", "🩸": "持續傷害", "👻": "召喚", "💣": "陷阱地雷",
    "🤡": "搞耍", "🗿": "圖騰", "🎇": "華麗",
  };

  function text(value) {
    return String(value ?? "").replace(/\s*\r?\n\s*/g, "").replace(/\s+/g, " ").trim();
  }

  function extractYouTubeId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] || "";
      if (parsed.hostname.endsWith("youtube.com")) {
        if (parsed.pathname === "/watch") return parsed.searchParams.get("v") || "";
        const [, route, id] = parsed.pathname.split("/");
        if (["embed", "shorts", "live"].includes(route)) return id || "";
      }
    } catch {}
    return "";
  }

  function urlsIn(value) {
    return text(value).match(/https?:\/\/[^\s]+/g) || [];
  }

  function cellLink(sheet, row, column) {
    const XLSX = globalThis.XLSX;
    return text(sheet[XLSX.utils.encode_cell({ r: row, c: column })]?.l?.Target);
  }

  function makeLink(url) {
    const videoId = extractYouTubeId(url);
    if (videoId) return { url, kind: "youtube", videoId };
    if (url.includes("pobb.in")) return { url, kind: "pob" };
    return { url, kind: "article" };
  }

  function parseSheet(sheet) {
    const XLSX = globalThis.XLSX;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    const builds = [];
    let character = "";
    let ascendancy = "";

    rows.slice(2).forEach((row, offset) => {
      const sourceRow = offset + 2;
      character = text(row[0]) || character;
      ascendancy = text(row[1]) || ascendancy;
      const name = text(row[2]);
      if (!name) return;

      const guideLabel = text(row[8]);
      const review = text(row[9]);
      const urls = [
        cellLink(sheet, sourceRow, 8),
        cellLink(sheet, sourceRow, 9),
        ...urlsIn(guideLabel),
        ...urlsIn(review),
      ].filter(Boolean);

      builds.push({
        id: `${sourceRow + 1}-${name}`,
        character,
        ascendancy,
        name,
        tags: Object.keys(TAGS).filter((symbol) => text(row[3]).includes(symbol)),
        mapping: text(row[4]),
        bossing: text(row[5]),
        overall: text(row[6]),
        note: text(row[7]),
        guideLabel: guideLabel.replace(/https?:\/\/[^\s]+/g, "").trim(),
        review,
        links: [...new Set(urls)].map(makeLink),
      });
    });

    if (!builds.length) throw new Error("表單格式可能已變更，找不到流派資料。");
    return builds;
  }

  function scoreClass(value) {
    if (value === "強") return "score-strong";
    if (value === "中") return "score-mid";
    if (value === "弱" || value === "中下") return "score-low";
    return "score-special";
  }

  function spanLength(rows, index, key) {
    const value = key(rows[index]);
    let length = 1;
    while (index + length < rows.length && key(rows[index + length]) === value) length += 1;
    return length;
  }

  function td(className, value) {
    const cell = document.createElement("td");
    cell.className = className;
    cell.textContent = value;
    return cell;
  }

  function appendLinkedText(container, value) {
    const pattern = /(https?:\/\/[^\s]+)/g;
    let start = 0;
    for (const match of value.matchAll(pattern)) {
      container.append(document.createTextNode(value.slice(start, match.index)));
      const link = document.createElement("a");
      link.href = match[0];
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = match[0];
      container.append(link);
      start = match.index + match[0].length;
    }
    container.append(document.createTextNode(value.slice(start)));
  }

  function guideLinkLabel(link) {
    if (link.kind === "pob") return "PoB ↗";
    try { return `${new URL(link.url).hostname.replace(/^www\./, "")} ↗`; }
    catch { return "攻略連結 ↗"; }
  }

  async function fetchLatestBuilds() {
    if (!globalThis.XLSX) throw new Error("試算表解析器載入失敗，請重新整理頁面。");
    const url = new URL(EXPORT_URL);
    url.searchParams.set("fresh", Date.now().toString());
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Google 表單回應錯誤（${response.status}）`);
    const workbook = globalThis.XLSX.read(await response.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("Google 表單沒有可讀取的工作表。");
    return parseSheet(sheet);
  }

  function init() {
    const elements = {
      body: document.getElementById("build-rows"), search: document.getElementById("search"),
      character: document.getElementById("character"), rating: document.getElementById("rating"),
      refresh: document.getElementById("refresh"), status: document.getElementById("status"),
      loading: document.getElementById("loading"), error: document.getElementById("error"),
      empty: document.getElementById("empty"), visible: document.getElementById("visible-count"),
      total: document.getElementById("total-count"), tags: document.getElementById("tag-filter"),
      legend: document.getElementById("legend"),
    };
    let builds = [];
    let activeTag = "";

    Object.entries(TAGS).forEach(([symbol, label]) => {
      const item = document.createElement("span");
      item.textContent = `${symbol} ${label}`;
      elements.legend.append(item);
    });

    [{ symbol: "", label: "全部" }, ...Object.entries(TAGS).map(([symbol, label]) => ({ symbol, label }))].forEach(({ symbol, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = symbol ? `${symbol} ${label}` : label;
      button.className = symbol ? "" : "active";
      button.addEventListener("click", () => {
        activeTag = symbol;
        [...elements.tags.children].forEach((child) => child.classList.toggle("active", child === button));
        render();
      });
      elements.tags.append(button);
    });

    function render() {
      const needle = elements.search.value.trim().toLocaleLowerCase("zh-Hant");
      const rows = builds.filter((build) => {
        const searchable = [build.character, build.ascendancy, build.name, build.note, build.guideLabel, build.review].join(" ").toLocaleLowerCase("zh-Hant");
        return (!needle || searchable.includes(needle)) &&
          (!elements.character.value || build.character === elements.character.value) &&
          (!elements.rating.value || build.overall === elements.rating.value) &&
          (!activeTag || build.tags.includes(activeTag));
      });

      elements.body.replaceChildren();
      elements.visible.textContent = String(rows.length);
      elements.total.textContent = String(builds.length);
      elements.empty.hidden = rows.length > 0 || builds.length === 0;

      rows.forEach((build, index) => {
        const row = document.createElement("tr");
        const newCharacter = index === 0 || rows[index - 1].character !== build.character;
        const newAscendancy = index === 0 || rows[index - 1].character !== build.character || rows[index - 1].ascendancy !== build.ascendancy;
        if (newCharacter) {
          row.classList.add("group-start");
          const cell = td("character-cell", build.character);
          cell.rowSpan = spanLength(rows, index, (item) => item.character);
          row.append(cell);
        }
        if (newAscendancy) {
          const cell = td("ascendancy-cell", build.ascendancy || "未標示");
          cell.rowSpan = spanLength(rows, index, (item) => `${item.character}\0${item.ascendancy}`);
          row.append(cell);
        }

        row.append(td("build-name", build.name));
        const tagCell = td("tag-cell", "");
        build.tags.forEach((tag) => {
          const icon = document.createElement("span");
          icon.className = "tag-icon";
          icon.title = TAGS[tag];
          icon.textContent = tag;
          tagCell.append(icon);
        });
        row.append(tagCell);

        [build.mapping, build.bossing, build.overall].forEach((value) => {
          const cell = td("score-cell", "");
          const badge = document.createElement("span");
          badge.className = scoreClass(value);
          badge.textContent = value || "—";
          cell.append(badge);
          row.append(cell);
        });

        row.append(td(`note-cell${build.note ? " has-note" : ""}`, build.note || "—"));
        const guideCell = td("guide-cell", "");
        const label = document.createElement("p");
        label.className = "guide-label";
        label.textContent = build.guideLabel || "教學資源";
        guideCell.append(label);
        const videos = build.links.filter((link) => link.kind === "youtube");
        videos.forEach((link) => {
          const preview = document.createElement("div");
          preview.className = "video-preview";
          const frame = document.createElement("iframe");
          frame.src = `https://www.youtube-nocookie.com/embed/${link.videoId}`;
          frame.title = `${build.name} 教學影片`;
          frame.loading = "lazy";
          frame.allowFullscreen = true;
          frame.referrerPolicy = "strict-origin-when-cross-origin";
          frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          preview.append(frame);
          guideCell.append(preview);
        });
        const externalLinks = build.links.filter((link) => link.kind !== "youtube");
        if (externalLinks.length) {
          const links = document.createElement("div");
          links.className = "guide-links";
          externalLinks.forEach((item) => {
            const anchor = document.createElement("a");
            anchor.href = item.url;
            anchor.target = "_blank";
            anchor.rel = "noreferrer";
            anchor.textContent = guideLinkLabel(item);
            links.append(anchor);
          });
          guideCell.append(links);
        }
        if (!build.links.length) {
          const missing = document.createElement("span");
          missing.className = "no-guide";
          missing.textContent = "尚未提供連結";
          guideCell.append(missing);
        }
        row.append(guideCell);

        const reviewCell = td("review-cell", "");
        appendLinkedText(reviewCell, build.review || "—");
        row.append(reviewCell);
        elements.body.append(row);
      });
    }

    function fillSelect(select, values) {
      [...new Set(values.filter(Boolean))].forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
      });
    }

    async function load() {
      elements.loading.hidden = false;
      elements.error.hidden = true;
      elements.refresh.disabled = true;
      elements.status.parentElement.classList.remove("is-error");
      elements.status.innerHTML = "<i></i>正在取得最新表單…";
      try {
        builds = await fetchLatestBuilds();
        if (elements.character.options.length === 1) {
          fillSelect(elements.character, builds.map((build) => build.character));
          fillSelect(elements.rating, ["強", "中", "中下", "弱", "信仰", "🦀", "-"].filter((value) => builds.some((build) => build.overall === value)));
        }
        const time = new Date().toLocaleString("zh-TW", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
        elements.status.innerHTML = `<i></i>最新取得：${time}`;
        render();
      } catch (error) {
        elements.status.parentElement.classList.add("is-error");
        elements.status.innerHTML = "<i></i>讀取失敗";
        elements.error.hidden = false;
        elements.error.querySelector("span").textContent = error instanceof Error ? error.message : "未知錯誤";
      } finally {
        elements.loading.hidden = true;
        elements.refresh.disabled = false;
      }
    }

    elements.search.addEventListener("input", render);
    elements.character.addEventListener("change", render);
    elements.rating.addEventListener("change", render);
    elements.refresh.addEventListener("click", load);
    load();
  }

  globalThis.PoeBuildGuide = { TAGS, extractYouTubeId, parseSheet };
  if (typeof document !== "undefined") init();
})();
