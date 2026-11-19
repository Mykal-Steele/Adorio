import { portfolioData } from '@/views/Portfolio/data/portfolio';

// Who runs oakar.dev, in the form search engines and AI tools read (schema.org JSON-LD).
// Every name, email and profile here is the same person, so they get linked together.
export const SITE_URL = 'https://oakar.dev';
export const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const ALTERNATE_NAMES = ['Kruskal', 'Mykal-Steele', 'OakarOo'];
export const EMAILS = ['me@oakar.dev', 'mykal.stele@gmail.com'];

export const PROFILES = [
  { label: 'GitHub', url: 'https://github.com/Mykal-Steele' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/oakaroo' },
  { label: 'Google Developer profile', url: 'https://g.dev/oakaroo' },
  { label: 'X', url: 'https://x.com/kruskal_oakar' },
  { label: 'Instagram', url: 'https://www.instagram.com/kruskal.oakar' },
  { label: 'Facebook', url: 'https://www.facebook.com/oakarooprofile' },
  { label: 'Buy Me a Coffee', url: 'https://buymeacoffee.com/mykalstele4' },
];

const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: portfolioData.name,
  alternateName: ALTERNATE_NAMES,
  url: SITE_URL,
  email: EMAILS,
  jobTitle: portfolioData.role,
  description: portfolioData.headline,
  address: { '@type': 'PostalAddress', addressLocality: 'Bangkok', addressCountry: 'TH' },
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: "King Mongkut's University of Technology Thonburi",
      alternateName: 'KMUTT',
      url: 'https://www.kmutt.ac.th',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'University of the People',
      url: 'https://www.uopeople.edu',
    },
  ],
  knowsAbout: portfolioData.skills.map((skill) => skill.name),
  sameAs: PROFILES.map((profile) => profile.url),
});

// on every page: the person and the site they own
export const siteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    person(),
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: portfolioData.name,
      alternateName: 'oakar.dev',
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
    },
  ],
});

// on the home page, which is the profile itself
export const profilePageJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: SITE_URL,
  isPartOf: { '@id': WEBSITE_ID },
  mainEntity: { '@id': PERSON_ID },
});

// JSON.stringify leaves "</script>" alone, which would close the tag early
export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
