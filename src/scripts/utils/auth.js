const AUTH_KEY = 'dicoding_story_auth';

export function isLoggedIn() {
  return !!getToken();
}

export function getToken() {
  const auth = getAuth();
  return auth ? auth.token : null;
}

export function getUser() {
  const auth = getAuth();
  return auth ? { name: auth.name, userId: auth.userId } : null;
}

export function setAuth(loginResult) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(loginResult));
}

export function removeAuth() {
  localStorage.removeItem(AUTH_KEY);
}

function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}
