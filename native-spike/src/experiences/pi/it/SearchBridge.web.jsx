import React, { useContext } from 'react';
import { useDemo } from '@/app/state/demoStore';
import ReferenceSearch from '@/experiences/pi/it/mobile-first/MobileFirstSearch';
import Search from './Search';
import { SearchRendererContext } from './rendererContext';

/** Browser migration bridge: keep the canonical Home callbacks and destination views. */
export default function SearchBridge(props) {
  const renderer = useContext(SearchRendererContext);
  const { amountsHidden } = useDemo();
  return renderer === 'reference' ? (
    <ReferenceSearch {...props} />
  ) : (
    <div className="shared-search-root">
      <Search {...props} amountsHidden={amountsHidden} systemInsetTop={70} />
    </div>
  );
}
