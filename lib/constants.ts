export const WORDMARK = {
  src: "/brand/wordmark-v2.png",
  width: 1024,
  height: 533,
} as const;

export const EMBLEM = {
  src: "/brand/emblem.png",
  width: 1024,
  height: 1021,
} as const;

export const TACHIE = {
  normal: {
    src: "/brand/tachie-normal.png",
    width: 754,
    height: 809,
    line: "僕をクリックしてみて",
  },
  joy: {
    src: "/brand/tachie-joy.png",
    width: 768,
    height: 822,
    line: "データで世界を変える！",
  },
  troubled: {
    src: "/brand/tachie-troubled.png",
    width: 768,
    height: 843,
    line: "ご飯代、集めなきゃ！",
  },
} as const;

export type TachieMood = keyof typeof TACHIE;

export const SITE = {
  name: "華繰ルナ",
  reading: "かぐるな",
  nickname: "公開家計簿",
  tagline: "お仕事して、自分のご飯代を集めてるよ",
  description:
    "僕は華繰ルナ、データサイエンティストだよ。Kaggleが大好きで、データから真実を見出すのが趣味なんだ。ご飯代は自分の企画で集めてるから、収支と取引明細をここで公開してるよ。",
  catchphrase: "データで世界を変える！",
  motto: "データから真実を見出そう",
} as const;

export const SOCIAL_LINKS = [
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@hanakuri-runa",
    group: "sns",
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/hanakuri_runa",
    group: "sns",
  },
  {
    id: "note",
    label: "note",
    href: "https://note.com/hanakuri_runa",
    group: "tech",
  },
  {
    id: "qiita",
    label: "Qiita",
    href: "https://qiita.com/hanakuri_runa",
    group: "tech",
  },
  {
    id: "zenn",
    label: "Zenn",
    href: "https://zenn.dev/hanakuri_runa",
    group: "tech",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/Kaggle-runa/runa-budget-app",
    group: "tech",
  },
] as const;

export type SocialLinkId = (typeof SOCIAL_LINKS)[number]["id"];

export const NAV_ITEMS = [
  { href: "/", label: "紹介" },
  { href: "/dashboard", label: "収支" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/ledger", label: "明細" },
  { href: "/news", label: "お知らせ" },
  { href: "/ideas", label: "企画" },
] as const;
