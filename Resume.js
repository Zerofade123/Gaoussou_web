(() => {
  const root = document.querySelector('#resume');
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== '') element.textContent = text;
    return element;
  };
  const section = title => {
    const element = make('section');
    element.append(make('h2', '', title));
    return element;
  };
  const safeUrl = value => {
    try { const url = new URL(value); return ['https:', 'mailto:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const load = async path => {
    const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  };
  const addLink = (parent, label, value, mail = false) => {
    if (!value) return;
    const href = safeUrl(mail ? `mailto:${value}` : value);
    if (!href) return;
    const link = make('a', '', label || value);
    link.href = href;
    if (!mail) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    parent.append(link);
  };

  async function render() {
    try {
      const [resumeData, projectData, credentialData] = await Promise.all([
        load('content/resume.json'), load('content/projects.json'), load('content/credentials.json')
      ]);
      root.replaceChildren();
      const profile = resumeData.profile || {};
      const header = make('header');
      const identity = make('div');
      identity.append(make('h1', '', profile.name), make('p', 'headline', profile.headline));
      const contact = make('div', 'contact');
      contact.append(make('div', '', profile.location));
      addLink(contact, profile.email, profile.email, true);
      addLink(contact, 'LinkedIn', profile.linkedin);
      addLink(contact, 'GitHub', profile.github);
      addLink(contact, 'Portfolio', profile.website);
      header.append(identity, contact);
      root.append(header);

      const summary = section('Professional summary');
      summary.append(make('p', '', resumeData.summary));
      root.append(summary);

      const skills = section('Technical skills');
      const skillGrid = make('div', 'skills');
      (resumeData.skillGroups || []).forEach(group => {
        const line = make('p');
        line.append(make('strong', '', `${group.label}: `), document.createTextNode((group.items || []).join(', ')));
        skillGrid.append(line);
      });
      skills.append(skillGrid);
      root.append(skills);

      if ((resumeData.experience || []).length) {
        const experience = section('Experience & programs');
        resumeData.experience.forEach(entry => {
          const item = make('article', 'item');
          const head = make('div', 'item-head');
          const title = make('div');
          title.append(make('h3', '', entry.role), make('p', 'project-meta', entry.organization));
          head.append(title, make('span', '', entry.date));
          item.append(head);
          const list = make('ul');
          (entry.bullets || []).forEach(bullet => list.append(make('li', '', bullet)));
          item.append(list);
          experience.append(item);
        });
        root.append(experience);
      }

      const selected = new Set(resumeData.selectedProjects || []);
      const projects = (projectData.projects || []).filter(project => project.published && selected.has(project.title));
      if (projects.length) {
        const projectSection = section('Selected projects');
        projects.forEach(project => {
          const item = make('article', 'item');
          const head = make('div', 'item-head');
          const title = make('div');
          title.append(make('h3', '', project.title), make('p', 'project-meta', `${project.category} · ${project.status}`));
          head.append(title);
          item.append(head);
          const list = make('ul');
          [project.summary, project.details].filter(Boolean).slice(0, resumeData.projectBulletLimit || 2).forEach(text => list.append(make('li', '', text)));
          item.append(list);
          projectSection.append(item);
        });
        root.append(projectSection);
      }

      const education = section('Education');
      (resumeData.education || []).forEach(entry => {
        const item = make('article', 'item');
        const head = make('div', 'item-head');
        head.append(make('h3', '', entry.school), make('span', '', entry.date));
        item.append(head, make('p', '', entry.program));
        education.append(item);
      });
      root.append(education);

      const credentialNames = new Set(resumeData.selectedCredentials || []);
      const credentials = (credentialData.credentials || []).filter(item => item.published && credentialNames.has(item.title));
      if (credentials.length) {
        const credentialSection = section('Certifications & training');
        credentials.forEach(entry => {
          const item = make('article', 'item');
          const head = make('div', 'item-head');
          const title = make('div');
          title.append(make('h3', '', entry.title), make('p', 'project-meta', entry.issuer));
          head.append(title, make('span', '', `${entry.status}${entry.year ? ` · ${entry.year}` : ''}`));
          item.append(head);
          credentialSection.append(item);
        });
        root.append(credentialSection);
      }
    } catch (error) {
      root.replaceChildren(make('p', 'error', 'The résumé could not be loaded. Please refresh the page.'));
      console.error(error);
    }
  }
  render();
})();
