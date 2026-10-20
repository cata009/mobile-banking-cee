import type { ImageSourcePropType } from 'react-native';
import huCardBackground from '@/assets/kids/figma/hu-card-bg-cat.png';
import contactsBuilding from '@/assets/98dd23c242155a923a78eda01f9320afee4330eb.png';

/** The same original image modules are registration IDs in Metro and URLs in Vite. */
export function kidsImageSource(value: number | string): ImageSourcePropType {
  return typeof value === 'number' ? value : { uri: value };
}
export const kidsAssets = {
  huCardBackground: kidsImageSource(huCardBackground),
  contactsBuilding: kidsImageSource(contactsBuilding),
};
