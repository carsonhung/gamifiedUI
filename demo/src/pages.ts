import { t } from './core';
import { codeView, snippetFor } from './code';

interface Category {
  label: string;
  /** Slugs; each page is the section whose heading id is `${slug}-title`. */
  pages: string[];
}

const CATEGORIES: Category[] = [
  { label: 'catStart', pages: ['overview', 'start', 'themes'] },
  { label: 'catInputs', pages: ['buttons', 'form', 'time', 'upload'] },
  { label: 'catNavigation', pages: ['menu', 'log'] },
  { label: 'catHud', pages: ['party', 'bag', 'hud', 'board'] },
  { label: 'catFeedback', pages: ['feedback', 'info', 'fx', 'sfx'] },
  { label: 'catStory', pages: ['dialogue'] },
  { label: 'catMedia', pages: ['sprite', 'media'] },
  { label: 'catLayout', pages: ['desktop', 'map'] },
  { label: 'catIcons', pages: ['icons'] },
];
const HOME = 'overview';
const SITE_NAME = 'gamifiedUI';
const MOBILE_SIDEBAR_QUERY = '(max-width: 63.99rem)';

interface Page {
  slug: string;
  category: Category;
  titleKey: string;
  article: HTMLElement;
  heading: HTMLHeadingElement;
  link: HTMLAnchorElement;
  /** gx- classes used in the snippet, so search finds a page by class name. */
  classes: string;
}

const pages: Page[] = [];
let current: Page | undefined;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', i18nKey = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (i18nKey) {
    node.dataset.i18n = i18nKey;
    node.textContent = t(i18nKey);
  }
  return node;
}

function titleKeyFor(slug: string, heading: HTMLElement): string {
  const override = `title:${slug}`;
  return t(override) === override ? (heading.dataset.i18n ?? slug) : override;
}

let tabSeq = 0;

function tabbed(preview: HTMLElement, source: string): HTMLElement {
  const id = `demo-tabs-${++tabSeq}`;
  const wrap = el('div', 'demo-tabs');
  const list = el('div', 'demo-tablist');
  list.setAttribute('role', 'tablist');
  const pairs = (
    [
      ['tabPreview', preview],
      ['tabCode', codeView(source)],
    ] as const
  ).map(([key, panel], i) => {
    const tab = el('button', 'demo-tab', key);
    tab.type = 'button';
    tab.id = `${id}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel-${i}`);
    panel.id = `${id}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    return { tab, panel };
  });
  const select = (index: number, shouldFocus = false): void => {
    pairs.forEach(({ tab, panel }, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panel.hidden = !isActive;
      if (isActive && shouldFocus) tab.focus();
    });
  };
  pairs.forEach(({ tab }, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      select((i + 1) % pairs.length, true);
    });
  });
  list.append(...pairs.map((p) => p.tab));
  wrap.append(list, ...pairs.map((p) => p.panel));
  select(0);
  return wrap;
}

function pager(index: number): HTMLElement {
  const nav = el('nav', 'demo-pager');
  nav.setAttribute('aria-label', t('prevPage') + ' / ' + t('nextPage'));
  const add = (target: Page | undefined, dirKey: string, className: string): void => {
    if (!target) return;
    const link = el('a', `demo-pager-link ${className}`);
    link.href = `#${target.slug}-title`;
    link.append(el('span', 'demo-pager-dir', dirKey), el('span', 'demo-pager-title', target.titleKey));
    nav.append(link);
  };
  add(pages[index - 1], 'prevPage', 'demo-pager-prev');
  add(pages[index + 1], 'nextPage', 'demo-pager-next');
  return nav;
}

function buildPages(): void {
  for (const category of CATEGORIES) {
    for (const slug of category.pages) {
      const heading = document.getElementById(`${slug}-title`) as HTMLHeadingElement | null;
      const section = heading?.closest('section');
      if (!heading || !section) {
        console.error(`[pages] missing section for ${slug}`);
        continue;
      }
      const hasCode = section.dataset.code !== 'off';
      const source = hasCode ? snippetFor(section) : '';
      const titleKey = titleKeyFor(slug, heading);

      const article = el('article', 'demo-page');
      article.dataset.page = slug;
      article.hidden = true;
      section.replaceWith(article);
      heading.classList.add('sr-only');

      const header = el('header', 'demo-page-header');
      const title = el('h2', 'demo-page-title', titleKey);
      title.tabIndex = -1;
      header.append(el('p', 'demo-eyebrow', category.label), title, el('p', 'demo-page-desc', `desc:${slug}`));
      article.append(header, hasCode ? tabbed(section, source) : section);

      pages.push({
        slug,
        category,
        titleKey,
        article,
        heading,
        link: el('a'),
        classes: Array.from(new Set(source.match(/gx-[a-z0-9-]+/g) ?? [])).join(' '),
      });
    }
  }
  pages.forEach((page, i) => page.article.append(pager(i)));
}

function buildSidebar(sidebar: HTMLElement): HTMLElement {
  const list = el('div', 'demo-nav');
  for (const category of CATEGORIES) {
    const group = el('div', 'demo-nav-group');
    const ul = el('ul');
    for (const page of pages.filter((p) => p.category === category)) {
      const li = el('li');
      page.link = el('a', 'demo-nav-link', page.titleKey);
      page.link.href = `#${page.slug}-title`;
      li.append(page.link);
      ul.append(li);
    }
    group.append(el('p', 'demo-nav-heading', category.label), ul);
    list.append(group);
  }
  const empty = el('p', 'demo-nav-empty', 'noResults');
  empty.hidden = true;
  sidebar.append(list, empty);
  return empty;
}

function buildOverview(grid: HTMLElement): void {
  for (const category of CATEGORIES.slice(1)) {
    const block = el('section', 'demo-overview-group');
    const cards = el('div', 'demo-cards');
    for (const page of pages.filter((p) => p.category === category)) {
      const card = el('a', 'demo-card gx-panel');
      card.href = `#${page.slug}-title`;
      card.append(el('span', 'demo-card-title', page.titleKey), el('span', 'demo-card-desc', `desc:${page.slug}`));
      cards.append(card);
    }
    block.append(el('h3', 'demo-overview-heading', category.label), cards);
    grid.append(block);
  }
}

function setDocumentTitle(): void {
  document.title = current && current.slug !== HOME ? `${t(current.titleKey)} · ${SITE_NAME}` : SITE_NAME;
}

function show(page: Page, target: HTMLElement | null): void {
  if (current !== page) {
    pages.forEach((p) => {
      p.article.hidden = p !== page;
      if (p === page) p.link.setAttribute('aria-current', 'page');
      else p.link.removeAttribute('aria-current');
    });
    current = page;
    setDocumentTitle();
  }
  const isPageTop = !target || target === page.heading;
  if (isPageTop) {
    window.scrollTo(0, 0);
    page.article.querySelector<HTMLElement>('.demo-page-title')?.focus({ preventScroll: true });
  } else {
    target.scrollIntoView({ block: 'start' });
  }
}

function route(): void {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  const article = target?.closest<HTMLElement>('.demo-page');
  const page = pages.find((p) => p.article === article) ?? pages.find((p) => p.slug === HOME);
  if (page) show(page, article ? target : null);
}

function setupSearch(input: HTMLInputElement, empty: HTMLElement): void {
  const matches = (page: Page, query: string): boolean =>
    [t(page.titleKey), t(page.category.label), t(`desc:${page.slug}`), page.slug, page.classes]
      .join(' ')
      .toLowerCase()
      .includes(query);

  const filter = (): Page[] => {
    const query = input.value.trim().toLowerCase();
    const visible = pages.filter((p) => !query || matches(p, query));
    pages.forEach((p) => (p.link.parentElement!.hidden = !visible.includes(p)));
    document.querySelectorAll<HTMLElement>('.demo-nav-group').forEach((group) => {
      group.hidden = !group.querySelector('li:not([hidden])');
    });
    empty.hidden = visible.length > 0;
    return visible;
  };

  input.addEventListener('input', () => {
    filter();
    if (input.value) document.body.dataset.sidebarOpen = 'true';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = filter()[0];
      if (first) location.hash = `${first.slug}-title`;
    } else if (e.key === 'Escape') {
      input.value = '';
      filter();
    }
  });
  document.addEventListener('keydown', (e) => {
    const typing = (e.target as HTMLElement).closest('input, textarea, select, [contenteditable]');
    if (e.key === '/' && !typing) {
      e.preventDefault();
      input.focus();
    }
  });
}

function setupMobileSidebar(toggle: HTMLButtonElement, sidebar: HTMLElement): void {
  const isMobile = window.matchMedia(MOBILE_SIDEBAR_QUERY);
  const setOpen = (isOpen: boolean): void => {
    if (isOpen) document.body.dataset.sidebarOpen = 'true';
    else delete document.body.dataset.sidebarOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
  };
  toggle.addEventListener('click', () => setOpen(document.body.dataset.sidebarOpen !== 'true'));
  sidebar.addEventListener('click', (e) => {
    if (isMobile.matches && (e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.dataset.sidebarOpen === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

/** Splits the demo into one page per component with a sidebar, search and hash routing. */
export function setupPages(): void {
  const sidebar = document.getElementById('sidebar');
  const grid = document.getElementById('overview-grid');
  const search = document.getElementById('page-search') as HTMLInputElement | null;
  const toggle = document.getElementById('sidebar-toggle') as HTMLButtonElement | null;
  if (!sidebar || !grid || !search || !toggle) {
    console.error('[pages] docs shell markup is missing');
    return;
  }
  buildPages();
  const empty = buildSidebar(sidebar);
  buildOverview(grid);
  setupSearch(search, empty);
  setupMobileSidebar(toggle, sidebar);
  window.addEventListener('hashchange', route);
  route();
}

export function refreshPageTitle(): void {
  setDocumentTitle();
}
