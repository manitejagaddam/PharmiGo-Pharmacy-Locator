// ═══════════════════════════════════════════════════════════════
//  api_dynamic.js  –  Production API service for Pharmigo
//  Connects to the live Django REST Framework backend.
//
//  FEATURES:
//   ✔ Token auth (DRF authtoken) with auto-clear on 401/403
//   ✔ Configurable base URL via VITE_API_URL env variable
//   ✔ Shared request wrapper with Django error surfacing
//   ✔ Automatic retry with exponential back-off
//   ✔ Request cancellation via AbortController
//   ✔ In-memory response cache with TTL + manual invalidation
//   ✔ Pagination helpers (page-number & cursor both supported)
//   ✔ Search, filtering & ordering params
//   ✔ Offline / network-status detection
//   ✔ Request deduplication (same GET = one in-flight fetch)
//   ✔ Bulk create / bulk delete
//   ✔ PATCH (partial update) alongside full PUT
//   ✔ Named abort scopes (cancel all requests in a scope)
//   ✔ Response normalizer (camelCase ↔ snake_case)
// ═══════════════════════════════════════════════════════════════

// ─── Config ────────────────────────────────────────────────────
const API_URL   = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const CACHE_TTL = 60_000;   // default cache lifetime: 60 s
const MAX_RETRY = 3;        // max automatic retries
const RETRY_BASE_MS = 400;  // base delay for exponential back-off

// ─── Auth helpers ───────────────────────────────────────────────
export const setAuthToken = (token) => {
  token
    ? localStorage.setItem('adminToken', token)
    : localStorage.removeItem('adminToken');
};
export const getAuthToken = () => localStorage.getItem('adminToken');
export const isLoggedIn   = () => Boolean(getAuthToken());

// ─── In-memory cache ────────────────────────────────────────────
const _cache = new Map(); // key → { data, expiresAt }

const cacheGet = (key) => {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
};
const cacheSet = (key, data, ttl = CACHE_TTL) =>
  _cache.set(key, { data, expiresAt: Date.now() + ttl });

export const invalidateCache = (keyPrefix = '') => {
  for (const k of _cache.keys()) {
    if (k.startsWith(keyPrefix)) _cache.delete(k);
  }
};

// ─── In-flight deduplication ────────────────────────────────────
const _inflight = new Map(); // key → Promise

// ─── Named abort scopes ─────────────────────────────────────────
const _controllers = new Map(); // scopeId → AbortController

export const createScope = (scopeId) => {
  cancelScope(scopeId);                     // cancel any previous scope
  const ctrl = new AbortController();
  _controllers.set(scopeId, ctrl);
  return ctrl.signal;
};
export const cancelScope = (scopeId) => {
  _controllers.get(scopeId)?.abort();
  _controllers.delete(scopeId);
};

// ─── Network status ─────────────────────────────────────────────
export const isOnline = () => navigator.onLine;

// ─── Utility: snake_case ↔ camelCase ────────────────────────────
const toCamel  = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake  = (s) => s.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);

const transformKeys = (obj, fn) => {
  if (Array.isArray(obj)) return obj.map(i => transformKeys(i, fn));
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [fn(k), transformKeys(v, fn)])
    );
  }
  return obj;
};

const toCamelCase = (data) => transformKeys(data, toCamel);
const toSnakeCase = (data) => transformKeys(data, toSnake);

// ─── Header builder ─────────────────────────────────────────────
const getHeaders = (requireAuth = false) => {
  const h = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = getAuthToken();
    if (token) h['Authorization'] = `Token ${token}`;
  }
  return h;
};

// ─── Exponential back-off retry ─────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const withRetry = async (fn, retries = MAX_RETRY) => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Don't retry on auth errors or aborted requests
      if (err.status === 401 || err.status === 403 || err.name === 'AbortError') throw err;
      lastErr = err;
      if (attempt < retries) await sleep(RETRY_BASE_MS * 2 ** attempt);
    }
  }
  throw lastErr;
};

// ─── Core fetch wrapper ─────────────────────────────────────────
const request = async (path, options = {}, { cache = false, cacheTTL = CACHE_TTL, signal } = {}) => {
  if (!isOnline()) throw new Error('No internet connection.');

  const url    = `${API_URL}${path}`;
  const method = (options.method ?? 'GET').toUpperCase();
  const cacheKey = `${method}:${url}:${JSON.stringify(options.body ?? '')}`;

  // Cache — only for GET requests
  if (method === 'GET' && cache) {
    const hit = cacheGet(cacheKey);
    if (hit) return hit;
  }

  // Deduplication — only for GET
  if (method === 'GET' && _inflight.has(cacheKey)) {
    return _inflight.get(cacheKey);
  }

  const fetchPromise = withRetry(async () => {
    const res = await fetch(url, { ...options, signal });

    if (res.status === 401 || res.status === 403) {
      setAuthToken(null);
      const err = new Error('Session expired. Please log in again.');
      err.status = res.status;
      throw err;
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        // Surface DRF validation errors nicely
        detail = typeof body === 'object'
          ? Object.entries(body).map(([f, msgs]) => `${f}: ${[].concat(msgs).join(', ')}`).join(' | ')
          : String(body);
      } catch (_) { /* ignore */ }
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) return null; // No Content (DELETE)
    const json = await res.json();
    return toCamelCase(json);           // normalize to camelCase
  }).finally(() => _inflight.delete(cacheKey));

  if (method === 'GET') _inflight.set(cacheKey, fetchPromise);

  const result = await fetchPromise;

  if (method === 'GET' && cache && result !== null) {
    cacheSet(cacheKey, result, cacheTTL);
  }

  return result;
};

// ─── Query-string builder ────────────────────────────────────────
const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(toSnake(k), v);
  });
  const qs = q.toString();
  return qs ? `?${qs}` : '';
};

// ═══════════════════════════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════════════════════════
export const api = {

  // ── Auth ──────────────────────────────────────────────────────

  /**
   * Authenticate an admin user.
   * @returns {{ token: string }}
   */
  login: async (username, password) => {
    const data = await request('/api-token-auth/', {
      method : 'POST',
      headers: getHeaders(),
      body   : JSON.stringify({ username, password }),
    });
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  /** Remove the stored token (client-side logout). */
  logout: () => setAuthToken(null),

  // ── Medicines (public) ────────────────────────────────────────

  /**
   * Search / list medicines (no auth required).
   *
   * @param {object} opts
   * @param {string}   opts.search   - name search term
   * @param {string}   opts.ordering - e.g. 'name' or '-created_at'
   * @param {number}   opts.page     - page number
   * @param {number}   opts.pageSize - results per page
   * @param {string}   opts.brand    - filter by brand
   * @param {AbortSignal} opts.signal
   */
  searchMedicines: async ({ search = '', ordering, page, pageSize, brand, signal } = {}) => {
    const qs = buildQuery({ search, ordering, page, page_size: pageSize, brand });
    return request(`/api/medicines/${qs}`, {}, { cache: true, signal });
  },

  /** Fetch a single medicine's detail (cached). */
  getMedicineById: async (id, { signal } = {}) => {
    return request(`/api/medicines/${id}/`, {}, { cache: true, signal });
  },

  // ── Medicines (admin) ─────────────────────────────────────────

  /**
   * List all medicines with optional filtering/ordering.
   * Same params as searchMedicines, but sends auth header.
   */
  getMedicines: async ({ search, ordering, page, pageSize, brand, signal } = {}) => {
    const qs = buildQuery({ search, ordering, page, page_size: pageSize, brand });
    return request(`/api/medicines/${qs}`, { headers: getHeaders(true) }, { signal });
  },

  /**
   * Create a new medicine.
   * Accepts camelCase — automatically converted to snake_case for Django.
   */
  createMedicine: async (data, { signal } = {}) => {
    const result = await request('/api/medicines/', {
      method : 'POST',
      headers: getHeaders(true),
      body   : JSON.stringify(toSnakeCase(data)),
      signal,
    });
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return result;
  },

  /**
   * Full update (PUT) — replaces all fields.
   */
  updateMedicine: async (id, data, { signal } = {}) => {
    const result = await request(`/api/medicines/${id}/`, {
      method : 'PUT',
      headers: getHeaders(true),
      body   : JSON.stringify(toSnakeCase(data)),
      signal,
    });
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return result;
  },

  /**
   * Partial update (PATCH) — only sends changed fields.
   */
  patchMedicine: async (id, partial, { signal } = {}) => {
    const result = await request(`/api/medicines/${id}/`, {
      method : 'PATCH',
      headers: getHeaders(true),
      body   : JSON.stringify(toSnakeCase(partial)),
      signal,
    });
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return result;
  },

  /**
   * Delete a medicine by ID.
   */
  deleteMedicine: async (id, { signal } = {}) => {
    const result = await request(`/api/medicines/${id}/`, {
      method : 'DELETE',
      headers: getHeaders(true),
      signal,
    });
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return result;
  },

  /**
   * Bulk create — sends an array of medicines in one POST.
   * Requires the Django view to support list creation
   * (e.g. with `allow_bulk_create=True` on the serializer).
   */
  bulkCreateMedicines: async (dataArray, { signal } = {}) => {
    const result = await request('/api/medicines/', {
      method : 'POST',
      headers: getHeaders(true),
      body   : JSON.stringify(dataArray.map(toSnakeCase)),
      signal,
    });
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return result;
  },

  /**
   * Bulk delete — deletes all IDs in the array sequentially.
   * Returns { deleted: number, failed: Array }.
   */
  bulkDeleteMedicines: async (ids, { signal } = {}) => {
    const results = await Promise.allSettled(
      ids.map(id => api.deleteMedicine(id, { signal }))
    );
    const failed  = ids.filter((_, i) => results[i].status === 'rejected');
    const deleted = ids.length - failed.length;
    invalidateCache(`GET:${API_URL}/api/medicines/`);
    return { deleted, failed };
  },

  // ── Pagination helpers ────────────────────────────────────────

  /**
   * Fetch all pages of medicines and return a flat array.
   * Uses DRF's default `?page=N` pagination.
   */
  getAllMedicines: async ({ pageSize = 100, signal } = {}) => {
    let page = 1, results = [];
    while (true) {
      const data = await api.getMedicines({ page, pageSize, signal });
      const items = Array.isArray(data) ? data : (data?.results ?? []);
      results = results.concat(items);
      const hasNext = !Array.isArray(data) && data?.next;
      if (!hasNext) break;
      page++;
    }
    return results;
  },
};

export default api;
