import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { strFromU8 } from 'fflate';
import { InvestmentContract } from '../src/experiences/pi/cz/evo-2027/robo/InvestmentContract';
import { Copy } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { shareDemoFile } from '../src/platform/nativeFiles';

jest.mock('../src/platform/nativeFiles', () => ({
  shareDemoFile: jest.fn().mockResolvedValue(undefined),
}));

const mounted: Renderer.ReactTestRenderer[] = [];
const share = jest.mocked(shareDemoFile);

function renderContract(onConfirm = jest.fn(), screenTopInset = 0) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <InvestmentContract
        onClose={jest.fn()}
        onConfirm={onConfirm}
        screenTopInset={screenTopInset}
      />,
    );
  });
  mounted.push(tree);
  return tree;
}

function buttons(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );
}

function scroll(
  tree: Renderer.ReactTestRenderer,
  offset: number,
  viewport = 600,
  content = 3000,
) {
  act(() => {
    tree.root
      .findByProps({ testID: 'cz-investment-contract-scroll' })
      .props.onScroll({
        nativeEvent: {
          contentOffset: { y: offset },
          layoutMeasurement: { height: viewport },
          contentSize: { height: content },
        },
      });
  });
}

beforeEach(() => jest.clearAllMocks());
afterEach(() => {
  act(() => mounted.splice(0).forEach(tree => tree.unmount()));
});

describe('CZ Robo investment account contract document', () => {
  it('renders a substantial readable demo document in the existing safe sheet', () => {
    const tree = renderContract();
    const document = tree.root.findByProps({
      testID: 'cz-investment-contract-scroll',
    });
    const copy = document
      .findAllByType(Copy)
      .map(node => node.props.children)
      .join('\n');
    expect(copy).toContain('Demonstration document');
    expect(copy).toContain('1. Parties and purpose');
    expect(copy).toContain('8. Closing the account and acknowledgement');
    expect(copy).toContain('End of demonstration document');
    expect(copy.length).toBeGreaterThan(4500);
    expect(
      document.findAllByType(Copy).filter(node => node.props.header),
    ).toHaveLength(9);
    expect(tree.root.findByType(BaselineBottomSheet).props).toMatchObject({
      fillHeight: true,
      maxHeightOffsetPx: 72,
    });
    expect(buttons(tree, 'Download document')).not.toHaveLength(0);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
  });

  it('requires positive scrolling to the document end before showing confirmation', () => {
    const onConfirm = jest.fn();
    const tree = renderContract(onConfirm);
    scroll(tree, 0, 600, 600);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
    scroll(tree, 10, 600, 600);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
    scroll(tree, 0);
    scroll(tree, 400);
    scroll(tree, 2390);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
    expect(onConfirm).not.toHaveBeenCalled();

    scroll(tree, 2400);
    const confirm = buttons(tree, 'I have read it')[0];
    expect(confirm).toBeDefined();
    expect(confirm.props.disabled).not.toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
    scroll(tree, 0);
    expect(buttons(tree, 'I have read it')).not.toHaveLength(0);
    act(() => buttons(tree, 'I have read it')[0].props.onPress());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('requires reading again after the contract is closed and reopened', () => {
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Pressable
            accessibilityLabel="Open contract"
            onPress={() => setOpen(true)}
          />
          {open ? (
            <InvestmentContract
              onClose={() => setOpen(false)}
              onConfirm={jest.fn()}
              screenTopInset={80}
            />
          ) : null}
        </>
      );
    }
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<Host />);
    });
    mounted.push(tree);
    expect(
      tree.root.findByType(BaselineBottomSheet).props.maxHeightOffsetPx,
    ).toBe(96);
    scroll(tree, 2400);
    expect(buttons(tree, 'I have read it')).not.toHaveLength(0);
    act(() => tree.root.findByType(BaselineBottomSheet).props.onClose());
    expect(tree.root.findAllByType(InvestmentContract)).toHaveLength(0);
    act(() => buttons(tree, 'Open contract')[0].props.onPress());
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
    scroll(tree, 400);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
  });

  it('downloads the same complete clauses as a paginated PDF without accepting them', async () => {
    const onConfirm = jest.fn();
    const tree = renderContract(onConfirm);
    await act(async () =>
      buttons(tree, 'Download document')[0].props.onPress(),
    );
    expect(share).toHaveBeenCalledWith(
      'investment-account-terms-demo.pdf',
      'application/pdf',
      expect.any(Uint8Array),
    );
    const pdf = strFromU8(share.mock.calls[0][2]);
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('Demonstration document');
    expect(pdf).toContain('1. Parties and purpose');
    expect(pdf).toContain('8. Closing the account and acknowledgement');
    expect(pdf).toContain('End of demonstration document');
    expect(pdf.match(/\/Type \/Page /g)!.length).toBeGreaterThan(1);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps a failed download retryable and clears the error after a successful retry', async () => {
    share.mockRejectedValueOnce(new Error('Sharing unavailable'));
    const tree = renderContract();
    await act(async () =>
      buttons(tree, 'Download document')[0].props.onPress(),
    );
    const error = () =>
      tree.root
        .findAllByType(Copy)
        .filter(
          node =>
            node.props.children ===
            'The document could not be downloaded. Try again.',
        );
    expect(error()).toHaveLength(1);
    await act(async () =>
      buttons(tree, 'Download document')[0].props.onPress(),
    );
    expect(error()).toHaveLength(0);
    expect(buttons(tree, 'I have read it')).toHaveLength(0);
  });
});
