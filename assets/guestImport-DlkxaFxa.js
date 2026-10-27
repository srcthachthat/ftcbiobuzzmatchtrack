import { E as getGuestSessions, i as firebaseService } from "./index-CrUxzRby.js";

export async function moveGuestSessionsIntoNewAccount(uid, email) {
  try {
    const guestSessions = typeof getGuestSessions === "function" ? getGuestSessions() : [];
    if (!Array.isArray(guestSessions) || guestSessions.length === 0) return;
    for (const s of guestSessions) {
      try {
        const { id, ...rest } = s;
        firebaseService.createSession({
          ...rest,
          userId: uid,
          ...(email ? { userEmail: email } : {})
        }).catch(() => {});
      } catch {
        // Keep local backup intact
      }
    }
  } catch (e) {
    console.warn("Could not sync guest sessions:", e);
  }
}
