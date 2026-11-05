import { portfolioData } from '../../src/views/Portfolio/data/portfolio.ts';
import {
  certificateFileName,
  fileNameForPath,
  initialOpenFolders,
} from '../../src/views/Portfolio/data/files.ts';
import sitemap from '../../src/app/sitemap.ts';

describe('explorer folders on first load', () => {
  test('should open projects and keep skills collapsed on the about page', () => {
    expect(initialOpenFolders('/')).toEqual({ projects: true, skills: false, certificates: false });
  });

  test('should open projects and keep skills collapsed on the other top-level pages', () => {
    for (const path of ['/projects', '/contact']) {
      expect(initialOpenFolders(path)).toEqual({
        projects: true,
        skills: false,
        certificates: false,
      });
    }
  });

  test('should open projects on a project page', () => {
    expect(initialOpenFolders('/projects/adorio')).toEqual({
      projects: true,
      skills: false,
      certificates: false,
    });
  });

  test('should reveal the skills folder when a skill page is open', () => {
    expect(initialOpenFolders('/skills/typescript')).toEqual({
      projects: true,
      skills: true,
      certificates: false,
    });
  });

  test('should reveal only the certificates folder when a certificate page is open', () => {
    for (const path of ['/certificates', '/certificates/isc2-cc']) {
      expect(initialOpenFolders(path)).toEqual({
        projects: true,
        skills: false,
        certificates: true,
      });
    }
  });
});

describe('explorer file names', () => {
  test('should name a certificate file after its id', () => {
    expect(certificateFileName('isc2-cc')).toBe('isc2-cc.md');
  });

  test('should show the certificates index as certificates.json and each certificate as a .md tab', () => {
    expect(fileNameForPath('/certificates')).toBe('certificates.json');
    expect(fileNameForPath('/certificates/google-it-support')).toBe('google-it-support.md');
  });

  test('should keep the names of the existing pages', () => {
    expect(fileNameForPath('/')).toBe('about_me.md');
    expect(fileNameForPath('/skills/typescript')).toBe('typescript.md');
    expect(fileNameForPath('/projects/adorio')).toBe('adorio.ts');
  });
});

describe('sitemap', () => {
  test('should list the certificates page and every certificate page', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain('https://adorio.space/certificates');
    for (const cert of portfolioData.certificates) {
      expect(urls).toContain(`https://adorio.space/certificates/${cert.id}`);
    }
  });
});
