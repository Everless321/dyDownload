#!/usr/bin/env node
'use strict';

var path = require('path');
var commander = require('commander');
var consola = require('consola');
var zod = require('zod');
var os = require('os');
var crypto = require('crypto');
var smCrypto = require('sm-crypto');
var jsonpathPlus = require('jsonpath-plus');
var fs2 = require('fs');
var promises = require('stream/promises');
var got = require('got');
var pLimit = require('p-limit');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var consola__default = /*#__PURE__*/_interopDefault(consola);
var os__namespace = /*#__PURE__*/_interopNamespace(os);
var crypto__default = /*#__PURE__*/_interopDefault(crypto);
var smCrypto__default = /*#__PURE__*/_interopDefault(smCrypto);
var fs2__namespace = /*#__PURE__*/_interopNamespace(fs2);
var got__default = /*#__PURE__*/_interopDefault(got);
var pLimit__default = /*#__PURE__*/_interopDefault(pLimit);

var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
var ConfigSchema = zod.z.object({
  cookie: zod.z.string().default(""),
  userAgent: zod.z.string().default(DEFAULT_USER_AGENT),
  referer: zod.z.string().default("https://www.douyin.com/"),
  downloadPath: zod.z.string().default("./downloads"),
  maxConcurrency: zod.z.number().min(1).max(10).default(3),
  timeout: zod.z.number().default(3e4),
  retries: zod.z.number().default(3),
  proxy: zod.z.string().optional(),
  encryption: zod.z.enum(["ab", "xb"]).default("xb"),
  msToken: zod.z.object({
    url: zod.z.string(),
    magic: zod.z.number(),
    version: zod.z.number(),
    dataType: zod.z.number(),
    strData: zod.z.string(),
    ulr: zod.z.number()
  }).default({
    url: "https://mssdk.bytedance.com/web/r/token?ms_appid=6383&msToken=T4bNG9W2rKF7hBNwaYssDErnJEobDAk641DFaOn4hcsfAM8slpbZeKPM4Ml4rhDQq18iY8nQ0JR3J87SLZtDiDqtZdZawfBjCWAgtolQsoEtG6MLETvo4fwr7F28zGJUFDdJgKEZHibNR0QshVBv28ygsQsJDzerKAtsgj9Pn5WsxyS1vfkiX3I%3D",
    magic: 538969122,
    version: 1,
    dataType: 8,
    strData: "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",
    ulr: 0
  }),
  ttwid: zod.z.object({
    url: zod.z.string(),
    data: zod.z.string()
  }).default({
    url: "https://ttwid.bytedance.com/ttwid/union/register/",
    data: JSON.stringify({
      region: "cn",
      aid: 1768,
      needFid: false,
      service: "www.ixigua.com",
      migrate_info: { ticket: "", source: "node" },
      cbUrlProtocol: "https",
      union: true
    })
  }),
  webid: zod.z.object({
    url: zod.z.string(),
    body: zod.z.object({
      app_id: zod.z.number(),
      referer: zod.z.string(),
      url: zod.z.string(),
      user_agent: zod.z.string()
    })
  }).default({
    url: "https://mcs.zijieapi.com/webid?aid=6383&sdk_version=5.1.18_zip&device_platform=web",
    body: {
      app_id: 6383,
      referer: "https://www.douyin.com/",
      url: "https://www.douyin.com/",
      user_agent: DEFAULT_USER_AGENT
    }
  })
});
var currentConfig = ConfigSchema.parse({});
function getConfig() {
  return currentConfig;
}
function setConfig(config) {
  currentConfig = ConfigSchema.parse({ ...currentConfig, ...config });
  return currentConfig;
}
function getEncryption() {
  return currentConfig.encryption;
}

// src/errors/index.ts
var DouyinError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DouyinError";
  }
};
var APIConnectionError = class extends DouyinError {
  constructor(message) {
    super(message);
    this.name = "APIConnectionError";
  }
};
var APIResponseError = class extends DouyinError {
  constructor(message) {
    super(message);
    this.name = "APIResponseError";
  }
};
var APINotFoundError = class extends DouyinError {
  constructor(message) {
    super(message);
    this.name = "APINotFoundError";
  }
};
var APITimeoutError = class extends DouyinError {
  constructor(message) {
    super(message);
    this.name = "APITimeoutError";
  }
};
var InvalidConfigError = class extends DouyinError {
  constructor(key, value) {
    super(`Invalid config: ${key} = ${value}`);
    this.name = "InvalidConfigError";
  }
};

// src/client/http.ts
function parseCookies(headers) {
  const cookies = /* @__PURE__ */ new Map();
  const setCookieArray = headers.getSetCookie?.() || [];
  if (setCookieArray.length > 0) {
    for (const cookieStr of setCookieArray) {
      const parts = cookieStr.split(";")[0].trim();
      const [name, ...valueParts] = parts.split("=");
      if (name && valueParts.length > 0) {
        cookies.set(name.trim(), valueParts.join("=").trim());
      }
    }
    return cookies;
  }
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return cookies;
  const cookieStrings = setCookie.split(/,(?=\s*\w+=)/);
  for (const cookieStr of cookieStrings) {
    const parts = cookieStr.split(";")[0].trim();
    const [name, ...valueParts] = parts.split("=");
    if (name && valueParts.length > 0) {
      cookies.set(name.trim(), valueParts.join("=").trim());
    }
  }
  return cookies;
}
async function request(url, options = {}) {
  const config = getConfig();
  const { method = "GET", headers = {}, body, timeout = config.timeout, followRedirects = true } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const fetchOptions = {
    method,
    headers: {
      "User-Agent": config.userAgent,
      "Referer": config.referer,
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Origin": "https://www.douyin.com",
      "Sec-Ch-Ua": '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      ...headers
    },
    signal: controller.signal,
    redirect: followRedirects ? "follow" : "manual"
  };
  if (body) {
    if (typeof body === "string") {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers["Content-Type"] = "application/json; charset=utf-8";
    }
  }
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    const cookies = parseCookies(response.headers);
    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    return {
      status: response.status,
      headers: response.headers,
      data,
      url: response.url,
      cookies
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new APITimeoutError(`\u8BF7\u6C42\u8D85\u65F6: ${url}`);
      }
      if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
        throw new APIConnectionError(`\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25: ${url}`);
      }
      if (error.message.includes("ENOTFOUND")) {
        throw new APIConnectionError(`DNS\u89E3\u6790\u5931\u8D25: ${url}`);
      }
      throw new APIResponseError(`\u8BF7\u6C42\u5931\u8D25: ${error.message}`);
    }
    throw new APIResponseError(`\u672A\u77E5\u9519\u8BEF: ${url}`);
  }
}
async function get(url, options = {}) {
  return request(url, { ...options, method: "GET" });
}
async function post(url, body, options = {}) {
  return request(url, { ...options, method: "POST", body });
}
var URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;
function extractValidUrls(input) {
  if (typeof input === "string") {
    const matches = input.match(URL_REGEX);
    return matches ? matches[0] : null;
  }
  const result = [];
  for (const item of input) {
    const matches = item.match(URL_REGEX);
    if (matches) {
      result.push(...matches);
    }
  }
  return result;
}
function splitFilename(filename, limits) {
  const platform2 = os__namespace.platform();
  let limit;
  switch (platform2) {
    case "win32":
    case "cygwin":
      limit = limits["win32"] || 200;
      break;
    case "darwin":
      limit = limits["darwin"] || 200;
      break;
    default:
      limit = limits["linux"] || 200;
  }
  if (filename.length <= limit) {
    return filename;
  }
  const safeFilename = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
  return safeFilename.slice(0, limit);
}

// src/utils/fetcher.ts
var DOUYIN_USER_PATTERN = /user\/([^/?]*)/;
var REDIRECT_SEC_UID_PATTERN = /sec_uid=([^&]*)/;
var DOUYIN_VIDEO_PATTERN = /video\/([^/?]*)/;
var DOUYIN_NOTE_PATTERN = /note\/([^/?]*)/;
var DOUYIN_SLIDES_PATTERN = /slides\/([^/?]*)/;
async function getSecUserId(url) {
  if (typeof url !== "string") {
    throw new TypeError("\u53C2\u6570\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B");
  }
  const validUrl = extractValidUrls(url);
  if (!validUrl) {
    throw new APINotFoundError("\u8F93\u5165\u7684URL\u4E0D\u5408\u6CD5");
  }
  const parsedUrl = new URL(validUrl);
  const host = parsedUrl.hostname;
  const pattern = host === "v.douyin.com" || host.endsWith(".v.douyin.com") ? REDIRECT_SEC_UID_PATTERN : DOUYIN_USER_PATTERN;
  const response = await get(validUrl, { followRedirects: true });
  if (response.status === 200 || response.status === 444) {
    const match = pattern.exec(response.url);
    if (match) {
      return match[1];
    }
    throw new APIResponseError("\u672A\u5728\u54CD\u5E94\u7684\u5730\u5740\u4E2D\u627E\u5230sec_user_id\uFF0C\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u4E3A\u7528\u6237\u4E3B\u9875");
  }
  throw new APIResponseError(`\u72B6\u6001\u7801\u9519\u8BEF: ${response.status}`);
}
async function getAwemeId(url) {
  if (typeof url !== "string") {
    throw new TypeError("\u53C2\u6570\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B");
  }
  const validUrl = extractValidUrls(url);
  if (!validUrl) {
    throw new APINotFoundError("\u8F93\u5165\u7684URL\u4E0D\u5408\u6CD5");
  }
  const response = await get(validUrl, { followRedirects: true });
  let match = DOUYIN_VIDEO_PATTERN.exec(response.url);
  if (match) {
    return match[1];
  }
  match = DOUYIN_NOTE_PATTERN.exec(response.url);
  if (match) {
    return match[1];
  }
  match = DOUYIN_SLIDES_PATTERN.exec(response.url);
  if (match) {
    return match[1];
  }
  throw new APIResponseError("\u672A\u5728\u54CD\u5E94\u7684\u5730\u5740\u4E2D\u627E\u5230aweme_id\uFF0C\u5F53\u524D\u94FE\u63A5\u6682\u65F6\u4E0D\u652F\u6301");
}
async function fetchFromSharePage(awemeId) {
  const shareUrl = `https://www.iesdouyin.com/share/video/${awemeId}/`;
  const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
  const response = await get(shareUrl, {
    headers: {
      "User-Agent": mobileUA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9"
    }
  });
  const html = response.data;
  const routerMatch = html.match(/<script[^>]*>window\._ROUTER_DATA\s*=\s*([\s\S]*?)<\/script>/i);
  if (!routerMatch) {
    return null;
  }
  try {
    const jsonStr = routerMatch[1].trim().replace(/;$/, "");
    const routerData = JSON.parse(jsonStr);
    const loaderData = routerData.loaderData;
    for (const key of Object.keys(loaderData)) {
      const data = loaderData[key];
      let detail = data?.aweme?.detail;
      if (!detail && data?.videoInfoRes?.item_list?.length > 0) {
        detail = data.videoInfoRes.item_list[0];
      }
      if (detail) {
        const result = {
          awemeId: detail.awemeId || detail.aweme_id,
          desc: detail.desc || "",
          createTime: detail.createTime || detail.create_time || 0,
          author: {
            uid: detail.author?.uid || "",
            secUid: detail.author?.secUid || detail.author?.sec_uid || "",
            nickname: detail.author?.nickname || "",
            avatarThumb: detail.author?.avatarThumb?.urlList?.[0] || detail.author?.avatar_thumb?.url_list?.[0]
          },
          statistics: {
            diggCount: detail.statistics?.diggCount || detail.statistics?.digg_count || 0,
            commentCount: detail.statistics?.commentCount || detail.statistics?.comment_count || 0,
            shareCount: detail.statistics?.shareCount || detail.statistics?.share_count || 0,
            collectCount: detail.statistics?.collectCount || detail.statistics?.collect_count || 0
          }
        };
        if (detail.video && !detail.images) {
          const playAddr = detail.video.playAddr || detail.video.play_addr;
          const cover = detail.video.cover || detail.video.origin_cover;
          result.video = {
            duration: detail.video.duration || 0,
            playAddr: playAddr ? playAddr[0]?.src ? playAddr.map((p) => p.src) : playAddr.url_list || [] : [],
            cover: cover?.urlList || cover?.url_list || []
          };
        }
        if (detail.images && detail.images.length > 0) {
          result.images = detail.images.map((img) => ({
            urlList: img.urlList || img.url_list || []
          }));
        }
        if (detail.music) {
          result.music = {
            id: detail.music.id || detail.music.mid || "",
            title: detail.music.title || "",
            author: detail.music.author || "",
            playUrl: detail.music.playUrl?.uri || detail.music.play_url?.uri
          };
        }
        return result;
      }
    }
  } catch {
    return null;
  }
  return null;
}
var CHAR_TABLE = "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=";
var HEX_ARRAY = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  10,
  11,
  12,
  13,
  14,
  15
];
var UA_KEY = Buffer.from([0, 1, 12]);
function md5(input) {
  const data = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
  return crypto__default.default.createHash("md5").update(data).digest("hex");
}
function md5StrToArray(md5Str) {
  if (md5Str.length > 32) {
    return Array.from(md5Str).map((c) => c.charCodeAt(0));
  }
  const arr = [];
  for (let i = 0; i < md5Str.length; i += 2) {
    const high = HEX_ARRAY[md5Str.charCodeAt(i)] ?? 0;
    const low = HEX_ARRAY[md5Str.charCodeAt(i + 1)] ?? 0;
    arr.push(high << 4 | low);
  }
  return arr;
}
function rc4Encrypt(key, data) {
  const S = Array.from({ length: 256 }, (_, i2) => i2);
  let j = 0;
  for (let i2 = 0; i2 < 256; i2++) {
    j = (j + S[i2] + key[i2 % key.length]) % 256;
    [S[i2], S[j]] = [S[j], S[i2]];
  }
  let i = 0;
  j = 0;
  const result = [];
  for (const byte of data) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    result.push(byte ^ S[(S[i] + S[j]) % 256]);
  }
  return Buffer.from(result);
}
function calculation(a1, a2, a3) {
  const x1 = (a1 & 255) << 16;
  const x2 = (a2 & 255) << 8;
  const x3 = x1 | x2 | a3;
  return CHAR_TABLE[(x3 & 16515072) >> 18] + CHAR_TABLE[(x3 & 258048) >> 12] + CHAR_TABLE[(x3 & 4032) >> 6] + CHAR_TABLE[x3 & 63];
}
function encodingConversion(a, b, c, e, d, t, f, r, n, o, i, _, x, u, s, l, v, h, p) {
  const y = [a, Math.floor(i), b, _, c, x, e, u, d, s, t, l, f, v, r, h, n, p, o];
  return Buffer.from(y).toString("latin1");
}
function encodingConversion2(a, b, c) {
  return String.fromCharCode(a) + String.fromCharCode(b) + c;
}
function getXBogus(urlParams, userAgent) {
  const ua = userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
  const encryptedUa = rc4Encrypt(UA_KEY, Buffer.from(ua, "latin1"));
  const base64Ua = encryptedUa.toString("base64");
  const array1 = md5StrToArray(md5(base64Ua));
  const array2 = md5StrToArray(md5(md5StrToArray("d41d8cd98f00b204e9800998ecf8427e")));
  const urlParamsHash1 = md5(urlParams);
  const urlParamsHash2 = md5(md5StrToArray(urlParamsHash1));
  const urlParamsArray = md5StrToArray(urlParamsHash2);
  const timer = Math.floor(Date.now() / 1e3);
  const ct = 536919696;
  const newArray = [
    64,
    390625e-8,
    1,
    12,
    urlParamsArray[14],
    urlParamsArray[15],
    array2[14],
    array2[15],
    array1[14],
    array1[15],
    timer >> 24 & 255,
    timer >> 16 & 255,
    timer >> 8 & 255,
    timer & 255,
    ct >> 24 & 255,
    ct >> 16 & 255,
    ct >> 8 & 255,
    ct & 255
  ].map((v) => typeof v === "number" ? Math.floor(v) : v);
  let xorResult = newArray[0];
  for (let i = 1; i < newArray.length; i++) {
    xorResult ^= newArray[i];
  }
  newArray.push(xorResult);
  const array3 = [];
  const array4 = [];
  for (let i = 0; i < newArray.length; i += 2) {
    array3.push(newArray[i]);
    if (i + 1 < newArray.length) {
      array4.push(newArray[i + 1]);
    }
  }
  const mergeArray = [...array3, ...array4];
  const encoded = encodingConversion(
    mergeArray[0],
    mergeArray[1],
    mergeArray[2],
    mergeArray[3],
    mergeArray[4],
    mergeArray[5],
    mergeArray[6],
    mergeArray[7],
    mergeArray[8],
    mergeArray[9],
    mergeArray[10],
    mergeArray[11],
    mergeArray[12],
    mergeArray[13],
    mergeArray[14],
    mergeArray[15],
    mergeArray[16],
    mergeArray[17],
    mergeArray[18]
  );
  const rc4Result = rc4Encrypt(Buffer.from([255]), Buffer.from(encoded, "latin1"));
  const garbledCode = encodingConversion2(2, 255, rc4Result.toString("latin1"));
  let xb = "";
  for (let i = 0; i < garbledCode.length; i += 3) {
    xb += calculation(
      garbledCode.charCodeAt(i),
      garbledCode.charCodeAt(i + 1),
      garbledCode.charCodeAt(i + 2)
    );
  }
  return {
    params: `${urlParams}&X-Bogus=${xb}`,
    xbogus: xb,
    userAgent: ua
  };
}
var { sm3 } = smCrypto__default.default;
var CHARACTER = "Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe";
var CHARACTER2 = "ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe";
var CHARACTER_LIST = [CHARACTER, CHARACTER2];
var UA_KEY2 = Buffer.from([0, 1, 14]);
var BIG_ARRAY = [
  121,
  243,
  55,
  234,
  103,
  36,
  47,
  228,
  30,
  231,
  106,
  6,
  115,
  95,
  78,
  101,
  250,
  207,
  198,
  50,
  139,
  227,
  220,
  105,
  97,
  143,
  34,
  28,
  194,
  215,
  18,
  100,
  159,
  160,
  43,
  8,
  169,
  217,
  180,
  120,
  247,
  45,
  90,
  11,
  27,
  197,
  46,
  3,
  84,
  72,
  5,
  68,
  62,
  56,
  221,
  75,
  144,
  79,
  73,
  161,
  178,
  81,
  64,
  187,
  134,
  117,
  186,
  118,
  16,
  241,
  130,
  71,
  89,
  147,
  122,
  129,
  65,
  40,
  88,
  150,
  110,
  219,
  199,
  255,
  181,
  254,
  48,
  4,
  195,
  248,
  208,
  32,
  116,
  167,
  69,
  201,
  17,
  124,
  125,
  104,
  96,
  83,
  80,
  127,
  236,
  108,
  154,
  126,
  204,
  15,
  20,
  135,
  112,
  158,
  13,
  1,
  188,
  164,
  210,
  237,
  222,
  98,
  212,
  77,
  253,
  42,
  170,
  202,
  26,
  22,
  29,
  182,
  251,
  10,
  173,
  152,
  58,
  138,
  54,
  141,
  185,
  33,
  157,
  31,
  252,
  132,
  233,
  235,
  102,
  196,
  191,
  223,
  240,
  148,
  39,
  123,
  92,
  82,
  128,
  109,
  57,
  24,
  38,
  113,
  209,
  245,
  2,
  119,
  153,
  229,
  189,
  214,
  230,
  174,
  232,
  63,
  52,
  205,
  86,
  140,
  66,
  175,
  111,
  171,
  246,
  133,
  238,
  193,
  99,
  60,
  74,
  91,
  225,
  51,
  76,
  37,
  145,
  211,
  166,
  151,
  213,
  206,
  0,
  200,
  244,
  176,
  218,
  44,
  184,
  172,
  49,
  216,
  93,
  168,
  53,
  21,
  183,
  41,
  67,
  85,
  224,
  155,
  226,
  242,
  87,
  177,
  146,
  70,
  190,
  12,
  162,
  19,
  137,
  114,
  25,
  165,
  163,
  192,
  23,
  59,
  9,
  94,
  179,
  107,
  35,
  7,
  142,
  131,
  239,
  203,
  149,
  136,
  61,
  249,
  14,
  156
];
var SORT_INDEX = [
  18,
  20,
  52,
  26,
  30,
  34,
  58,
  38,
  40,
  53,
  42,
  21,
  27,
  54,
  55,
  31,
  35,
  57,
  39,
  41,
  43,
  22,
  28,
  32,
  60,
  36,
  23,
  29,
  33,
  37,
  44,
  45,
  59,
  46,
  47,
  48,
  49,
  50,
  24,
  25,
  65,
  66,
  70,
  71
];
var SORT_INDEX_2 = [
  18,
  20,
  26,
  30,
  34,
  38,
  40,
  42,
  21,
  27,
  31,
  35,
  39,
  41,
  43,
  22,
  28,
  32,
  36,
  23,
  29,
  33,
  37,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  24,
  25,
  52,
  53,
  54,
  55,
  57,
  58,
  59,
  60,
  65,
  66,
  70,
  71
];
function jsShiftRight(val, n) {
  return val % 4294967296 >>> n;
}
function toCharArray(s) {
  return Array.from(s).map((c) => c.charCodeAt(0));
}
function toCharStr(arr) {
  return arr.map((n) => String.fromCharCode(n)).join("");
}
function generateRandomBytes(length = 3) {
  const result = [];
  for (let i = 0; i < length; i++) {
    const rd = Math.floor(Math.random() * 1e4);
    result.push(
      String.fromCharCode(rd & 255 & 170 | 1),
      String.fromCharCode(rd & 255 & 85 | 2),
      String.fromCharCode(jsShiftRight(rd, 8) & 170 | 5),
      String.fromCharCode(jsShiftRight(rd, 8) & 85 | 40)
    );
  }
  return result.join("");
}
function sm3ToArray(input) {
  const sm3Func = sm3;
  let hexResult;
  if (typeof input === "string") {
    const bytes = Array.from(new TextEncoder().encode(input));
    hexResult = sm3Func(bytes);
  } else {
    hexResult = sm3Func(input);
  }
  const result = [];
  for (let i = 0; i < hexResult.length; i += 2) {
    result.push(parseInt(hexResult.slice(i, i + 2), 16));
  }
  return result;
}
function rc4Encrypt2(key, plaintext) {
  const S = Array.from({ length: 256 }, (_, i2) => i2);
  let j = 0;
  for (let i2 = 0; i2 < 256; i2++) {
    j = (j + S[i2] + key[i2 % key.length]) % 256;
    [S[i2], S[j]] = [S[j], S[i2]];
  }
  let i = 0;
  j = 0;
  const ciphertext = [];
  for (const char of plaintext) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    const K = S[(S[i] + S[j]) % 256];
    ciphertext.push(char.charCodeAt(0) ^ K);
  }
  return ciphertext;
}
function base64Encode(inputString, alphabetIndex = 0) {
  const alphabet = CHARACTER_LIST[alphabetIndex];
  let binaryString = "";
  for (const char of inputString) {
    binaryString += char.charCodeAt(0).toString(2).padStart(8, "0");
  }
  const paddingLength = (6 - binaryString.length % 6) % 6;
  binaryString += "0".repeat(paddingLength);
  let output = "";
  for (let i = 0; i < binaryString.length; i += 6) {
    const index = parseInt(binaryString.slice(i, i + 6), 2);
    output += alphabet[index];
  }
  output += "=".repeat(Math.floor(paddingLength / 2));
  return output;
}
function abogusEncode(abogusBytes, alphabetIndex) {
  const alphabet = CHARACTER_LIST[alphabetIndex];
  const result = [];
  for (let i = 0; i < abogusBytes.length; i += 3) {
    let n;
    if (i + 2 < abogusBytes.length) {
      n = abogusBytes.charCodeAt(i) << 16 | abogusBytes.charCodeAt(i + 1) << 8 | abogusBytes.charCodeAt(i + 2);
    } else if (i + 1 < abogusBytes.length) {
      n = abogusBytes.charCodeAt(i) << 16 | abogusBytes.charCodeAt(i + 1) << 8;
    } else {
      n = abogusBytes.charCodeAt(i) << 16;
    }
    const shifts = [18, 12, 6, 0];
    const masks = [16515072, 258048, 4032, 63];
    for (let idx = 0; idx < 4; idx++) {
      if (shifts[idx] === 6 && i + 1 >= abogusBytes.length) break;
      if (shifts[idx] === 0 && i + 2 >= abogusBytes.length) break;
      result.push(alphabet[(n & masks[idx]) >> shifts[idx]]);
    }
  }
  const padding = (4 - result.length % 4) % 4;
  result.push("=".repeat(padding));
  return result.join("");
}
function transformBytes(bytesList, bigArray) {
  const bytesStr = toCharStr(bytesList);
  const resultStr = [];
  let indexB = bigArray[1];
  let initialValue = 0;
  let valueE = 0;
  for (let index = 0; index < bytesStr.length; index++) {
    const char = bytesStr[index];
    if (index === 0) {
      initialValue = bigArray[indexB];
      const sumInitial2 = indexB + initialValue;
      bigArray[1] = initialValue;
      bigArray[indexB] = indexB;
      const charValue = char.charCodeAt(0);
      const adjustedSum = sumInitial2 % bigArray.length;
      const valueF = bigArray[adjustedSum];
      resultStr.push(String.fromCharCode(charValue ^ valueF));
    } else {
      let sumInitial2 = initialValue + valueE;
      const charValue = char.charCodeAt(0);
      sumInitial2 = sumInitial2 % bigArray.length;
      const valueF = bigArray[sumInitial2];
      resultStr.push(String.fromCharCode(charValue ^ valueF));
    }
    valueE = bigArray[(index + 2) % bigArray.length];
    let sumInitial = (indexB + valueE) % bigArray.length;
    initialValue = bigArray[sumInitial];
    bigArray[sumInitial] = bigArray[(index + 2) % bigArray.length];
    bigArray[(index + 2) % bigArray.length] = initialValue;
    indexB = sumInitial;
  }
  return resultStr.join("");
}
function generateBrowserFingerprint(platform2 = "Win32") {
  const innerWidth = 1024 + Math.floor(Math.random() * 896);
  const innerHeight = 768 + Math.floor(Math.random() * 312);
  const outerWidth = innerWidth + 24 + Math.floor(Math.random() * 8);
  const outerHeight = innerHeight + 75 + Math.floor(Math.random() * 15);
  const screenX = 0;
  const screenY = Math.random() > 0.5 ? 0 : 30;
  const sizeWidth = 1024 + Math.floor(Math.random() * 896);
  const sizeHeight = 768 + Math.floor(Math.random() * 312);
  const availWidth = 1280 + Math.floor(Math.random() * 640);
  const availHeight = 800 + Math.floor(Math.random() * 280);
  return `${innerWidth}|${innerHeight}|${outerWidth}|${outerHeight}|${screenX}|${screenY}|0|0|${sizeWidth}|${sizeHeight}|${availWidth}|${availHeight}|${innerWidth}|${innerHeight}|24|24|${platform2}`;
}
function getABogus(params, body = "", opts = {}) {
  const userAgent = opts.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
  const browserFp = opts.fingerprint || generateBrowserFingerprint("Win32");
  const requestOptions = opts.options || [0, 1, 14];
  const salt = "cus";
  const aid = 6383;
  const pageId = 0;
  const bigArray = [...BIG_ARRAY];
  const addSalt = (param) => param + salt;
  const paramsToArray = (param, shouldAddSalt = true) => {
    const processed = typeof param === "string" && shouldAddSalt ? addSalt(param) : param;
    return sm3ToArray(processed);
  };
  const startEncryption = Date.now();
  const array1 = paramsToArray(paramsToArray(params));
  const array2 = paramsToArray(paramsToArray(body));
  const encryptedUa = rc4Encrypt2(UA_KEY2, userAgent);
  const base64Ua = base64Encode(toCharStr(encryptedUa), 1);
  const array3 = paramsToArray(base64Ua, false);
  const endEncryption = Date.now();
  const abDir = {
    8: 3,
    18: 44,
    66: 0,
    69: 0,
    70: 0,
    71: 0
  };
  abDir[20] = startEncryption >> 24 & 255;
  abDir[21] = startEncryption >> 16 & 255;
  abDir[22] = startEncryption >> 8 & 255;
  abDir[23] = startEncryption & 255;
  abDir[24] = Math.floor(startEncryption / 256 / 256 / 256 / 256) >> 0;
  abDir[25] = Math.floor(startEncryption / 256 / 256 / 256 / 256 / 256) >> 0;
  abDir[26] = requestOptions[0] >> 24 & 255;
  abDir[27] = requestOptions[0] >> 16 & 255;
  abDir[28] = requestOptions[0] >> 8 & 255;
  abDir[29] = requestOptions[0] & 255;
  abDir[30] = Math.floor(requestOptions[1] / 256) & 255;
  abDir[31] = requestOptions[1] % 256 & 255;
  abDir[32] = requestOptions[1] >> 24 & 255;
  abDir[33] = requestOptions[1] >> 16 & 255;
  abDir[34] = requestOptions[2] >> 24 & 255;
  abDir[35] = requestOptions[2] >> 16 & 255;
  abDir[36] = requestOptions[2] >> 8 & 255;
  abDir[37] = requestOptions[2] & 255;
  abDir[38] = array1[21];
  abDir[39] = array1[22];
  abDir[40] = array2[21];
  abDir[41] = array2[22];
  abDir[42] = array3[23];
  abDir[43] = array3[24];
  abDir[44] = endEncryption >> 24 & 255;
  abDir[45] = endEncryption >> 16 & 255;
  abDir[46] = endEncryption >> 8 & 255;
  abDir[47] = endEncryption & 255;
  abDir[48] = abDir[8];
  abDir[49] = Math.floor(endEncryption / 256 / 256 / 256 / 256) >> 0;
  abDir[50] = Math.floor(endEncryption / 256 / 256 / 256 / 256 / 256) >> 0;
  abDir[51] = pageId >> 24 & 255;
  abDir[52] = pageId >> 16 & 255;
  abDir[53] = pageId >> 8 & 255;
  abDir[54] = pageId & 255;
  abDir[55] = pageId;
  abDir[56] = aid;
  abDir[57] = aid & 255;
  abDir[58] = aid >> 8 & 255;
  abDir[59] = aid >> 16 & 255;
  abDir[60] = aid >> 24 & 255;
  abDir[64] = browserFp.length;
  abDir[65] = browserFp.length;
  const sortedValues = SORT_INDEX.map((i) => abDir[i] || 0);
  const edgeFpArray = toCharArray(browserFp);
  let abXor = (browserFp.length & 255) >> (8 & 255);
  for (let i = 0; i < SORT_INDEX_2.length - 1; i++) {
    if (i === 0) {
      abXor = abDir[SORT_INDEX_2[i]] || 0;
    }
    abXor ^= abDir[SORT_INDEX_2[i + 1]] || 0;
  }
  sortedValues.push(...edgeFpArray);
  sortedValues.push(abXor);
  const abogusBytes = generateRandomBytes() + transformBytes(sortedValues, bigArray);
  const abogus = abogusEncode(abogusBytes, 0);
  return {
    params: `${params}&a_bogus=${abogus}`,
    abogus,
    userAgent,
    body
  };
}

// src/utils/sign.ts
function xbogusModel2Endpoint(userAgent, baseEndpoint, params) {
  if (typeof params !== "object" || params === null) {
    throw new TypeError("\u53C2\u6570\u5FC5\u987B\u662F\u5BF9\u8C61\u7C7B\u578B");
  }
  const paramStr = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
  const result = getXBogus(paramStr, userAgent);
  const separator = baseEndpoint.includes("?") ? "&" : "?";
  return `${baseEndpoint}${separator}${paramStr}&X-Bogus=${result.xbogus}`;
}
function abogusModel2Endpoint(userAgent, baseEndpoint, params, body = "") {
  if (typeof params !== "object" || params === null) {
    throw new TypeError("\u53C2\u6570\u5FC5\u987B\u662F\u5BF9\u8C61\u7C7B\u578B");
  }
  const paramStr = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
  const fingerprint = generateBrowserFingerprint("Win32");
  const result = getABogus(paramStr, body, {
    userAgent,
    fingerprint
  });
  const separator = baseEndpoint.includes("?") ? "&" : "?";
  return `${baseEndpoint}${separator}${paramStr}&a_bogus=${result.abogus}`;
}

// src/api/endpoints.ts
var DOUYIN_DOMAIN = "https://www.douyin.com";
var LIVE_DOMAIN = "https://live.douyin.com";
var LIVE_DOMAIN2 = "https://webcast.amemv.com";
var ENDPOINTS = {
  // 首页 Feed
  TAB_FEED: `${DOUYIN_DOMAIN}/aweme/v1/web/tab/feed/`,
  // 用户详细信息
  USER_DETAIL: `${DOUYIN_DOMAIN}/aweme/v1/web/user/profile/other/`,
  // 用户作品
  USER_POST: `${DOUYIN_DOMAIN}/aweme/v1/web/aweme/post/`,
  // 定位作品
  LOCATE_POST: `${DOUYIN_DOMAIN}/aweme/v1/web/locate/post/`,
  // 搜索作品
  POST_SEARCH: `${DOUYIN_DOMAIN}/aweme/v1/web/general/search/single/`,
  // 主页作品搜索
  HOME_POST_SEARCH: `${DOUYIN_DOMAIN}/aweme/v1/web/home/search/item/`,
  // 作品详情
  POST_DETAIL: `${DOUYIN_DOMAIN}/aweme/v1/web/aweme/detail/`,
  // 用户喜欢 A
  USER_FAVORITE_A: `${DOUYIN_DOMAIN}/aweme/v1/web/aweme/favorite/`,
  // 关注用户
  USER_FOLLOWING: `${DOUYIN_DOMAIN}/aweme/v1/web/user/following/list/`,
  // 粉丝用户
  USER_FOLLOWER: `${DOUYIN_DOMAIN}/aweme/v1/web/user/follower/list/`,
  // 合集作品
  MIX_AWEME: `${DOUYIN_DOMAIN}/aweme/v1/web/mix/aweme/`,
  // 用户收藏
  USER_COLLECTION: `${DOUYIN_DOMAIN}/aweme/v1/web/aweme/listcollection/`,
  // 用户收藏夹
  USER_COLLECTS: `${DOUYIN_DOMAIN}/aweme/v1/web/collects/list/`,
  // 用户收藏夹作品
  USER_COLLECTS_VIDEO: `${DOUYIN_DOMAIN}/aweme/v1/web/collects/video/list/`,
  // 用户音乐收藏
  USER_MUSIC_COLLECTION: `${DOUYIN_DOMAIN}/aweme/v1/web/music/listcollection/`,
  // 首页朋友作品
  FRIEND_FEED: `${DOUYIN_DOMAIN}/aweme/v1/web/familiar/feed/`,
  // 关注用户作品
  FOLLOW_FEED: `${DOUYIN_DOMAIN}/aweme/v1/web/follow/feed/`,
  // 相关推荐
  POST_RELATED: `${DOUYIN_DOMAIN}/aweme/v1/web/aweme/related/`,
  // 关注用户列表直播
  FOLLOW_USER_LIVE: `${DOUYIN_DOMAIN}/webcast/web/feed/follow/`,
  // 直播信息
  LIVE_INFO: `${LIVE_DOMAIN}/webcast/room/web/enter/`,
  // 直播信息 2
  LIVE_INFO_ROOM_ID: `${LIVE_DOMAIN2}/webcast/room/reflow/info/`,
  // 直播弹幕初始化
  LIVE_IM_FETCH: `${LIVE_DOMAIN}/webcast/im/fetch/`,
  // 用户直播状态
  USER_LIVE_STATUS: `${LIVE_DOMAIN}/webcast/distribution/check_user_live_status/`,
  // 推荐搜索词
  SUGGEST_WORDS: `${DOUYIN_DOMAIN}/aweme/v1/web/api/suggest_words/`,
  // 作品评论
  POST_COMMENT: `${DOUYIN_DOMAIN}/aweme/v1/web/comment/list/`,
  // 评论回复
  POST_COMMENT_REPLY: `${DOUYIN_DOMAIN}/aweme/v1/web/comment/list/reply/`,
  // 查询用户
  QUERY_USER: `${DOUYIN_DOMAIN}/aweme/v1/web/query/user/`,
  // 作品状态
  POST_STATS: `${DOUYIN_DOMAIN}/aweme/v2/web/aweme/stats/`
};

// src/algorithm/index.ts
function generateFakeMsToken(length = 128) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
async function fetchRealMsToken() {
  const config = getConfig();
  const msTokenConfig = config.msToken;
  const payload = {
    magic: msTokenConfig.magic,
    version: msTokenConfig.version,
    dataType: msTokenConfig.dataType,
    strData: msTokenConfig.strData,
    ulr: msTokenConfig.ulr,
    tspFromClient: Date.now()
  };
  const response = await fetch(msTokenConfig.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": config.userAgent
    },
    body: JSON.stringify(payload)
  });
  const cookies = response.headers.getSetCookie?.() || [];
  for (const cookie of cookies) {
    if (cookie.startsWith("msToken=")) {
      const msToken = cookie.split(";")[0].split("=")[1];
      if (msToken.length >= 100 && msToken.length <= 200) {
        return msToken;
      }
    }
  }
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = /msToken=([^;]+)/.exec(setCookie);
    if (match) {
      const msToken = match[1];
      if (msToken.length >= 100 && msToken.length <= 200) {
        return msToken;
      }
    }
  }
  return generateFakeMsToken();
}

// src/model/request.ts
function getBaseRequestParams() {
  return {
    device_platform: "webapp",
    aid: "6383",
    channel: "channel_pc_web",
    pc_client_type: 1,
    publish_video_strategy_type: 2,
    pc_libra_divert: "Windows",
    version_code: "290100",
    version_name: "29.1.0",
    cookie_enabled: "true",
    screen_width: 1920,
    screen_height: 1080,
    browser_language: "zh-CN",
    browser_platform: "Win32",
    browser_name: "Edge",
    browser_version: "131.0.0.0",
    browser_online: "true",
    engine_name: "Blink",
    engine_version: "131.0.0.0",
    os_name: "Windows",
    os_version: "10",
    cpu_core_num: 12,
    device_memory: 8,
    platform: "PC",
    downlink: 10,
    effective_type: "4g",
    round_trip_time: 100,
    msToken: ""
    // 由 DouyinCrawler 在请求时注入真实 msToken
  };
}
function getBaseLiveParams() {
  return {
    aid: "6383",
    app_name: "douyin_web",
    live_id: 1,
    device_platform: "web",
    language: "zh-CN",
    cookie_enabled: "true",
    screen_width: 1920,
    screen_height: 1080,
    browser_language: "zh-CN",
    browser_platform: "Win32",
    browser_name: "Edge",
    browser_version: "131.0.0.0",
    enter_source: "",
    is_need_double_stream: "false",
    insert_task_id: "",
    live_reason: ""
  };
}
function getBaseLiveParams2() {
  return {
    verifyFp: "",
    type_id: "0",
    live_id: "1",
    sec_user_id: "",
    version_code: "99.99.99",
    app_id: "1128",
    msToken: ""
  };
}
function getBaseWebCastParams() {
  return {
    app_name: "douyin_web",
    version_code: "180800",
    device_platform: "web",
    cookie_enabled: "true",
    screen_width: 1920,
    screen_height: 1080,
    browser_language: "zh-CN",
    browser_platform: "Win32",
    browser_name: "Mozilla",
    browser_version: encodeURIComponent(
      "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
    ),
    browser_online: "true",
    tz_name: "Asia/Hong_Kong",
    host: "https://live.douyin.com",
    aid: 6383,
    live_id: 1,
    did_rule: 3,
    endpoint: "live_pc",
    support_wrds: 1,
    identity: "audience",
    need_persist_msg_count: 15,
    insert_task_id: "",
    live_reason: ""
  };
}
function createUserProfileParams(secUserId) {
  return { ...getBaseRequestParams(), sec_user_id: secUserId };
}
function createUserPostParams(secUserId, maxCursor = 0, count = 18) {
  return { ...getBaseRequestParams(), sec_user_id: secUserId, max_cursor: maxCursor, count };
}
function createUserLikeParams(secUserId, maxCursor = 0, count = 18) {
  return { ...getBaseRequestParams(), sec_user_id: secUserId, max_cursor: maxCursor, count };
}
function createUserCollectionParams(cursor = 0, count = 18) {
  return { ...getBaseRequestParams(), cursor, count };
}
function createUserCollectsParams(cursor = 0, count = 18) {
  return { ...getBaseRequestParams(), cursor, count };
}
function createUserCollectsVideoParams(collectsId, cursor = 0, count = 18) {
  return { ...getBaseRequestParams(), collects_id: collectsId, cursor, count };
}
function createUserMusicCollectionParams(cursor = 0, count = 18) {
  return { ...getBaseRequestParams(), cursor, count };
}
function createUserMixParams(mixId, cursor = 0, count = 18) {
  return { ...getBaseRequestParams(), mix_id: mixId, cursor, count };
}
function createFriendFeedParams(cursor = 0) {
  return {
    ...getBaseRequestParams(),
    cursor,
    level: 1,
    aweme_ids: "",
    room_ids: "",
    pull_type: 0,
    refresh_type: 0,
    address_book_access: 2,
    gps_access: 2,
    recent_gids: ""
  };
}
function createPostFeedParams(count = 10) {
  return {
    ...getBaseRequestParams(),
    count,
    tag_id: "",
    share_aweme_id: "",
    live_insert_type: "",
    refresh_index: 1,
    video_type_select: 1,
    aweme_pc_rec_raw_data: encodeURIComponent('{"is_client":"false"}'),
    globalwid: "",
    pull_type: "",
    min_window: "",
    free_right: "",
    ug_source: "",
    creative_id: ""
  };
}
function createFollowFeedParams(cursor = 0, count = 20) {
  return { ...getBaseRequestParams(), cursor, level: 1, count, pull_type: "" };
}
function createPostRelatedParams(awemeId, filterGids = "", count = 20) {
  return {
    ...getBaseRequestParams(),
    aweme_id: awemeId,
    count,
    filterGids,
    awemePcRecRawData: encodeURIComponent('{"is_client":"false"}'),
    sub_channel_id: 3
  };
}
function createPostDetailParams(awemeId) {
  return { ...getBaseRequestParams(), aweme_id: awemeId };
}
function createPostCommentParams(awemeId, cursor = 0, count = 20) {
  return {
    ...getBaseRequestParams(),
    aweme_id: awemeId,
    cursor,
    count,
    item_type: 0,
    insert_ids: "",
    whale_cut_token: "",
    cut_version: 1,
    rcFT: ""
  };
}
function createPostCommentReplyParams(itemId, commentId, cursor = 0, count = 3) {
  return {
    ...getBaseRequestParams(),
    item_id: itemId,
    comment_id: commentId,
    cursor,
    count,
    item_type: 0,
    cut_version: 1
  };
}
function createPostLocateParams(secUserId, maxCursor, locateItemCursor, locateItemId = "", count = 10) {
  return {
    ...getBaseRequestParams(),
    sec_user_id: secUserId,
    max_cursor: maxCursor,
    locate_item_id: locateItemId,
    locate_item_cursor: locateItemCursor,
    locate_query: "true",
    count
  };
}
function createUserLiveParams(webRid, roomIdStr) {
  return { ...getBaseLiveParams(), web_rid: webRid, room_id_str: roomIdStr };
}
function createUserLive2Params(roomId) {
  return { ...getBaseLiveParams2(), room_id: roomId };
}
function createFollowingUserLiveParams() {
  return { ...getBaseRequestParams(), scene: "aweme_pc_follow_top" };
}
function createSuggestWordParams(query, count = 8) {
  return {
    ...getBaseRequestParams(),
    query,
    count,
    business_id: "30068",
    from_group_id: "",
    rsp_source: "",
    penetrate_params: encodeURIComponent("{}")
  };
}
function createPostSearchParams(keyword, filterSelected = "", offset = 0, count = 15) {
  return {
    ...getBaseRequestParams(),
    search_channel: "aweme_general",
    filter_selected: filterSelected,
    keyword,
    search_source: "normal_search",
    search_id: "",
    query_correct_type: 1,
    is_filter_search: 0,
    from_group_id: "",
    offset,
    count,
    need_filter_settings: 1
  };
}
function createHomePostSearchParams(keyword, fromUser, offset = 0, count = 10) {
  return {
    ...getBaseRequestParams(),
    search_channel: "aweme_personal_home_video",
    search_source: "normal_search",
    search_scene: "douyin_search",
    sort_type: 0,
    publish_time: 0,
    is_filter_search: 0,
    query_correct_type: 1,
    keyword,
    enable_history: 1,
    search_id: "",
    offset,
    count,
    from_user: fromUser
  };
}
function createUserFollowingParams(secUserId, userId = "", offset = 0, count = 20, sourceType = 4) {
  return {
    ...getBaseRequestParams(),
    user_id: userId,
    sec_user_id: secUserId,
    offset,
    min_time: 0,
    max_time: 0,
    count,
    source_type: sourceType,
    gps_access: 0,
    address_book_access: 0,
    is_top: 1
  };
}
function createUserFollowerParams(userId, secUserId, offset = 0, count = 20, sourceType = 1) {
  return {
    ...getBaseRequestParams(),
    user_id: userId,
    sec_user_id: secUserId,
    offset,
    min_time: 0,
    max_time: 0,
    count,
    source_type: sourceType,
    gps_access: 0,
    address_book_access: 0,
    is_top: 1
  };
}
function createLiveImFetchParams(roomId, userUniqueId, cursor = "", internalExt = "") {
  return {
    ...getBaseWebCastParams(),
    resp_content_type: "json",
    fetch_rule: 1,
    last_rtt: 0,
    cursor,
    internal_ext: internalExt,
    room_id: roomId,
    user_unique_id: userUniqueId
  };
}
function createUserLiveStatusParams(userIds) {
  return {
    ...getBaseRequestParams(),
    user_ids: userIds,
    distribution_scenes: "254",
    channel: "test"
  };
}
function createQueryUserParams() {
  return {
    ...getBaseRequestParams(),
    update_version_code: "170400",
    version_code: "170400",
    version_name: "17.4.0"
  };
}
function createPostStatsParams(itemId, awemeType = 0, playDelta = 1) {
  return {
    ...getBaseRequestParams(),
    aweme_type: awemeType,
    item_id: itemId,
    play_delta: playDelta,
    source: 0
  };
}
function toQueryString(params) {
  return Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
}

// src/crawler/douyin.ts
var DouyinCrawler = class {
  headers;
  userAgent;
  msToken = null;
  msTokenPromise = null;
  constructor(config) {
    const globalConfig = getConfig();
    this.userAgent = globalConfig.userAgent;
    this.headers = {
      Cookie: config.cookie,
      ...config.headers
    };
  }
  async ensureMsToken() {
    if (this.msToken) {
      return this.msToken;
    }
    if (this.msTokenPromise) {
      return this.msTokenPromise;
    }
    this.msTokenPromise = fetchRealMsToken().then((token) => {
      this.msToken = token;
      return token;
    }).catch(() => {
      const fakeToken = generateFakeMsToken();
      this.msToken = fakeToken;
      return fakeToken;
    });
    return this.msTokenPromise;
  }
  async model2Endpoint(baseEndpoint, params) {
    const msToken = await this.ensureMsToken();
    const paramsWithMsToken = { ...params, msToken };
    const encryption = getEncryption();
    if (encryption === "xb") {
      return xbogusModel2Endpoint(this.userAgent, baseEndpoint, paramsWithMsToken);
    }
    return abogusModel2Endpoint(this.userAgent, baseEndpoint, paramsWithMsToken);
  }
  async fetchGetJson(endpoint, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await get(endpoint, { headers: this.headers });
        if (response.data === null || response.data === void 0) {
          throw new Error("\u54CD\u5E94\u6570\u636E\u4E3A\u7A7A");
        }
        if (typeof response.data === "string" && response.data.trim() === "") {
          throw new Error("\u54CD\u5E94\u6570\u636E\u4E3A\u7A7A\u5B57\u7B26\u4E32");
        }
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await new Promise((resolve2) => setTimeout(resolve2, 1e3 * attempt));
        }
      }
    }
    throw lastError;
  }
  async fetchPostJson(endpoint, body) {
    return post(endpoint, body, { headers: this.headers });
  }
  /**
   * 获取用户资料
   */
  async fetchUserProfile(secUserId) {
    const params = createUserProfileParams(secUserId);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_DETAIL, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户作品列表
   */
  async fetchUserPost(secUserId, maxCursor = 0, count = 18) {
    const params = createUserPostParams(secUserId, maxCursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_POST, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户喜欢列表
   */
  async fetchUserLike(secUserId, maxCursor = 0, count = 18) {
    const params = createUserLikeParams(secUserId, maxCursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_FAVORITE_A, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户收藏列表
   * 注意：该接口需要用 POST 且只靠 cookie 来获取数据（与 f2 保持一致）
   */
  async fetchUserCollection(cursor = 0, count = 18) {
    const params = createUserCollectionParams(cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_COLLECTION, params);
    return this.fetchPostJson(endpoint, params);
  }
  /**
   * 获取用户收藏夹列表
   */
  async fetchUserCollects(cursor = 0, count = 18) {
    const params = createUserCollectsParams(cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_COLLECTS, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取收藏夹作品
   */
  async fetchUserCollectsVideo(collectsId, cursor = 0, count = 18) {
    const params = createUserCollectsVideoParams(collectsId, cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_COLLECTS_VIDEO, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户音乐收藏
   */
  async fetchUserMusicCollection(cursor = 0, count = 18) {
    const params = createUserMusicCollectionParams(cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_MUSIC_COLLECTION, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取合集作品
   */
  async fetchUserMix(mixId, cursor = 0, count = 18) {
    const params = createUserMixParams(mixId, cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.MIX_AWEME, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取朋友作品
   */
  async fetchFriendFeed(cursor = 0) {
    const params = createFriendFeedParams(cursor);
    const endpoint = await this.model2Endpoint(ENDPOINTS.FRIEND_FEED, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取首页 Feed
   */
  async fetchPostFeed(count = 10) {
    const params = createPostFeedParams(count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.TAB_FEED, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取关注用户作品
   */
  async fetchFollowFeed(cursor = 0, count = 20) {
    const params = createFollowFeedParams(cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.FOLLOW_FEED, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取相关推荐
   */
  async fetchPostRelated(awemeId, filterGids = "", count = 20) {
    const params = createPostRelatedParams(awemeId, filterGids, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_RELATED, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取作品详情
   */
  async fetchPostDetail(awemeId) {
    const params = createPostDetailParams(awemeId);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_DETAIL, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取作品评论
   */
  async fetchPostComment(awemeId, cursor = 0, count = 20) {
    const params = createPostCommentParams(awemeId, cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_COMMENT, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取评论回复
   */
  async fetchPostCommentReply(itemId, commentId, cursor = 0, count = 3) {
    const params = createPostCommentReplyParams(itemId, commentId, cursor, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_COMMENT_REPLY, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 定位作品
   */
  async fetchPostLocate(secUserId, maxCursor, locateItemCursor, locateItemId = "", count = 10) {
    const params = createPostLocateParams(secUserId, maxCursor, locateItemCursor, locateItemId, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.LOCATE_POST, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户直播信息
   */
  async fetchUserLive(webRid, roomIdStr) {
    const params = createUserLiveParams(webRid, roomIdStr);
    const endpoint = `${ENDPOINTS.LIVE_INFO}?${toQueryString(params)}`;
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户直播信息2
   */
  async fetchUserLive2(roomId) {
    const params = createUserLive2Params(roomId);
    const endpoint = `${ENDPOINTS.LIVE_INFO_ROOM_ID}?${toQueryString(params)}`;
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取关注用户直播列表
   */
  async fetchFollowingUserLive() {
    const params = createFollowingUserLiveParams();
    const endpoint = await this.model2Endpoint(ENDPOINTS.FOLLOW_USER_LIVE, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取搜索建议词
   */
  async fetchSuggestWords(query, count = 8) {
    const params = createSuggestWordParams(query, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.SUGGEST_WORDS, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 搜索作品
   */
  async fetchPostSearch(keyword, filterSelected = "", offset = 0, count = 15) {
    const params = createPostSearchParams(keyword, filterSelected, offset, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_SEARCH, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 主页作品搜索
   */
  async fetchHomePostSearch(keyword, fromUser, offset = 0, count = 10) {
    const params = createHomePostSearchParams(keyword, fromUser, offset, count);
    const endpoint = await this.model2Endpoint(ENDPOINTS.HOME_POST_SEARCH, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户关注列表
   */
  async fetchUserFollowing(secUserId, userId = "", offset = 0, count = 20, sourceType = 4) {
    const params = createUserFollowingParams(secUserId, userId, offset, count, sourceType);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_FOLLOWING, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户粉丝列表
   */
  async fetchUserFollower(userId, secUserId, offset = 0, count = 20, sourceType = 1) {
    const params = createUserFollowerParams(userId, secUserId, offset, count, sourceType);
    const endpoint = await this.model2Endpoint(ENDPOINTS.USER_FOLLOWER, params);
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取直播弹幕初始化数据
   */
  async fetchLiveImFetch(roomId, userUniqueId, cursor = "", internalExt = "") {
    const params = createLiveImFetchParams(roomId, userUniqueId, cursor, internalExt);
    const endpoint = `${ENDPOINTS.LIVE_IM_FETCH}?${toQueryString(params)}`;
    return this.fetchGetJson(endpoint);
  }
  /**
   * 获取用户直播状态
   */
  async fetchUserLiveStatus(userIds) {
    const params = createUserLiveStatusParams(userIds);
    const endpoint = `${ENDPOINTS.USER_LIVE_STATUS}?${toQueryString(params)}`;
    return this.fetchGetJson(endpoint);
  }
  /**
   * 查询用户
   */
  async fetchQueryUser(secUserIds) {
    const params = createQueryUserParams();
    const endpoint = await this.model2Endpoint(ENDPOINTS.QUERY_USER, params);
    return this.fetchPostJson(endpoint, { sec_user_ids: secUserIds.split(",") });
  }
  /**
   * 获取作品统计
   */
  async fetchPostStats(itemId, awemeType = 0, playDelta = 1) {
    const params = createPostStatsParams(itemId, awemeType, playDelta);
    const endpoint = await this.model2Endpoint(ENDPOINTS.POST_STATS, params);
    return this.fetchPostJson(endpoint);
  }
};
var JSONModel = class {
  _data;
  _cache = /* @__PURE__ */ new Map();
  constructor(data) {
    this._data = data;
  }
  _getAttrValue(jsonpathExpr) {
    const cacheKey = `attr:${jsonpathExpr}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }
    const matches = jsonpathPlus.JSONPath({ path: jsonpathExpr, json: this._data });
    if (!matches || matches.length === 0) {
      this._cache.set(cacheKey, null);
      return null;
    }
    const result = matches.length === 1 ? matches[0] : matches;
    this._cache.set(cacheKey, result);
    return result;
  }
  _getListAttrValue(jsonpathExpr, asJson = false) {
    const cacheKey = `list:${jsonpathExpr}:${asJson}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }
    let parentExprStr;
    let childExprStr;
    if (jsonpathExpr.includes("[*]")) {
      const idx = jsonpathExpr.indexOf("[*]");
      parentExprStr = jsonpathExpr.slice(0, idx + 3);
      childExprStr = jsonpathExpr.slice(idx + 3);
    } else {
      parentExprStr = jsonpathExpr;
      childExprStr = "";
    }
    const parentMatches = jsonpathPlus.JSONPath({ path: parentExprStr, json: this._data });
    if (!parentMatches || !Array.isArray(parentMatches) || parentMatches.length === 0) {
      this._cache.set(cacheKey, null);
      return null;
    }
    const values = [];
    if (childExprStr) {
      const childPath = `$.${childExprStr.replace(/^\./, "")}`;
      for (const parentValue of parentMatches) {
        const childMatches = jsonpathPlus.JSONPath({ path: childPath, json: parentValue });
        if (childMatches && childMatches.length > 0) {
          values.push(childMatches[0]);
        } else {
          values.push(null);
        }
      }
    } else {
      values.push(...parentMatches);
    }
    const result = asJson ? JSON.stringify(values) : values;
    this._cache.set(cacheKey, result);
    return result;
  }
  toRaw() {
    return this._data;
  }
  toDict() {
    const result = {};
    const proto = Object.getPrototypeOf(this);
    const propertyNames = Object.getOwnPropertyNames(proto);
    for (const name of propertyNames) {
      if (name.startsWith("_") || name === "constructor") continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (descriptor && typeof descriptor.get === "function") {
        try {
          result[name] = this[name];
        } catch {
          result[name] = null;
        }
      }
    }
    return result;
  }
};

// src/filter/utils.ts
var REPLACE_PATTERN = /[^\u4e00-\u9fa5a-zA-Z0-9#]/g;
function replaceT(obj) {
  if (Array.isArray(obj)) {
    return obj.map(
      (item) => typeof item === "string" ? item.replace(REPLACE_PATTERN, "_") : item || ""
    );
  }
  if (typeof obj === "string") {
    return obj.replace(REPLACE_PATTERN, "_");
  }
  return obj;
}
function timestamp2Str(timestamp, format = "YYYY-MM-DD HH-mm-ss", tzOffsetHours = 8) {
  if (timestamp === null || timestamp === void 0 || timestamp === "None") {
    return "Invalid timestamp";
  }
  if (timestamp === 0 || timestamp === "0") {
    return formatDate(/* @__PURE__ */ new Date(), format);
  }
  const convert = (ts) => {
    if (typeof ts === "string" && ts.length === 30) {
      const date2 = new Date(ts);
      return formatDate(date2, format);
    }
    let value = typeof ts === "string" ? parseFloat(ts) : ts;
    if (value > 1e10) {
      value = value / 1e3;
    }
    const date = new Date(value * 1e3);
    const tzOffset = tzOffsetHours * 60 * 60 * 1e3;
    const localDate = new Date(date.getTime() + tzOffset - date.getTimezoneOffset() * 60 * 1e3);
    return formatDate(localDate, format);
  };
  if (Array.isArray(timestamp)) {
    return timestamp.map((ts) => {
      if (Array.isArray(ts)) {
        return ts.map((t) => convert(t)).join(", ");
      }
      return convert(ts);
    });
  }
  return convert(timestamp);
}
function formatDate(date, format) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return format.replace("YYYY", String(year)).replace("MM", month).replace("DD", day).replace("HH", hours).replace("mm", minutes).replace("ss", seconds);
}
function filterToList(filterInstance, options) {
  const { entriesPath, excludeFields, extraFields = [] } = options;
  const proto = Object.getPrototypeOf(filterInstance);
  const propertyNames = Object.getOwnPropertyNames(proto);
  const keys = propertyNames.filter((name) => {
    if (name.startsWith("_") || name === "constructor") return false;
    if (excludeFields.includes(name)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    return descriptor && typeof descriptor.get === "function";
  });
  const entries = filterInstance._getAttrValue(entriesPath) || [];
  const listDicts = [];
  for (let index = 0; index < entries.length; index++) {
    const d = {};
    for (const key of extraFields) {
      try {
        d[key] = filterInstance[key];
      } catch {
        d[key] = null;
      }
    }
    for (const key of keys) {
      try {
        const attrValues = filterInstance[key];
        if (Array.isArray(attrValues) && index < attrValues.length) {
          d[key] = attrValues[index];
        } else {
          d[key] = null;
        }
      } catch {
        d[key] = null;
      }
    }
    listDicts.push(d);
  }
  return listDicts;
}

// src/filter/user.ts
var UserProfileFilter = class extends JSONModel {
  get avatarUrl() {
    return this._getAttrValue("$.user.avatar_larger.url_list[0]");
  }
  get awemeCount() {
    return this._getAttrValue("$.user.aweme_count");
  }
  get city() {
    return this._getAttrValue("$.user.city");
  }
  get country() {
    return this._getAttrValue("$.user.country");
  }
  get favoritingCount() {
    return this._getAttrValue("$.user.favoriting_count");
  }
  get followerCount() {
    return this._getAttrValue("$.user.follower_count");
  }
  get followingCount() {
    return this._getAttrValue("$.user.following_count");
  }
  get gender() {
    return this._getAttrValue("$.user.gender");
  }
  get ipLocation() {
    return this._getAttrValue("$.user.ip_location");
  }
  get isBan() {
    return this._getAttrValue("$.user.is_ban");
  }
  get isBlock() {
    return this._getAttrValue("$.user.is_block");
  }
  get isBlocked() {
    return this._getAttrValue("$.user.is_blocked");
  }
  get isStar() {
    return this._getAttrValue("$.user.is_star");
  }
  get liveStatus() {
    return this._getAttrValue("$.user.live_status");
  }
  get mixCount() {
    return this._getAttrValue("$.user.mix_count");
  }
  get mplatformFollowersCount() {
    return this._getAttrValue("$.user.mplatform_followers_count");
  }
  get nickname() {
    const raw = this._getAttrValue("$.user.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getAttrValue("$.user.nickname");
  }
  get roomId() {
    return this._getAttrValue("$.user.room_id");
  }
  get schoolName() {
    return this._getAttrValue("$.user.school_name");
  }
  get secUserId() {
    return this._getAttrValue("$.user.sec_uid");
  }
  get shortId() {
    return this._getAttrValue("$.user.short_id");
  }
  get signature() {
    const raw = this._getAttrValue("$.user.signature");
    return raw ? replaceT(raw) : null;
  }
  get signatureRaw() {
    return this._getAttrValue("$.user.signature");
  }
  get totalFavorited() {
    return this._getAttrValue("$.user.total_favorited");
  }
  get uid() {
    return this._getAttrValue("$.user.uid");
  }
  get uniqueId() {
    return this._getAttrValue("$.user.unique_id");
  }
  get userAge() {
    return this._getAttrValue("$.user.user_age");
  }
};
var UserFollowingFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get statusMsg() {
    return this._getAttrValue("$.status_msg");
  }
  get hasMore() {
    return this._getAttrValue("$.has_more");
  }
  get total() {
    return this._getAttrValue("$.total");
  }
  get mixCount() {
    return this._getAttrValue("$.mix_count");
  }
  get offset() {
    return this._getAttrValue("$.offset");
  }
  get myselfUserId() {
    return this._getAttrValue("$.myself_user_id");
  }
  get maxTime() {
    return this._getAttrValue("$.max_time");
  }
  get minTime() {
    return this._getAttrValue("$.min_time");
  }
  get avatarLarger() {
    return this._getListAttrValue("$.followings[*].avatar_larger.url_list[0]");
  }
  get canComment() {
    return this._getListAttrValue("$.followings[*].aweme_control.can_comment");
  }
  get canForward() {
    return this._getListAttrValue("$.followings[*].aweme_control.can_forward");
  }
  get canShare() {
    return this._getListAttrValue("$.followings[*].aweme_control.can_share");
  }
  get canShowComment() {
    return this._getListAttrValue("$.followings[*].aweme_control.can_show_comment");
  }
  get awemeCount() {
    return this._getListAttrValue("$.followings[*].aweme_count");
  }
  get backCover() {
    return this._getListAttrValue("$.followings[*].cover_url[0].url_list[0]");
  }
  get registerTime() {
    return this._getListAttrValue("$.followings[*].create_time");
  }
  get secondaryPriority() {
    return this._getListAttrValue("$.followings[*].following_list_secondary_information_struct.secondary_information_priority");
  }
  get secondaryText() {
    const raw = this._getListAttrValue("$.followings[*].following_list_secondary_information_struct.secondary_information_text");
    return raw ? replaceT(raw) : null;
  }
  get secondaryTextRaw() {
    return this._getListAttrValue("$.followings[*].following_list_secondary_information_struct.secondary_information_text");
  }
  get isBlock() {
    return this._getListAttrValue("$.followings[*].is_block");
  }
  get isBlocked() {
    return this._getListAttrValue("$.followings[*].is_blocked");
  }
  get isGovMediaVip() {
    return this._getListAttrValue("$.followings[*].is_gov_media_vip");
  }
  get isMixUser() {
    return this._getListAttrValue("$.followings[*].is_mix_user");
  }
  get isPhoneBinded() {
    return this._getListAttrValue("$.followings[*].is_phone_binded");
  }
  get isStar() {
    return this._getListAttrValue("$.followings[*].is_star");
  }
  get isTop() {
    return this._getListAttrValue("$.followings[*].is_top");
  }
  get isVerified() {
    return this._getListAttrValue("$.followings[*].is_verified");
  }
  get language() {
    return this._getListAttrValue("$.followings[*].language");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.followings[*].nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.followings[*].nickname");
  }
  get relationLabel() {
    return this._getListAttrValue("$.followings[*].relation_label");
  }
  get roomId() {
    return this._getListAttrValue("$.followings[*].room_id");
  }
  get secUid() {
    return this._getListAttrValue("$.followings[*].sec_uid");
  }
  get secret() {
    return this._getListAttrValue("$.followings[*].secret");
  }
  get shortId() {
    return this._getListAttrValue("$.followings[*].short_id");
  }
  get signature() {
    const raw = this._getListAttrValue("$.followings[*].signature");
    return raw ? replaceT(raw) : null;
  }
  get signatureRaw() {
    return this._getListAttrValue("$.followings[*].signature");
  }
  get uid() {
    return this._getListAttrValue("$.followings[*].uid");
  }
  get uniqueId() {
    return this._getListAttrValue("$.followings[*].unique_id");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.followings",
      excludeFields: [
        "statusCode",
        "statusMsg",
        "hasMore",
        "total",
        "mixCount",
        "offset",
        "myselfUserId",
        "maxTime",
        "minTime"
      ],
      extraFields: [
        "hasMore",
        "total",
        "mixCount",
        "offset",
        "myselfUserId",
        "maxTime",
        "minTime"
      ]
    });
  }
};
var UserFollowerFilter = class extends UserFollowingFilter {
  get total() {
    return this._getAttrValue("$.total");
  }
  get avatarLarger() {
    return this._getListAttrValue("$.followers[*].avatar_larger.url_list[0]");
  }
  get canComment() {
    return this._getListAttrValue("$.followers[*].aweme_control.can_comment");
  }
  get canForward() {
    return this._getListAttrValue("$.followers[*].aweme_control.can_forward");
  }
  get canShare() {
    return this._getListAttrValue("$.followers[*].aweme_control.can_share");
  }
  get canShowComment() {
    return this._getListAttrValue("$.followers[*].aweme_control.can_show_comment");
  }
  get awemeCount() {
    return this._getListAttrValue("$.followers[*].aweme_count");
  }
  get backCover() {
    return this._getListAttrValue("$.followers[*].cover_url[0].url_list[0]");
  }
  get registerTime() {
    return this._getListAttrValue("$.followers[*].create_time");
  }
  get isBlock() {
    return this._getListAttrValue("$.followers[*].is_block");
  }
  get isBlocked() {
    return this._getListAttrValue("$.followers[*].is_blocked");
  }
  get isGovMediaVip() {
    return this._getListAttrValue("$.followers[*].is_gov_media_vip");
  }
  get isMixUser() {
    return this._getListAttrValue("$.followers[*].is_mix_user");
  }
  get isPhoneBinded() {
    return this._getListAttrValue("$.followers[*].is_phone_binded");
  }
  get isStar() {
    return this._getListAttrValue("$.followers[*].is_star");
  }
  get isTop() {
    return this._getListAttrValue("$.followers[*].is_top");
  }
  get isVerified() {
    return this._getListAttrValue("$.followers[*].is_verified");
  }
  get language() {
    return this._getListAttrValue("$.followers[*].language");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.followers[*].nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.followers[*].nickname");
  }
  get relationLabel() {
    return this._getListAttrValue("$.followers[*].relation_label");
  }
  get roomId() {
    return this._getListAttrValue("$.followers[*].room_id");
  }
  get secUid() {
    return this._getListAttrValue("$.followers[*].sec_uid");
  }
  get secret() {
    return this._getListAttrValue("$.followers[*].secret");
  }
  get shortId() {
    return this._getListAttrValue("$.followers[*].short_id");
  }
  get signature() {
    const raw = this._getListAttrValue("$.followers[*].signature");
    return raw ? replaceT(raw) : null;
  }
  get signatureRaw() {
    return this._getListAttrValue("$.followers[*].signature");
  }
  get uid() {
    return this._getListAttrValue("$.followers[*].uid");
  }
  get uniqueId() {
    return this._getListAttrValue("$.followers[*].unique_id");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.followers",
      excludeFields: [
        "statusCode",
        "statusMsg",
        "hasMore",
        "total",
        "mixCount",
        "offset",
        "myselfUserId",
        "maxTime",
        "minTime"
      ],
      extraFields: [
        "hasMore",
        "total",
        "mixCount",
        "offset",
        "myselfUserId",
        "maxTime",
        "minTime"
      ]
    });
  }
};
var QueryUserFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get statusMsg() {
    return this._getAttrValue("$.status_msg");
  }
  get browserName() {
    return this._getAttrValue("$.browser_name");
  }
  get createTime() {
    const ts = this._getAttrValue("$.create_time");
    return timestamp2Str(String(ts));
  }
  get firebaseInstanceId() {
    return this._getAttrValue("$.firebase_instance_id");
  }
  get userUniqueId() {
    return this._getAttrValue("$.id");
  }
  get lastTime() {
    const ts = this._getAttrValue("$.last_time");
    return timestamp2Str(String(ts));
  }
  get userAgent() {
    return this._getAttrValue("$.user_agent");
  }
  get userUid() {
    return this._getAttrValue("$.user_uid");
  }
  get userUidType() {
    return this._getAttrValue("$.user_uid_type");
  }
};

// src/filter/post.ts
var UserPostFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get hasAweme() {
    return Boolean(this._getAttrValue("$.aweme_list"));
  }
  get locateItemCursor() {
    return this._getAttrValue("$.locate_item_cursor");
  }
  get awemeId() {
    const ids = this._getListAttrValue("$.aweme_list[*].aweme_id");
    return ids || [];
  }
  get awemeType() {
    return this._getListAttrValue("$.aweme_list[*].aweme_type");
  }
  get createTime() {
    const createTimes = this._getListAttrValue("$.aweme_list[*].create_time");
    if (!createTimes) return [];
    return timestamp2Str(createTimes.map(String));
  }
  get caption() {
    const raw = this._getAttrValue("$.aweme_list[*].caption");
    return raw ? replaceT(raw) : null;
  }
  get captionRaw() {
    return this._getAttrValue("$.aweme_list[*].caption");
  }
  get desc() {
    const raw = this._getListAttrValue("$.aweme_list[*].desc");
    return raw ? replaceT(raw) : null;
  }
  get descRaw() {
    return this._getListAttrValue("$.aweme_list[*].desc");
  }
  get uid() {
    return this._getListAttrValue("$.aweme_list[*].author.uid");
  }
  get secUserId() {
    return this._getListAttrValue("$.aweme_list[*].author.sec_uid");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.aweme_list[*].author.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.aweme_list[*].author.nickname");
  }
  get authorAvatarThumb() {
    return this._getListAttrValue("$.aweme_list[*].author.avatar_thumb.url_list[0]");
  }
  get images() {
    const imagesList = this._getListAttrValue("$.aweme_list[*].images");
    if (!imagesList) return [];
    return imagesList.map((images) => {
      if (!images) return null;
      return images.filter(
        (img) => typeof img === "object" && img !== null && "url_list" in img
      ).map((img) => {
        const urlList = img.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get imagesVideo() {
    const imagesVideoList = this._getListAttrValue("$.aweme_list[*].images");
    if (!imagesVideoList) return [];
    return imagesVideoList.map((images) => {
      if (!images) return [];
      return images.filter(
        (img) => typeof img === "object" && img !== null && img.video != null
      ).map((img) => {
        const video = img.video;
        const playAddr = video?.play_addr;
        const urlList = playAddr?.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get animatedCover() {
    const videos = this._getListAttrValue("$.aweme_list[*].video");
    if (!videos) return [];
    return videos.map((video) => {
      if (!video) return null;
      const animatedCover = video.animated_cover;
      if (!animatedCover) return null;
      const urlList = animatedCover.url_list;
      return urlList?.[0] || null;
    });
  }
  get cover() {
    return this._getListAttrValue("$.aweme_list[*].video.origin_cover.url_list[0]");
  }
  get videoPlayAddr() {
    return this._getListAttrValue("$.aweme_list[*].video.bit_rate[0].play_addr.url_list");
  }
  get videoBitRate() {
    const bitRateData = this._getListAttrValue("$.aweme_list[*].video.bit_rate");
    if (!bitRateData) return [];
    return bitRateData.map((aweme) => {
      if (!aweme) return [];
      if (!Array.isArray(aweme)) {
        return [aweme.bit_rate || 0];
      }
      return aweme.map((item) => item.bit_rate || 0);
    });
  }
  get videoDuration() {
    return this._getListAttrValue("$.aweme_list[*].video.duration");
  }
  get partSee() {
    return this._getListAttrValue("$.aweme_list[*].status.part_see");
  }
  get privateStatus() {
    return this._getListAttrValue("$.aweme_list[*].status.private_status");
  }
  get isProhibited() {
    return this._getListAttrValue("$.aweme_list[*].status.is_prohibited");
  }
  get authorDeleted() {
    return this._getListAttrValue("$.aweme_list[*].music.author_deleted");
  }
  get musicStatus() {
    return this._getListAttrValue("$.aweme_list[*].music.status");
  }
  get musicTitle() {
    const raw = this._getListAttrValue("$.aweme_list[*].music.title");
    return raw ? replaceT(raw) : null;
  }
  get musicTitleRaw() {
    return this._getListAttrValue("$.aweme_list[*].music.title");
  }
  get musicPlayUrl() {
    return this._getListAttrValue("$.aweme_list[*].music.play_url.url_list[0]");
  }
  get hasMore() {
    return Boolean(this._getAttrValue("$.has_more"));
  }
  get maxCursor() {
    return this._getAttrValue("$.max_cursor");
  }
  get minCursor() {
    return this._getAttrValue("$.min_cursor");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.aweme_list",
      excludeFields: [
        "statusCode",
        "hasMore",
        "maxCursor",
        "minCursor",
        "hasAweme",
        "locateItemCursor"
      ],
      extraFields: ["statusCode", "hasMore", "maxCursor", "minCursor"]
    });
  }
  /**
   * 转换为 AwemeData 数组，方便直接传给 downloader
   */
  toAwemeDataList() {
    const awemeIds = this.awemeId || [];
    const awemeTypes = this.awemeType || [];
    const secUserIds = this.secUserId || [];
    const nicknames = this.nickname || [];
    const uids = this.uid || [];
    const descs = this.desc || [];
    const descRaws = this.descRaw || [];
    const createTimes = this.createTime;
    const covers = this.cover || [];
    const animatedCovers = this.animatedCover || [];
    const videoPlayAddrs = this.videoPlayAddr || [];
    const images = this.images || [];
    const imagesVideo = this.imagesVideo || [];
    const musicPlayUrls = this.musicPlayUrl || [];
    const musicStatuses = this.musicStatus || [];
    const isProhibiteds = this.isProhibited || [];
    const privateStatuses = this.privateStatus || [];
    return awemeIds.map((awemeId, i) => ({
      awemeId,
      awemeType: awemeTypes[i] ?? 0,
      secUserId: secUserIds[i] ?? "",
      nickname: nicknames[i] ?? "",
      uid: uids[i] ?? "",
      desc: descs[i] ?? "",
      descRaw: descRaws[i] ?? "",
      createTime: Array.isArray(createTimes) ? createTimes[i] : createTimes,
      cover: covers[i] ?? void 0,
      animatedCover: animatedCovers[i] ?? void 0,
      videoPlayAddr: videoPlayAddrs[i]?.[0] ?? void 0,
      images: images[i] ?? void 0,
      imagesVideo: imagesVideo[i] ?? void 0,
      musicPlayUrl: musicPlayUrls[i] ?? void 0,
      musicStatus: musicStatuses[i] ?? 0,
      isProhibited: isProhibiteds[i] ?? false,
      privateStatus: privateStatuses[i] ?? 0
    }));
  }
};
var UserCollectionFilter = class extends UserPostFilter {
  get maxCursor() {
    return this._getAttrValue("$.cursor");
  }
};
var UserMixFilter = class extends UserPostFilter {
  get maxCursor() {
    return this._getAttrValue("$.cursor");
  }
};
var UserLikeFilter = class extends UserPostFilter {
};
var PostRelatedFilter = class extends UserPostFilter {
};
var UserCollectsFilter = class extends JSONModel {
  get maxCursor() {
    return this._getAttrValue("$.cursor");
  }
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get collectsTotalNumber() {
    return this._getAttrValue("$.total_number");
  }
  get hasMore() {
    return Boolean(this._getAttrValue("$.has_more"));
  }
  get appId() {
    return this._getListAttrValue("$.collects_list[*].app_id");
  }
  get collectsCover() {
    return this._getListAttrValue("$.collects_list[*].collects_cover.url_list[0]");
  }
  get collectsId() {
    return this._getListAttrValue("$.collects_list[*].collects_id");
  }
  get collectsName() {
    const raw = this._getListAttrValue("$.collects_list[*].collects_name");
    return raw ? replaceT(raw) : null;
  }
  get collectsNameRaw() {
    return this._getListAttrValue("$.collects_list[*].collects_name");
  }
  get createTime() {
    const createTimes = this._getListAttrValue("$.collects_list[*].create_time");
    if (!createTimes) return [];
    return timestamp2Str(createTimes.map(String));
  }
  get followStatus() {
    return this._getListAttrValue("$.collects_list[*].follow_status");
  }
  get followedCount() {
    return this._getListAttrValue("$.collects_list[*].followed_count");
  }
  get isNormalStatus() {
    return this._getListAttrValue("$.collects_list[*].is_normal_status");
  }
  get itemType() {
    return this._getListAttrValue("$.collects_list[*].item_type");
  }
  get lastCollectTime() {
    const times = this._getListAttrValue("$.collects_list[*].last_collect_time");
    if (!times) return [];
    return timestamp2Str(times.map(String));
  }
  get playCount() {
    return this._getListAttrValue("$.collects_list[*].play_count");
  }
  get states() {
    return this._getListAttrValue("$.collects_list[*].states");
  }
  get status() {
    return this._getListAttrValue("$.collects_list[*].status");
  }
  get systemType() {
    return this._getListAttrValue("$.collects_list[*].system_type");
  }
  get totalNumber() {
    return this._getListAttrValue("$.collects_list[*].total_number");
  }
  get userId() {
    return this._getListAttrValue("$.collects_list[*].user_id");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.collects_list[*].user_info.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.collects_list[*].user_info.nickname");
  }
  get uid() {
    return this._getListAttrValue("$.collects_list[*].user_info.uid");
  }
};
var UserMusicCollectionFilter = class extends JSONModel {
  get maxCursor() {
    return this._getAttrValue("$.cursor");
  }
  get hasMore() {
    return this._getAttrValue("$.has_more");
  }
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get msg() {
    return this._getAttrValue("$.msg");
  }
  get album() {
    return this._getListAttrValue("$.mc_list[*].album");
  }
  get auditionDuration() {
    return this._getListAttrValue("$.mc_list[*].audition_duration");
  }
  get duration() {
    return this._getListAttrValue("$.mc_list[*].duration");
  }
  get author() {
    const raw = this._getListAttrValue("$.mc_list[*].author");
    return raw ? replaceT(raw) : null;
  }
  get authorRaw() {
    return this._getListAttrValue("$.mc_list[*].author");
  }
  get collectStatus() {
    return this._getListAttrValue("$.mc_list[*].collect_stat");
  }
  get musicStatus() {
    return this._getListAttrValue("$.mc_list[*].music_status");
  }
  get coverHd() {
    return this._getListAttrValue("$.mc_list[*].cover_hd.url_list[0]");
  }
  get musicId() {
    return this._getListAttrValue("$.mc_list[*].id");
  }
  get mid() {
    return this._getListAttrValue("$.mc_list[*].mid");
  }
  get isCommerceMusic() {
    return this._getListAttrValue("$.mc_list[*].is_commerce_music");
  }
  get isOriginal() {
    return this._getListAttrValue("$.mc_list[*].is_original");
  }
  get isOriginalSound() {
    return this._getListAttrValue("$.mc_list[*].is_original_sound");
  }
  get lyricType() {
    return this._getListAttrValue("$.mc_list[*].lyric_type");
  }
  get lyricUrl() {
    const data = this._data;
    const mcList = data.mc_list || [];
    return mcList.map((item) => item.lyric_url || null);
  }
  get playUrl() {
    return this._getListAttrValue("$.mc_list[*].play_url.url_list[0]");
  }
  get title() {
    const raw = this._getListAttrValue("$.mc_list[*].title");
    return raw ? replaceT(raw) : null;
  }
  get titleRaw() {
    return this._getListAttrValue("$.mc_list[*].title");
  }
  get strongBeatUrl() {
    return this._getListAttrValue("$.mc_list[*].strong_beat_url.url_list[0]");
  }
  get ownerNickname() {
    const raw = this._getListAttrValue("$.mc_list[*].owner_nickname");
    return raw ? replaceT(raw) : null;
  }
  get ownerNicknameRaw() {
    return this._getListAttrValue("$.mc_list[*].owner_nickname");
  }
  get ownerId() {
    return this._getListAttrValue("$.mc_list[*].owner_id");
  }
  get secUid() {
    return this._getListAttrValue("$.mc_list[*].sec_uid");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.mc_list",
      excludeFields: ["hasMore", "maxCursor", "statusCode", "msg"],
      extraFields: ["hasMore", "maxCursor", "statusCode", "msg"]
    });
  }
};
var PostDetailFilter = class extends JSONModel {
  get apiStatusCode() {
    return this._getAttrValue("$.status_code");
  }
  get awemeType() {
    return this._getAttrValue("$.aweme_detail.aweme_type");
  }
  get awemeId() {
    return this._getAttrValue("$.aweme_detail.aweme_id");
  }
  get nickname() {
    const raw = this._getAttrValue("$.aweme_detail.author.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getAttrValue("$.aweme_detail.author.nickname");
  }
  get secUserId() {
    return this._getAttrValue("$.aweme_detail.author.sec_uid");
  }
  get shortId() {
    return this._getAttrValue("$.aweme_detail.author.short_id");
  }
  get uid() {
    return this._getAttrValue("$.aweme_detail.author.uid");
  }
  get uniqueId() {
    return this._getAttrValue("$.aweme_detail.author.unique_id");
  }
  get canComment() {
    return this._getAttrValue("$.aweme_detail.aweme_control.can_comment");
  }
  get canForward() {
    return this._getAttrValue("$.aweme_detail.aweme_control.can_forward");
  }
  get canShare() {
    return this._getAttrValue("$.aweme_detail.aweme_control.can_share");
  }
  get canShowComment() {
    return this._getAttrValue("$.aweme_detail.aweme_control.can_show_comment");
  }
  get commentGid() {
    return this._getAttrValue("$.aweme_detail.comment_gid");
  }
  get createTime() {
    const ts = this._getAttrValue("$.aweme_detail.create_time");
    return timestamp2Str(String(ts));
  }
  get caption() {
    const raw = this._getAttrValue("$.aweme_detail.caption");
    return raw ? replaceT(raw) : null;
  }
  get captionRaw() {
    return this._getAttrValue("$.aweme_detail.caption");
  }
  get desc() {
    const raw = this._getAttrValue("$.aweme_detail.desc");
    return raw ? replaceT(raw) : null;
  }
  get descRaw() {
    return this._getAttrValue("$.aweme_detail.desc");
  }
  get duration() {
    return this._getAttrValue("$.aweme_detail.duration");
  }
  get isAds() {
    return this._getAttrValue("$.aweme_detail.is_ads");
  }
  get isStory() {
    return this._getAttrValue("$.aweme_detail.is_story");
  }
  get isTop() {
    return this._getAttrValue("$.aweme_detail.is_top");
  }
  get partSee() {
    return this._getAttrValue("$.aweme_detail.status.part_see");
  }
  get privateStatus() {
    return this._getAttrValue("$.aweme_detail.status.private_status");
  }
  get isDelete() {
    return this._getAttrValue("$.aweme_detail.status.is_delete");
  }
  get isProhibited() {
    return this._getAttrValue("$.aweme_detail.status.is_prohibited");
  }
  get mediaType() {
    return this._getAttrValue("$.aweme_detail.media_type");
  }
  get mixDesc() {
    const raw = this._getAttrValue("$.aweme_detail.mix_info.mix_desc");
    return raw ? replaceT(raw) : null;
  }
  get mixDescRaw() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_desc");
  }
  get mixCreateTime() {
    const ts = this._getAttrValue("$.aweme_detail.mix_info.mix_create_time");
    return timestamp2Str(String(ts));
  }
  get mixId() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_id");
  }
  get mixName() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_name");
  }
  get mixPicType() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_pic_type");
  }
  get mixType() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_type");
  }
  get mixShareUrl() {
    return this._getAttrValue("$.aweme_detail.mix_info.mix_share_url");
  }
  get mixUpdateTime() {
    const ts = this._getAttrValue("$.aweme_detail.mix_info.mix_update_time");
    return timestamp2Str(String(ts));
  }
  get isCommerceMusic() {
    return this._getAttrValue("$.aweme_detail.music.is_commerce_music");
  }
  get isOriginal() {
    return this._getAttrValue("$.aweme_detail.music.is_original");
  }
  get isOriginalSound() {
    return this._getAttrValue("$.aweme_detail.music.is_original_sound");
  }
  get isPgc() {
    return this._getAttrValue("$.aweme_detail.music.is_pgc");
  }
  get musicAuthor() {
    const raw = this._getAttrValue("$.aweme_detail.music.author");
    return raw ? replaceT(raw) : null;
  }
  get musicAuthorRaw() {
    return this._getAttrValue("$.aweme_detail.music.author");
  }
  get musicAuthorDeleted() {
    return this._getAttrValue("$.aweme_detail.music.author_deleted");
  }
  get musicDuration() {
    return this._getAttrValue("$.aweme_detail.music.duration");
  }
  get musicId() {
    return this._getAttrValue("$.aweme_detail.music.id");
  }
  get musicMid() {
    return this._getAttrValue("$.aweme_detail.music.mid");
  }
  get pgcAuthor() {
    const raw = this._getAttrValue("$.aweme_detail.music.matched_pgc_sound.pgc_author");
    return raw ? replaceT(raw) : null;
  }
  get pgcAuthorRaw() {
    return this._getAttrValue("$.aweme_detail.music.matched_pgc_sound.pgc_author");
  }
  get pgcAuthorTitle() {
    const raw = this._getAttrValue("$.aweme_detail.music.matched_pgc_sound.pgc_author_title");
    return raw ? replaceT(raw) : null;
  }
  get pgcAuthorTitleRaw() {
    return this._getAttrValue("$.aweme_detail.music.matched_pgc_sound.pgc_author_title");
  }
  get pgcMusicType() {
    return this._getAttrValue("$.aweme_detail.music.matched_pgc_sound.pgc_music_type");
  }
  get musicStatus() {
    return this._getAttrValue("$.aweme_detail.music.status");
  }
  get musicOwnerHandle() {
    const raw = this._getAttrValue("$.aweme_detail.music.owner_handle");
    return raw ? replaceT(raw) : null;
  }
  get musicOwnerHandleRaw() {
    return this._getAttrValue("$.aweme_detail.music.owner_handle");
  }
  get musicOwnerId() {
    return this._getAttrValue("$.aweme_detail.music.owner_id");
  }
  get musicOwnerNickname() {
    const raw = this._getAttrValue("$.aweme_detail.music.owner_nickname");
    return raw ? replaceT(raw) : null;
  }
  get musicOwnerNicknameRaw() {
    return this._getAttrValue("$.aweme_detail.music.owner_nickname");
  }
  get musicPlayUrl() {
    return this._getAttrValue("$.aweme_detail.music.play_url.url_list[0]");
  }
  get position() {
    return this._getAttrValue("$.aweme_detail.position");
  }
  get region() {
    return this._getAttrValue("$.aweme_detail.region");
  }
  get seoOcrContent() {
    return this._getAttrValue("$.aweme_detail.seo_info.seo_ocr_content");
  }
  get allowDouplus() {
    return this._getAttrValue("$.aweme_detail.video_control.allow_douplus");
  }
  get downloadSetting() {
    return this._getAttrValue("$.aweme_detail.video_control.download_setting");
  }
  get allowShare() {
    return this._getAttrValue("$.aweme_detail.video_control.allow_share");
  }
  get admireCount() {
    return this._getAttrValue("$.aweme_detail.statistics.admire_count");
  }
  get collectCount() {
    return this._getAttrValue("$.aweme_detail.statistics.collect_count");
  }
  get commentCount() {
    return this._getAttrValue("$.aweme_detail.statistics.comment_count");
  }
  get diggCount() {
    return this._getAttrValue("$.aweme_detail.statistics.digg_count");
  }
  get shareCount() {
    return this._getAttrValue("$.aweme_detail.statistics.share_count");
  }
  get hashtagIds() {
    return this._getListAttrValue("$.aweme_detail.text_extra[*].hashtag_id", true) ? JSON.parse(this._getListAttrValue("$.aweme_detail.text_extra[*].hashtag_id", true)) : null;
  }
  get hashtagNames() {
    return this._getListAttrValue("$.aweme_detail.text_extra[*].hashtag_name", true) ? JSON.parse(this._getListAttrValue("$.aweme_detail.text_extra[*].hashtag_name", true)) : null;
  }
  get animatedCover() {
    return this._getAttrValue("$.aweme_detail.video.animated_cover.url_list[0]");
  }
  get cover() {
    return this._getAttrValue("$.aweme_detail.video.origin_cover.url_list[0]");
  }
  get videoBitRate() {
    const bitRateData = this._getListAttrValue("$.aweme_detail.video.bit_rate");
    if (!bitRateData) return [];
    return bitRateData.map((aweme) => {
      if (!aweme) return [];
      if (!Array.isArray(aweme)) {
        return [aweme.bit_rate || 0];
      }
      return aweme.map((item) => item.bit_rate || 0);
    });
  }
  get videoPlayAddr() {
    return this._getAttrValue("$.aweme_detail.video.bit_rate[0].play_addr.url_list");
  }
  get images() {
    return this._getListAttrValue("$.aweme_detail.images[*].url_list[0]");
  }
  get imagesVideo() {
    return this._getListAttrValue("$.aweme_detail.images[*].video.play_addr.url_list[0]");
  }
  /**
   * 转换为 AwemeData，方便直接传给 downloader
   */
  toAwemeData() {
    return {
      awemeId: this.awemeId || "",
      awemeType: this.awemeType || 0,
      secUserId: this.secUserId || "",
      nickname: this.nickname || "",
      uid: this.uid || "",
      desc: this.desc || "",
      descRaw: this.descRaw || "",
      createTime: this.createTime,
      cover: this.cover || void 0,
      animatedCover: this.animatedCover || void 0,
      videoPlayAddr: this.videoPlayAddr?.[0] || void 0,
      images: this.images || void 0,
      imagesVideo: this.imagesVideo || void 0,
      musicPlayUrl: this.musicPlayUrl || void 0,
      musicStatus: this.musicStatus || 0,
      isProhibited: this.isProhibited || false,
      privateStatus: this.privateStatus || 0
    };
  }
};
var PostStatsFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get statusMsg() {
    return this._getAttrValue("$.status_msg");
  }
};

// src/filter/comment.ts
var PostCommentFilter = class extends JSONModel {
  get apiStatusCode() {
    return this._getAttrValue("$.status_code");
  }
  get hasMore() {
    return this._getAttrValue("$.has_more");
  }
  get total() {
    return this._getAttrValue("$.total");
  }
  get cursor() {
    return this._getAttrValue("$.cursor");
  }
  get canShare() {
    return this._getListAttrValue("$.comments[*].can_share");
  }
  get createTime() {
    const createTimes = this._getListAttrValue("$.comments[*].create_time");
    if (!createTimes) return [];
    return timestamp2Str(createTimes.map(String));
  }
  get commentId() {
    return this._getListAttrValue("$.comments[*].cid");
  }
  get commentText() {
    const raw = this._getListAttrValue("$.comments[*].text");
    return raw ? replaceT(raw) : null;
  }
  get commentTextRaw() {
    return this._getListAttrValue("$.comments[*].text");
  }
  get itemCommentTotal() {
    return this._getListAttrValue("$.comments[*].item_comment_total");
  }
  get isHot() {
    return this._getListAttrValue("$.comments[*].is_hot");
  }
  get diggCount() {
    return this._getListAttrValue("$.comments[*].digg_count");
  }
  get userId() {
    return this._getListAttrValue("$.comments[*].user.uid");
  }
  get userUniqueId() {
    return this._getListAttrValue("$.comments[*].user.unique_id");
  }
  get secUid() {
    return this._getListAttrValue("$.comments[*].user.sec_uid");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.comments[*].user.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.comments[*].user.nickname");
  }
  get replyCommentId() {
    return this._getListAttrValue("$.comments[*].reply_comment[0].cid");
  }
  get replyCommentText() {
    const raw = this._getListAttrValue("$.comments[*].reply_comment[0].text");
    return raw ? replaceT(raw) : null;
  }
  get replyCommentTextRaw() {
    return this._getListAttrValue("$.comments[*].reply_comment[0].text");
  }
  get replyCommentTotal() {
    return this._getListAttrValue("$.comments[*].reply_comment_total");
  }
  get replyId() {
    return this._getListAttrValue("$.comments[*].reply_id");
  }
  get replyToReplyId() {
    return this._getListAttrValue("$.comments[*].reply_to_reply_id");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.comments",
      excludeFields: ["apiStatusCode", "hasMore", "total", "cursor"],
      extraFields: ["hasMore", "total", "cursor"]
    });
  }
};
var PostCommentReplyFilter = class extends PostCommentFilter {
};

// src/filter/live.ts
var UserLiveFilter = class extends JSONModel {
  get apiStatusCode() {
    return this._getAttrValue("$.status_code");
  }
  get roomId() {
    return this._getAttrValue("$.data.data[0].id_str");
  }
  get liveStatus() {
    return this._getAttrValue("$.data.data[0].status");
  }
  get liveTitle() {
    const raw = this._getAttrValue("$.data.data[0].title");
    return raw ? replaceT(raw) : null;
  }
  get liveTitleRaw() {
    return this._getAttrValue("$.data.data[0].title");
  }
  get cover() {
    return this._getAttrValue("$.data.data[0].cover.url_list[0]");
  }
  get userCount() {
    return this._getAttrValue("$.data.data[0].stats.user_count_str");
  }
  get totalUserCount() {
    return this._getAttrValue("$.data.data[0].stats.total_user_str");
  }
  get likeCount() {
    return this._getAttrValue("$.data.data[0].stats.like_count_str");
  }
  get flvPullUrl() {
    return this._getAttrValue("$.data.data[0].stream_url.flv_pull_url");
  }
  get m3u8PullUrl() {
    return this._getAttrValue("$.data.data[0].stream_url.hls_pull_url_map");
  }
  get userId() {
    return this._getAttrValue("$.data.data[0].owner.id_str");
  }
  get secUserId() {
    return this._getAttrValue("$.data.data[0].owner.sec_uid");
  }
  get nickname() {
    const raw = this._getAttrValue("$.data.data[0].owner.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getAttrValue("$.data.data[0].owner.nickname");
  }
  get avatarThumb() {
    return this._getAttrValue("$.data.data[0].owner.avatar_thumb.url_list[0]");
  }
  get followStatus() {
    return this._getAttrValue("$.data.data[0].owner.follow_info.follow_status");
  }
  get partitionId() {
    return this._getAttrValue("$.data.data[0].partition_road_map.partition.id_str");
  }
  get partitionTitle() {
    return this._getAttrValue("$.data.data[0].partition_road_map.partition.title");
  }
  get subPartitionId() {
    return this._getAttrValue("$.data.data[0].partition_road_map.sub_partition.id_str");
  }
  get subPartitionTitle() {
    return this._getAttrValue("$.data.data[0].partition_road_map.sub_partition.title");
  }
  get chatAuth() {
    return this._getAttrValue("$.data.data[0].room_auth.Chat");
  }
  get giftAuth() {
    return this._getAttrValue("$.data.data[0].room_auth.Gift");
  }
  get diggAuth() {
    return this._getAttrValue("$.data.data[0].room_auth.Digg");
  }
  get shareAuth() {
    return this._getAttrValue("$.data.data[0].room_auth.Share");
  }
};
var UserLive2Filter = class extends JSONModel {
  get apiStatusCode() {
    return this._getAttrValue("$.status_code");
  }
  get roomId() {
    return this._getAttrValue("$.data.room.id");
  }
  get webRid() {
    return this._getAttrValue("$.data.room.owner.web_rid");
  }
  get liveStatus() {
    return this._getAttrValue("$.data.room.status");
  }
  get liveTitle() {
    const raw = this._getAttrValue("$.data.room.title");
    return raw ? replaceT(raw) : null;
  }
  get liveTitleRaw() {
    return this._getAttrValue("$.data.room.title");
  }
  get userCount() {
    return this._getAttrValue("$.data.room.user_count");
  }
  get createTime() {
    const ts = this._getAttrValue("$.data.room.create_time");
    return timestamp2Str(String(ts));
  }
  get finishTime() {
    const ts = this._getAttrValue("$.data.room.finish_time");
    return timestamp2Str(String(ts));
  }
  get cover() {
    return this._getAttrValue("$.data.room.cover.url_list[0]");
  }
  get streamId() {
    return this._getAttrValue("$.data.room.stream_id");
  }
  get resolutionName() {
    return this._getAttrValue("$.data.room.stream_url.resolution_name");
  }
  get flvPullUrl() {
    return this._getAttrValue("$.data.room.stream_url.flv_pull_url");
  }
  get hlsPullUrl() {
    return this._getAttrValue("$.data.room.stream_url.hls_pull_url_map");
  }
  get nickname() {
    const raw = this._getAttrValue("$.data.room.owner.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getAttrValue("$.data.room.owner.nickname");
  }
  get gender() {
    const raw = this._getAttrValue("$.data.room.owner.gender");
    return raw ? replaceT(raw) : null;
  }
  get genderRaw() {
    return this._getAttrValue("$.data.room.owner.gender");
  }
  get signature() {
    const raw = this._getAttrValue("$.data.room.owner.signature");
    return raw ? replaceT(raw) : null;
  }
  get signatureRaw() {
    return this._getAttrValue("$.data.room.owner.signature");
  }
  get avatarLarge() {
    return this._getAttrValue("$.data.room.owner.avatar_large.url_list[0]");
  }
  get verified() {
    return this._getAttrValue("$.data.room.owner.verified");
  }
  get city() {
    return this._getAttrValue("$.data.room.owner.city");
  }
  get followingCount() {
    return this._getAttrValue("$.data.room.owner.follow_info.following_count");
  }
  get followerCount() {
    return this._getAttrValue("$.data.room.owner.follow_info.follower_count");
  }
  get secUid() {
    return this._getAttrValue("$.data.room.owner.sec_uid");
  }
};
var UserLiveStatusFilter = class extends JSONModel {
  get apiStatusCode() {
    return this._getAttrValue("$.status_code");
  }
  get errorMsg() {
    return this._getAttrValue("$.data.prompts");
  }
  get sceneId() {
    return this._getAttrValue("$.data[0].scene_id");
  }
  get liveStatus() {
    return this._getAttrValue("$.data[0].user_live[0].live_status");
  }
  get roomId() {
    return this._getAttrValue("$.data[0].user_live[0].room_id");
  }
  get roomIdStr() {
    return this._getAttrValue("$.data[0].user_live[0].room_id_str");
  }
  get userId() {
    return this._getAttrValue("$.data[0].user_live[0].user_id");
  }
  get userIdStr() {
    return this._getAttrValue("$.data[0].user_live[0].user_id_str");
  }
};
var FollowingUserLiveFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get statusMsg() {
    return this._getAttrValue("$.data.message");
  }
  get coverType() {
    return this._getListAttrValue("$.data.data.[*].cover_type");
  }
  get isRecommend() {
    return this._getListAttrValue("$.data.data.[*].is_recommend");
  }
  get tagName() {
    return this._getListAttrValue("$.data.data.[*].tag_name");
  }
  get titleType() {
    return this._getListAttrValue("$.data.data.[*].title_type");
  }
  get uniqId() {
    return this._getListAttrValue("$.data.data.[*].uniq_id");
  }
  get webRid() {
    return this._getListAttrValue("$.data.data.[*].web_rid");
  }
  get cover() {
    return this._getListAttrValue("$.data.data.[*].room.cover.url_list[0]");
  }
  get hasCommerceGoods() {
    return this._getListAttrValue("$.data.data.[*].room.has_commerce_goods");
  }
  get roomId() {
    return this._getListAttrValue("$.data.data.[*].room.id_str");
  }
  get liveTitle() {
    const raw = this._getListAttrValue("$.data.data.[*].room.title");
    return raw ? replaceT(raw) : null;
  }
  get liveTitleRaw() {
    return this._getListAttrValue("$.data.data.[*].room.title");
  }
  get liveRoomMode() {
    return this._getListAttrValue("$.data.data.[*].room.live_room_mode");
  }
  get mosaicStatus() {
    return this._getListAttrValue("$.data.data.[*].room.mosaic_status");
  }
  get userCount() {
    return this._getListAttrValue("$.data.data.[*].room.stats.user_count_str");
  }
  get likeCount() {
    return this._getListAttrValue("$.data.data.[*].room.stats.like_count");
  }
  get totalCount() {
    return this._getListAttrValue("$.data.data.[*].room.stats.total_user_str");
  }
  get avatarThumb() {
    return this._getListAttrValue("$.data.data.[*].room.owner.avatar_thumb.url_list[0]");
  }
  get userId() {
    return this._getListAttrValue("$.data.data.[*].room.owner.id_str");
  }
  get userSecUid() {
    return this._getListAttrValue("$.data.data.[*].room.owner.sec_uid");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.data.data.[*].room.owner.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.data.data.[*].room.owner.nickname");
  }
  get flvPullUrl() {
    return this._getListAttrValue("$.data.data.[*].room.stream_url.flv_pull_url");
  }
  get hlsPullUrl() {
    return this._getListAttrValue("$.data.data.[*].room.stream_url.hls_pull_url_map");
  }
  get streamOrientation() {
    return this._getListAttrValue("$.data.data.[*].room.stream_url.stream_orientation");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.data.data",
      excludeFields: ["statusCode", "statusMsg"],
      extraFields: []
    });
  }
};
var LiveImFetchFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get isShowMsg() {
    return this._getAttrValue("$.data[0].common.is_show_msg");
  }
  get msgId() {
    return this._getAttrValue("$.data[0].common.msg_id");
  }
  get roomId() {
    return this._getAttrValue("$.data[0].common.room_id");
  }
  get internalExt() {
    return this._getAttrValue("$.internal_ext");
  }
  get cursor() {
    return this._getAttrValue("$.extra.cursor");
  }
  get now() {
    const ts = this._getAttrValue("$.extra.now");
    return timestamp2Str(String(ts));
  }
};

// src/filter/feed.ts
var FriendFeedFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get statusMsg() {
    return this._getAttrValue("$.status_msg");
  }
  get toast() {
    return this._getAttrValue("$.toast");
  }
  get hasMore() {
    return Boolean(this._getAttrValue("$.has_more"));
  }
  get hasAweme() {
    return Boolean(this._getAttrValue("$.data"));
  }
  get friendUpdateCount() {
    return this._getAttrValue("$.friend_update_count");
  }
  get cursor() {
    return this._getAttrValue("$.cursor");
  }
  get level() {
    return this._getAttrValue("$.level");
  }
  get friendFeedType() {
    return this._getListAttrValue("$.data[*].feed_type");
  }
  get friendFeedSource() {
    return this._getListAttrValue("$.data[*].source");
  }
  get avatarLarger() {
    return this._getListAttrValue("$.data[*].aweme.author.avatar_larger.url_list[0]");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.data[*].aweme.author.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.data[*].aweme.author.nickname");
  }
  get secUid() {
    return this._getListAttrValue("$.data[*].aweme.author.sec_uid");
  }
  get uid() {
    return this._getListAttrValue("$.data[*].aweme.author.uid");
  }
  get awemeId() {
    return this._getListAttrValue("$.data[*].aweme.aweme_id");
  }
  get awemeType() {
    return this._getListAttrValue("$.data[*].aweme.aweme_type");
  }
  get caption() {
    const raw = this._getListAttrValue("$.data[*].aweme.desc");
    return raw ? replaceT(raw) : null;
  }
  get captionRaw() {
    return this._getListAttrValue("$.data[*].aweme.desc");
  }
  get desc() {
    const raw = this._getListAttrValue("$.data[*].aweme.desc");
    return raw ? replaceT(raw) : null;
  }
  get descRaw() {
    return this._getListAttrValue("$.data[*].aweme.desc");
  }
  get recommendReason() {
    return this._getListAttrValue("$.data[*].aweme.fall_card_struct.recommend_reason");
  }
  get createTime() {
    const createTimes = this._getListAttrValue("$.data[*].aweme.create_time");
    if (!createTimes) return [];
    return timestamp2Str(createTimes.map(String));
  }
  get is24Story() {
    return this._getListAttrValue("$.data[*].aweme.is_24_story");
  }
  get mediaType() {
    return this._getListAttrValue("$.data[*].aweme.media_type");
  }
  get collectCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.collect_count");
  }
  get commentCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.comment_count");
  }
  get diggCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.digg_count");
  }
  get exposureCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.exposure_count");
  }
  get liveWatchCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.live_watch_count");
  }
  get playCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.play_count");
  }
  get shareCount() {
    return this._getListAttrValue("$.data[*].aweme.statistics.share_count");
  }
  get allowShare() {
    return this._getListAttrValue("$.data[*].aweme.status.allow_share");
  }
  get privateStatus() {
    return this._getListAttrValue("$.data[*].aweme.status.private_status");
  }
  get isProhibited() {
    return this._getListAttrValue("$.data[*].aweme.status.is_prohibited");
  }
  get partSee() {
    return this._getListAttrValue("$.data[*].aweme.status.part_see");
  }
  get animatedCover() {
    const videos = this._getListAttrValue("$.data[*].aweme.video");
    if (!videos) return [];
    return videos.map((video) => {
      if (!video) return null;
      const animatedCover = video.animated_cover;
      if (!animatedCover) return null;
      const urlList = animatedCover.url_list;
      return urlList?.[0] || null;
    });
  }
  get cover() {
    return this._getListAttrValue("$.data[*].aweme.video.cover.url_list[0]");
  }
  get images() {
    const imagesList = this._getListAttrValue("$.data[*].aweme.images");
    if (!imagesList) return [];
    return imagesList.map((images) => {
      if (!images) return null;
      return images.filter(
        (img) => typeof img === "object" && img !== null && "url_list" in img
      ).map((img) => {
        const urlList = img.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get imagesVideo() {
    const imagesList = this._getListAttrValue("$.data[*].aweme.images");
    if (!imagesList) return [];
    return imagesList.map((images) => {
      if (!images) return null;
      return images.filter(
        (img) => typeof img === "object" && img !== null && "video" in img
      ).map((img) => {
        const video = img.video;
        const playAddr = video?.play_addr;
        const urlList = playAddr?.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get videoPlayAddr() {
    return this._getListAttrValue("$.data[*].aweme.video.bit_rate[0].play_addr.url_list");
  }
  get musicId() {
    return this._getListAttrValue("$.data[*].aweme.music.id");
  }
  get musicMid() {
    return this._getListAttrValue("$.data[*].aweme.music.mid");
  }
  get musicDuration() {
    return this._getListAttrValue("$.data[*].aweme.music.duration");
  }
  get musicPlayUrl() {
    return this._getListAttrValue("$.data[*].aweme.music.play_url.url_list[0]");
  }
  get musicOwnerNickname() {
    const raw = this._getListAttrValue("$.data[*].aweme.music.owner_nickname");
    return raw ? replaceT(raw) : null;
  }
  get musicOwnerNicknameRaw() {
    return this._getListAttrValue("$.data[*].aweme.music.owner_nickname");
  }
  get musicSecUid() {
    return this._getListAttrValue("$.data[*].aweme.music.sec_uid");
  }
  get musicTitle() {
    const raw = this._getListAttrValue("$.data[*].aweme.music.title");
    return raw ? replaceT(raw) : null;
  }
  get musicTitleRaw() {
    return this._getListAttrValue("$.data[*].aweme.music.title");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.data",
      excludeFields: [
        "statusCode",
        "statusMsg",
        "hasMore",
        "hasAweme",
        "friendUpdateCount",
        "cursor",
        "level"
      ],
      extraFields: ["hasMore", "hasAweme", "friendUpdateCount", "cursor", "level"]
    });
  }
};

// src/filter/search.ts
var HomePostSearchFilter = class extends JSONModel {
  get statusCode() {
    return this._getAttrValue("$.status_code");
  }
  get hasAweme() {
    return Boolean(this._getAttrValue("$.aweme_list"));
  }
  get statusMsg() {
    return this._getAttrValue("$.status_msg");
  }
  get hasMore() {
    return this._getAttrValue("$.has_more");
  }
  get cursor() {
    return this._getAttrValue("$.cursor");
  }
  get homeText() {
    return this._getAttrValue("$.global_doodle_config.home_text");
  }
  get searchKeyword() {
    return this._getAttrValue("$.global_doodle_config.keyword");
  }
  get searchId() {
    const imprId = this._getAttrValue("$.log_pb.impr_id");
    return String(imprId);
  }
  get userId() {
    return this._getListAttrValue("$.aweme_list[*].item.author.uid");
  }
  get uniqueId() {
    return this._getListAttrValue("$.aweme_list[*].item.author.unique_id");
  }
  get secUid() {
    return this._getListAttrValue("$.aweme_list[*].item.author.sec_uid");
  }
  get signature() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.author.signature");
    return raw ? replaceT(raw) : null;
  }
  get signatureRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.author.signature");
  }
  get nickname() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.author.nickname");
    return raw ? replaceT(raw) : null;
  }
  get nicknameRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.author.nickname");
  }
  get avatarLarger() {
    return this._getListAttrValue("$.aweme_list[*].item.author.avatar_larger.url_list[0]");
  }
  get awemeType() {
    return this._getListAttrValue("$.aweme_list[*].item.aweme_type");
  }
  get awemeId() {
    return this._getListAttrValue("$.aweme_list[*].item.aweme_id");
  }
  get caption() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.caption");
    return raw ? replaceT(raw) : null;
  }
  get captionRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.caption");
  }
  get city() {
    return this._getListAttrValue("$.aweme_list[*].item.city");
  }
  get desc() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.desc");
    return raw ? replaceT(raw) : null;
  }
  get descRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.desc");
  }
  get images() {
    const imagesList = this._getListAttrValue("$.aweme_list[*].item.images");
    if (!imagesList) return [];
    return imagesList.map((images) => {
      if (!images) return null;
      return images.filter(
        (img) => typeof img === "object" && img !== null && "url_list" in img
      ).map((img) => {
        const urlList = img.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get imagesVideo() {
    const imagesList = this._getListAttrValue("$.aweme_list[*].item.images");
    if (!imagesList) return [];
    return imagesList.map((images) => {
      if (!images) return null;
      return images.filter(
        (img) => typeof img === "object" && img !== null && "video" in img
      ).map((img) => {
        const video = img.video;
        const playAddr = video?.play_addr;
        const urlList = playAddr?.url_list;
        return urlList?.[0] || null;
      }).filter((url) => url !== null);
    });
  }
  get musicId() {
    return this._getListAttrValue("$.aweme_list[*].item.music.id");
  }
  get musicIdStr() {
    return this._getListAttrValue("$.aweme_list[*].item.music.id_str");
  }
  get musicMid() {
    return this._getListAttrValue("$.aweme_list[*].item.music.mid");
  }
  get musicDuration() {
    return this._getListAttrValue("$.aweme_list[*].item.music.duration");
  }
  get musicPlayUrl() {
    return this._getListAttrValue("$.aweme_list[*].item.music.play_url.url_list[0]");
  }
  get musicOwnerNickname() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.music.owner_nickname");
    return raw ? replaceT(raw) : null;
  }
  get musicOwnerNicknameRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.music.owner_nickname");
  }
  get musicSecUid() {
    return this._getListAttrValue("$.aweme_list[*].item.music.sec_uid");
  }
  get musicTitle() {
    const raw = this._getListAttrValue("$.aweme_list[*].item.music.title");
    return raw ? replaceT(raw) : null;
  }
  get musicTitleRaw() {
    return this._getListAttrValue("$.aweme_list[*].item.music.title");
  }
  get cover() {
    return this._getListAttrValue("$.aweme_list[*].item.video.cover.url_list[0]");
  }
  get dynamicCover() {
    return this._getListAttrValue("$.aweme_list[*].item.video.dynamic_cover.url_list[0]");
  }
  get animatedCover() {
    const videos = this._getListAttrValue("$.aweme_list[*].item.video");
    if (!videos) return [];
    return videos.map((video) => {
      if (!video) return null;
      const animatedCover = video.animated_cover;
      if (!animatedCover) return null;
      const urlList = animatedCover.url_list;
      return urlList?.[0] || null;
    });
  }
  get videoPlayAddr() {
    return this._getListAttrValue("$.aweme_list[*].item.video.bit_rate[0].play_addr.url_list");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.aweme_list",
      excludeFields: [
        "statusCode",
        "statusMsg",
        "hasAweme",
        "hasMore",
        "cursor",
        "homeText",
        "searchKeyword",
        "searchId"
      ],
      extraFields: ["hasMore", "cursor", "homeText", "searchKeyword", "searchId"]
    });
  }
};
var SuggestWordFilter = class extends JSONModel {
  get statusMsg() {
    return this._getAttrValue("$.msg");
  }
  get suggestWordId() {
    return this._getListAttrValue("$.data[0].words[*].id");
  }
  get suggestWord() {
    return this._getListAttrValue("$.data[0].words[*].word");
  }
  toList() {
    return filterToList(this, {
      entriesPath: "$.data[0].words",
      excludeFields: ["statusMsg"],
      extraFields: []
    });
  }
};

// src/handler/types.ts
var DY_LIVE_STATUS_MAPPING = {
  2: "\u76F4\u64AD\u4E2D",
  4: "\u5DF2\u5173\u64AD"
};

// src/handler/index.ts
var DouyinHandler = class {
  crawler;
  hasCookie;
  constructor(config) {
    this.hasCookie = !!config.cookie;
    this.crawler = new DouyinCrawler({
      cookie: config.cookie || "",
      headers: config.headers,
      proxies: config.proxies
    });
  }
  /**
   * 获取用户资料
   */
  async fetchUserProfile(secUserId) {
    const response = await this.crawler.fetchUserProfile(secUserId);
    return new UserProfileFilter(response.data);
  }
  /**
   * 获取单个作品详情
   * @param urlOrAwemeId - 作品链接或 aweme_id
   * 如果没有 cookie，会尝试从移动端分享页面获取信息
   */
  async fetchOneVideo(urlOrAwemeId) {
    const isUrl = urlOrAwemeId.includes("http") || urlOrAwemeId.includes("douyin.com");
    const awemeId = isUrl ? await getAwemeId(urlOrAwemeId) : urlOrAwemeId;
    if (this.hasCookie) {
      try {
        const response = await this.crawler.fetchPostDetail(awemeId);
        return new PostDetailFilter(response.data);
      } catch {
      }
    }
    const shareDetail = await fetchFromSharePage(awemeId);
    if (shareDetail) {
      return shareDetail;
    }
    throw new Error("\u65E0\u6CD5\u83B7\u53D6\u89C6\u9891\u4FE1\u606F\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u6709\u6548");
  }
  /**
   * 从移动端分享页面获取视频详情（无需 Cookie）
   * @param urlOrAwemeId - 作品链接或 aweme_id
   */
  async fetchOneVideoFromSharePage(urlOrAwemeId) {
    const isUrl = urlOrAwemeId.includes("http") || urlOrAwemeId.includes("douyin.com");
    const awemeId = isUrl ? await getAwemeId(urlOrAwemeId) : urlOrAwemeId;
    return fetchFromSharePage(awemeId);
  }
  /**
   * 获取用户作品列表（生成器）
   */
  async *fetchUserPostVideos(secUserId, options = {}) {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserPost(secUserId, cursor, pageCounts);
      const filter = new UserPostFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户喜欢列表（生成器）
   */
  async *fetchUserLikeVideos(secUserId, options = {}) {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserLike(secUserId, cursor, pageCounts);
      const filter = new UserLikeFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户收藏列表（生成器）
   */
  async *fetchUserCollectionVideos(options = {}) {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = initialCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserCollection(cursor, pageCounts);
      const filter = new UserCollectionFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户收藏夹列表（生成器）
   */
  async *fetchUserCollects(options = {}) {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = initialCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserCollects(cursor, pageCounts);
      const filter = new UserCollectsFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.collectsId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取收藏夹作品（生成器）
   */
  async *fetchUserCollectsVideos(collectsId, options = {}) {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = initialCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserCollectsVideo(collectsId, cursor, pageCounts);
      const filter = new UserCollectsFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.collectsId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取合集作品（生成器）
   */
  async *fetchUserMixVideos(mixId, options = {}) {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = initialCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserMix(mixId, cursor, pageCounts);
      const filter = new UserMixFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户音乐收藏（生成器）
   */
  async *fetchUserMusicCollection(options = {}) {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = initialCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserMusicCollection(cursor, pageCounts);
      const filter = new UserMusicCollectionFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.maxCursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.musicId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取相关推荐作品（生成器）
   */
  async *fetchRelatedVideos(awemeId, options = {}) {
    const { maxCounts = 0 } = options;
    let filterGids = "";
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchPostRelated(awemeId, filterGids, 20);
      const filter = new PostRelatedFilter(response.data);
      yield filter;
      const awemeIds = filter.awemeId;
      if (!awemeIds || awemeIds.length === 0) break;
      filterGids = awemeIds.join(",");
      count += awemeIds.length;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取朋友作品（生成器）
   */
  async *fetchFriendFeedVideos(options = {}) {
    const { maxCursor = 0, maxCounts = 0 } = options;
    let cursor = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchFriendFeed(cursor);
      const filter = new FriendFeedFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.cursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户直播信息
   */
  async fetchUserLiveVideos(webRid, roomIdStr) {
    const response = await this.crawler.fetchUserLive(webRid, roomIdStr);
    return new UserLiveFilter(response.data);
  }
  /**
   * 获取用户直播信息2
   */
  async fetchUserLiveVideos2(roomId) {
    const response = await this.crawler.fetchUserLive2(roomId);
    return new UserLive2Filter(response.data);
  }
  /**
   * 获取直播弹幕
   */
  async fetchLiveImFetch(roomId, userUniqueId, cursor = "", internalExt = "") {
    const response = await this.crawler.fetchLiveImFetch(roomId, userUniqueId, cursor, internalExt);
    return new LiveImFetchFilter(response.data);
  }
  /**
   * 获取用户直播状态
   */
  async fetchUserLiveStatus(userIds) {
    const response = await this.crawler.fetchUserLiveStatus(userIds);
    return new UserLiveStatusFilter(response.data);
  }
  /**
   * 获取关注用户直播列表
   */
  async fetchFollowingUserLive() {
    const response = await this.crawler.fetchFollowingUserLive();
    return new FollowingUserLiveFilter(response.data);
  }
  /**
   * 获取作品评论（生成器）
   */
  async *fetchPostComment(awemeId, options = {}) {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let cursor = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchPostComment(awemeId, cursor, pageCounts);
      const filter = new PostCommentFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.cursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.commentId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取评论回复（生成器）
   */
  async *fetchPostCommentReply(itemId, commentId, options = {}) {
    const { maxCursor = 0, pageCounts = 3, maxCounts = 0 } = options;
    let cursor = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchPostCommentReply(itemId, commentId, cursor, pageCounts);
      const filter = new PostCommentReplyFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.cursor;
      if (newCursor === null || newCursor === cursor) break;
      cursor = newCursor;
      count += filter.commentId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 主页作品搜索（生成器）
   */
  async *fetchHomePostSearch(keyword, fromUser, options = {}) {
    const { maxCursor = 0, pageCounts = 10, maxCounts = 0 } = options;
    let offset = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchHomePostSearch(keyword, fromUser, offset, pageCounts);
      const filter = new HomePostSearchFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newCursor = filter.cursor;
      if (newCursor === null || newCursor === offset) break;
      offset = newCursor;
      count += filter.awemeId?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 搜索建议词
   */
  async fetchSuggestWords(query, count = 8) {
    const response = await this.crawler.fetchSuggestWords(query, count);
    return new SuggestWordFilter(response.data);
  }
  /**
   * 获取用户关注列表（生成器）
   */
  async *fetchUserFollowing(secUserId, userId = "", options = {}) {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let offset = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserFollowing(secUserId, userId, offset, pageCounts);
      const filter = new UserFollowingFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newOffset = filter.offset;
      if (newOffset === null || newOffset === offset) break;
      offset = newOffset;
      count += filter.secUid?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 获取用户粉丝列表（生成器）
   */
  async *fetchUserFollower(userId, secUserId, options = {}) {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options;
    let offset = maxCursor;
    let count = 0;
    while (true) {
      const response = await this.crawler.fetchUserFollower(userId, secUserId, offset, pageCounts);
      const filter = new UserFollowerFilter(response.data);
      yield filter;
      if (!filter.hasMore) break;
      const newOffset = filter.offset;
      if (newOffset === null || newOffset === offset) break;
      offset = newOffset;
      count += filter.secUid?.length || 0;
      if (maxCounts > 0 && count >= maxCounts) break;
    }
  }
  /**
   * 查询用户
   */
  async fetchQueryUser(secUserIds) {
    const response = await this.crawler.fetchQueryUser(secUserIds);
    return new QueryUserFilter(response.data);
  }
  /**
   * 获取作品统计
   */
  async fetchPostStats(itemId, awemeType = 0, playDelta = 1) {
    const response = await this.crawler.fetchPostStats(itemId, awemeType, playDelta);
    return new PostStatsFilter(response.data);
  }
  /**
   * 获取直播状态文本
   */
  getLiveStatusText(status) {
    return DY_LIVE_STATUS_MAPPING[status] || "\u672A\u77E5\u72B6\u6001";
  }
};
var OS_LIMITS = {
  win32: 200,
  darwin: 200,
  linux: 200
};
function formatFileName(namingTemplate, awemeData = {}, customFields = {}) {
  if (!namingTemplate) {
    throw new InvalidConfigError("naming", namingTemplate);
  }
  const fields = {
    create: awemeData.create || "",
    nickname: awemeData.nickname || "",
    aweme_id: awemeData.awemeId || "",
    desc: splitFilename(awemeData.desc || "", OS_LIMITS),
    caption: awemeData.caption || "",
    uid: awemeData.uid || "",
    ...customFields
  };
  return namingTemplate.replace(/\{(\w+)\}/g, (_, key) => {
    if (!(key in fields)) {
      throw new Error(`\u6587\u4EF6\u540D\u6A21\u677F\u5B57\u6BB5 ${key} \u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5`);
    }
    return fields[key];
  });
}
function json2Lrc(data) {
  const lrcLines = [];
  for (const item of data) {
    const text = item.text;
    const timeSeconds = parseFloat(String(item.timeId));
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60);
    const milliseconds = Math.floor(timeSeconds % 1 * 1e3);
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
    lrcLines.push(`[${timeStr}] ${text}`);
  }
  return lrcLines.join("\n");
}
function ensureDir(dirPath) {
  fs2__namespace.mkdirSync(dirPath, { recursive: true });
}

// src/downloader/douyin.ts
var DouyinDownloader = class {
  config;
  limit;
  tasks = [];
  constructor(config) {
    this.config = {
      cookie: config.cookie || "",
      downloadPath: "./downloads",
      maxConcurrency: 3,
      timeout: 3e4,
      retries: 3,
      naming: "{create}_{desc}",
      folderize: false,
      interval: "all",
      music: false,
      cover: false,
      desc: false,
      lyric: false,
      ...config
    };
    this.limit = pLimit__default.default(this.config.maxConcurrency);
  }
  /**
   * 创建下载任务
   */
  async createDownloadTasks(awemeDatas, userPath) {
    if (!awemeDatas || !userPath) return;
    const dataList = Array.isArray(awemeDatas) ? awemeDatas : [awemeDatas];
    const filteredList = this.filterByDateInterval(dataList);
    if (filteredList.length === 0) {
      console.log("\u6CA1\u6709\u627E\u5230\u7B26\u5408\u6761\u4EF6\u7684\u4F5C\u54C1");
      return;
    }
    for (const awemeData of filteredList) {
      await this.handleDownload(awemeData, userPath);
    }
    await this.executeTasks();
  }
  /**
   * 处理单个作品下载
   */
  async handleDownload(awemeData, userPath) {
    const basePath = this.config.folderize ? path__namespace.join(
      userPath,
      formatFileName(this.config.naming, {
        create: awemeData.createTime,
        nickname: awemeData.nickname,
        awemeId: awemeData.awemeId,
        desc: awemeData.desc
      })
    ) : userPath;
    const awemeId = awemeData.awemeId || "";
    const awemeType = awemeData.awemeType ?? 0;
    if (awemeData.isProhibited) {
      console.warn(`[${awemeId}] \u8BE5\u4F5C\u54C1\u5DF2\u88AB\u5C4F\u853D\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
      return;
    }
    const privateStatus = awemeData.privateStatus ?? 0;
    if (![0, 1, 2].includes(privateStatus)) {
      console.warn(`[${awemeId}] \u4F5C\u54C1\u72B6\u6001\u5F02\u5E38\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
      return;
    }
    if (this.config.music) {
      await this.downloadMusic(awemeData, basePath);
    }
    if (this.config.cover) {
      await this.downloadCover(awemeData, basePath);
    }
    if (this.config.desc) {
      await this.downloadDesc(awemeData, basePath);
    }
    if ([0, 4, 55, 61, 109, 201].includes(awemeType)) {
      await this.downloadVideo(awemeData, basePath);
    } else if (awemeType === 68) {
      await this.downloadImages(awemeData, basePath);
    }
  }
  /**
   * 下载音乐
   */
  async downloadMusic(awemeData, basePath) {
    if (awemeData.musicStatus !== 1) {
      console.warn(`[${awemeData.awemeId}] \u8BE5\u539F\u58F0\u5DF2\u88AB\u5C4F\u853D\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
      return;
    }
    const musicUrl = awemeData.musicPlayUrl;
    if (!musicUrl) return;
    const musicName = this.buildFileName(awemeData, "_music");
    this.addDownloadTask(musicUrl, basePath, musicName, ".mp3");
  }
  /**
   * 下载封面
   */
  async downloadCover(awemeData, basePath) {
    const coverName = this.buildFileName(awemeData, "_cover");
    if (awemeData.animatedCover) {
      this.addDownloadTask(awemeData.animatedCover, basePath, coverName, ".webp");
    } else if (awemeData.cover) {
      this.addDownloadTask(awemeData.cover, basePath, coverName, ".jpeg");
    } else {
      console.warn(`[${awemeData.awemeId}] \u8BE5\u4F5C\u54C1\u6CA1\u6709\u5C01\u9762`);
    }
  }
  /**
   * 下载文案
   */
  async downloadDesc(awemeData, basePath) {
    const descName = this.buildFileName(awemeData, "_desc");
    const descContent = awemeData.descRaw || awemeData.desc || "";
    this.addStaticDownloadTask(descContent, basePath, descName, ".txt");
  }
  /**
   * 下载视频
   */
  async downloadVideo(awemeData, basePath) {
    const videoName = this.buildFileName(awemeData, "_video");
    const videoUrl = Array.isArray(awemeData.videoPlayAddr) ? awemeData.videoPlayAddr[0] : awemeData.videoPlayAddr;
    if (!videoUrl) {
      console.warn(`[${awemeData.awemeId}] \u8BE5\u4F5C\u54C1\u6CA1\u6709\u89C6\u9891\u94FE\u63A5\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
      return;
    }
    this.addDownloadTask(videoUrl, basePath, videoName, ".mp4");
  }
  /**
   * 下载图集
   */
  async downloadImages(awemeData, basePath) {
    const awemeId = awemeData.awemeId || "";
    const imagesVideo = awemeData.imagesVideo || [];
    if (imagesVideo.length > 0) {
      for (let i = 0; i < imagesVideo.length; i++) {
        const videoUrl = imagesVideo[i];
        if (videoUrl) {
          const videoName = this.buildFileName(awemeData, `_live_${i + 1}`);
          this.addDownloadTask(videoUrl, basePath, videoName, ".mp4");
        } else {
          console.warn(`[${awemeId}] \u8BE5\u56FE\u96C6\u6CA1\u6709\u5B9E\u51B5\u94FE\u63A5\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
        }
      }
    }
    const images = awemeData.images || [];
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      if (imageUrl) {
        const imageName = this.buildFileName(awemeData, `_image_${i + 1}`);
        this.addDownloadTask(imageUrl, basePath, imageName, ".webp");
      } else {
        console.warn(`[${awemeId}] \u8BE5\u56FE\u96C6\u6CA1\u6709\u56FE\u7247\u94FE\u63A5\uFF0C\u65E0\u6CD5\u4E0B\u8F7D`);
      }
    }
  }
  /**
   * 创建音乐下载任务
   */
  async createMusicDownloadTasks(musicDatas, userPath) {
    if (!musicDatas || !userPath) return;
    const dataList = Array.isArray(musicDatas) ? musicDatas : [musicDatas];
    for (const musicData of dataList) {
      await this.handleMusicDownload(musicData, userPath);
    }
    await this.executeTasks();
  }
  /**
   * 处理音乐下载
   */
  async handleMusicDownload(musicData, userPath) {
    const title = musicData.title || "unknown";
    const basePath = this.config.folderize ? path__namespace.join(userPath, title) : userPath;
    const musicName = `${title}_music`;
    const musicUrl = musicData.playUrl;
    if (musicUrl) {
      this.addDownloadTask(musicUrl, basePath, musicName, ".mp3");
    }
    if (this.config.lyric && musicData.lyricUrl) {
      await this.downloadLyric(musicData.lyricUrl, basePath, `${title}_lyric`);
    }
  }
  /**
   * 下载歌词
   */
  async downloadLyric(lyricUrl, basePath, lyricName) {
    try {
      const response = await got__default.default(lyricUrl, {
        timeout: { request: this.config.timeout },
        retry: { limit: this.config.retries }
      }).json();
      const lrcContent = json2Lrc(response);
      this.addStaticDownloadTask(lrcContent, basePath, lyricName, ".lrc");
    } catch (error) {
      console.warn(`\u6B4C\u8BCD\u4E0B\u8F7D\u5931\u8D25: ${error instanceof Error ? error.message : error}`);
    }
  }
  /**
   * 创建直播流下载任务
   */
  async createStreamTasks(webcastDatas, userPath) {
    if (!webcastDatas || !userPath) return;
    const dataList = Array.isArray(webcastDatas) ? webcastDatas : [webcastDatas];
    for (const webcastData of dataList) {
      await this.handleStreamDownload(webcastData, userPath);
    }
    await this.executeTasks();
  }
  /**
   * 处理直播流下载
   */
  async handleStreamDownload(webcastData, userPath) {
    const customFields = {
      create: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      nickname: webcastData.nickname || "",
      awemeId: webcastData.roomId || "",
      desc: webcastData.liveTitle || "",
      uid: webcastData.userId || ""
    };
    const basePath = this.config.folderize ? path__namespace.join(userPath, formatFileName(this.config.naming, customFields)) : userPath;
    const streamName = formatFileName(this.config.naming, customFields) + "_live";
    const streamUrl = webcastData.m3u8PullUrl?.FULL_HD1 || webcastData.m3u8PullUrl?.HD1 || webcastData.m3u8PullUrl?.SD1 || webcastData.flvPullUrl?.FULL_HD1 || webcastData.flvPullUrl?.HD1;
    if (streamUrl) {
      this.addM3u8DownloadTask(streamUrl, basePath, streamName, ".flv");
    } else {
      console.warn(`[${webcastData.roomId}] \u6CA1\u6709\u53EF\u7528\u7684\u76F4\u64AD\u6D41\u5730\u5740`);
    }
  }
  /**
   * 添加下载任务
   */
  addDownloadTask(url, basePath, filename, extension) {
    const task = this.limit(async () => {
      return this.downloadFile(url, basePath, filename, extension);
    });
    this.tasks.push(task);
  }
  /**
   * 添加静态内容下载任务
   */
  addStaticDownloadTask(content, basePath, filename, extension) {
    const task = this.limit(async () => {
      return this.saveStaticFile(content, basePath, filename, extension);
    });
    this.tasks.push(task);
  }
  /**
   * 添加 m3u8 下载任务
   */
  addM3u8DownloadTask(url, basePath, filename, extension) {
    const task = this.limit(async () => {
      return this.downloadM3u8Stream(url, basePath, filename, extension);
    });
    this.tasks.push(task);
  }
  /**
   * 执行所有下载任务
   */
  async executeTasks() {
    const results = await Promise.all(this.tasks);
    this.tasks = [];
    return results;
  }
  /**
   * 下载文件
   */
  async downloadFile(url, basePath, filename, extension, onProgress) {
    const filePath = path__namespace.join(basePath, `${filename}${extension}`);
    try {
      ensureDir(basePath);
      if (fs2__namespace.existsSync(filePath)) {
        const stat = fs2__namespace.statSync(filePath);
        if (stat.size > 0) {
          console.log(`\u6587\u4EF6\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7: ${filePath}`);
          return { success: true, filePath };
        }
        fs2__namespace.unlinkSync(filePath);
      }
      const globalConfig = getConfig();
      const downloadStream = got__default.default.stream(url, {
        timeout: { request: this.config.timeout },
        retry: { limit: this.config.retries },
        headers: {
          "User-Agent": globalConfig.userAgent,
          Referer: globalConfig.referer,
          Cookie: this.config.cookie
        }
      });
      if (onProgress) {
        downloadStream.on("downloadProgress", (progress) => {
          onProgress({
            downloaded: progress.transferred,
            total: progress.total || 0,
            percentage: progress.percent * 100,
            speed: 0
          });
        });
      }
      const tmpPath = filePath + ".tmp";
      const writeStream = fs2__namespace.createWriteStream(tmpPath);
      await promises.pipeline(downloadStream, writeStream);
      const tmpStat = fs2__namespace.statSync(tmpPath);
      if (tmpStat.size === 0) {
        fs2__namespace.unlinkSync(tmpPath);
        return { success: false, error: "Downloaded file is empty" };
      }
      fs2__namespace.renameSync(tmpPath, filePath);
      console.log(`\u4E0B\u8F7D\u5B8C\u6210: ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      const tmpPath = filePath + ".tmp";
      try {
        if (fs2__namespace.existsSync(tmpPath)) fs2__namespace.unlinkSync(tmpPath);
      } catch {
      }
      try {
        if (fs2__namespace.existsSync(filePath) && fs2__namespace.statSync(filePath).size === 0) fs2__namespace.unlinkSync(filePath);
      } catch {
      }
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`\u4E0B\u8F7D\u5931\u8D25 [${filename}]: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
  /**
   * 保存静态文件
   */
  async saveStaticFile(content, basePath, filename, extension) {
    try {
      ensureDir(basePath);
      const filePath = path__namespace.join(basePath, `${filename}${extension}`);
      if (fs2__namespace.existsSync(filePath)) {
        console.log(`\u6587\u4EF6\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7: ${filePath}`);
        return { success: true, filePath };
      }
      fs2__namespace.writeFileSync(filePath, content, "utf-8");
      console.log(`\u4FDD\u5B58\u5B8C\u6210: ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`\u4FDD\u5B58\u5931\u8D25 [${filename}]: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
  /**
   * 下载 m3u8 直播流
   */
  async downloadM3u8Stream(url, basePath, filename, extension) {
    try {
      ensureDir(basePath);
      const filePath = path__namespace.join(basePath, `${filename}${extension}`);
      console.log(`\u5F00\u59CB\u5F55\u5236\u76F4\u64AD\u6D41: ${filePath}`);
      console.log(`\u76F4\u64AD\u6D41\u5730\u5740: ${url}`);
      console.warn("\u76F4\u64AD\u6D41\u5F55\u5236\u9700\u8981\u4F7F\u7528 ffmpeg\uFF0C\u8BF7\u4F7F\u7528\u4EE5\u4E0B\u547D\u4EE4:");
      console.log(`ffmpeg -i "${url}" -c copy "${filePath}"`);
      return { success: true, filePath };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`\u76F4\u64AD\u6D41\u4E0B\u8F7D\u5931\u8D25: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
  /**
   * 构建文件名
   */
  buildFileName(awemeData, suffix) {
    return formatFileName(this.config.naming, {
      create: awemeData.createTime,
      nickname: awemeData.nickname,
      awemeId: awemeData.awemeId,
      desc: awemeData.desc
    }) + suffix;
  }
  /**
   * 日期区间过滤
   */
  filterByDateInterval(dataList) {
    if (!this.config.interval || this.config.interval === "all") {
      return dataList;
    }
    const now = /* @__PURE__ */ new Date();
    let startDate;
    switch (this.config.interval) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        if (this.config.interval.includes("~")) {
          const [start, end] = this.config.interval.split("~");
          const startTime = new Date(start).getTime();
          const endTime = new Date(end).getTime();
          return dataList.filter((item) => {
            if (!item.createTime) return true;
            const createTime = new Date(item.createTime).getTime();
            return createTime >= startTime && createTime <= endTime;
          });
        }
        return dataList;
    }
    return dataList.filter((item) => {
      if (!item.createTime) return true;
      const createTime = new Date(item.createTime).getTime();
      return createTime >= startDate.getTime();
    });
  }
};

// src/cli/index.ts
var program = new commander.Command();
program.name("dy").description("\u6296\u97F3\u89C6\u9891/\u56FE\u96C6\u4E0B\u8F7D\u5668").version("0.1.0");
program.command("download <url>").alias("d").description("\u4E0B\u8F7D\u5355\u4E2A\u89C6\u9891\u6216\u56FE\u96C6\uFF08\u65E0\u9700 Cookie\uFF09").option("-o, --output <path>", "\u4E0B\u8F7D\u76EE\u5F55", "./downloads").option("-c, --cookie <cookie>", "Cookie\uFF08\u53EF\u9009\uFF0C\u4E0D\u63D0\u4F9B\u65F6\u4F7F\u7528\u514D\u767B\u5F55\u6A21\u5F0F\uFF09").option("--cover", "\u4E0B\u8F7D\u5C01\u9762").option("--music", "\u4E0B\u8F7D\u97F3\u4E50").option("--desc", "\u4E0B\u8F7D\u6587\u6848").action(async (url, options) => {
  try {
    setConfig({
      downloadPath: options.output,
      cookie: options.cookie || ""
    });
    consola__default.default.start("\u89E3\u6790\u94FE\u63A5...");
    const awemeId = await getAwemeId(url);
    consola__default.default.info(`\u4F5C\u54C1ID: ${awemeId}`);
    consola__default.default.start("\u83B7\u53D6\u4F5C\u54C1\u8BE6\u60C5...");
    let awemeData;
    let nickname = "\u672A\u77E5";
    if (options.cookie) {
      const handler = new DouyinHandler({ cookie: options.cookie });
      const postDetail = await handler.fetchOneVideo(awemeId);
      if (postDetail instanceof PostDetailFilter) {
        nickname = postDetail.nickname || "\u672A\u77E5";
        awemeData = postDetail.toAwemeData();
      } else {
        nickname = postDetail.author.nickname;
        awemeData = {
          awemeId: postDetail.awemeId,
          awemeType: postDetail.images ? 68 : 0,
          secUserId: postDetail.author.secUid,
          nickname: postDetail.author.nickname,
          uid: postDetail.author.uid,
          desc: postDetail.desc,
          createTime: new Date(postDetail.createTime * 1e3).toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-"),
          videoPlayAddr: postDetail.video?.playAddr,
          images: postDetail.images?.map((img) => img.urlList[0]),
          cover: postDetail.video?.cover?.[0],
          musicPlayUrl: postDetail.music?.playUrl
        };
      }
    } else {
      consola__default.default.info("\u4F7F\u7528\u514D\u767B\u5F55\u6A21\u5F0F\u83B7\u53D6\u89C6\u9891\u4FE1\u606F...");
      const shareDetail = await fetchFromSharePage(awemeId);
      if (!shareDetail) {
        throw new Error("\u65E0\u6CD5\u83B7\u53D6\u89C6\u9891\u4FE1\u606F");
      }
      nickname = shareDetail.author.nickname;
      awemeData = {
        awemeId: shareDetail.awemeId,
        awemeType: shareDetail.images ? 68 : 0,
        secUserId: shareDetail.author.secUid,
        nickname: shareDetail.author.nickname,
        uid: shareDetail.author.uid,
        desc: shareDetail.desc,
        createTime: new Date(shareDetail.createTime * 1e3).toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-"),
        videoPlayAddr: shareDetail.video?.playAddr,
        images: shareDetail.images?.map((img) => img.urlList[0]),
        cover: shareDetail.video?.cover?.[0],
        musicPlayUrl: shareDetail.music?.playUrl
      };
    }
    consola__default.default.info(`\u4F5C\u8005: ${nickname}`);
    consola__default.default.info(`\u63CF\u8FF0: ${(awemeData.desc || "").substring(0, 50)}...`);
    consola__default.default.start("\u5F00\u59CB\u4E0B\u8F7D...");
    const downloadPath = path__namespace.resolve(options.output);
    const downloader = new DouyinDownloader({
      cookie: options.cookie || "",
      downloadPath,
      naming: "{nickname}_{aweme_id}",
      folderize: false,
      cover: options.cover || false,
      music: options.music || false,
      desc: options.desc || false
    });
    await downloader.createDownloadTasks(awemeData, downloadPath);
    consola__default.default.success("\u4E0B\u8F7D\u5B8C\u6210!");
  } catch (error) {
    consola__default.default.error("\u4E0B\u8F7D\u51FA\u9519:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("user <url>").alias("u").description("\u4E0B\u8F7D\u7528\u6237\u4E3B\u9875\u4F5C\u54C1").option("-o, --output <path>", "\u4E0B\u8F7D\u76EE\u5F55", "./downloads").option("-n, --number <count>", "\u4E0B\u8F7D\u6570\u91CF (0 \u8868\u793A\u5168\u90E8)", "0").option("-c, --cookie <cookie>", "Cookie").option("--cover", "\u4E0B\u8F7D\u5C01\u9762").option("--music", "\u4E0B\u8F7D\u97F3\u4E50").option("--desc", "\u4E0B\u8F7D\u6587\u6848").action(async (url, options) => {
  try {
    if (!options.cookie) {
      consola__default.default.error("\u8BF7\u63D0\u4F9B cookie \u53C2\u6570: --cookie <cookie>");
      process.exit(1);
    }
    setConfig({
      downloadPath: options.output,
      cookie: options.cookie
    });
    const maxCount = parseInt(options.number) || 0;
    consola__default.default.start("\u89E3\u6790\u7528\u6237\u94FE\u63A5...");
    const secUserId = await getSecUserId(url);
    consola__default.default.info(`\u7528\u6237ID: ${secUserId}`);
    const handler = new DouyinHandler({ cookie: options.cookie });
    const downloadPath = path__namespace.resolve(options.output);
    const downloader = new DouyinDownloader({
      cookie: options.cookie,
      downloadPath,
      naming: "{nickname}_{aweme_id}",
      folderize: false,
      cover: options.cover || false,
      music: options.music || false,
      desc: options.desc || false
    });
    consola__default.default.start("\u5F00\u59CB\u4E0B\u8F7D\u7528\u6237\u4F5C\u54C1...");
    let count = 0;
    for await (const postFilter of handler.fetchUserPostVideos(secUserId, { maxCounts: maxCount })) {
      const awemeList = postFilter.toAwemeDataList();
      for (const awemeData of awemeList) {
        count++;
        consola__default.default.info(`[${count}] \u4E0B\u8F7D: ${awemeData.awemeId}`);
        await downloader.createDownloadTasks(awemeData, downloadPath);
        if (maxCount > 0 && count >= maxCount) break;
      }
      if (maxCount > 0 && count >= maxCount) break;
    }
    consola__default.default.success(`\u4E0B\u8F7D\u5B8C\u6210! \u5171 ${count} \u4E2A\u4F5C\u54C1`);
  } catch (error) {
    consola__default.default.error("\u4E0B\u8F7D\u51FA\u9519:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map