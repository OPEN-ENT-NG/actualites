import type { Environment } from 'vitest/environments';
import { builtinEnvironments } from 'vitest/environments';

const { jsdom } = builtinEnvironments;

/**
 * jsdom environment keeping Node's native AbortController / AbortSignal.
 *
 * The default jsdom environment replaces them with jsdom's implementation,
 * while `Request` / `fetch` remain Node's native (undici) ones. Since Node 24,
 * undici rejects any signal that is not one of its own AbortSignal
 * ("RequestInit: Expected signal to be an instance of AbortSignal"),
 * which breaks react-router navigations (`new Request(url, { signal })`).
 */
export default <Environment>{
  ...jsdom,
  name: 'jsdom-native-abort',
  async setup(global, options) {
    const { AbortController, AbortSignal } = global;
    const env = await jsdom.setup(global, options);
    global.AbortController = AbortController;
    global.AbortSignal = AbortSignal;
    return env;
  },
};
