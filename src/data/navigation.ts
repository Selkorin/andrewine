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
  phone: '+7 (980) 466-91-90',
  phoneHref: 'tel:+79804669190',
  email: 'andrewine@mail.com',
  emailHref: 'mailto:andrewine@mail.com',
  telegram: '+7 (980) 466-91-90',
  telegramHref: 'https://t.me/+79804669190',
  whatsapp: '+63 910 229-90-03',
  whatsappHref: 'https://wa.me/63910229903',
  maxHref: 'https://max.ru/u/f9LHodD0cOIYhHkLn0AZXxUTnF3Dz2MuyTfMX4OnZgvS1QZbotQEvgQAhDY',
};

export const companyLinks = [
  ['О нас', '#about'],
  ['Онлайн оценка', '#request'],
] as const;

export const copyright = '© 2014–2026, Выкуп элитного алкоголя в Москве';
