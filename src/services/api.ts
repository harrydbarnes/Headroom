import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { fromProvider } from '../lib/finance';
export type Bank = {
  name: string;
  country: string;
  methods: { name: string; requiresInput: boolean }[];
};
export type Connection = {
  id: string;
  provider: string;
  expires: string;
  lastSync: string | null;
  accounts: { name: string; currency: string }[];
};
export type SyncOutcome = {
  id: string;
  provider: string;
  status: 'success' | 'cached' | 'partial' | 'failed' | 'expired';
  lastSync: string | null;
  count: number;
};
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
async function credentials() {
  const saved = await SecureStore.getItemAsync('headroomConnection');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.origin === 'string' && typeof parsed.token === 'string') {
        return parsed as { origin: string; token: string };
      }
    } catch {
      // Fall through to legacy keys if stored JSON is corrupted.
    }
  }
  return {
    origin: await SecureStore.getItemAsync('apiOrigin'),
    token: await SecureStore.getItemAsync('deviceToken'),
  };
}
export async function savedConnection() {
  const { origin, token } = await credentials();
  return { origin: origin || '', paired: !!origin && !!token };
}
export async function saveConnection(url: string, token: string) {
  const u = new URL(url.trim());
  if (
    u.protocol !== 'https:' ||
    u.username ||
    u.password ||
    u.pathname !== '/' ||
    u.search ||
    u.hash
  )
    throw Error('Use your finance API HTTPS origin, with no path.');
  if (typeof token !== 'string' || token.trim().length < 43)
    throw Error('Use the server device token (at least 43 characters).');
  await SecureStore.setItemAsync(
    'headroomConnection',
    JSON.stringify({ origin: u.origin, token: token.trim() }),
  );
}
export async function forgetConnection() {
  await SecureStore.deleteItemAsync('deviceToken');
  await SecureStore.deleteItemAsync('apiOrigin');
  await SecureStore.deleteItemAsync('headroomConnection');
}
export async function api(path: string, method = 'GET', body?: unknown) {
  const { origin, token } = await credentials();
  if (!origin || !token) throw Error('Pair your finance server in Settings first.');
  const r = await fetchWithTimeout(
    origin + path,
    {
      method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    },
    120000,
  );
  let data;
  try {
    data = await r.json();
  } catch {
    throw Error(
      'Your finance server returned an unreadable response. Check its HTTPS address and try again.',
    );
  }
  if (!r.ok) throw Error(data.error || 'The finance API could not complete this request.');
  return data;
}
export async function sync(id?: string) {
  const d = await api('/api/banking/sync', 'POST', id ? { id } : undefined);
  return {
    rows: (d.rows || []).map(fromProvider).filter((r: any) => r !== null),
    warnings: (d.warnings || []) as string[],
    outcomes: (d.outcomes || []) as SyncOutcome[],
  };
}
export async function connectBank(bank: string) {
  const { url } = await api('/mobile/launch', 'POST', { bank });
  await WebBrowser.openBrowserAsync(url);
}
