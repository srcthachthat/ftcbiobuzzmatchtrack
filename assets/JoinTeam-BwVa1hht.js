import { j as e, c as useNavigate, R as ROUTES } from "./index-CrUxzRby.js";

function JoinTeamPage() {
  const navigate = useNavigate();
  return e.jsx("div", {
    style: { maxWidth: 600, margin: "60px auto", padding: "0 24px", textAlign: "center" },
    children: e.jsxs("div", {
      style: { backgroundColor: "#0c0c0c", border: "1px solid #daa520", borderRadius: 16, padding: 40 },
      children: [
        e.jsx("h2", { style: { color: "#ffffff", fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: "SRC 28785 BIOBUZZ" }),
        e.jsx("p", { style: { color: "#a3a3a3", marginBottom: 24 }, children: "Welcome to SRC 28785 Match Tracker." }),
        e.jsx("button", {
          onClick: () => navigate(ROUTES.SESSIONS),
          style: { padding: "12px 24px", borderRadius: 10, border: "1px solid #daa520", backgroundColor: "#daa520", color: "#000000", fontWeight: 700, cursor: "pointer" },
          children: "Go to Sessions"
        })
      ]
    })
  });
}

export { JoinTeamPage as default };
