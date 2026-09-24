import { CAR_LOGOS } from '../data/carLogos';
import { FLAG_LOGOS, type CountryFlag } from '../data/flagLogos';
import type { GameMode, DifficultySetting, QuestionItem } from '../types/quiz';

export function generateQuizQuestion(
  gameMode: GameMode,
  difficultySetting: DifficultySetting,
  step = 0,
  currentCorrect = 0,
  startTime = Date.now(),
  usedIds: Set<number> = new Set()
): QuestionItem {
  const fullDataset = gameMode === 'cars' ? CAR_LOGOS : FLAG_LOGOS;
  const total = fullDataset.length;

  let pool = fullDataset;
  if (difficultySetting === 'hard') {
    const mode = step % 6;
    if (mode === 0) {
      pool = fullDataset.slice(0, Math.min(50, total));
    } else if (mode === 1 || mode === 2 || mode === 4 || mode === 5) {
      pool = fullDataset.slice(Math.min(100, total - 1));
    } else {
      pool = fullDataset.slice(Math.min(50, total), Math.min(100, total));
    }
  } else if (difficultySetting === 'medium') {
    const mode = step % 4;
    const q1 = Math.floor(total * 0.25);
    const q2 = Math.floor(total * 0.5);
    const q3 = Math.floor(total * 0.75);

    if (mode === 0) pool = fullDataset.slice(q1, q2);
    else if (mode === 1) pool = fullDataset.slice(q2, q3);
    else if (mode === 2) pool = fullDataset.slice(0, q1);
    else pool = fullDataset.slice(q3);
  } else if (difficultySetting === 'easy') {
    const elapsedSec = (Date.now() - startTime) / 1000;
    if (currentCorrect >= 8 && elapsedSec <= 10) {
      pool = fullDataset.slice(Math.min(65, total), Math.min(100, total));
    } else {
      pool = fullDataset.slice(0, Math.min(65, total));
    }
  }

  if (!pool || pool.length === 0) {
    pool = fullDataset;
  }

  let unusedPool = pool.filter((logo) => !usedIds.has(logo.id));
  if (unusedPool.length < 1) {
    unusedPool = [...fullDataset];
  }

  const targetLogo = unusedPool[Math.floor(Math.random() * unusedPool.length)] || fullDataset[0];
  usedIds.add(targetLogo.id);

  if (gameMode === 'capitals') {
    const countryItem = targetLogo as CountryFlag;
    const targetAnswer = countryItem.capital;

    const distractors: string[] = [];
    const optionPool = FLAG_LOGOS.filter((c) => c.capital !== targetAnswer);

    while (distractors.length < 3 && optionPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * optionPool.length);
      const selected = optionPool.splice(randomIndex, 1)[0];
      if (!distractors.includes(selected.capital)) {
        distractors.push(selected.capital);
      }
    }

    const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      logo: countryItem,
      targetAnswer,
      countryName: countryItem.brand,
      options,
    };
  } else {
    const targetAnswer = targetLogo.brand;
    const distractors: string[] = [];
    const optionPool = fullDataset.filter((l) => l.brand !== targetAnswer);

    while (distractors.length < 3 && optionPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * optionPool.length);
      const selected = optionPool.splice(randomIndex, 1)[0];
      if (!distractors.includes(selected.brand)) {
        distractors.push(selected.brand);
      }
    }

    const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      logo: targetLogo,
      targetAnswer,
      options,
    };
  }
}
