export interface CategoryFaqBlock {
  label?: string;
  text: string;
}

export interface CategoryFaqItem {
  question: string;
  blocks: CategoryFaqBlock[];
}

const renderItem = (question: string, answer: string) =>
  `<details class="faq__item" name="category-faq"><summary>${question}<span aria-hidden="true">+</span></summary><div class="faq__answer">${answer}</div></details>`;

const renderBlocks = (blocks: CategoryFaqBlock[]) =>
  blocks.map((block) => `${block.label ? `<h3>${block.label}</h3>` : ''}<p>${block.text}</p>`).join('');

export const renderCategoryFaq = (title: string, items: string) =>
  `<section class="faq home-faq category-faq" aria-labelledby="category-faq-title"><div class="faq__inner home-faq__inner"><div class="home-faq__layout"><header class="home-faq__heading"><p class="editorial__eyebrow">Частые вопросы</p><h2 id="category-faq-title">${title}</h2><a class="home-faq__cta" href="#request">Отправить фотографии <span aria-hidden="true">→</span></a></header><div class="faq__list home-faq__list">${items}</div></div></div></section>`;

export const renderCategoryFaqFromData = (title: string, items: CategoryFaqItem[]) =>
  renderCategoryFaq(title, items.map((item) => renderItem(item.question, renderBlocks(item.blocks))).join(''));

// buy_champagne and buy_whisky carry this copy inside a Tilda T123 record as raw
// HTML: an <h1> followed by <h2> sections. Rebuild it into the same accordion the
// data-driven categories use, so both sources render identically. The title drops
// to <h2> and the hero keeps the page's only visible <h1>.
export const rebuildLegacyCategoryFaq = (html: string) =>
  html.replace(/<!-- nominify begin -->([\s\S]*?)<!-- nominify end -->/g, (whole, inner: string) => {
    const title = inner.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.trim();
    if (!title) return whole;

    const items = inner
      .slice(inner.indexOf('</h1>') + 5)
      .split(/(?=<h2>)/)
      .filter((part) => /<h2>/.test(part))
      .map((part) => {
        const question = part.match(/<h2>([\s\S]*?)<\/h2>/)?.[1]?.trim() ?? '';
        return renderItem(question, part.slice(part.indexOf('</h2>') + 5).trim());
      })
      .join('');

    return renderCategoryFaq(title, items);
  });
