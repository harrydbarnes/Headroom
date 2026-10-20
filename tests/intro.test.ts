import {beforeEach, expect, it, vi} from 'vitest';
import type {ReactElement} from 'react';

const state = vi.hoisted(() => ({
  reducedMotion: true,
  visible: true,
  refs: [] as {current: any}[],
  cursor: 0,
  effect: null as null | (() => void | (() => void)),
  cleanup: undefined as void | (() => void),
  finish: null as null | ((result: {finished: boolean}) => void),
  starts: 0,
  stops: 0,
}));

vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useRef: (initial: unknown) => state.refs[state.cursor++] ??= {current: initial},
  useEffect: (effect: () => void | (() => void)) => {state.effect = effect;},
}));
vi.mock('react-native', () => ({
  View: 'View', Text: 'Text', ScrollView: 'ScrollView',
  Easing: {out: () => 0, cubic: 0, inOut: () => 0, quad: 0},
  Animated: {
    View: 'AnimatedView',
    Value: class {
      constructor(public value: number) {}
      setValue(value: number) {this.value = value;}
      interpolate() {return 1;}
    },
    timing: () => ({}), delay: () => ({}), spring: () => ({}),
    sequence: () => ({
      start: (finish: (result: {finished: boolean}) => void) => {state.starts++; state.finish = finish;},
      stop: () => {state.stops++; state.finish?.({finished: false});},
    }),
  },
}));
vi.mock('react-native-safe-area-context', () => ({SafeAreaView: 'SafeAreaView'}));
vi.mock('expo-status-bar', () => ({StatusBar: 'StatusBar'}));
vi.mock('../src/ui/theme', () => ({
  styles: {title: {}},
  useTheme: () => ({colors: {}, dark: false, reducedMotion: state.reducedMotion}),
}));
vi.mock('../src/ui/privacy', () => ({useInterfaceVisible: () => state.visible}));
vi.mock('../src/ui/components', () => ({Button: 'Button', Copy: 'Copy'}));
import {Intro} from '../src/ui/Intro';
import {todayCopy} from '../src/strings/today';

beforeEach(() => {
  state.cleanup?.();
  state.refs = []; state.cursor = 0; state.effect = null; state.cleanup = undefined;
  state.finish = null; state.starts = 0; state.stops = 0;
  state.reducedMotion = true; state.visible = true;
});

function render(onStart = vi.fn(), onExample = vi.fn()) {
  state.cursor = 0;
  return Intro({onStart, onExample});
}
function flushEffect() {
  state.cleanup?.();
  state.cleanup = state.effect?.();
}
function content(tree: ReactElement): ReactElement<any> {
  const children = (tree.props as any).children;
  const scroll = children.find((child: ReactElement) => child.type === ('ScrollView' as any));
  const component = scroll.props.children.find((child: ReactElement) => typeof child.type === 'function');
  return component.type(component.props);
}

it('renders the explanation and working actions before any animation effect runs', () => {
  const start = vi.fn(), example = vi.fn();
  const view = content(render(start, example));
  expect(view.type).toBe('View');
  expect(view.props.style).toEqual({gap: 16});
  for (const key of ['pointerEvents', 'accessibilityElementsHidden', 'importantForAccessibility']) {
    expect(view.props).not.toHaveProperty(key);
  }
  const [headline, tagline, setup, demo] = view.props.children;
  expect(headline.props.children).toBe(todayCopy.makeRoomForWhatMatters);
  expect(tagline.props.children).toBe(todayCopy.introTagline);
  setup.props.onPress(); demo.props.onPress();
  expect(start).toHaveBeenCalledOnce(); expect(example).toHaveBeenCalledOnce();
  expect(state.starts).toBe(0);
});

it('can animate after the initial reduced-motion setting resolves to false', () => {
  render(); flushEffect();
  expect(state.starts).toBe(0);
  expect(state.refs.slice(1).map(ref => ref.current.value)).toEqual([1, 1, 1, 0]);
  state.reducedMotion = false;
  render(); flushEffect();
  expect(state.starts).toBe(1);
  state.finish?.({finished: true});
  state.visible = false; render(); flushEffect();
  state.visible = true; render(); flushEffect();
  expect(state.starts).toBe(1);
});

it('finishes quietly when covered without consuming an animation that has not completed', () => {
  state.reducedMotion = false;
  render(); flushEffect();
  state.visible = false;
  render(); flushEffect();
  expect(state.stops).toBe(1);
  expect(state.refs.slice(1).map(ref => ref.current.value)).toEqual([1, 1, 1, 0]);
  state.visible = true;
  render(); flushEffect();
  expect(state.starts).toBe(2);
});
