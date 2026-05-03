import CONFIG from '../config.js';
import { getToken } from '../utils/auth.js';

const BASE_URL = CONFIG.BASE_URL;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (json.error) {
    throw new Error(json.message || 'Terjadi kesalahan dari server.');
  }
  return json;
}

export async function register(name, email, password) {
  return fetchJson(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email, password) {
  return fetchJson(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getStories({ page = 1, size = 20, location = 1 } = {}) {
  const token = getToken();
  return fetchJson(
    `${BASE_URL}/stories?page=${page}&size=${size}&location=${location}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function getStoryDetail(id) {
  const token = getToken();
  return fetchJson(`${BASE_URL}/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addStory(formData) {
  const token = getToken();
  return fetchJson(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export async function subscribeNotification({ endpoint, keys }) {
  const token = getToken();
  return fetchJson(`${BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, keys }),
  });
}

export async function unsubscribeNotification(endpoint) {
  const token = getToken();
  return fetchJson(`${BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
}