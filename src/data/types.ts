export interface ArticleSection {
  title: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePage: string;
  imageCredit: string;
  /** SEO-имя файла для локального зеркала картинки (scripts/fetch-images.mjs). */
  imageSeoName: string;
  intro: string;
  sections: ArticleSection[];
  checklist: string[];
  note: string;
  /** Уникальные вопрос-ответ для блока FAQ статьи (и FAQPage-разметки). */
  faq: [string, string][];
}

export interface Category {
  slug: string;
  /** Название напитка в именительном падеже: «Ром». */
  name: string;
  /** Название рубрики для карточек и хлебных крошек: «Статьи о роме». */
  label: string;
  /** Родственная страница выкупа: buy_rum. */
  buyRoute: string;
  /** Текст ссылки на страницу выкупа. */
  buyLabel: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
}
