import { AzureCliCredential, ManagedIdentityCredential } from '@azure/identity';
import ApiError from './ApiError.js';
import { environment, isProduction } from '../config/environment.js';

const ARM_ENDPOINT = 'https://management.azure.com';
const ARM_SCOPE = `${ARM_ENDPOINT}/.default`;
const API_VERSION = '2024-11-01';

// These calls run on the request path, and the Cloudflare failover worker gives
// up on the primary after 5s. A slow Azure call has to time out well before
// that, with room left for the Piston readiness probe after it.
const ARM_TIMEOUT_MS = 2000;

// In production this is the Container App's user-assigned identity (see
// infra/piston.bicep). Locally it uses whoever is logged in to the Azure CLI,
// so the same code can run against a real VM.
let credential;
const getCredential = () => {
  credential ??= isProduction
    ? new ManagedIdentityCredential({ clientId: environment.piston.controlClientId })
    : new AzureCliCredential();
  return credential;
};

const armFetch = async (action, method) => {
  const { token } = await getCredential().getToken(ARM_SCOPE, {
    requestOptions: { timeout: ARM_TIMEOUT_MS },
  });
  const url = `${ARM_ENDPOINT}${environment.piston.vmResourceId}${action}?api-version=${API_VERSION}`;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(ARM_TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw ApiError.internalServerError(
      `Azure answered ${res.status} (${body?.error?.code ?? 'no error code'}) to ${method} ${action}`,
    );
  }
  return res;
};

// One of Azure's power states without the "PowerState/" prefix: running,
// starting, stopping, stopped, deallocating, deallocated. "stopped" means the
// OS shut down but the VM is still allocated and still billed.
export const getVmPowerState = async () => {
  const res = await armFetch('/instanceView', 'GET');
  const view = await res.json();
  const code = view.statuses?.find((status) => status.code?.startsWith('PowerState/'))?.code;
  return code ? code.slice('PowerState/'.length) : 'unknown';
};

// Both return as soon as Azure accepts the operation (202), not when the VM
// has finished changing state.
export const startVm = () => armFetch('/start', 'POST');
export const deallocateVm = () => armFetch('/deallocate', 'POST');
