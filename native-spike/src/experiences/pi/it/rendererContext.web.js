import { createContext } from 'react';
// Separate from the refreshable Search component so HMR cannot split provider identity.
export const SearchRendererContext = createContext('shared');
