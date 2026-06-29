export async function loginWithGoogleIdToken(idToken) {
  
  const baseUrl = "https://aigendaweb.runasp.net"; 

  const res = await fetch(`${baseUrl}/api/Auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || 'Google login failed');
  }

  return res.json(); 
}