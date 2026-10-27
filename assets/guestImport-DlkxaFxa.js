import { E as getGuestSessions, F as setGuestSessions, i as firebaseService } from "./index-CrUxzRby.js";

export async function moveGuestSessionsIntoNewAccount(uid, email) {
  try {
    const guestSessions = typeof getGuestSessions === "function" ? getGuestSessions() : [];
    if (!Array.isArray(guestSessions) || guestSessions.length === 0) return;
    const remaining = [];
    for (const s of guestSessions) {
      try {
        const { id, ...rest } = s;
        await firebaseService.createSession({
          ...rest,
          userId: uid,
          ...(email ? { userEmail: email } : {})
        });
      } catch {
        remaining.push(s);
      }
    }
    if (typeof setGuestSessions === "function") {
      setGuestSessions(remaining);
    }
  } catch (e) {
    console.warn("Could not import guest sessions:", e);
  }
}
