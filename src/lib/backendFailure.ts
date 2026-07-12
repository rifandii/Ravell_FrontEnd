export type BackendFailureKind = 'BACKEND_UNAVAILABLE';

export class BackendFailure extends Error {
  readonly kind: BackendFailureKind;

  constructor(kind: BackendFailureKind = 'BACKEND_UNAVAILABLE') {
    super(kind);
    this.name = 'BackendFailure';
    this.kind = kind;
  }
}

export function backendUnavailable(): BackendFailure {
  return new BackendFailure('BACKEND_UNAVAILABLE');
}

export function isBackendUnavailable(error: unknown): error is BackendFailure {
  return error instanceof BackendFailure && error.kind === 'BACKEND_UNAVAILABLE';
}
