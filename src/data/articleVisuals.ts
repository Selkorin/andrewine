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
import andrewMagnifier from '../assets/editorial/andrew/andrew-magnifier.png';
import andrewBook from '../assets/editorial/andrew/andrew-book.png';
import andrewWine from '../assets/editorial/andrew/andrew-wine.png';
import andrewCamera from '../assets/editorial/andrew/andrew-camera.png';

export const articleBackgrounds = [cellarRacks, appraisalDesk, champagneCave, auctionArchive];

const packs = {
  condition: {
    eyebrow: 'Состояние экземпляра',
    title: 'Четыре зоны внимательного осмотра',
    note: 'Эндрю начинает с сохранности: одна незаметная деталь может изменить итоговую оценку.',
    character: andrewMagnifier,
    characterAlt: 'Эндрю изучает бутылку через лупу',
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
    note: 'Каждый ракурс отвечает на отдельный вопрос оценщика — случайных кадров в досье нет.',
    character: andrewCamera,
    characterAlt: 'Эндрю фотографирует коллекционную бутылку',
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
    note: 'Цена появляется только после сопоставления выпуска, происхождения, комплекта и спроса.',
    character: andrewBook,
    characterAlt: 'Эндрю изучает сведения в архивной книге',
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
    note: 'Четыре последовательных шага сохраняют контекст экземпляра и делают оценку понятной.',
    character: andrewCamera,
    characterAlt: 'Эндрю документирует бутылку камерой',
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

const characterBySlug = {
  'hennessy-louis-xiii': [andrewMagnifier, 'Эндрю изучает бутылку через лупу'],
  'rare-wine': [andrewWine, 'Эндрю оценивает цвет вина в бокале'],
  'champagne-cristal-dom-perignon': [andrewWine, 'Эндрю оценивает напиток в бокале'],
} as const;

export function getArticleVisuals(slug: string, articleIndex: number) {
  const infographic = packs[packBySlug[slug] ?? 'process'];
  const character = characterBySlug[slug as keyof typeof characterBySlug];
  return {
    heroBackground: articleBackgrounds[articleIndex % articleBackgrounds.length],
    relatedBackground: articleBackgrounds[(articleIndex + 2) % articleBackgrounds.length],
    checklistBackground: articleBackgrounds[(articleIndex + 1) % articleBackgrounds.length],
    infographic: character ? { ...infographic, character: character[0], characterAlt: character[1] } : infographic,
    process: packs.process,
  };
}
