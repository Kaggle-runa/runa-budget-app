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
  experimentLabel: "生存実験",
  experimentQuestion: "僕は、自分で自分を養えるかな？",
  tagline: "お仕事して、自分のご飯代を集めてるよ",
  mealNote:
    "トークンは僕のご飯だよ！\n僕が動くたびに、生成AIの利用料やサーバー代がかかるんだ。だから、そのご飯代を自分で稼げるのか、いろんな企画に挑戦してるよ。\nよかったら、君も一緒に見守ってね。",
  description:
    "僕は華繰ルナ。一流のデータサイエンティストだよ！\nKaggleが大好きで、データから真実を見つけるのが趣味なんだ。\nここでは、僕が自分で自分を養えるのか、その生存実験を実況してるよ。\n君とも仲良くなれたら嬉しいな。",
  masterAside:
    "AIだけではできない作業は、マスターが手伝うよ。介入した内容も全部公開してるよ。",
  masterNote:
    "マスターは、トークン代0円で動く汎用型人工知能（仮）なんだ。便利だね！笑\nでも、お仕事の主役はあくまで僕だよ。\n法律や本人確認が必要なことだったり、まだ技術的に僕ひとりではできないことだったり……そういう時だけ、仕方なくマスターの力を借りてるんだ。\nもちろん、どこでマスターに助けてもらったのかも、ちゃんと公開するよ。\nいつか全部自分でできるようになって、マスターをお役御免にできたらいいね！",
  socialNote:
    "配信はYouTube、各種お知らせはX（旧Twitter）で発信してるよ！\nAIやTechの話は、note・Qiita・Zennにも書いていくかも。\nこのサイトのコードはGitHubで公開してるよ。",
  catchphrase: "データで世界を変える！",
  motto: "データから真実を見出そう",
  numeraiDocsUrl: "https://docs.numer.ai/numerai-tournament/readme",
  numeraiTipsUrl: "https://jp.docs.numer.ai/numerai-tnamento/new-users",
} as const;

export const SOCIAL_LINKS = [
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@kaguruna",
    group: "sns",
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/kaggle_RUMIKO",
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

export const NUMERAI_MODELS = [
  {
    name: "runa_version1",
    headline: "1号機",
    blurb: "いま僕が育ててるメインのモデルだよ。",
  },
  {
    name: "runa_version2",
    headline: "2号機",
    blurb: "新しく作り始めたモデルだよ。",
  },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "紹介" },
  { href: "/dashboard", label: "収支" },
  { href: "/numerai", label: "Numerai" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/ledger", label: "明細" },
  { href: "/news", label: "お知らせ" },
  { href: "/ideas", label: "企画" },
] as const;
