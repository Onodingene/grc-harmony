// Opens an uploaded evidence file without tripping ngrok's browser-warning
// interstitial. A plain <a> navigation can't send the ngrok-skip header, so
// ngrok shows its warning page instead of the file. Instead we fetch the file
// (with the header), turn it into a blob URL, and open that.

// Files are served at <host>/uploads/... — strip a trailing /api from the API base.
const FILE_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "");

export async function openEvidence(pathOrUrl: string): Promise<void> {
  const fullUrl = /^https?:\/\//.test(pathOrUrl)
    ? pathOrUrl
    : `${FILE_BASE}${pathOrUrl}`;

  // Open the tab synchronously (inside the click) so it isn't popup-blocked,
  // then point it at the blob once the fetch resolves.
  const win = window.open("", "_blank");

  try {
    const res = await fetch(fullUrl, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    if (win) win.location.href = objUrl;
    else window.open(objUrl, "_blank", "noopener,noreferrer");
    // Revoke later so the opened tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(objUrl), 60_000);
  } catch {
    // Fallback: navigate directly (may show the ngrok warning, but still works).
    if (win) win.location.href = fullUrl;
    else window.open(fullUrl, "_blank", "noopener,noreferrer");
  }
}
