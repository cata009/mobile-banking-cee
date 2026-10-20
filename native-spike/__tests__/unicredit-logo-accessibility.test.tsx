import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Svg, { Path } from 'react-native-svg';
import { SourceLogo as CurrentLogo } from '../src/experiences/pi/current/profile/SourceLogo';
import { SourceLogo as CzechLogo } from '../src/experiences/pi/cz/evo-2027/profile/SourceLogo';

describe.each([
  ['current', CurrentLogo],
  ['Czech', CzechLogo],
] as const)('%s logo image semantics', (_name, Logo) => {
  it('hides redundant artwork and exposes one optional accessible name', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<Logo />);
    });
    try {
      let svg = tree.root.findByType(Svg);
      expect(svg.props.accessible).toBe(false);
      expect(svg.props.accessibilityElementsHidden).toBe(true);
      expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
      const paths = tree.root.findAllByType(Path).map(path => path.props);
      act(() => {
        tree.update(
          <Logo ariaLabel="UniCredit Bank" width={145} height={20} />,
        );
      });
      svg = tree.root.findByType(Svg);
      expect(svg.props.accessible).toBe(true);
      expect(svg.props.accessibilityRole).toBe('image');
      expect(svg.props.accessibilityLabel).toBe('UniCredit Bank');
      expect(svg.props.accessibilityElementsHidden).toBe(false);
      expect(svg.props.importantForAccessibility).toBe('yes');
      expect(svg.props.width).toBe(145);
      expect(svg.props.height).toBe(20);
      expect(svg.props.viewBox).toBe('0 0 174 24');
      expect(tree.root.findAllByType(Path).map(path => path.props)).toEqual(
        paths,
      );
    } finally {
      act(() => tree.unmount());
    }
  });
});
