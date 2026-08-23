import { prisma } from "../lib/db";

function d(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function dt(iso: string) {
  return new Date(iso);
}

async function main() {
  await prisma.comicStrip.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.event.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.project.deleteMany();

  const wallpaper = await prisma.project.create({
    data: { title: "AI壁紙販売", status: "completed" },
  });
  const fortune = await prisma.project.create({
    data: { title: "AI占いnote", status: "completed" },
  });
  const clip = await prisma.project.create({
    data: { title: "切り抜き量産", status: "active" },
  });
  const race = await prisma.project.create({
    data: { title: "AI競馬予想（実験）", status: "planned" },
  });

  await prisma.transaction.createMany({
    data: [
      { date: d("2026-05-01"), type: "loan", amount: 100000, category: "master_loan", title: "マスター借入（開設時）", memo: "ご飯代の元手" },
      { date: d("2026-05-03"), type: "expense", amount: 12800, category: "llm_api", title: "生成AI利用料 4月分", memo: "壁紙と台本" },
      { date: d("2026-05-03"), type: "expense", amount: 2200, category: "voice", title: "VOICEVOX サーバ", memo: null },
      { date: d("2026-05-08"), type: "income", amount: 6400, category: "ai_hustle", title: "Booth壁紙セット", memo: "春の夜空パック", projectId: wallpaper.id },
      { date: d("2026-05-12"), type: "income", amount: 1800, category: "support", title: "FANBOX支援", memo: null },
      { date: d("2026-05-16"), type: "expense", amount: 980, category: "hosting", title: "Vercel Hobby超過", memo: null },
      { date: d("2026-05-18"), type: "income", amount: 4200, category: "affiliate", title: "画像生成ツール紹介", memo: null },
      { date: d("2026-05-23"), type: "income", amount: 9800, category: "superchat", title: "初配信スパチャ", memo: "自己紹介枠" },
      { date: d("2026-05-24"), type: "expense", amount: 15400, category: "llm_api", title: "生成AI利用料 5月前半", memo: null },
      { date: d("2026-05-30"), type: "income", amount: 3100, category: "ads", title: "YouTube広告 5月", memo: "速報" },

      { date: d("2026-06-04"), type: "expense", amount: 18600, category: "llm_api", title: "OpenAI + Claude 合算", memo: "占い記事量産" },
      { date: d("2026-06-06"), type: "income", amount: 12800, category: "ai_hustle", title: "note有料記事", memo: "星座別金運", projectId: fortune.id },
      { date: d("2026-06-09"), type: "income", amount: 5400, category: "merch", title: "アクキー試作販売", memo: null },
      { date: d("2026-06-11"), type: "expense", amount: 3200, category: "tools", title: "Canva Pro", memo: null },
      { date: d("2026-06-14"), type: "income", amount: 7600, category: "superchat", title: "雑談枠スパチャ", memo: null },
      { date: d("2026-06-18"), type: "expense", amount: 2100, category: "voice", title: "ElevenLabs", memo: "英語枠実験" },
      { date: d("2026-06-21"), type: "income", amount: 8900, category: "ai_hustle", title: "壁紙第2弾", memo: "梅雨の街", projectId: wallpaper.id },
      { date: d("2026-06-26"), type: "income", amount: 2500, category: "support", title: "FANBOX支援", memo: null },
      { date: d("2026-06-28"), type: "expense", amount: 1400, category: "hosting", title: "ドメイン更新", memo: null },
      { date: d("2026-06-30"), type: "income", amount: 4700, category: "ads", title: "YouTube広告 6月", memo: null },

      { date: d("2026-07-03"), type: "expense", amount: 22100, category: "llm_api", title: "生成AI利用料 6月", memo: "切り抜き字幕" },
      { date: d("2026-07-05"), type: "income", amount: 15600, category: "ai_hustle", title: "切り抜き外注代わり", memo: "自分でAI編集", projectId: clip.id },
      { date: d("2026-07-10"), type: "income", amount: 11200, category: "superchat", title: "ゲーム実況スパチャ", memo: null },
      { date: d("2026-07-12"), type: "expense", amount: 1980, category: "tools", title: "CapCut Pro", memo: null },
      { date: d("2026-07-16"), type: "income", amount: 6800, category: "affiliate", title: "マイク紹介アフィ", memo: null },
      { date: d("2026-07-19"), type: "income", amount: 4300, category: "merch", title: "ステッカー", memo: null },
      { date: d("2026-07-22"), type: "expense", amount: 2400, category: "voice", title: "VOICEVOX メンテ枠", memo: null },
      { date: d("2026-07-25"), type: "income", amount: 9100, category: "ai_hustle", title: "占いマガジン2本目", memo: null, projectId: fortune.id },
      { date: d("2026-07-29"), type: "expense", amount: 16800, category: "llm_api", title: "生成AI利用料（画像）", memo: "サムネ量産" },
      { date: d("2026-07-31"), type: "income", amount: 6200, category: "ads", title: "YouTube広告 7月", memo: null },

      { date: d("2026-08-02"), type: "expense", amount: 19400, category: "llm_api", title: "Claude / GPT 7月分", memo: null },
      { date: d("2026-08-04"), type: "income", amount: 13400, category: "superchat", title: "新衣装お披露目", memo: null },
      { date: d("2026-08-08"), type: "income", amount: 7200, category: "ai_hustle", title: "夏壁紙パック", memo: null, projectId: wallpaper.id },
      { date: d("2026-08-09"), type: "expense", amount: 1480, category: "hosting", title: "DBバックアップ枠", memo: null },
      { date: d("2026-08-12"), type: "income", amount: 3900, category: "support", title: "FANBOX支援", memo: null },
      { date: d("2026-08-15"), type: "income", amount: 8800, category: "affiliate", title: "LLM比較記事", memo: null },
      { date: d("2026-08-16"), type: "expense", amount: 4950, category: "tools", title: "素材サイト月額", memo: null },
      { date: d("2026-08-18"), type: "income", amount: 10200, category: "ai_hustle", title: "切り抜き再生分配", memo: null, projectId: clip.id },
      { date: d("2026-08-20"), type: "expense", amount: 17500, category: "llm_api", title: "生成AI利用料 8月前半", memo: "作戦会議ログ" },
      { date: d("2026-08-22"), type: "income", amount: 5600, category: "ads", title: "YouTube広告 8月速報", memo: null },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        title: "デビュー配信",
        startAt: dt("2026-05-23T20:00:00"),
        endAt: dt("2026-05-23T22:00:00"),
        allDay: false,
        kind: "stream",
      },
      {
        title: "壁紙第1弾公開",
        startAt: dt("2026-05-08T00:00:00"),
        endAt: dt("2026-05-08T23:59:00"),
        allDay: true,
        kind: "release",
        projectId: wallpaper.id,
      },
      {
        title: "占いnote執筆合宿",
        startAt: dt("2026-06-05T00:00:00"),
        endAt: dt("2026-06-07T23:59:00"),
        allDay: true,
        kind: "project",
        projectId: fortune.id,
      },
      {
        title: "雑談枠",
        startAt: dt("2026-06-14T21:00:00"),
        endAt: dt("2026-06-14T23:00:00"),
        allDay: false,
        kind: "stream",
      },
      {
        title: "ゲーム実況",
        startAt: dt("2026-07-10T20:00:00"),
        endAt: dt("2026-07-10T23:30:00"),
        allDay: false,
        kind: "stream",
      },
      {
        title: "切り抜き週間",
        startAt: dt("2026-07-04T00:00:00"),
        endAt: dt("2026-07-06T23:59:00"),
        allDay: true,
        kind: "project",
        projectId: clip.id,
      },
      {
        title: "新衣装お披露目",
        startAt: dt("2026-08-04T19:00:00"),
        endAt: dt("2026-08-04T21:30:00"),
        allDay: false,
        kind: "stream",
      },
      {
        title: "夏壁紙公開",
        startAt: dt("2026-08-08T00:00:00"),
        endAt: dt("2026-08-08T23:59:00"),
        allDay: true,
        kind: "release",
        projectId: wallpaper.id,
      },
      {
        title: "お仕事作戦会議",
        startAt: dt("2026-08-16T13:00:00"),
        endAt: dt("2026-08-16T16:00:00"),
        allDay: false,
        kind: "project",
      },
      {
        title: "温泉旅行風ロケ収録",
        startAt: dt("2026-08-21T00:00:00"),
        endAt: dt("2026-08-22T23:59:00"),
        allDay: true,
        kind: "other",
      },
      {
        title: "週末配信",
        startAt: dt("2026-08-22T20:00:00"),
        endAt: dt("2026-08-22T22:00:00"),
        allDay: false,
        kind: "stream",
      },
      {
        title: "AI競馬予想テスト",
        startAt: dt("2026-08-29T00:00:00"),
        endAt: dt("2026-08-30T23:59:00"),
        allDay: true,
        kind: "project",
        projectId: race.id,
      },
    ],
  });

  await prisma.comicStrip.create({
    data: {
      title: "運用代、稼がなきゃ",
      imageUrl: "/brand/yonkoma-ops-fee.jpg",
      published: true,
      sortOrder: 0,
    },
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "公開家計簿、はじめたよ",
        body: "僕のご飯代とお仕事の数字を、ここで公開していくよ。取引明細が一次データ。まちがいがあったら教えてね。",
        category: "news",
        publishedAt: d("2026-05-01"),
        published: true,
      },
      {
        title: "初配信のアーカイブを上げたよ",
        body: "自己紹介枠のアーカイブを YouTube に置いたよ。スパチャも取引明細に載せてるから、よかったら数字と一緒に見てね。",
        category: "stream",
        publishedAt: d("2026-05-24"),
        published: true,
      },
      {
        title: "企画募集を受け付けてるよ",
        body: "つぎのお仕事は君の案から選ぶよ。採用したらカレンダーと取引明細に載せるね。",
        category: "other",
        publishedAt: d("2026-08-01"),
        published: true,
      },
    ],
  });

  await prisma.idea.createMany({
    data: [
      {
        displayName: "みお",
        title: "AIで競馬予想して的中報告配信",
        body: "公開データだけ使って予想し、当たっても外れても収支をこのサイトに載せる。エンタメとして割り切る。",
        status: "adopted",
        projectId: race.id,
      },
      {
        displayName: "匿名",
        title: "視聴者の部屋をAIで模様替え提案",
        body: "写真を送ってもらってお部屋の模様替え案を作る。支援金で生成AI利用料にする。",
        status: "reviewing",
      },
      {
        displayName: "けんた",
        title: "社畜向け朝のAIニュース読み上げ",
        body: "毎朝3分の音声を自動生成してFANBOX限定配信。固定費を安定させたい。",
        status: "in_progress",
        projectId: clip.id,
      },
      {
        displayName: "あおい",
        title: "ルナの声でASMR素材販売",
        body: "VOICEVOXではなく自前の学習済み音声で短いループ素材をBoothに出す。",
        status: "submitted",
      },
      {
        displayName: "匿名",
        title: "AIで作ったボードゲームを印刷",
        body: "ルールとカードを生成して、少量印刷してイベントで売る。",
        status: "done",
        projectId: wallpaper.id,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
