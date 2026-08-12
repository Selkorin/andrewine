import type { CategoryFaqItem } from '../lib/categoryFaq';

// buy_champagne and buy_whisky keep this copy inside their Tilda export and are
// rebuilt from it. The remaining categories never had the block, so the copy
// lives here — drawn from what each page already states about itself: the
// accepted brands, the categories of bottles bought, and the valuation factors
// ("Учитываем год урожая, состояние бутылки, оригинальность и текущий рыночный
// спрос"). No price figures: the two legacy blocks carry them, these pages have
// never published any.
interface CategoryFaqContent {
  title: string;
  items: CategoryFaqItem[];
}

const contacts = 'Пришлите фото в Telegram @AWONLINE_BOT или позвоните +7(986)345-82-35.';

const process = (subject: string) =>
  `Отправьте фото ${subject}, проверим аутентичность, назовём справедливую цену, специалист приедет для финального осмотра.`;

const condition = (drink: string) =>
  `Уровень напитка, состояние пробки, этикетки и капсулы влияют на итоговую оценку ${drink}.`;

const demand = 'Проверяем оригинальность бутылки и сверяем оценку с текущим рыночным спросом.';

export const categoryFaqs: Record<string, CategoryFaqContent> = {
  'page136462246.html': {
    title: 'Выкуп элитного вина в Москве — Оценка коллекционного вина',
    items: [
      {
        question: 'Какое вино мы выкупаем?',
        blocks: [
          { label: 'Коллекционные позиции', text: 'Petrus, Château Lafite Rothschild, Château Margaux, Sassicaia, Masseto и другие востребованные марки премиум-класса.' },
          { label: 'Винтажные бутылки', text: 'Вина редких годов урожая, в том числе с подтверждённой историей хранения.' },
          { label: 'Инвестиционные позиции', text: 'Бутылки, на которые держится устойчивый спрос коллекционеров.' },
        ],
      },
      {
        question: 'Что влияет на цену вина',
        blocks: [
          { label: 'Год урожая', text: 'У одной и той же марки разные годы урожая стоят по-разному, поэтому релиз определяют точно.' },
          { label: 'Состояние бутылки', text: condition('вина') },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем вино', blocks: [{ text: process('вина') }] },
      { question: 'Оценить вино бесплатно', blocks: [{ text: contacts }] },
    ],
  },
  'page136046316.html': {
    title: 'Выкуп элитного коньяка в Москве — Оценка коллекционного коньяка',
    items: [
      {
        question: 'Какой коньяк мы выкупаем?',
        blocks: [
          { label: 'Выдержанные позиции', text: 'Hennessy, Louis XIII, Rémy Martin, Martell, Courvoisier и другие востребованные марки премиум-класса.' },
          { label: 'Коллекционные бутылки', text: 'Декантеры и номерные выпуски с оригинальным футляром и сертификатом.' },
          { label: 'Лимитированные серии', text: 'Ограниченные и снятые с производства линейки.' },
        ],
      },
      {
        question: 'Что влияет на цену коньяка',
        blocks: [
          { label: 'Выдержка и линейка', text: 'Определяем точную линейку и выпуск: у одного дома они заметно различаются по цене.' },
          { label: 'Состояние бутылки', text: 'Сколы и помутнение декантера, посадка пробки, уровень напитка и состояние футляра влияют на оценку.' },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем коньяк', blocks: [{ text: process('коньяка') }] },
      { question: 'Оценить коньяк бесплатно', blocks: [{ text: contacts }] },
    ],
  },
  'page136046936.html': {
    title: 'Выкуп портвейна в Москве — Оценка винтажного портвейна',
    items: [
      {
        question: 'Какой портвейн мы выкупаем?',
        blocks: [
          { label: 'Выдержанные позиции', text: 'Taylor’s, Fonseca, Graham’s, Dow’s, Sandeman и другие востребованные марки премиум-класса.' },
          { label: 'Винтажные бутылки', text: 'Портвейн объявленных винтажей и редких годов розлива.' },
          { label: 'Коллекционные серии', text: 'Ограниченные выпуски и позиции с подтверждённой историей хранения.' },
        ],
      },
      {
        question: 'Что влияет на цену портвейна',
        blocks: [
          { label: 'Год урожая', text: 'Объявленный винтаж и год розлива определяют позицию точнее, чем название дома.' },
          { label: 'Состояние бутылки', text: condition('портвейна') },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем портвейн', blocks: [{ text: process('портвейна') }] },
      { question: 'Оценить портвейн бесплатно', blocks: [{ text: contacts }] },
    ],
  },
  'page136047606.html': {
    title: 'Выкуп элитного рома в Москве — Оценка коллекционного рома',
    items: [
      {
        question: 'Какой ром мы выкупаем?',
        blocks: [
          { label: 'Выдержанные позиции', text: 'Zacapa, Diplomático, Havana Club, Plantation, El Dorado и другие востребованные марки премиум-класса.' },
          { label: 'Коллекционные бутылки', text: 'Ром редких лет розлива и позиции снятых линеек.' },
          { label: 'Лимитированные серии', text: 'Ограниченные выпуски и подарочные наборы в оригинальной упаковке.' },
        ],
      },
      {
        question: 'Что влияет на цену рома',
        blocks: [
          { label: 'Выдержка и релиз', text: 'Возраст на этикетке и конкретный релиз определяют позицию точнее, чем бренд.' },
          { label: 'Состояние бутылки', text: condition('рома') },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем ром', blocks: [{ text: process('рома') }] },
      { question: 'Оценить ром бесплатно', blocks: [{ text: contacts }] },
    ],
  },
  'page136048186.html': {
    title: 'Выкуп элитной водки в Москве — Оценка коллекционной водки',
    items: [
      {
        question: 'Какую водку мы выкупаем?',
        blocks: [
          { label: 'Коллекционные позиции', text: 'Beluga Gold Line, Belvedere, Grey Goose, Crystal Head, Absolut Elyx и другие востребованные марки премиум-класса.' },
          { label: 'Лимитированные серии', text: 'Ограниченные выпуски и авторские оформления.' },
          { label: 'Подарочные выпуски', text: 'Наборы в оригинальной упаковке с полной комплектностью.' },
        ],
      },
      {
        question: 'Что влияет на цену водки',
        blocks: [
          { label: 'Серия и выпуск', text: 'Определяем серию и год выпуска: оформление у одной марки менялось со временем.' },
          { label: 'Состояние бутылки', text: condition('водки') },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем водку', blocks: [{ text: process('водки') }] },
      { question: 'Оценить водку бесплатно', blocks: [{ text: contacts }] },
    ],
  },
  'page136049296.html': {
    title: 'Выкуп элитного бренди в Москве — Оценка коллекционного бренди',
    items: [
      {
        question: 'Какой бренди мы выкупаем?',
        blocks: [
          { label: 'Выдержанные позиции', text: 'Torres Jaime I, Cardenal Mendoza, Lepanto, Gran Duque d’Alba, Carlos I и другие востребованные марки премиум-класса.' },
          { label: 'Коллекционные бутылки', text: 'Позиции снятых линеек и бутылки с оригинальным футляром.' },
          { label: 'Лимитированные серии', text: 'Ограниченные выпуски и номерные экземпляры.' },
        ],
      },
      {
        question: 'Что влияет на цену бренди',
        blocks: [
          { label: 'Выдержка и линейка', text: 'Точная линейка и выпуск важнее известности бренда: у одного производителя они различаются по цене.' },
          { label: 'Состояние бутылки', text: condition('бренди') },
          { label: 'Оригинальность и спрос', text: demand },
        ],
      },
      { question: 'Как выкупаем бренди', blocks: [{ text: process('бренди') }] },
      { question: 'Оценить бренди бесплатно', blocks: [{ text: contacts }] },
    ],
  },
};
