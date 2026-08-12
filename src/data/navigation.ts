// Content model for the site chrome, lifted out of the Tilda export so the
// header and footer can be rendered from our own markup.

export const categories = [
  ['Вино', 'buy_wine'],
  ['Шампанское', 'buy_champagne'],
  ['Виски', 'buy_whisky'],
  ['Коньяк', 'buy_cognac'],
  ['Портвейн', 'buy_portwine'],
  ['Ром', 'buy_rum'],
  ['Водка', 'buy_vodka'],
  ['Бренди', 'buy_brandy'],
] as const;

export const contacts = {
  phone: '+7(986)345-82-35',
  phoneHref: 'tel:+79863458235',
  secondPhone: '+7(936)525-99-56',
  secondPhoneHref: 'tel:+79365259956',
  email: 'andrewine@mail.com',
  emailHref: 'mailto:andrewine@mail.com',
  telegram: '@AWONLINE_BOT',
  telegramHref: 'https://t.me/AWONLINE_BOT',
};

export const companyLinks = [
  ['О нас', '#about'],
  ['Онлайн оценка', '#request'],
] as const;

export const copyright = '© 2014–2026, Выкуп элитного алкоголя в Москве';
