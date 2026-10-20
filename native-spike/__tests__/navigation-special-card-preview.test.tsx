import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { NavigationDesignSystemPreview } from '../src/app/designSystemPreviews/navigation';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import { resolveCardArtwork } from '@/app/components/contracts/cardArtwork';

it.each([false, true])(
  'uses the existing red standard card for Figma1515:1996 in dark=%s',
  dark => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <NavigationDesignSystemPreview
          componentId="ui.navigation-row"
          variantId="special-card"
          dark={dark}
        />,
      );
    });
    try {
      expect(tree.root.findAllByType(BaselineNavigationRow)).toHaveLength(1);
      expect(tree.root.findByType(BaselineNavigationRow).props.dark).toBe(dark);
      const artwork = tree.root.findByType(BaselineCardArtwork);
      expect(artwork.props).toMatchObject({
        variant: 'mc-debit-standard',
        size: 'figma',
      });
      expect(
        resolveCardArtwork({
          variant: artwork.props.variant,
          size: artwork.props.size,
        }),
      ).toMatchObject({
        width: 64,
        height: 40,
        tone: { pattern: '#E30613' },
      });
    } finally {
      act(() => tree.unmount());
    }
  },
);
