// Login state lives in localStorage so it survives a page refresh.
// One session at a time: logging in as a customer replaces a seller session and vice versa.
const KEYS = { access: 'access', refresh: 'refresh', role: 'role' };

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode): the session just won't persist */
  }
}

export const session = {
  get access() {
    return safeGet(KEYS.access);
  },
  get refresh() {
    return safeGet(KEYS.refresh);
  },
  get role() {
    return safeGet(KEYS.role);
  },
  save({ access, refresh, role }) {
    safeSet(KEYS.access, access);
    if (refresh !== undefined) safeSet(KEYS.refresh, refresh);
    if (role !== undefined) safeSet(KEYS.role, role);
  },
  clear() {
    Object.values(KEYS).forEach((key) => safeSet(key, null));
    safeSet('userEmail', null); // left over from the old frontend
  },
};
