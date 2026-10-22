import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Svg, { G, Path } from 'react-native-svg';
import { BaselineUniCreditLogo } from '../src/universal/BaselineUniCreditLogo';
import { SourceLogo } from '../src/experiences/pi/current/profile/SourceLogo';
import { SourceLogo as CzechSourceLogo } from '../src/experiences/pi/cz/evo-2027/profile/SourceLogo';
import { sourceColor } from '../src/universal/sourceColor';

function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

it('preserves the existing vector geometry and default wordmark dimensions', () => {
  const original = mount(<SourceLogo />);
  const logo = mount(<BaselineUniCreditLogo />);
  try {
    const svg = logo.root.findByType(Svg);
    expect([svg.props.width, svg.props.height, svg.props.viewBox]).toEqual([
      174,
      24,
      '0 0 174 24',
    ]);
    expect(logo.root.findAllByType(Path).map(path => path.props.d)).toEqual(
      original.root.findAllByType(Path).map(path => path.props.d),
    );
    expect(
      logo.root.findAllByType(G).map(group => group.props.transform),
    ).toEqual(
      original.root.findAllByType(G).map(group => group.props.transform),
    );
    expect(svg.props.accessible).toBe(false);
    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  } finally {
    act(() => {
      original.unmount();
      logo.unmount();
    });
  }
});

it.each([false, true])(
  'resolves existing web color tokens in dark=%s',
  dark => {
    const logo = mount(
      <BaselineUniCreditLogo dark={dark} textColor="var(--uc-text)" />,
    );
    try {
      const paths = logo.root.findAllByType(Path);
      expect(paths.slice(0, 2).map(path => path.props.fill)).toEqual([
        '#e2001a',
        '#e2001a',
      ]);
      expect(paths[2].props.fill).toBe('#ffffff');
      expect(paths.slice(3).map(path => path.props.fill)).toEqual(
        Array(13).fill(sourceColor('var(--uc-text)', dark)),
      );
    } finally {
      act(() => logo.unmount());
    }
  },
);

it.each([SourceLogo, CzechSourceLogo])(
  'uses the canonical DS renderer through the existing SourceLogo API',
  Adapter => {
    const tree = mount(
      <Adapter
        color="#123456"
        width={145}
        height={20}
        ariaLabel="UniCredit Bank"
      />,
    );
    try {
      expect(tree.root.findAllByType(BaselineUniCreditLogo)).toHaveLength(1);
      const paths = tree.root.findAllByType(Path);
      expect(paths.map(path => path.props.fill)).toEqual([
        '#e2001a',
        '#e2001a',
        '#ffffff',
        ...Array(13).fill('#123456'),
      ]);
      const svg = tree.root.findByType(Svg);
      expect([
        svg.props.width,
        svg.props.height,
        svg.props.accessibilityLabel,
      ]).toEqual([145, 20, 'UniCredit Bank']);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('supports meaningful naming and proportional sizing without changing artwork', () => {
  const label = 'UniCredit Bank — Romanian banking services';
  const logo = mount(<BaselineUniCreditLogo />);
  try {
    const paths = logo.root.findAllByType(Path).map(path => path.props.d);
    act(() => {
      logo.update(
        <BaselineUniCreditLogo
          ariaLabel={label}
          textColor="#111111"
          width={145}
          height={20}
          style={{ opacity: 0.75 }}
        />,
      );
    });
    const svg = logo.root.findByType(Svg);
    expect(svg.props.accessible).toBe(true);
    expect(svg.props.accessibilityRole).toBe('image');
    expect(svg.props.accessibilityLabel).toBe(label);
    expect(svg.props.accessibilityElementsHidden).toBe(false);
    expect(svg.props.importantForAccessibility).toBe('yes');
    expect([svg.props.width, svg.props.height]).toEqual([145, 20]);
    expect(svg.props.style).toEqual({ opacity: 0.75 });
    expect(logo.root.findAllByType(Path).map(path => path.props.d)).toEqual(
      paths,
    );
    expect(
      logo.root
        .findAllByType(Path)
        .slice(3)
        .every(path => path.props.fill === '#111111'),
    ).toBe(true);
  } finally {
    act(() => logo.unmount());
  }
});
