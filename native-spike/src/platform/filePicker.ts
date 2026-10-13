import { NativeModules } from 'react-native';
export interface PickedDemoFile {
  uri: string;
  name: string;
  mime: string;
  size: number;
}
export async function pickLocalDocument(
  imagesOnly = false,
): Promise<PickedDemoFile | null> {
  const device = NativeModules.CeeDemoDevice as
    | {
        pickLocalDocument?: (
          imagesOnly: boolean,
        ) => Promise<PickedDemoFile | null>;
      }
    | undefined;
  if (!device?.pickLocalDocument)
    throw new Error('Selezione documenti non disponibile');
  return device.pickLocalDocument(imagesOnly);
}
