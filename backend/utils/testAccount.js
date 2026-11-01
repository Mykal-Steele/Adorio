export const TEST_EMAIL_PATTERN = /@integration\.test$/;

// .test is a reserved domain, so a real address never ends like this.
export const isTestEmail = (email) => TEST_EMAIL_PATTERN.test(email ?? '');
