// Decap CMS configuration. Edit GITHUB_REPO before deploying.
const GITHUB_REPO = 'YOUR-GITHUB-USER/YOUR-REPO'; // PLACEHOLDER, e.g. 'balkanwings/website'

const str = (name, label, o = {}) => ({ name, label, widget: 'string', required: false, ...o });
const txt = (name, label, o = {}) => ({ name, label, widget: 'text', required: false, ...o });
const img = (name, label, o = {}) => ({ name, label, widget: 'image', required: false, ...o });
const obj = (name, label, fields, o = {}) => ({ name, label, widget: 'object', collapsed: true, fields, ...o });
const list = (name, label, fields, o = {}) => ({ name, label, widget: 'list', fields, collapsed: true, ...o });
const alt = (name = 'imageAlt') => str(name, 'Image description (for screen readers)', { hint: 'Describe what is in the photo, e.g. "Training aircraft on the apron".' });
const hint = 'Text in [square brackets] is a placeholder: replace it with real information.';

const pageFiles = (L) => [
  { name: 'site', label: 'Site-wide: name, menu, footer, contact details', file: `src/content/${L}/site.json`, fields: [
    str('siteName', 'School name'), str('logoAlt', 'Logo description'),
    obj('meta', 'Home page search-engine title and description', [str('title', 'Title'), txt('description', 'Description (max 150 characters)')]),
    obj('nav', 'Menu labels', ['home', 'about', 'training', 'faq', 'contact'].map((k) => str(k, k))),
    str('menu', 'Mobile "Menu" button'), str('skip', '"Skip to content" link'),
    str('switchTo', 'Language switch text'), str('switchLabel', 'Language switch description'), str('photoAlt', 'Placeholder photo label'),
    obj('notice', 'Bottom notice bar (cookies)', [str('label', 'Description for screen readers'), txt('text', 'Notice text', { hint: 'Only keep the claim "does not use cookies" while it is true: adding analytics, embedded videos or similar can set cookies.' }), str('ok', 'Button text')]),
    obj('footer', 'Footer and contact details', [str('rights', 'Rights text'), str('address', 'Address'), str('phone', 'Phone', { hint: 'Once this is a real number it becomes tap-to-call.' }), str('email', 'Email', { hint: 'Once this is a real address it becomes a mailto link.' })], { collapsed: false }),
  ] },
  { name: 'home', label: 'Home page: headline, key facts, call to action', file: `src/content/${L}/home.json`, fields: [
    obj('hero', 'Headline area', [str('title', 'Headline'), txt('lead', 'Intro text'), str('cta1', 'First button'), str('cta2', 'Second button'), str('photo', 'Placeholder label'), img('image', 'Main photo'), alt()], { collapsed: false }),
    list('facts', 'Key facts (three work best)', [str('k', 'Value'), str('v', 'Label')]),
    obj('cta', 'Closing call to action', [str('title', 'Title'), txt('text', 'Text'), str('btn', 'Button')]),
  ] },
  { name: 'programs', label: 'Training programs: page headings', file: `src/content/${L}/programs.json`, fields: [
    str('title', 'Heading'), txt('intro', 'Intro'), str('more', '"View details" link'),
  ] },
  { name: 'school', label: 'Instructors, aircraft and facilities', file: `src/content/${L}/school.json`, fields: [
    obj('team', 'Instructors', [str('title', 'Heading'), txt('intro', 'Intro'), list('items', 'People', [str('t', 'Name'), str('d', 'Role and ratings'), img('image', 'Photo')], { summary: '{{fields.t}}' })]),
    obj('fleet', 'Aircraft', [str('title', 'Heading'), txt('intro', 'Intro'), list('items', 'Aircraft', [str('t', 'Type'), txt('d', 'Details'), img('image', 'Photo')], { summary: '{{fields.t}}' })]),
    obj('facilities', 'Facilities', [str('title', 'Heading'), txt('intro', 'Text'), img('image', 'Photo'), alt()]),
  ] },
  { name: 'about', label: 'About page', file: `src/content/${L}/about.json`, fields: [str('title', 'Title'), txt('intro', 'Intro'), str('storyTitle', 'Story heading'), txt('story', 'Story'), str('approvalsTitle', 'Approvals heading'), txt('approvals', 'Approvals text', { hint: 'Add only verified approvals and certificate numbers.' })] },
  { name: 'training', label: 'Training page (intro and enrolment steps)', file: `src/content/${L}/training.json`, fields: [
    str('title', 'Title'), txt('intro', 'Intro'),
    obj('labels', 'Labels', [str('req', 'Entry requirements'), str('dur', 'Duration'), str('price', 'Price')]),
    str('back', '"Back" link on program pages'), str('gallery', 'Photos heading'), str('details', '"Program details" link'), str('empty', 'Text when there are no programs'),
    str('enrolTitle', 'Enrolment heading'), list('steps', 'Enrolment steps', [str('t', 'Step title'), txt('d', 'Description')], { summary: '{{fields.t}}' }),
  ] },
  { name: 'faq', label: 'FAQ page', file: `src/content/${L}/faq.json`, fields: [str('title', 'Title'), txt('intro', 'Intro'), list('items', 'Questions', [str('q', 'Question'), txt('a', 'Answer')], { summary: '{{fields.q}}', collapsed: false })] },
  { name: 'contact', label: 'Contact page', file: `src/content/${L}/contact.json`, fields: [
    str('title', 'Title'), txt('intro', 'Intro'),
    obj('labels', 'Labels', ['address', 'phone', 'email', 'hours'].map((k) => str(k, k))),
    str('hours', 'Opening hours'), str('mapTitle', 'Directions heading'), txt('map', 'Directions text'),
    str('mapQuery', 'Map location', { hint: 'An address or coordinates, e.g. "Sofia Airport, Bulgaria" or "42.6952,23.4062". Leave as the [placeholder] to use the footer address instead.' }),
    str('mapEmbedUrl', 'Google embed link (optional)', { hint: 'Advanced: in Google Maps choose Share > Embed a map, then paste only the web address inside src="...". It must start with https://www.google.com/maps/embed.' }),
    str('mapLoad', 'Map button text'), txt('mapNote', 'Privacy notice shown before the map loads'), str('mapOpen', '"Open in Google Maps" link'), str('mapFrameTitle', 'Map description (for screen readers)'), str('mapPlaceholder', 'Text shown when no location is set'),
  ] },
].map((f) => ({ ...f, fields: f.fields.map((x, i) => (i === 0 ? { ...x, hint: x.hint || hint } : x)) }));

const programsCollection = (L, label) => ({
  name: `programs_${L}`, label: `Training programs (${label})`, label_singular: 'training program',
  folder: `src/content/programs/${L}`, create: true, extension: 'md', format: 'frontmatter',
  identifier_field: 'handle', slug: '{{slug}}', summary: '{{title}}',
  fields: [
    str('handle', 'Page address (slug)', { required: true, pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'Use lowercase letters, numbers and hyphens only, e.g. private-pilot'],
      hint: 'Becomes the web address /training/<slug>/. Must be identical in English and Bulgarian. Do not change it after the first save.' }),
    str('title', 'Program name', { required: true }),
    txt('summary', 'Short description (shown in lists and under the title)'),
    { name: 'order', label: 'Display order', widget: 'number', value_type: 'int', min: 0, default: 10, required: false, hint: 'Lower numbers are listed first.' },
    str('requirements', 'Entry requirements'), str('duration', 'Duration'), str('price', 'Price'),
    img('image', 'Main photo'), alt(),
    list('gallery', 'More photos', [img('image', 'Photo', { required: true }), str('alt', 'Description (for screen readers)')], { summary: '{{fields.alt}}', collapsed: false }),
    { name: 'draft', label: 'Draft (hidden from the website)', widget: 'boolean', default: false, required: false },
    // Photos go in the fields above; images pasted into the text would not display on the site.
    { name: 'body', label: 'Full description', widget: 'markdown', required: false, editor_components: [],
      buttons: ['bold', 'italic', 'link', 'heading-two', 'heading-three', 'bulleted-list', 'numbered-list', 'quote'] },
  ],
});

CMS.init({
  config: {
    load_config_file: false,
    backend: { name: 'github', repo: GITHUB_REPO, branch: 'main', base_url: 'https://balkanwings.eu', auth_endpoint: 'oauth/auth.php' },
    local_backend: true, // only active on localhost: edits files directly, no login (see README)
    media_folder: 'src/assets/uploads',
    public_folder: '/src/assets/uploads',
    locale: 'en',
    site_url: 'https://balkanwings.eu',
    collections: [
      { name: 'pages_en', label: 'Pages (English)', files: pageFiles('en') },
      { name: 'pages_bg', label: 'Pages (Български)', files: pageFiles('bg') },
      programsCollection('en', 'English'), programsCollection('bg', 'Български'),
    ],
  },
});
