/** Metro keeps statically addressable modules deferred; the launcher imports no domain UI. */
export const loadItaly = async (): Promise<
  Pick<typeof import('../experiences/pi/it/NativeItalyApp'), 'default'>
> => {
  const loaded = require('../experiences/pi/it/NativeItalyApp');
  return { default: typeof loaded === 'function' ? loaded : loaded.default };
};
export const loadCzech = async (): Promise<
  Pick<typeof import('../experiences/pi/cz/evo-2027/NativeCzechApp'), 'default'>
> => {
  const loaded = require('../experiences/pi/cz/evo-2027/NativeCzechApp');
  return { default: typeof loaded === 'function' ? loaded : loaded.default };
};
export const loadKids = async (): Promise<
  Pick<typeof import('../experiences/kids-pi/NativeKidsApp'), 'default'>
> => {
  const loaded = require('../experiences/kids-pi/NativeKidsApp');
  return { default: typeof loaded === 'function' ? loaded : loaded.default };
};
export const loadCurrent = async (): Promise<
  Pick<typeof import('./CurrentApplication'), 'default'>
> => {
  const loaded = require('./CurrentApplication');
  return { default: typeof loaded === 'function' ? loaded : loaded.default };
};
