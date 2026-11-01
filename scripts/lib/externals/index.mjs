import { CONFIG } from '../../secrets.config.mjs';
import { createFieldHold } from '../hold.mjs';
import { readCurrent, root, stateDir } from '../session.mjs';
import { createVmTokenExternal } from './vm-token.mjs';

export const EXTERNAL_TYPES = ['vm-token'];

// One adapter per entry in CONFIG.externals. A new kind of external is a new file in
// this folder with the same five members (id, label, applies, snapshot, apply, restore)
// and a line here.
export function buildExternals() {
  return (CONFIG.externals ?? []).map((entry) => {
    if (entry.type === 'vm-token') {
      // The hold keeps whatever else manages the VM from switching it off mid-change.
      const hold = entry.hold
        ? {
            acquire: () =>
              createFieldHold({ ...entry.hold, uri: readCurrent(entry.hold.uriKey) }).acquire(),
          }
        : undefined;
      return createVmTokenExternal({
        config: entry,
        root,
        current: readCurrent,
        paramsDir: stateDir,
        hold,
      });
    }
    throw new Error(`Unknown external type "${entry.type}" in secrets.config.mjs.`);
  });
}
