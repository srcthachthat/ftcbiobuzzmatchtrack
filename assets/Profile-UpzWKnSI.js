import { j as e, u as useAuth, c as useNavigate, R as ROUTES, a as useTheme } from "./index-CrUxzRby.js";
import { r as React } from "./vendor-react-BrRUuK2M.js";

function ProfilePage() {
  const { user, signOut, updateUserDisplayName, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [editing, setEditing] = React.useState(false);
  const [nameInput, setNameInput] = React.useState((user && user.displayName) || "");
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState("");

  React.useEffect(() => {
    if (user && user.displayName) setNameInput(user.displayName);
  }, [user]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      await updateUserDisplayName(nameInput.trim());
      setSavedMsg("Saved!");
      setEditing(false);
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return e.jsx("div", {
      style: { maxWidth: 600, margin: "60px auto", padding: "0 24px", textAlign: "center" },
      children: e.jsxs("div", {
        style: { backgroundColor: "#0c0c0c", border: "1px solid #daa520", borderRadius: 16, padding: 40 },
        children: [
          e.jsx("h2", { style: { color: "#ffffff", fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: "Not Signed In" }),
          e.jsx("p", { style: { color: "#a3a3a3", marginBottom: 24 }, children: "Sign in to manage your profile and sync sessions across devices." }),
          e.jsx("button", {
            onClick: () => openAuthModal("signin"),
            style: { padding: "12px 24px", borderRadius: 10, border: "1px solid #daa520", backgroundColor: "#daa520", color: "#000000", fontWeight: 700, cursor: "pointer" },
            children: "Sign In"
          })
        ]
      })
    });
  }

  return e.jsx("div", {
    style: { maxWidth: 680, margin: "40px auto", padding: "0 24px 60px" },
    children: e.jsxs("div", {
      style: { backgroundColor: "#0c0c0c", border: "1px solid #daa520", borderRadius: 16, padding: 32 },
      children: [
        e.jsx("h1", { style: { color: "#ffffff", fontSize: 28, fontWeight: 700, margin: "0 0 24px 0" }, children: "Account Profile" }),
        e.jsxs("div", {
          style: { display: "flex", flexDirection: "column", gap: 20 },
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("div", { style: { fontSize: 12, fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase", marginBottom: 6 }, children: "Email" }),
                e.jsx("div", { style: { fontSize: 16, color: "#ffffff", fontWeight: 500 }, children: user.email || "—" })
              ]
            }),
            e.jsxs("div", {
              children: [
                e.jsx("div", { style: { fontSize: 12, fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase", marginBottom: 6 }, children: "Display Name" }),
                editing ? e.jsxs("div", {
                  style: { display: "flex", gap: 10, alignItems: "center" },
                  children: [
                    e.jsx("input", {
                      value: nameInput,
                      onChange: (ev) => setNameInput(ev.target.value),
                      style: { padding: "8px 12px", borderRadius: 8, border: "1px solid #daa520", backgroundColor: "#141414", color: "#ffffff", fontSize: 15, outline: "none" }
                    }),
                    e.jsx("button", {
                      onClick: handleSaveName,
                      disabled: saving,
                      style: { padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#daa520", color: "#000000", fontWeight: 700, cursor: "pointer" },
                      children: saving ? "Saving..." : "Save"
                    }),
                    e.jsx("button", {
                      onClick: () => setEditing(false),
                      style: { padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "transparent", color: "#ffffff", cursor: "pointer" },
                      children: "Cancel"
                    })
                  ]
                }) : e.jsxs("div", {
                  style: { display: "flex", alignItems: "center", gap: 12 },
                  children: [
                    e.jsx("span", { style: { fontSize: 16, color: "#ffffff", fontWeight: 500 }, children: user.displayName || "Team Member" }),
                    e.jsx("button", {
                      onClick: () => setEditing(true),
                      style: { padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(218,165,32,0.5)", backgroundColor: "transparent", color: "#daa520", fontSize: 12, fontWeight: 600, cursor: "pointer" },
                      children: "Edit"
                    }),
                    savedMsg && e.jsx("span", { style: { fontSize: 13, color: "#22c55e" }, children: savedMsg })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              style: { display: "flex", gap: 12, marginTop: 16, paddingTop: 20, borderTop: "1px solid rgba(218,165,32,0.25)" },
              children: [
                e.jsx("button", {
                  onClick: () => navigate(ROUTES.SESSIONS),
                  style: { padding: "10px 20px", borderRadius: 10, border: "1px solid #daa520", backgroundColor: "#daa520", color: "#000000", fontWeight: 700, cursor: "pointer" },
                  children: "View My Sessions"
                }),
                e.jsx("button", {
                  onClick: async () => { await signOut(); navigate(ROUTES.HOME); },
                  style: { padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 600, cursor: "pointer" },
                  children: "Sign Out"
                })
              ]
            })
          ]
        })
      ]
    })
  });
}

export { ProfilePage as default };
