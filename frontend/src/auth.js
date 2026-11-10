/*
 * The signed-in session, kept in localStorage so it survives a reload.
 * `token` is the signed session token from the server; `user` is the public
 * profile (id, name, email) used for greetings. Components listen for the
 * `authChange` event to react to signing in or out.
 */

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function signIn({ user, token }) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  window.dispatchEvent(new Event('authChange'));
}

export function signOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
}
