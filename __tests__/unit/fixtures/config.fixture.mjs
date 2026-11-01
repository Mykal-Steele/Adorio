// Test data. A frozen copy of the config shape, see manifest.fixture.mjs.

// What the rotation tools need to know about this repository that is not a secret.
// A different repository edits this file and secrets.manifest.mjs, and nothing else.
//
//   name             used for the private folder that keeps the old values
//   productionFile   the env file that is the record of what production runs on
//   azure            resource group and Container App name, or null when the app does
//                    not run on Azure Container Apps
//   github           false when secrets are not kept in GitHub Actions
//   dependenciesFrom a package.json whose node_modules hold the database and storage
//                    drivers the live checks use
//   mongo            collections the live login check reads
//   health           the path every health check uses, the public address to probe,
//                    and the header a failover proxy sets when it serves a backup
//   secondaryCopy    a second copy of the app the tools cannot reach (a failover host),
//                    with the keys it needs, so they are listed after every rotation
//   externals        things outside Azure, GitHub and the env files that check a
//                    rotated value and have to change before the app does
//   followUps        commands to offer after a key changes
//   staleDays        a credential older than this is flagged
//   oldBackupDays    saved old values older than this are flagged
export const CONFIG = {
  name: 'adorio',
  productionFile: '.env.production',
  azure: { resourceGroup: 'adorio-prod-rg', app: 'adorio' },
  github: true,
  dependenciesFrom: 'backend/package.json',
  mongo: { probeCollections: ['users', 'posts'] },
  health: {
    path: '/api/health',
    publicUrl: 'https://adorio.space',
    backupHeader: {
      name: 'x-served-by',
      value: 'northflank-backup',
      note: 'Cloudflare switches back after two good checks, which takes about 10 minutes.',
    },
  },
  secondaryCopy: {
    name: 'Northflank',
    reason: 'the failover copy of the app',
    keys: [
      'MONGO_URI',
      'JWT_SECRET',
      'REFRESH_TOKEN_SECRET',
      'CLOUDINARY_KEY',
      'CLOUDINARY_SECRET',
      'CLOUDINARY_URL',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'TURNSTILE_SECRET_KEY',
      'PISTON_TOKEN',
    ],
  },
  // A VM that sits behind a proxy that checks a token header. Azure does not let a VM's
  // customData change after it exists, so the token is edited on the running VM through
  // run-command, in the proxy config the container mounts (onVm), and the proxy restarted.
  // deployEnv holds the resource group and the token the VM has now. A reimage or a
  // recreate resets the VM to the token it was created with.
  externals: [
    {
      id: 'runner',
      type: 'vm-token',
      label: 'Updating the code runner VM',
      vmName: 'adorio-piston-vm',
      deployEnv: 'infra/.secrets/piston-deploy.env',
      deployEnvKeys: { resourceGroup: 'PISTON_RESOURCE_GROUP', token: 'PISTON_AUTH_TOKEN' },
      onVm: {
        confFile: '/opt/piston/nginx.conf',
        container: 'piston_proxy',
        port: 2358,
        scrubDirs: ['/var/lib/cloud'],
      },
      // The app switches this VM off whenever nobody has a hold on it. The hold moves the same
      // date the app's own admin hold moves.
      hold: {
        uriKey: 'MONGO_URI',
        collection: 'coderunnerstates',
        match: { key: 'piston' },
        field: 'keepUntil',
        minutes: 20,
      },
      tokenKey: 'PISTON_TOKEN',
      urlKey: 'PISTON_URL',
      caKey: 'PISTON_CA_CERT',
      tokenHeader: 'X-Auth-Token',
      probePath: '/api/v2/runtimes',
      readyTimeoutMinutes: 4,
    },
  ],
  followUps: [
    {
      key: 'AUDIT_PASSWORD',
      ask: 'The report password changed. Encrypt the report again now?',
      command: ['npm', 'run', 'encrypt-report'],
      done: 'Report encrypted with the new password',
      failed: 'Encrypting the report failed, run npm run encrypt-report yourself',
      manual: 'Run npm run encrypt-report so the report uses the new password.',
    },
  ],
  staleDays: 90,
  oldBackupDays: 7,
};
