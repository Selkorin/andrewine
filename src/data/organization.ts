// Единый источник данных о компании для микроразметки на всех страницах.
// Контакты взяты из оригинального Tilda-экспорта (шапка и подвал).
export const organization = {
  name: 'Andrewine',
  legalName: 'Andrewine',
  url: 'https://andrewine.ru/',
  telephone: '+7-986-345-82-35',
  secondaryPhone: '+7-936-525-99-56',
  email: 'andrewine@mail.com',
  telegram: 'https://t.me/AWONLINE_BOT',
  description:
    'Оценка и выкуп коллекционного алкоголя: виски, коньяк, шампанское, вино, ром, водка, бренди и портвейн. Предварительная оценка по фотографиям, очный осмотр в Москве, работа с регионами России.',
  // Компания работает по всей стране, а не только в Москве: указываем оба
  // уровня, иначе региональные запросы не связываются с сайтом.
  areaServed: [
    { '@type': 'City', name: 'Москва' },
    { '@type': 'Country', name: 'Россия' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Москва',
    addressRegion: 'Москва',
    addressCountry: 'RU',
  },
  knowsAbout: [
    'Оценка коллекционного алкоголя',
    'Выкуп виски',
    'Выкуп коньяка',
    'Выкуп шампанского',
    'Выкуп вина',
    'Выкуп рома',
    'Выкуп водки',
    'Выкуп бренди',
    'Выкуп портвейна',
  ],
};

/** LocalBusiness для страниц журнала: тот же бизнес, что и на страницах выкупа. */
export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://andrewine.ru/#business',
    name: organization.name,
    url: organization.url,
    description: organization.description,
    telephone: organization.telephone,
    email: organization.email,
    sameAs: [organization.telegram],
    areaServed: organization.areaServed,
    address: organization.address,
    knowsAbout: organization.knowsAbout,
    priceRange: '₽₽₽',
    currenciesAccepted: 'RUB',
  };
}
