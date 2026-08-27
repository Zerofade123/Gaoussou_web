(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('#main-nav');
  const navToggle = document.querySelector('#nav-toggle');
  const themeToggle = document.querySelector('#theme-toggle');

  const preferredTheme = localStorage.getItem('theme');
  const useLight = preferredTheme === 'light' || (!preferredTheme && matchMedia('(prefers-color-scheme: light)').matches);

  function setTheme(light) {
    document.body.classList.toggle('light', light);
    themeToggle.textContent = light ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    root.style.colorScheme = light ? 'light' : 'dark';
  }

  setTheme(useLight);
  themeToggle.addEventListener('click', () => {
    const light = !document.body.classList.contains('light');
    setTheme(light);
    localStorage.setItem('theme', light ? 'light' : 'dark');
  });

  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.sr-only').textContent = `${open ? 'Close' : 'Open'} navigation`;
  });

  nav.addEventListener('click', event => {
    if (event.target.matches('a')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 12), { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(element => observer.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('visible'));
  }

  document.querySelector('#year').textContent = new Date().getFullYear();

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const safeMediaPath = value => typeof value === 'string' && value && !value.includes('..') && !value.includes(':') ? value : '';
  const safeWebUrl = value => {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };

  async function loadContent(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  }

  function addTags(parent, values = []) {
    const tags = make('div', 'tags');
    values.forEach(value => tags.append(make('em', '', String(value))));
    parent.append(tags);
  }

  async function renderProjects() {
    const grid = document.querySelector('#projects-grid');
    if (!grid) return;
    try {
      const { projects = [] } = await loadContent('content/projects.json');
      grid.replaceChildren();
      projects.filter(project => project.published).forEach(project => {
        const card = make('article', 'project-square');
        const media = make('div', 'project-square-media');
        const imagePath = safeMediaPath(project.image);
        if (imagePath) {
          const image = make('img');
          image.src = imagePath;
          image.alt = `${project.title} project preview`;
          image.loading = 'lazy';
          media.append(image);
        } else {
          media.classList.add('project-placeholder');
          media.append(make('span', '', String(project.category || 'Project').split(/\s|\//).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()));
          media.append(make('code', '', project.status || 'Project'));
        }
        const body = make('div', 'project-square-body');
        body.append(make('p', 'project-number', `${project.category} · ${project.status}`));
        body.append(make('h2', '', project.title));
        body.append(make('p', '', project.summary));
        addTags(body, project.technologies);
        const link = safeWebUrl(project.link);
        if (link) {
          const anchor = make('a', 'text-link', `${project.linkLabel || 'View project'} ↗`);
          anchor.href = link;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          body.append(anchor);
        }
        card.append(media, body);
        grid.append(card);
      });
    } catch (error) {
      grid.replaceChildren(make('p', 'content-error', 'Projects could not be loaded. Please refresh the page.'));
      console.error(error);
    }
  }

  async function renderCredentials() {
    const grid = document.querySelector('#credentials-grid');
    if (!grid) return;
    try {
      const { credentials = [] } = await loadContent('content/credentials.json');
      grid.replaceChildren();
      credentials.filter(credential => credential.published).forEach(credential => {
        const card = make('article', `credential-page-card${credential.image ? '' : ' credential-progress'}`);
        const imagePath = safeMediaPath(credential.image);
        if (imagePath) {
          const button = make('button', 'certificate-trigger');
          button.type = 'button';
          button.dataset.certificateImage = imagePath;
          button.dataset.certificateTitle = credential.title;
          button.dataset.certificateMeta = `${credential.type}${credential.year ? ` · ${credential.year}` : ''}`;
          button.dataset.certificateIssuer = credential.issuer;
          button.setAttribute('aria-label', `View ${credential.title} certificate`);
          const image = make('img');
          image.src = imagePath;
          image.alt = `${credential.title} certificate preview`;
          image.loading = 'lazy';
          button.append(image);
          card.append(button);
        } else {
          card.append(make('div', 'credential-icon', '◎'));
        }
        const copy = make('div');
        copy.append(make('p', 'credential-type', `${credential.status}${credential.year ? ` · ${credential.year}` : ''}`));
        copy.append(make('h2', '', credential.title));
        copy.append(make('p', '', credential.summary));
        if (imagePath) {
          const button = make('button', 'button button-small', 'View certificate');
          button.type = 'button';
          button.dataset.certificateImage = imagePath;
          button.dataset.certificateTitle = credential.title;
          button.dataset.certificateMeta = `${credential.type}${credential.year ? ` · ${credential.year}` : ''}`;
          button.dataset.certificateIssuer = credential.issuer;
          copy.append(button);
        }
        card.append(copy);
        grid.append(card);
      });
    } catch (error) {
      grid.replaceChildren(make('p', 'content-error', 'Credentials could not be loaded. Please refresh the page.'));
      console.error(error);
    }
  }

  renderProjects();
  renderCredentials();

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-certificate-image]');
    if (!trigger) return;
    const dialog = document.querySelector('#certificate-dialog');
    const imagePath = safeMediaPath(trigger.dataset.certificateImage);
    if (!dialog || !imagePath) return;
    dialog.querySelector('#certificate-image').src = imagePath;
    dialog.querySelector('#certificate-title').textContent = trigger.dataset.certificateTitle;
    dialog.querySelector('#certificate-meta').textContent = trigger.dataset.certificateMeta;
    dialog.querySelector('#certificate-issuer').textContent = trigger.dataset.certificateIssuer;
    dialog.querySelector('#certificate-download').href = imagePath;
    if (typeof dialog.showModal === 'function') dialog.showModal();
  });

  document.querySelectorAll('.media-dialog').forEach(dialog => {
    dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) dialog.close();
    });
  });
})();
