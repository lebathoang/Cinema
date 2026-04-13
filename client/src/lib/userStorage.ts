export const USER_STORAGE_KEY = "user";
export const USER_UPDATED_EVENT = "user-updated";

export type StoredUser = {
  id?: string;
  fullname?: string;
  email?: string;
  avatar?: string;
  age?: number | null;
  phone?: string | null;
  address?: string | null;
  membership?: string;
  points?: number;
  [key: string]: unknown;
};

export function getStoredUser(): StoredUser {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return {};
  }

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return {};
  }
}

export function setStoredUser(user: StoredUser) {
  const normalizedUser =
    user && typeof user === "object" && Object.keys(user).length ? user : {};

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: normalizedUser }));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: null }));
}
