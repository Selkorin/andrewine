export const siteUrl = 'https://andrewine.ru';

export interface LandingSeo {
  route: string;
  title: string;
  description: string;
  heading: string;
  service: string;
  imageAlt: string;
}

export const landingSeoByFile: Record<string, LandingSeo> = {
  'page132437346.html': {
    route: '/',
    title: 'Продать элитный алкоголь в Москве — выкуп и оценка | Andrewine',
    description: 'Выкуп элитного и коллекционного алкоголя в Москве. Бесплатно оценим вино, виски, коньяк или шампанское по фото и организуем выезд специалиста.',
    heading: 'Выкуп элитного алкоголя в Москве',
    service: 'Выкуп элитного и коллекционного алкоголя',
    imageAlt: 'Коллекционные бутылки элитного алкоголя',
  },
  'page136045756.html': {
    route: '/buy_champagne',
    title: 'Выкуп шампанского в Москве — продать дорого | Andrewine',
    description: 'Выкуп коллекционного шампанского в Москве: Dom Pérignon, Krug, Louis Roederer, Moët & Chandon. Бесплатная оценка по фото и выезд специалиста.',
    heading: 'Выкуп шампанского в Москве',
    service: 'Выкуп коллекционного шампанского',
    imageAlt: 'Коллекционная бутылка шампанского',
  },
  'page136045966.html': {
    route: '/buy_whisky',
    title: 'Выкуп виски в Москве — продать редкий виски | Andrewine',
    description: 'Выкуп элитного и редкого виски в Москве: Macallan, Glenfiddich, Dalmore, Balvenie. Оценка по фото, бесплатный выезд и быстрая оплата.',
    heading: 'Выкуп виски в Москве',
    service: 'Выкуп элитного и редкого виски',
    imageAlt: 'Бутылка коллекционного виски',
  },
  'page136046316.html': {
    route: '/buy_cognac',
    title: 'Выкуп коньяка в Москве — оценка редкого коньяка | Andrewine',
    description: 'Выкуп элитного и коллекционного коньяка в Москве: Hennessy, Martell, Rémy Martin, Camus. Бесплатная оценка по фото и выезд специалиста.',
    heading: 'Выкуп коньяка в Москве',
    service: 'Выкуп элитного и коллекционного коньяка',
    imageAlt: 'Бутылка коллекционного коньяка',
  },
  'page136046936.html': {
    route: '/buy_portwine',
    title: 'Выкуп портвейна в Москве — оценка редких бутылок | Andrewine',
    description: 'Выкуп редкого и винтажного портвейна в Москве. Оценим Taylor’s, Graham’s, Dow’s и другие марки по фото, организуем бесплатный выезд.',
    heading: 'Выкуп портвейна в Москве',
    service: 'Выкуп редкого и винтажного портвейна',
    imageAlt: 'Бутылка редкого винтажного портвейна',
  },
  'page136047606.html': {
    route: '/buy_rum',
    title: 'Выкуп рома в Москве — продать коллекционный ром | Andrewine',
    description: 'Выкуп премиального и коллекционного рома в Москве: Appleton Estate, Plantation, Ron Zacapa, Diplomatico. Оценка по фото и бесплатный выезд.',
    heading: 'Выкуп рома в Москве',
    service: 'Выкуп премиального и коллекционного рома',
    imageAlt: 'Бутылка коллекционного рома',
  },
  'page136048186.html': {
    route: '/buy_vodka',
    title: 'Выкуп элитной водки в Москве — оценка и продажа | Andrewine',
    description: 'Выкуп элитной и коллекционной водки в Москве. Бесплатно оценим редкую бутылку по фото, согласуем цену и организуем выезд специалиста.',
    heading: 'Выкуп элитной водки в Москве',
    service: 'Выкуп элитной и коллекционной водки',
    imageAlt: 'Бутылка элитной коллекционной водки',
  },
  'page136049296.html': {
    route: '/buy_brandy',
    title: 'Выкуп бренди в Москве — продать редкий бренди | Andrewine',
    description: 'Выкуп премиального и коллекционного бренди в Москве: Torres, Metaxa, Ararat и другие марки. Оценка по фото и бесплатный выезд.',
    heading: 'Выкуп бренди в Москве',
    service: 'Выкуп премиального и коллекционного бренди',
    imageAlt: 'Бутылка коллекционного бренди',
  },
  'page136462246.html': {
    route: '/buy_wine',
    title: 'Выкуп вина в Москве — продать коллекционное вино | Andrewine',
    description: 'Выкуп редких и коллекционных вин в Москве. Оценим винтаж, состояние и происхождение бутылки по фото, предложим цену и организуем выезд.',
    heading: 'Выкуп коллекционного вина в Москве',
    service: 'Выкуп редкого и коллекционного вина',
    imageAlt: 'Бутылка редкого коллекционного вина',
  },
};

export const landingRoutes = Object.values(landingSeoByFile).map(({ route }) => route === '/' ? route : `${route.replace(/\/+$/, '')}/`);
