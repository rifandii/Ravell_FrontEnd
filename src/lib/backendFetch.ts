import { backendUnavailable, isBackendUnavailable } from './backendFailure';

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export function fetchBackendJson<T>(
  input: string,
  init: NextFetchOptions,
): Promise<T>;
export function fetchBackendJson<T>(
  input: string,
  init: NextFetchOptions,
  options: { allowNotFound: true },
): Promise<T | null>;
export async function fetchBackendJson<T>(
  input: string,
  init: NextFetchOptions,
  options: { allowNotFound?: boolean } = {},
): Promise<T | null> {
  try {
    const response = await fetch(input, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(20_000),
    });
    if (response.status === 404 && options.allowNotFound) {
      return null;
    }
    if (!response.ok) {
      throw backendUnavailable();
    }
    return await response.json() as T;
  } catch (error) {
    if (isBackendUnavailable(error)) {
      throw error;
    }
    throw backendUnavailable();
  }
}
