/* 天気（現在＋7日間）と、その日の過ごし方の提案 */
(() => {
  const I = window.I18N;
  const root = document.querySelector("[data-weather]");
  if (!root) return;

  const nowBox = root.querySelector("[data-weather-now]");
  const daysBox = root.querySelector("[data-weather-days]");
  const riskBox = root.querySelector("[data-weather-risk]");
  const summaryBox = root.querySelector("[data-weather-summary]");
  const wearBox = root.querySelector("[data-weather-wear]");
  const planBox = root.querySelector("[data-weather-plan]");
  const itemsBox = root.querySelector("[data-weather-items]");
  const extraBox = root.querySelector("[data-weather-extra]");
  const updatedBox = root.querySelector("[data-weather-updated]");

  const LAT = 37.6549877;
  const LON = 139.8661643;
  const TZ = "Asia%2FTokyo";
  const FORECAST =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,snowfall_sum" +
    `&timezone=${TZ}&forecast_days=7`;
  const POLLEN =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
    `&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=${TZ}&forecast_days=1`;

  const CACHE_KEY = "nitchu-weather-cache-v2";
  const TTL = 10 * 60 * 1000;
  const WEEK = [I.t("sun"), I.t("mon"), I.t("tue"), I.t("wed"), I.t("thu"), I.t("fri"), I.t("sat")];

  /* 天候コード → [アイコン, 種別]（表示ラベルは i18n から） */
  const CODES = {
    0: ["sun", "clear"], 1: ["sun", "clear"], 2: ["cloud", "cloudy"], 3: ["cloud", "cloudy"],
    45: ["cloud", "fog"], 48: ["cloud", "fog"],
    51: ["rain", "drizzle"], 53: ["rain", "drizzle"], 55: ["rain", "drizzle"], 56: ["rain", "freezing"], 57: ["rain", "freezing"],
    61: ["rain", "light"], 63: ["rain", "normal"], 65: ["rain", "heavy"],
    66: ["rain", "freezing"], 67: ["rain", "freezing"],
    71: ["snow", "light"], 73: ["snow", "normal"], 75: ["snow", "heavy"], 77: ["snow", "light"],
    80: ["rain", "shower"], 81: ["rain", "shower"], 82: ["rain", "heavy"],
    85: ["snow", "shower"], 86: ["snow", "heavy"],
    95: ["rain", "thunder"], 96: ["rain", "thunder"], 99: ["rain", "thunder"],
  };

  const ICONS = {
    sun: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="6.5"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M24.5 7.5l-2.8 2.8M10.3 21.7l-2.8 2.8"/></svg>',
    cloud: '<svg viewBox="0 0 32 32"><path d="M9.5 23h13a5.2 5.2 0 0 0 0-10.4 7.2 7.2 0 0 0-13.6 2.4A4.4 4.4 0 0 0 9.5 23Z"/></svg>',
    rain: '<svg viewBox="0 0 32 32"><path d="M9.5 19h13a5.2 5.2 0 0 0 0-10.4 7.2 7.2 0 0 0-13.6 2.4A4.4 4.4 0 0 0 9.5 19Z"/><path d="M11.5 22l-1 5.5M16 22l-1 5.5M20.5 22l-1 5.5"/></svg>',
    snow: '<svg viewBox="0 0 32 32"><path d="M9.5 19h13a5.2 5.2 0 0 0 0-10.4 7.2 7.2 0 0 0-13.6 2.4A4.4 4.4 0 0 0 9.5 19Z"/><path d="M11.5 23.5h9M13 27h6"/></svg>',
  };

  const num = (value) => (typeof value === "number" && !Number.isNaN(value) ? value : null);
  const round = (value) => (num(value) === null ? "—" : Math.round(value));
  const wxLabel = (code) => {
    const s = I.t("wx" + code);
    return s === "wx" + code ? "—" : s;
  };
  const label = (code) => wxLabel(code);
  const kind = (code) => (CODES[code] || ["cloud", "cloudy"])[1];
  const icon = (code) => ICONS[(CODES[code] || ["cloud"])[0]] || ICONS.cloud;
  const clock = (iso) => (iso ? iso.slice(11, 16) : "—");

  const windWord = (ms) => {
    const v = num(ms) ?? 0;
    let level = 8;
    if (v < 1.6) level = 1;
    else if (v < 3.4) level = 2;
    else if (v < 5.5) level = 3;
    else if (v < 8) level = 4;
    else if (v < 10.8) level = 5;
    else if (v < 13.9) level = 6;
    else if (v < 17.2) level = 7;
    return { level, text: I.t("wind" + level) };
  };

  const uvWord = (uv) => {
    const v = num(uv) ?? 0;
    if (v < 3) return I.t("uvLow");
    if (v < 6) return I.t("uvMod");
    if (v < 8) return I.t("uvHigh");
    if (v < 11) return I.t("uvVHigh");
    return I.t("uvExt");
  };

  const pollenWord = (value) => {
    const v = num(value) ?? 0;
    if (v >= 50) return I.t("pollenHigh");
    if (v >= 11) return I.t("pollenMod");
    return I.t("pollenLow");
  };

  const formatDay = (iso, index) => {
    const d = new Date(`${iso}T00:00:00`);
    const md = `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]})`;
    return index === 0 ? `${I.t("dayToday")} ${md}` : index === 1 ? `${I.t("dayTomorrow")} ${md}` : md;
  };

  /* ---------- 提案エンジン ---------- */
  const buildAdvice = (data, pollen) => {
    const cur = data.current;
    const day = data.daily;
    const today = {
      code: day.weather_code[0],
      max: num(day.temperature_2m_max[0]),
      min: num(day.temperature_2m_min[0]),
      appMax: num(day.apparent_temperature_max?.[0]),
      appMin: num(day.apparent_temperature_min?.[0]),
      pop: num(day.precipitation_probability_max?.[0]),
      rain: num(day.precipitation_sum?.[0]),
      snow: num(day.snowfall_sum?.[0]),
      uv: num(day.uv_index_max?.[0]),
      wind: num(day.wind_speed_10m_max?.[0]),
      gust: num(day.wind_gusts_10m_max?.[0]),
      sunset: day.sunset?.[0],
      sunrise: day.sunrise?.[0],
    };
    const kindToday = kind(today.code);
    const wind = windWord(today.wind ?? cur.wind_speed_10m);
    const gust = windWord(today.gust ?? 0);
    const diff = today.max !== null && today.min !== null ? today.max - today.min : null;

    const risks = [];
    const wear = [];
    const plan = [];
    const items = [];

    /* リスク（高い順） */
    if (kindToday === "thunder") risks.push({ level: "high", text: I.t("riskThunder") });
    if ((today.rain ?? 0) >= 30 || kindToday === "heavy") risks.push({ level: "high", text: I.t("riskHeavyRain") });
    if ((today.snow ?? 0) >= 5) risks.push({ level: "high", text: I.t("riskSnow") });
    if (gust.level >= 7) risks.push({ level: "high", text: I.t("riskGustHigh") });
    if ((today.appMax ?? today.max ?? 0) >= 35) risks.push({ level: "high", text: I.t("riskHeat") });
    else if ((today.appMax ?? today.max ?? 0) >= 32) risks.push({ level: "mid", text: I.t("riskHeatMid") });
    if ((today.min ?? 99) <= 0 && (today.rain ?? 0) > 0) risks.push({ level: "mid", text: I.t("riskFreeze") });
    if ((today.min ?? 99) <= -5) risks.push({ level: "mid", text: I.t("riskCold") });
    if (gust.level >= 5 && gust.level < 7) risks.push({ level: "mid", text: I.t("riskGustMid") });
    if (kindToday === "fog") risks.push({ level: "mid", text: I.t("riskFog") });
    if (diff !== null && diff >= 12) risks.push({ level: "mid", text: I.t("riskDiff") });
    if ((today.uv ?? 0) >= 8) risks.push({ level: "mid", text: I.t("riskUv") });
    if (pollen && pollen.level >= 50) risks.push({ level: "mid", text: I.t("riskPollen", [pollen.label]) });

    /* 服装 */
    if (diff !== null && diff >= 8) wear.push(I.t("wearDiff"));
    if (today.max !== null && today.max >= 32) wear.push(I.t("wearHot"));
    else if (today.max !== null && today.max >= 25) wear.push(I.t("wearWarm"));
    else if (today.max !== null && today.max >= 18) wear.push(I.t("wearMild"));
    else if (today.max !== null && today.max >= 10) wear.push(I.t("wearCool"));
    else if (today.max !== null) wear.push(I.t("wearCold"));
    if (today.min !== null && today.min <= 5) wear.push(I.t("wearFreeze"));
    if ((today.pop ?? 0) >= 30 || (today.rain ?? 0) > 0) wear.push(I.t("wearRain"));
    if (gust.level >= 5) wear.push(I.t("wearGust"));
    if ((today.snow ?? 0) > 0) wear.push(I.t("wearSnow"));

    /* 遊び方 */
    if (kindToday === "clear" && (today.pop ?? 0) < 30) plan.push(I.t("planClear"));
    else if (kindToday === "cloudy" && (today.pop ?? 0) < 40) plan.push(I.t("planCloudy"));
    const severe = kindToday === "thunder" || (today.rain ?? 0) >= 20 || gust.level >= 7 || (today.snow ?? 0) >= 5;
    if ((kindToday === "drizzle" || kindToday === "light") && !severe) plan.push(I.t("planDrizzle"));
    if (kindToday === "thunder" || (today.rain ?? 0) >= 20 || gust.level >= 7) plan.push(I.t("planSevere"));
    if (gust.level >= 5 && gust.level < 7) plan.push(I.t("planGustMid"));
    if (gust.level === 3 || gust.level === 4) plan.push(I.t("planGustLow"));
    if (today.max !== null && today.max >= 28) plan.push(I.t("planHot"));
    if ((today.snow ?? 0) > 0 || (today.max !== null && today.max <= 5)) plan.push(I.t("planSnow"));
    if (kindToday === "fog") plan.push(I.t("planFog"));
    if (pollen && pollen.level >= 11) plan.push(I.t("planPollen"));
    if (!plan.length) plan.push(I.t("planDefault"));

    /* 持ち物 */
    if ((today.pop ?? 0) >= 60 || (today.rain ?? 0) >= 5) items.push(I.t("itemUmbrella"));
    else if ((today.pop ?? 0) >= 30) items.push(I.t("itemFold"));
    if (gust.level >= 5) items.push(I.t("itemHatGust"));
    else if ((today.uv ?? 0) >= 3) items.push(I.t("itemHat"));
    if ((today.uv ?? 0) >= 6) items.push(I.t("itemSun"));
    if ((today.appMax ?? today.max ?? 0) >= 28) items.push(I.t("itemDrink"));
    if ((today.appMax ?? today.max ?? 0) >= 32) items.push(I.t("itemTowel"));
    if (today.max !== null && today.max >= 25) items.push(I.t("itemBug"));
    if (diff !== null && diff >= 8) items.push(I.t("itemJacket"));
    if (today.min !== null && today.min <= 5) items.push(I.t("itemGloves"));
    if ((today.rain ?? 0) > 0) items.push(I.t("itemShoesRain"));
    if ((today.snow ?? 0) > 0) items.push(I.t("itemShoesSnow"));
    if (pollen && pollen.level >= 11) items.push(I.t("itemMask"));
    if (!items.length) items.push(I.t("itemNone"));

    return { risks, wear, plan, items, today, wind, gust, diff };
  };

  /* ---------- 描画 ---------- */
  const renderNow = (data) => {
    const cur = data.current;
    nowBox.innerHTML = `
      <div class="weather-now-main">
        <span class="weather-icon big">${icon(cur.weather_code)}</span>
        <div>
          <p class="weather-temp"><strong>${round(cur.temperature_2m)}</strong><span>℃</span></p>
          <p class="weather-cond">${label(cur.weather_code)}（${I.t("wxFeels")} ${round(cur.apparent_temperature)}℃）</p>
        </div>
      </div>
      <dl class="weather-facts">
        <div><dt>${I.t("wxHumidity")}</dt><dd>${round(cur.relative_humidity_2m)}%</dd></div>
        <div><dt>${I.t("wxWind")}</dt><dd>${round(cur.wind_speed_10m)} m/s</dd></div>
        <div><dt>${I.t("wxGust")}</dt><dd>${round(cur.wind_gusts_10m)} m/s</dd></div>
        <div><dt>${I.t("wxPrecip")}</dt><dd>${num(cur.precipitation) ?? 0} mm</dd></div>
      </dl>
    `;
  };

  const renderDays = (daily) => {
    daysBox.innerHTML = daily.time
      .map((iso, index) => {
        const pop = daily.precipitation_probability_max?.[index];
        return `
          <article class="weather-day">
            <p class="weather-day-date">${formatDay(iso, index)}</p>
            <span class="weather-icon">${icon(daily.weather_code[index])}</span>
            <p class="weather-day-cond">${label(daily.weather_code[index])}</p>
            <p class="weather-day-temp"><strong>${round(daily.temperature_2m_max[index])}℃</strong><span>${round(daily.temperature_2m_min[index])}℃</span></p>
            <p class="weather-day-pop">${I.t("wxPopLabel")} ${pop ?? "—"}%</p>
          </article>
        `;
      })
      .join("");
  };

  const renderSummary = (advice) => {
    const t = advice.today;
    summaryBox.innerHTML = `${I.t("wxSummaryPrefix")}${label(t.code)}　${round(t.min)}〜${round(t.max)}℃　${I.t("wxUV")} ${uvWord(t.uv)}　${I.t("wxWind2")} ${advice.wind.text}　${I.t("wxPop")} ${t.pop ?? "—"}%`;
  };

  const renderRisk = (risks) => {
    if (!risks.length) {
      riskBox.hidden = true;
      riskBox.innerHTML = "";
      return;
    }
    riskBox.hidden = false;
    riskBox.innerHTML = `
      <p class="risk-title">${I.t("wxRiskTitle")}</p>
      <ul>${risks
        .map((risk) => `<li class="${risk.level === "high" ? "high" : "mid"}">${risk.text}</li>`)
        .join("")}</ul>
      <p class="risk-note">${I.t("wxRiskNote")}
        <a href="https://www.jma.go.jp/bosai/warning/" target="_blank" rel="noopener noreferrer">${I.t("wxJma")}</a>
        ${I.t("wxRiskNoteAfter")}</p>
    `;
  };

  const renderList = (box, items) => {
    const block = box.closest("[data-guide]");
    if (!items.length) {
      if (block) block.hidden = true;
      box.innerHTML = "";
      return;
    }
    if (block) block.hidden = false;
    box.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };

  const renderExtra = (advice, data, pollen) => {
    const t = advice.today;
    const parts = [];
    if (t.appMax !== null && t.appMin !== null)
      parts.push(`${I.t("wxFeels")} ${round(t.appMin)}〜${round(t.appMax)}℃`);
    parts.push(`${I.t("wxSunrise")} ${clock(t.sunrise)}／${I.t("wxSunset")} ${clock(t.sunset)}`);
    if (pollen && pollen.level > 0) parts.push(`${I.t("wxPollen")}（${pollen.label}）${pollenWord(pollen.level)}`);
    if ((t.snow ?? 0) > 0) parts.push(`${I.t("wxSnowfall")} ${t.snow.toFixed(1)} cm`);
    if ((t.rain ?? 0) > 0) parts.push(`${I.t("wxDailyPrecip")} ${t.rain.toFixed(1)} mm`);
    extraBox.textContent = parts.join("　｜　");
  };

  const renderError = () => {
    nowBox.innerHTML = `<p class="weather-loading">${I.t("wxError")}</p>`;
    updatedBox.textContent = I.t("wxUpdatedFail");
  };

  const apply = (data, pollen, cached) => {
    renderNow(data);
    renderDays(data.daily);
    const advice = buildAdvice(data, pollen);
    renderSummary(advice);
    renderRisk(advice.risks);
    renderList(wearBox, advice.wear);
    renderList(planBox, advice.plan);
    renderList(itemsBox, advice.items);
    renderExtra(advice, data, pollen);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    updatedBox.textContent = I.t("wxUpdated", [`${hh}:${mm}`]) + (cached ? I.t("wxUpdatedCached") : "");
  };

  const readCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL || !parsed.data) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  };

  const writeCache = (data, pollen) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data, pollen }));
    } catch (error) {
      /* 保存できない環境では無視 */
    }
  };

  const parsePollen = (payload) => {
    const hourly = payload?.hourly;
    if (!hourly) return null;
    const keys = ["birch_pollen", "alder_pollen", "grass_pollen", "mugwort_pollen", "ragweed_pollen"];
    let best = 0;
    let name = "";
    const names = {
      birch_pollen: I.t("pollenBirch"),
      alder_pollen: I.t("pollenAlder"),
      grass_pollen: I.t("pollenGrass"),
      mugwort_pollen: I.t("pollenMugwort"),
      ragweed_pollen: I.t("pollenRagweed"),
    };
    keys.forEach((key) => {
      const values = (hourly[key] || []).filter((value) => typeof value === "number");
      const max = values.length ? Math.max(...values) : 0;
      if (max > best) {
        best = max;
        name = names[key];
      }
    });
    return { level: best, label: name || I.t("wxPollen") };
  };

  const cached = readCache();
  if (cached?.data) apply(cached.data, cached.pollen ?? null, true);

  const pollenRequest = fetch(POLLEN)
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => parsePollen(payload))
    .catch(() => null);

  fetch(FORECAST)
    .then((response) => {
      if (!response.ok) throw new Error("weather request failed");
      return response.json();
    })
    .then(async (data) => {
      if (!data?.current || !data?.daily) throw new Error("unexpected payload");
      const pollen = await pollenRequest;
      writeCache(data, pollen);
      apply(data, pollen, false);
    })
    .catch(() => {
      if (!cached?.data) renderError();
    });
})();
