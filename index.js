// index.js
import fetch from "node-fetch";

/** ===== 配置区 ===== **/
const profiles = [
  {
    cred: "TX12mFTHGXFnRNNDeKsbdHDxOTr5RGmj",
    skGameRole: "3_4957913437_2",
    platform: "3",
    vName: "1.0.0",
    accountName: "main",
  },
  {
    cred: "8bgmqfRhtXa6dYJbLeJf9iJyKxmsQdJg",
    skGameRole: "3_4237585212_2",
    platform: "3",
    vName: "1.0.0",
    accountName: "sub",
  },
];

const attendanceUrl =
  "https://zonai.skport.com/web/v1/game/endfield/attendance";

const discordWebhook = process.env.DISCORD_WEBHOOK;
/** ================= **/

async function autoClaim(profile) {
  const {
    cred,
    skGameRole,
    platform,
    vName,
    accountName,
  } = profile;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Accept: "*/*",
    "Content-Type": "application/json",
    Referer: "https://game.skport.com/",
    Origin: "https://game.skport.com",
    "sk-language": "jp",
    "sk-game-role": skGameRole,
    cred,
    platform,
    vName,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  try {
    const res = await fetch(attendanceUrl, {
      method: "POST",
      headers,
    });

    const json = await res.json();

    if (json.code === 0) {
      const awards = json.data.awardIds
        .map((a) => {
          const r = json.data.resourceInfoMap[a.id];
          return `${r.name} x${r.count}`;
        })
        .join(", ");

      return `✅ ${accountName}\n签到成功\n奖励：${awards}`;
    }

    if (json.code === 10001) {
      return `ℹ️ ${accountName}\n今天已经签到`;
    }

    return `❌ ${accountName}\n错误：${json.message}`;
  } catch (e) {
    return `🔥 ${accountName}\n请求失败：${e.message}`;
  }
}

async function main() {
  const results = [];

  for (const p of profiles) {
    results.push(await autoClaim(p));
  }

  const content = results.join("\n\n");

  if (discordWebhook) {
    await fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "アレッシュ",
        avatar_url: "https://github.com/TENN-96/endfield-auto-sign/blob/main/icon.png?raw=true",
        content,
      }),
    });
  }

  console.log(content);
}

main();
