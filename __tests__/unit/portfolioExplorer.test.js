import { portfolioData } from '../../src/views/Portfolio/data/portfolio.ts';
import {
  certificateFileName,
  fileNameForPath,
  initialOpenFolders,
  revealFolder,
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

describe('revealing the folder of the open page', () => {
  const closed = { projects: false, skills: false, certificates: false };

  test('should open skills when a skill page is shown and leave the others alone', () => {
    expect(revealFolder(closed, '/skills/bun')).toEqual({
      projects: false,
      skills: true,
      certificates: false,
    });
  });

  test('should open projects when a project page is shown', () => {
    expect(revealFolder(closed, '/projects/adorio')).toEqual({
      projects: true,
      skills: false,
      certificates: false,
    });
  });

  test('should open certificates for the overview and for each certificate', () => {
    for (const path of ['/certificates', '/certificates/isc2-cc']) {
      expect(revealFolder(closed, path)).toEqual({
        projects: false,
        skills: false,
        certificates: true,
      });
    }
  });

  test('should not close a folder the visitor opened', () => {
    const open = { projects: true, skills: true, certificates: false };
    expect(revealFolder(open, '/')).toEqual(open);
    expect(revealFolder(open, '/certificates/msa')).toEqual({ ...open, certificates: true });
  });

  test('should change nothing for pages that are files at the root', () => {
    for (const path of ['/', '/projects', '/contact']) {
      expect(revealFolder(closed, path)).toEqual(closed);
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
