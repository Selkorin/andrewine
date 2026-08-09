import cellarRacks from '../assets/article-backgrounds/cellar-racks.jpg';
import appraisalDesk from '../assets/article-backgrounds/appraisal-desk.jpg';
import champagneCave from '../assets/article-backgrounds/champagne-cave.jpg';
import auctionArchive from '../assets/article-backgrounds/auction-archive.jpg';

import conditionFill from '../assets/infographics/items/condition-fill-level.png';
import conditionCapsule from '../assets/infographics/items/condition-capsule.png';
import conditionLabel from '../assets/infographics/items/condition-label.png';
import conditionBase from '../assets/infographics/items/condition-base.png';
import photosFront from '../assets/infographics/items/photos-front.png';
import photosBack from '../assets/infographics/items/photos-back.png';
import photosNeck from '../assets/infographics/items/photos-neck.png';
import photosBottom from '../assets/infographics/items/photos-bottom.png';
import valueProvenance from '../assets/infographics/items/value-provenance.png';
import valueVintage from '../assets/infographics/items/value-vintage.png';
import valueCase from '../assets/infographics/items/value-case.png';
import valueAuction from '../assets/infographics/items/value-auction.png';
import processPhotograph from '../assets/infographics/items/process-photograph.png';
import processInspect from '../assets/infographics/items/process-inspect.png';
import processOffer from '../assets/infographics/items/process-offer.png';
import processHandover from '../assets/infographics/items/process-handover.png';

export const articleBackgrounds = [cellarRacks, appraisalDesk, champagneCave, auctionArchive];

const packs = {
  condition: {
    eyebrow: 'Состояние экземпляра',
    title: 'Четыре зоны внимательного осмотра',
    items: [
      [conditionFill, 'Уровень напитка'],
      [conditionCapsule, 'Капсула и пробка'],
      [conditionLabel, 'Состояние этикетки'],
      [conditionBase, 'Стекло и дно'],
    ],
  },
  photos: {
    eyebrow: 'Документальная съёмка',
    title: 'Минимальный набор кадров',
    items: [
      [photosFront, 'Фронтальный вид'],
      [photosBack, 'Оборотная сторона'],
      [photosNeck, 'Горло и укупорка'],
      [photosBottom, 'Дно и маркировки'],
    ],
  },
  value: {
    eyebrow: 'Факторы стоимости',
    title: 'Что формирует коллекционную ценность',
    items: [
      [valueProvenance, 'Происхождение'],
      [valueVintage, 'Винтаж и выпуск'],
      [valueCase, 'Комплект и упаковка'],
      [valueAuction, 'Рыночный спрос'],
    ],
  },
  process: {
    eyebrow: 'Как проходит оценка',
    title: 'От фотографии до предложения',
    items: [
      [processPhotograph, 'Фотографии'],
      [processInspect, 'Проверка специалистом'],
      [processOffer, 'Предложение цены'],
      [processHandover, 'Безопасная передача'],
    ],
  },
} as const;

const packBySlug: Record<string, keyof typeof packs> = {
  'macallan-value': 'value',
  'hennessy-louis-xiii': 'condition',
  'soviet-cognac': 'value',
  'rare-wine': 'condition',
  'champagne-cristal-dom-perignon': 'condition',
  'photo-appraisal': 'photos',
};

export function getArticleVisuals(slug: string, articleIndex: number) {
  return {
    heroBackground: articleBackgrounds[articleIndex % articleBackgrounds.length],
    relatedBackground: articleBackgrounds[(articleIndex + 2) % articleBackgrounds.length],
    checklistBackground: articleBackgrounds[(articleIndex + 1) % articleBackgrounds.length],
    infographic: packs[packBySlug[slug] ?? 'process'],
    process: packs.process,
  };
}
