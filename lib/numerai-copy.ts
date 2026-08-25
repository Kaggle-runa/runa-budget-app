import { formatYen } from "@/lib/format";
import { isModelTraining, stakedNmr, yenDelta24h } from "@/lib/numerai";
import type { NmrQuote, NumeraiModelSnapshot } from "@/types/domain";

export function runaModelComment(
  models: NumeraiModelSnapshot[],
  quote: NmrQuote,
  ok: boolean
): string {
  if (!ok) return "いま成績を取れなかったから、あとでまた見てね。";

  const staked = stakedNmr(models);
  const usdNow =
    staked !== null && quote.usdPrice !== null ? staked * quote.usdPrice : null;
  const yenDelta =
    usdNow !== null && quote.change24h !== null && quote.usdJpy !== null
      ? yenDelta24h(usdNow, quote.change24h, quote.usdJpy)
      : null;

  if (yenDelta !== null && yenDelta <= -400) {
    return `Stakeの円換算が昨日より${formatYen(Math.abs(yenDelta))}減ってるね……NMRさん？`;
  }
  if (yenDelta !== null && yenDelta >= 400) {
    return `Stakeの円換算が昨日より${formatYen(yenDelta)}増えてるよ。NMRさん、ありがとう。`;
  }

  const main = models.find((model) => !isModelTraining(model)) ?? models[0];
  if (main?.corr !== null && main.corr < 0.01) {
    return "CORRはまだ低いね……。もうちょっと特徴量を見直した方がよさそうだよ。";
  }
  if (main?.return1d !== null && main.return1d < 0) {
    return "直近の成績が少し下がってるね。次の提出に向けて、中身を見直すよ。";
  }
  if (main?.return1d !== null && main.return1d > 0) {
    return "直近の成績はプラスだよ。この調子で育てていくね。";
  }

  const training = models.find(isModelTraining);
  if (training) {
    return `${training.headline}はまだ評価待ちだよ。数字が出るのが楽しみだね。`;
  }

  return "今日もモデルを見守ってるよ。君も一緒に見ていってね。";
}
