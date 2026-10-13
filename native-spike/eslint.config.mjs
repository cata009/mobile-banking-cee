import native from '@react-native/eslint-config/flat';
import { fixupConfigRules } from '@eslint/compat';
export default [
  { ignores: ['dist/**', 'android/**', 'ios/**'] },
  ...fixupConfigRules(native),
];
