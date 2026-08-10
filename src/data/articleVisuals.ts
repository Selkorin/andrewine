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
    note: 'Состояние оценивают последовательно — от уровня напитка до маркировок на стекле. Так отдельный дефект не теряется среди общих впечатлений.',
    itemPrefix: 'Зона',
    items: [
      [conditionFill, 'Уровень напитка', 'Положение жидкости показывает степень естественного испарения и помогает оценить условия хранения.'],
      [conditionCapsule, 'Капсула и пробка', 'Здесь раньше всего заметны подтёки, коррозия, усыхание пробки и следы вмешательства.'],
      [conditionLabel, 'Состояние этикетки', 'Потёртости допустимы, но утраты бумаги, пятна и реставрация напрямую влияют на ценность.'],
      [conditionBase, 'Стекло и дно', 'Форма бутылки, заводские клейма и повреждения стекла помогают подтвердить выпуск и сохранность.'],
    ],
  },
  photos: {
    eyebrow: 'Документальная съёмка',
    title: 'Минимальный набор кадров',
    note: 'Четыре базовых ракурса дают оценщику больше информации, чем серия случайных снимков. Фотографируйте без фильтров и бликов.',
    itemPrefix: 'Кадр',
    items: [
      [photosFront, 'Фронтальный вид', 'Поставьте бутылку вертикально и снимите этикетку строго спереди, чтобы читались все строки.'],
      [photosBack, 'Оборотная сторона', 'Покажите контрэтикетку, импортные наклейки, крепость, объём и служебную информацию.'],
      [photosNeck, 'Горло и укупорка', 'Снимите капсулу и пробку сверху и сбоку, не разворачивая и не очищая их.'],
      [photosBottom, 'Дно и маркировки', 'Крупный план донышка фиксирует рельеф, клейма, номера формы и возможные повреждения.'],
    ],
  },
  value: {
    eyebrow: 'Факторы стоимости',
    title: 'Что формирует коллекционную ценность',
    note: 'Стоимость нельзя определить по одному признаку. Итоговый диапазон появляется после сопоставления выпуска, состояния и реального спроса.',
    itemPrefix: 'Фактор',
    items: [
      [valueProvenance, 'Происхождение', 'Чеки, история покупки и сведения о хранении повышают доверие к дорогому экземпляру.'],
      [valueVintage, 'Винтаж и выпуск', 'Год, серия, рынок розлива и тираж определяют, насколько редкой является конкретная версия.'],
      [valueCase, 'Комплект и упаковка', 'Оригинальная коробка, сертификат и вкладыши оцениваются вместе с бутылкой, но отдельно по состоянию.'],
      [valueAuction, 'Рыночный спрос', 'Ориентир дают не объявления, а подтверждённые продажи сопоставимых экземпляров за недавний период.'],
    ],
  },
  process: {
    eyebrow: 'Как проходит оценка',
    title: 'От фотографии до предложения',
    note: 'Предварительная оценка проходит по понятной схеме. Каждый следующий этап начинается только после проверки предыдущего.',
    itemPrefix: 'Шаг',
    items: [
      [processPhotograph, 'Подготовьте фотографии', 'Отправьте общий вид, этикетки, укупорку, уровень, дно и упаковку без ретуши.'],
      [processInspect, 'Дождитесь проверки', 'Специалист идентифицирует выпуск, отмечает риски и при необходимости просит дополнительные кадры.'],
      [processOffer, 'Получите диапазон цены', 'После проверки фотографий и истории хранения формируется предварительное предложение.'],
      [processHandover, 'Согласуйте осмотр', 'Окончательная сумма подтверждается после проверки подлинности и фактического состояния.'],
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
  'vintage-port-appraisal': 'condition',
  'collectible-rum': 'value',
  'soviet-vodka': 'value',
  'brandy-identification': 'condition',
};

export function getArticleVisuals(slug: string, articleIndex: number) {
  const infographic = packs[packBySlug[slug] ?? 'process'];
  return {
    heroBackground: articleBackgrounds[articleIndex % articleBackgrounds.length],
    relatedBackground: articleBackgrounds[(articleIndex + 2) % articleBackgrounds.length],
    checklistBackground: articleBackgrounds[(articleIndex + 1) % articleBackgrounds.length],
    infographic,
    process: packs.process,
  };
}
