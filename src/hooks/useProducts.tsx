import { useMemo } from 'react';
import { useProductData } from '@/app/state/demoStore';
import { deriveProductCategories } from '@/features/products/selectors';
import { createProductFormatters } from '@/features/products/formatters';
import { getProductIcon } from '@/app/components/products/productGlyph';

export { deriveProductCategories } from '@/features/products/selectors';

export function useProducts() {
 const {country,release,resolvedProductCounts}=useProductData();
 const categories=useMemo(()=>deriveProductCategories({country,release,resolvedProductCounts}),[country,release,resolvedProductCounts]);
 const formatters=useMemo(()=>createProductFormatters(categories,country,release),[categories,country,release]);
 return useMemo(()=>({categories,getProductIcon,...formatters}),[categories,formatters]);
}
