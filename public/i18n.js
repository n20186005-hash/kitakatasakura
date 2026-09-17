/* 言語辞書：document.documentElement.lang に応じて ja / en を切り替える。
   script.js と weather.js から window.I18N.t(key, vars) で参照する。 */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "ja").split("-")[0].toLowerCase();
  if (lang !== "en") lang = "ja";

  var dict = {
    ja: {
      menuOpen: "メニューを開く",
      menuClose: "メニューを閉じる",

      planShortLabel: "60分精華コース",
      planShortRoute: "喜多方駅 → 南側入口 → まちなか桜道 → SL広場 → 同じ道を戻る",
      planStandardLabel: "120分賞桜コース",
      planStandardRoute: "南側入口 → SL広場 → 桜のトンネル → 北側の静かな区間 → 市街地へ戻る",
      planDayLabel: "喜多方一日コース",
      planDayRoute: "朝ラー → 日中線しだれ桜並木 → 昼食 → 蔵のまち歩き → 酒蔵・喫茶",

      saveSaved: "保存済み",
      savePrompt: "このコースを保存",
      savedToast: "{0}をこの端末に保存しました",
      shareTitle: "日中線しだれ桜並木 旅人向けガイド",
      shareText: "線路は消え、春だけの道が残った。喜多方の日中線しだれ桜並木を歩くためのガイドです。",
      copyToast: "ページのアドレスをコピーしました",
      shareFail: "共有できませんでした",

      dayToday: "今日",
      dayTomorrow: "明日",
      sun: "日", mon: "月", tue: "火", wed: "水", thu: "木", fri: "金", sat: "土",

      wx0: "快晴", wx1: "おおむね晴れ", wx2: "ところにより曇り", wx3: "曇り",
      wx45: "霧", wx48: "着氷性の霧",
      wx51: "弱い霧雨", wx53: "霧雨", wx55: "強い霧雨", wx56: "着氷性の霧雨", wx57: "強い着氷性の霧雨",
      wx61: "小雨", wx63: "雨", wx65: "大雨", wx66: "着氷性の雨", wx67: "強い着氷性の雨",
      wx71: "小雪", wx73: "雪", wx75: "大雪", wx77: "霧雪",
      wx80: "にわか雨", wx81: "強いにわか雨", wx82: "激しいにわか雨", wx85: "にわか雪", wx86: "強いにわか雪",
      wx95: "雷雨", wx96: "雷雨とひょう", wx99: "激しい雷雨とひょう",

      wind1: "ほとんど風なし", wind2: "やわらかな風", wind3: "やや強い風", wind4: "やや強い風",
      wind5: "強い風", wind6: "かなり強い風", wind7: "非常に強い風", wind8: "猛烈な風",
      uvLow: "弱い", uvMod: "やや強い", uvHigh: "強い", uvVHigh: "非常に強い", uvExt: "極端に強い",
      pollenLow: "少ない", pollenMod: "やや多い", pollenHigh: "多い",

      wxHumidity: "湿度", wxWind: "風速", wxGust: "突風", wxPrecip: "降水",
      wxSummaryPrefix: "今日：", wxUV: "紫外線", wxWind2: "風", wxPop: "降水確率",
      wxRiskTitle: "注意しておきたい点",
      wxRiskNote: "予測値から算出した目安です。気象警報・注意報は",
      wxRiskNoteAfter: "でご確認ください。",
      wxJma: "気象庁 防災情報↗",
      wxUpdated: "{0} 時点の予測",
      wxUpdatedCached: "（この端末に保存した直近の取得結果）",
      wxUpdatedFail: "取得に失敗しました。",
      pollenBirch: "カバノキ科", pollenAlder: "ハンノキ科", pollenGrass: "イネ科", pollenMugwort: "ヨモギ", pollenRagweed: "ブタクサ",
      wxPopLabel: "降水確率", wxFeels: "体感温度", wxSunrise: "日の出", wxSunset: "日の入り",
      wxPollen: "花粉", wxSnowfall: "降雪量の目安", wxDailyPrecip: "1日の降水量",
      wxError: '天気情報を取得できませんでした。通信環境をご確認のうえ、最新の天気は<a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noopener noreferrer">気象庁 防災情報↗</a>でご確認ください。',
      wxLoading: "天気情報を読み込んでいます…",

      riskThunder: "雷雨のおそれがあります。傘や高い木、支柱のそばは避け、屋内でやり過ごす判断も検討してください。",
      riskHeavyRain: "雨量が多くなる予想です。側溝や用水路の増水、足元の悪化に注意し、無理な行動は控えてください。",
      riskSnow: "まとまった降雪の予想です。歩道の凍結・圧雪に備え、滑り止めのある靴で。",
      riskGustHigh: "非常に強い風の予想です。枝や看板、傘の取り扱いに注意し、並木の下は早めに離れましょう。",
      riskHeat: "猛暑日の予想です。日陰が少ない区間が多いため、散策は午前か夕方に限定し、こまめに水分を。",
      riskHeatMid: "暑さの厳しい一日です。日陰が少ない並木では、休憩と水分補給をこまめにとりましょう。",
      riskFreeze: "気温が0℃前後まで下がり、路面が凍結するおそれがあります。足元に注意してください。",
      riskCold: "冷え込みの厳しい日です。防寒と、末端の冷え対策を。",
      riskGustMid: "風が強まる時間がありそうです。帽子や傘が飛ばされないよう注意してください。",
      riskFog: "霧で見通しが悪くなるおそれがあります。車での来訪は速度を控えめに。",
      riskDiff: "一日の寒暖差が大きい日です。体調を崩しやすいので、羽織るものを一枚用意してください。",
      riskUv: "紫外線が非常に強い予想です。帽子・日焼け止め・こまめな水分補給を。",
      riskPollen: "花粉（{0}）が多い予想です。花粉症の方はマスクと目の保護を。",

      wearDiff: "朝晩と日中の気温差が大きい日。脱ぎ着しやすい上着を一枚。",
      wearHot: "通気性のよい軽装で。汗をかくので羽織れるものも一枚あると安心。",
      wearWarm: "半袖で過ごせます。日差しをさえぎる帽子・羽織りものを併用。",
      wearMild: "長袖一枚でちょうどよい陽気。朝晩は薄手の上着を。",
      wearCool: "日中でも羽織るものが必要です。重ね着で調整を。",
      wearCold: "厚手の上着・手袋・マフラーなど、しっかりした防寒を。",
      wearFreeze: "朝晩は冷え込みます。首元を温められる服装に。",
      wearRain: "雨に濡れても乾きやすい上着と、滑りにくい靴を。",
      wearGust: "風を通しにくい上着。帽子はあごひも付きなど飛ばされにくいものを。",
      wearSnow: "防水性のある靴と滑り止め。足首まで覆えるものが安心です。",

      planClear: "散策と撮影に向いた一日。午前は光が低く、しだれ桜の枝に陰影が出ます。",
      planCloudy: "光がやわらかく花色が均一に写ります。長時間歩いても疲れにくいコンディションです。",
      planDrizzle: "小雨の日は人出が少なく、しだれ桜は花色が濃く見えます。足元に注意して短めの行程で。",
      planSevere: "並木歩きは控えめに。喜多方駅周辺や市街地の屋内施設を中心に組み立ててください。",
      planGustMid: "花が散りやすく枝が揺れるので、撮影は風が弱い午前中の早い時間に。",
      planGustLow: "風で花びらが舞う条件。散り始めの時期なら「花吹雪」が狙えます。",
      planHot: "日陰が少ない区間があります。暑い時間帯は蔵のまちやカフェに切り替えるのが賢い選択です。",
      planSnow: "雪や氷の並木は静かで美しい日。日没が早いので、行程は短めに組んでください。",
      planFog: "見通しが悪く、遠景の撮影には向きません。近景の枝ぶりやSLの質感を楽しむ日に。",
      planPollen: "花粉が気になる日。長時間の屋外滞在は休憩をはさみながら。",
      planDefault: "特別な注意は少ない一日。混雑しやすい時間帯をずらして、ゆっくり歩けます。",

      itemUmbrella: "傘または雨具",
      itemFold: "折りたたみ傘",
      itemHatGust: "飛ばされにくい帽子",
      itemHat: "帽子",
      itemSun: "日焼け止め・サングラス",
      itemDrink: "飲み物（多めに）",
      itemTowel: "汗拭きタオル",
      itemBug: "虫よけ",
      itemJacket: "脱ぎ着できる上着",
      itemGloves: "手袋・マフラー",
      itemShoesRain: "滑りにくい靴",
      itemShoesSnow: "滑り止め付きの靴",
      itemMask: "マスク・目薬",
      itemNone: "とくに追加の道具は不要です。飲み物とカメラがあれば十分。"
    },

    en: {
      menuOpen: "Open menu",
      menuClose: "Close menu",

      planShortLabel: "60-min Highlights Course",
      planShortRoute: "Kitakata Station → South Entrance → Machinaka Sakura Path → SL Plaza → back the same way",
      planStandardLabel: "120-min Cherry Viewing Course",
      planStandardRoute: "South Entrance → SL Plaza → Cherry Tunnel → quiet northern section → return to town",
      planDayLabel: "Kitakata Full-Day Course",
      planDayRoute: "Morning ramen → Nitchū-sen Weeping Cherry Path → lunch → storehouse town walk → sake brewery & café",

      saveSaved: "Saved",
      savePrompt: "Save this course",
      savedToast: "Saved {0} to this device",
      shareTitle: "Nitchū-sen Weeping Cherry Path – Visitor Guide",
      shareText: "The tracks are gone; only a springtime path remains. A guide to walking the Nitchū-sen Weeping Cherry Trees in Kitakata.",
      copyToast: "Page link copied",
      shareFail: "Could not share",

      dayToday: "Today",
      dayTomorrow: "Tomorrow",
      sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",

      wx0: "Clear", wx1: "Mostly clear", wx2: "Partly cloudy", wx3: "Cloudy",
      wx45: "Fog", wx48: "Rime fog",
      wx51: "Light drizzle", wx53: "Drizzle", wx55: "Heavy drizzle", wx56: "Freezing drizzle", wx57: "Heavy freezing drizzle",
      wx61: "Light rain", wx63: "Rain", wx65: "Heavy rain", wx66: "Freezing rain", wx67: "Heavy freezing rain",
      wx71: "Light snow", wx73: "Snow", wx75: "Heavy snow", wx77: "Snow grains",
      wx80: "Rain showers", wx81: "Heavy rain showers", wx82: "Violent rain showers", wx85: "Snow showers", wx86: "Heavy snow showers",
      wx95: "Thunderstorm", wx96: "Thunderstorm with hail", wx99: "Severe thunderstorm with hail",

      wind1: "Calm", wind2: "Light breeze", wind3: "Breezy", wind4: "Breezy",
      wind5: "Strong wind", wind6: "Very strong wind", wind7: "Gale-force wind", wind8: "Violent wind",
      uvLow: "Low", uvMod: "Moderate", uvHigh: "High", uvVHigh: "Very high", uvExt: "Extreme",
      pollenLow: "Low", pollenMod: "Moderate", pollenHigh: "High",

      wxHumidity: "Humidity", wxWind: "Wind", wxGust: "Gusts", wxPrecip: "Precip",
      wxSummaryPrefix: "Today: ", wxUV: "UV", wxWind2: "Wind", wxPop: "P.O.P.",
      wxRiskTitle: "Things to watch out for",
      wxRiskNote: "These are estimates from the forecast. For official warnings, see the",
      wxRiskNoteAfter: ".",
      wxJma: "JMA Disaster Info↗",
      wxUpdated: "Forecast as of {0}",
      wxUpdatedCached: " (saved on this device)",
      wxUpdatedFail: "Failed to fetch.",
      pollenBirch: "birch", pollenAlder: "alder", pollenGrass: "grass", pollenMugwort: "mugwort", pollenRagweed: "ragweed",
      wxPopLabel: "P.O.P.", wxFeels: "Feels like", wxSunrise: "Sunrise", wxSunset: "Sunset",
      wxPollen: "Pollen", wxSnowfall: "Snowfall", wxDailyPrecip: "Daily precip",
      wxError: 'Could not load weather data. Please check your connection, and see the latest forecast on the <a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noopener noreferrer">JMA Disaster Info↗</a>.',
      wxLoading: "Loading weather data…",

      riskThunder: "Thunderstorms are possible. Avoid umbrellas and standing near tall trees or poles; consider waiting it out indoors.",
      riskHeavyRain: "Heavy rainfall is expected. Watch for swollen ditches and slippery ground; avoid pushing yourself.",
      riskSnow: "Significant snowfall is expected. Prepare for icy, packed snow on the path with non-slip footwear.",
      riskGustHigh: "Very strong winds are expected. Mind branches, signs, and umbrellas, and move away from under the trees early.",
      riskHeat: "A scorching day is expected. With little shade along the path, limit walking to morning or evening and drink often.",
      riskHeatMid: "A hot day. With little shade among the trees, take regular breaks and drink water.",
      riskFreeze: "Temperatures may drop to around 0°C and the surface could freeze. Watch your footing.",
      riskCold: "A severe cold day. Dress warmly and protect your extremities.",
      riskGustMid: "Gusty spells are likely. Keep hats and umbrellas from blowing away.",
      riskFog: "Fog may reduce visibility. Drive slowly if arriving by car.",
      riskDiff: "A day with a large temperature swing. Easy to catch a chill—bring a layer to put on or take off.",
      riskUv: "Very strong UV is expected. Hat, sunscreen, and regular hydration.",
      riskPollen: "Pollen ({0}) is forecast to be high. Allergy sufferers should wear a mask and eye protection.",

      wearDiff: "Big temperature swing between morning/evening and midday. Bring a layer you can shed.",
      wearHot: "Light, breathable clothing. A layer to throw on is handy since you may sweat.",
      wearWarm: "Short sleeves are fine. Pair with a hat or light layer for the sun.",
      wearMild: "A single long-sleeve is comfortable. A light jacket for morning and evening.",
      wearCool: "You'll want a layer even during the day. Dress in layers.",
      wearCold: "Proper cold-weather gear: heavy coat, gloves, scarf.",
      wearFreeze: "Chilly mornings and evenings. Keep your neck warm.",
      wearRain: "A quick-drying coat and non-slip shoes.",
      wearGust: "A wind-resistant coat. A hat with a chin strap that won't blow away.",
      wearSnow: "Waterproof shoes with traction. Coverage to the ankle is reassuring.",

      planClear: "A good day for walking and photos. Light is low in the morning, giving the weeping branches depth.",
      planCloudy: "Soft light renders the blossom evenly—easy on the legs for a long walk.",
      planDrizzle: "On light-rain days the crowds thin and the blossoms look deeper in color. Mind your footing on a shorter route.",
      planSevere: "Keep riverside walking light. Center your plan on Kitakata Station and indoor spots in town.",
      planGustMid: "Petals scatter easily and branches sway—shoot in the calm early morning.",
      planGustLow: "Wind drifts the petals; early in the fall you may catch a 'flower blizzard'.",
      planHot: "Little shade in places. Switching to the storehouse town or a café in the heat is smart.",
      planSnow: "Snow- or ice-lined trees are quiet and beautiful. Sunset is early—keep the route short.",
      planFog: "Poor visibility, not suited to distant shots. Enjoy nearby branches and the SL's texture.",
      planPollen: "A high-pollen day. Break up long outdoor stays with rests.",
      planDefault: "A calm day with few cautions. Shift away from peak hours and stroll at ease.",

      itemUmbrella: "Umbrella or rain gear",
      itemFold: "Folding umbrella",
      itemHatGust: "Hat that won't blow away",
      itemHat: "Hat",
      itemSun: "Sunscreen & sunglasses",
      itemDrink: "Drinks (plenty)",
      itemTowel: "Towel",
      itemBug: "Insect repellent",
      itemJacket: "A layer to shed",
      itemGloves: "Gloves & scarf",
      itemShoesRain: "Non-slip shoes",
      itemShoesSnow: "Shoes with traction",
      itemMask: "Mask & eye drops",
      itemNone: "No extra gear needed. Drinks and a camera are enough."
    }
  };

  var table = dict[lang] || dict.ja;

  window.I18N = {
    lang: lang,
    t: function (key, vars) {
      var s = table[key];
      if (s == null) s = dict.ja[key];
      if (s == null) return key;
      if (vars && vars.length) {
        s = s.replace(/\{(\d+)\}/g, function (_, i) {
          return vars[i] != null ? vars[i] : "";
        });
      }
      return s;
    }
  };
})();
