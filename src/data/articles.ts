import type { Article } from './types';
import { categories } from './categories';
import { generalArticles } from './articles/general';
import { wineArticles } from './articles/wine';
import { champagneArticles } from './articles/champagne';
import { whiskyArticles } from './articles/whisky';
import { cognacArticles } from './articles/cognac';
import { portwineArticles } from './articles/portwine';
import { rumArticles } from './articles/rum';
import { vodkaArticles } from './articles/vodka';
import { brandyArticles } from './articles/brandy';

const byCategory: Record<string, Article[]> = {
  wine: wineArticles,
  champagne: champagneArticles,
  whisky: whiskyArticles,
  cognac: cognacArticles,
  portwine: portwineArticles,
  rum: rumArticles,
  vodka: vodkaArticles,
  brandy: brandyArticles,
};

export const articles: Article[] = [
  ...generalArticles,
  ...categories.flatMap((category) => byCategory[category.slug] ?? []),
];

export const articlesByCategory = byCategory;

export function categoryArticles(slug: string): Article[] {
  return byCategory[slug] ?? [];
}

/** Подборка для блока «Популярные статьи» на главной: гид по съёмке + по одной сильной статье из основных категорий. */
export const featuredArticles: Article[] = [
  ...generalArticles,
  ...['whisky', 'cognac', 'wine', 'champagne', 'rum'].map((slug) => byCategory[slug]?.[0]).filter(Boolean) as Article[],
].slice(0, 6);

export const faqs = [
  ['Какие бутылки можно предложить на оценку?', 'Коллекционные и премиальные вина, виски, коньяк, шампанское, ром, бренди, портвейн и водку. Интерес зависит от производителя, выпуска, состояния и текущего спроса.'],
  ['Оценка по фотографии бесплатная?', 'Да. Для предварительной оценки нужны общий вид бутылки, этикетки, капсула, уровень напитка, дно и упаковка, если она сохранилась.'],
  ['Что сильнее всего влияет на стоимость?', 'Точный релиз, винтаж или возраст, уровень напитка, состояние пробки и этикетки, комплектность и подтверждённая история хранения.'],
  ['Можно предложить одну бутылку?', 'Да, рассматриваются отдельные бутылки и коллекции. Для коллекции сначала пришлите общий кадр, затем одинаковый набор фотографий каждого экземпляра.'],
  ['Какие маркировки нужно показать?', 'Сфотографируйте все этикетки, заводские коды, акцизные и иные марки без ретуши. Возможность сделки определяется после проверки экземпляра и документов с учётом применимых требований.'],
  ['Как проходит предварительная оценка?', 'Специалист изучает фотографии и сведения о хранении, задаёт уточняющие вопросы и называет предварительный диапазон. Итог возможен только после очного осмотра.'],
];
