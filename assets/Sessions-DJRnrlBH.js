import { r as React, u as useNavigate, L as Link } from "./vendor-react-BrRUuK2M.js";
import { E as getGuestSessions, ar as useSession, R as ROUTES, S as STORAGE_KEYS, j as u } from "./index-CrUxzRby.js";

const Sessions = () => {
  const navigate = useNavigate();
  const { sessionData, hasStarted } = useSession();
  const [sessions, setSessions] = React.useState(() => {
    try {
      return getGuestSessions() || [];
    } catch {
      return [];
    }
  });

  const hasActiveSession =
    sessionData &&
    !sessionData.isSessionCompleted &&
    (hasStarted || (sessionData.matches && sessionData.matches.length > 0));

  const handleDelete = (id) => {
    try {
      const next = sessions.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.GUEST_SESSIONS, JSON.stringify(next));
      setSessions(next);
    } catch (e) {
      console.error(e);
    }
  };

  return u.jsx("div", {
    className: "flex-1 w-full max-w-[1152px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10",
    children: u.jsxs("div", {
      className: "space-y-6",
      children: [
        u.jsxs("div", {
          className: "flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border-2",
          style: {
            backgroundColor: "#0c0c0c",
            borderColor: "#DAA520",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.88)"
          },
          children: [
            u.jsxs("div", {
              children: [
                u.jsx("h1", {
                  className: "text-2xl sm:text-3xl font-montserrat italic font-bold",
                  style: { color: "#FFD700" },
                  children: "Match Sessions"
                }),
                u.jsx("p", {
                  className: "text-sm mt-1",
                  style: { color: "#e5e5e5" },
                  children: "Scienceroboticsclub 28785 — FTC BIOBUZZ Match Tracker"
                })
              ]
            }),
            u.jsx(Link, {
              to: ROUTES.ACTIVE,
              className: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105",
              style: {
                backgroundColor: "#DAA520",
                color: "#0a0a0a",
                boxShadow: "0 4px 14px rgba(218, 165, 32, 0.4)"
              },
              children: hasActiveSession ? "Continue Active Session →" : "+ Start New Session"
            })
          ]
        }),

        hasActiveSession &&
          u.jsxs("div", {
            className: "p-6 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-4",
            style: {
              backgroundColor: "#0c0c0c",
              borderColor: "#22c55e",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.88)"
            },
            children: [
              u.jsxs("div", {
                className: "space-y-1",
                children: [
                  u.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      u.jsx("span", {
                        className: "inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
                      }),
                      u.jsx("span", {
                        className: "text-xs font-bold uppercase tracking-wider text-green-400",
                        children: "Active Session In Progress"
                      })
                    ]
                  }),
                  u.jsx("h2", {
                    className: "text-xl font-bold text-white",
                    children: sessionData.sessionName || "Untitled Session"
                  }),
                  u.jsxs("p", {
                    className: "text-sm",
                    style: { color: "#d4d4d4" },
                    children: [
                      (sessionData.matches ? sessionData.matches.length : 0),
                      " matches recorded"
                    ]
                  })
                ]
              }),
              u.jsx("button", {
                type: "button",
                onClick: () => navigate(ROUTES.ACTIVE),
                className: "px-5 py-2.5 rounded-xl font-bold text-sm",
                style: {
                  backgroundColor: "#22c55e",
                  color: "#0a0a0a"
                },
                children: "Open Active Session"
              })
            ]
          }),

        sessions.length > 0
          ? u.jsx("div", {
              className: "grid gap-4 sm:grid-cols-2",
              children: sessions.map((s) =>
                u.jsxs(
                  "div",
                  {
                    className: "p-5 rounded-2xl border-2 flex flex-col justify-between gap-4",
                    style: {
                      backgroundColor: "#0c0c0c",
                      borderColor: "#DAA520",
                      color: "#ffffff",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.85)"
                    },
                    children: [
                      u.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          u.jsx("h3", {
                            className: "text-lg font-bold text-white",
                            children: s.sessionName || "Saved Session"
                          }),
                          u.jsxs("p", {
                            className: "text-xs",
                            style: { color: "#cccccc" },
                            children: [
                              (s.matches ? s.matches.length : 0),
                              " matches • ",
                              s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Saved locally"
                            ]
                          })
                        ]
                      }),
                      u.jsxs("div", {
                        className: "flex items-center justify-end gap-2 pt-2 border-t border-white/10",
                        children: [
                          u.jsx("button", {
                            type: "button",
                            onClick: () => handleDelete(s.id),
                            className: "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                            style: {
                              backgroundColor: "#1a0f0f",
                              borderColor: "#ef4444",
                              color: "#f87171"
                            },
                            children: "Delete"
                          }),
                          u.jsx("button", {
                            type: "button",
                            onClick: () => navigate(ROUTES.ACTIVE),
                            className: "px-4 py-1.5 rounded-lg text-xs font-bold",
                            style: {
                              backgroundColor: "#DAA520",
                              color: "#0a0a0a"
                            },
                            children: "Go to Tracker"
                          })
                        ]
                      })
                    ]
                  },
                  s.id || Math.random()
                )
              )
            })
          : u.jsxs("div", {
              className: "p-8 rounded-2xl border-2 text-center max-w-lg mx-auto my-8 space-y-4",
              style: {
                backgroundColor: "#0c0c0c",
                borderColor: "#DAA520",
                color: "#ffffff",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.9)"
              },
              children: [
                u.jsx("div", {
                  className: "text-4xl",
                  children: "🐝"
                }),
                u.jsx("h2", {
                  className: "text-xl font-bold text-white",
                  children: "Ready to Track Matches"
                }),
                u.jsx("p", {
                  className: "text-sm",
                  style: { color: "#e0e0e0" },
                  children: "Start a new scoring session to track Autonomous, TeleOp, End of Match, and Ranking Points."
                }),
                u.jsx("div", {
                  className: "pt-2",
                  children: u.jsx("button", {
                    type: "button",
                    onClick: () => navigate(ROUTES.ACTIVE),
                    className: "px-6 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105",
                    style: {
                      backgroundColor: "#DAA520",
                      color: "#0a0a0a"
                    },
                    children: "Open Match Tracker"
                  })
                })
              ]
            })
      ]
    })
  });
};

export default Sessions;
