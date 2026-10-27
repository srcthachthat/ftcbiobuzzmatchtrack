import { r as React, u as useNavigate, L as Link } from "./vendor-react-BrRUuK2M.js";
import {
  E as getGuestSessions,
  F as setGuestSessions,
  i as firebaseService,
  u as useAuth,
  ar as useSession,
  R as ROUTES,
  D as getMatchScore,
  a2 as getSessionRP,
  t as toDate,
  y as toast,
  j as u
} from "./index-CrUxzRby.js";

function parseDateMs(session) {
  try {
    if (session.createdAt) {
      const d = typeof toDate === "function" ? toDate(session.createdAt) : new Date(session.createdAt);
      if (d && !Number.isNaN(d.getTime())) return d.getTime();
    }
    if (session.completedAt) {
      const t = Date.parse(session.completedAt);
      if (!Number.isNaN(t)) return t;
    }
  } catch {}
  return 0;
}

function formatSessionDate(session) {
  const ms = parseDateMs(session);
  if (!ms) return "Recently saved";
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  }) + ", " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function computeSessionStats(session) {
  const matches = Array.isArray(session.matches) ? session.matches : [];
  const matchCount = matches.length;
  const fallbackType = session.matchType || "Full Game";
  const scores = matches.map((m) =>
    typeof m.finalScore === "number" && Number.isFinite(m.finalScore)
      ? m.finalScore
      : getMatchScore(m, fallbackType)
  );
  const best = scores.length > 0 ? Math.max(...scores) : 0;
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const rp = getSessionRP(matches, fallbackType);
  const duration = session.sessionDuration || "0:00";
  return { matchCount, best, avg, rp, duration };
}

function readLocalSavedSessions() {
  const map = new Map();
  try {
    const v2Raw = localStorage.getItem("src28785-saved-sessions-v2");
    const v2List = v2Raw ? JSON.parse(v2Raw) : [];
    if (Array.isArray(v2List)) {
      for (const s of v2List) {
        if (s && s.id) map.set(s.id, s);
      }
    }
  } catch {}
  try {
    const guestList = getGuestSessions() || [];
    if (Array.isArray(guestList)) {
      for (const s of guestList) {
        if (s && s.id && !map.has(s.id)) map.set(s.id, s);
      }
    }
  } catch {}
  return [...map.values()].sort((a, b) => parseDateMs(b) - parseDateMs(a));
}

function writeLocalSavedSessions(list) {
  try {
    localStorage.setItem("src28785-saved-sessions-v2", JSON.stringify(list));
  } catch {}
  try {
    setGuestSessions(list);
  } catch {}
}

const Sessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessionData, hasStarted, replaceSessionData, setHasStarted } = useSession();

  const [sessions, setSessions] = React.useState(() => readLocalSavedSessions());
  const [loadingCloud, setLoadingCloud] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [matchTypeFilter, setMatchTypeFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("NEWEST");
  const [showArchived, setShowArchived] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const [renamingSession, setRenamingSession] = React.useState(null);
  const [renameText, setRenameText] = React.useState("");

  React.useEffect(() => {
    document.title = "Sessions - Scienceroboticsclub 28785";
  }, []);

  const loadAllSessions = React.useCallback(async () => {
    const localList = readLocalSavedSessions();
    setSessions(localList);

    if (!user?.uid) {
      return;
    }

    setLoadingCloud(true);
    try {
      const cloudPromise = firebaseService.getUserSessions(user.uid);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));
      const cloudList = await Promise.race([cloudPromise, timeoutPromise]);
      if (Array.isArray(cloudList)) {
        const map = new Map();
        for (const s of [...localList, ...cloudList]) {
          if (s && s.id && !map.has(s.id)) {
            map.set(s.id, s);
          }
        }
        const merged = [...map.values()].sort((a, b) => parseDateMs(b) - parseDateMs(a));
        setSessions(merged);
        writeLocalSavedSessions(merged);
      }
    } catch (e) {
      console.warn("Could not load cloud sessions, showing local sessions:", e);
    } finally {
      setLoadingCloud(false);
    }
  }, [user?.uid]);

  React.useEffect(() => {
    loadAllSessions();
  }, [loadAllSessions]);

  React.useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const hasActiveSession =
    sessionData &&
    !sessionData.isSessionCompleted &&
    (hasStarted || (sessionData.matches && sessionData.matches.length > 0));

  const handleOpenInTracker = (session, e) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    if (typeof replaceSessionData === "function") {
      replaceSessionData({
        sessionName: session.sessionName || "Practice 1",
        sessionType: session.sessionType || "Practice",
        matchType: session.matchType || "Full Game",
        selectedFeature: session.selectedFeature || "",
        notes: session.notes || "",
        matches: Array.isArray(session.matches) ? session.matches : [],
        isSessionCompleted: false,
        robot1Leave: false,
        robot2Leave: false,
        robot1ParkAuto: false,
        robot2ParkAuto: false,
        robot1ParkTeleop: false,
        robot2ParkTeleop: false,
        tipping: 0,
        ballsInHive: 0,
        garden: 0,
        flower: 0,
        flowerBonus: 0,
        minorPenalties: 0,
        majorPenalties: 0,
        phaseLog: []
      });
      if (typeof setHasStarted === "function") setHasStarted(true);
    }
    navigate(ROUTES.ACTIVE);
  };

  const handleDelete = async (session, e) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    const id = session.id;
    const prev = sessions;
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    try {
      const localNext = readLocalSavedSessions().filter((s) => s.id !== id);
      writeLocalSavedSessions(localNext);
      if (user?.uid && !String(id).startsWith("guest_")) {
        firebaseService.deleteSession(id).catch(() => {});
      }
      toast.success(`Deleted "${session.sessionName || "Session"}"`);
    } catch (err) {
      console.error("Delete session error:", err);
      setSessions(prev);
      toast.error("Couldn't delete session");
    }
  };

  const handleToggleArchive = async (session, e) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    const nextArchived = !session.archived;
    const updated = sessions.map((s) =>
      s.id === session.id ? { ...s, archived: nextArchived } : s
    );
    setSessions(updated);
    try {
      const localList = readLocalSavedSessions();
      writeLocalSavedSessions(
        localList.map((s) => (s.id === session.id ? { ...s, archived: nextArchived } : s))
      );
      if (user?.uid && !String(session.id).startsWith("guest_")) {
        firebaseService.updateSession(session.id, { archived: nextArchived }).catch(() => {});
      }
      toast.success(nextArchived ? "Session archived" : "Session unarchived");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renamingSession || !renameText.trim()) return;
    const newName = renameText.trim();
    const targetId = renamingSession.id;
    setRenamingSession(null);
    setSessions((prev) =>
      prev.map((s) => (s.id === targetId ? { ...s, sessionName: newName } : s))
    );
    try {
      const localList = readLocalSavedSessions();
      writeLocalSavedSessions(
        localList.map((s) => (s.id === targetId ? { ...s, sessionName: newName } : s))
      );
      if (user?.uid && !String(targetId).startsWith("guest_")) {
        firebaseService.updateSession(targetId, { sessionName: newName }).catch(() => {});
      }
      toast.success("Session renamed");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSessions = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = sessions.filter((s) => {
      const isArch = !!s.archived;
      if (isArch !== showArchived) return false;
      if (matchTypeFilter !== "ALL" && (s.matchType || "Full Game") !== matchTypeFilter) {
        return false;
      }
      if (q) {
        const nameMatch = (s.sessionName || "").toLowerCase().includes(q);
        const notesMatch = (s.notes || "").toLowerCase().includes(q);
        if (!nameMatch && !notesMatch) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "OLDEST") return parseDateMs(a) - parseDateMs(b);
      if (sortBy === "BEST_SCORE") {
        return computeSessionStats(b).best - computeSessionStats(a).best;
      }
      if (sortBy === "AVG_SCORE") {
        return computeSessionStats(b).avg - computeSessionStats(a).avg;
      }
      return parseDateMs(b) - parseDateMs(a);
    });
  }, [sessions, search, matchTypeFilter, sortBy, showArchived]);

  return u.jsx("div", {
    className: "flex-1 w-full max-w-[1152px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10",
    children: u.jsxs("div", {
      className: "space-y-6",
      children: [
        /* Active Session In-Progress Banner (if any) */
        hasActiveSession &&
          u.jsxs("div", {
            className: "p-4 sm:p-5 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-4",
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
                    className: "text-lg font-bold text-white",
                    children: sessionData.sessionName || "Untitled Session"
                  }),
                  u.jsxs("p", {
                    className: "text-xs text-gray-300",
                    children: [
                      sessionData.matches ? sessionData.matches.length : 0,
                      " matches recorded so far"
                    ]
                  })
                ]
              }),
              u.jsx("button", {
                type: "button",
                onClick: () => navigate(ROUTES.ACTIVE),
                className: "px-4 py-2 rounded-xl font-bold text-sm transition-transform hover:scale-105",
                style: {
                  backgroundColor: "#22c55e",
                  color: "#0a0a0a"
                },
                children: "Continue Session →"
              })
            ]
          }),

        /* Filter & Search Bar (Matches Image 2) */
        u.jsxs("div", {
          className: "flex flex-wrap items-center gap-2.5",
          children: [
            /* Search Input */
            u.jsxs("div", {
              className: "relative flex-1 min-w-[220px] max-w-md",
              children: [
                u.jsx("span", {
                  className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
                  children: u.jsxs("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      u.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      u.jsx("path", { d: "m21 21-4.3-4.3" })
                    ]
                  })
                }),
                u.jsx("input", {
                  type: "search",
                  placeholder: "Search",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  className: "w-full h-11 pl-10 pr-4 rounded-xl border text-sm text-white placeholder-gray-400 focus:outline-none",
                  style: {
                    backgroundColor: "#0c0c0c",
                    borderColor: "#DAA520"
                  }
                })
              ]
            }),

            /* Match Type Select */
            u.jsx("select", {
              value: matchTypeFilter,
              onChange: (e) => setMatchTypeFilter(e.target.value),
              "aria-label": "Filter by match type",
              className: "h-11 px-3.5 rounded-xl border text-sm font-medium text-white focus:outline-none cursor-pointer",
              style: {
                backgroundColor: "#0c0c0c",
                borderColor: "#DAA520"
              },
              children: [
                u.jsx("option", { value: "ALL", children: "All match types" }),
                u.jsx("option", { value: "Full Game", children: "Full Game" }),
                u.jsx("option", { value: "Autonomous", children: "Autonomous" }),
                u.jsx("option", { value: "Teleop", children: "Teleop" })
              ]
            }),

            /* Sort Select */
            u.jsx("select", {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              "aria-label": "Sort sessions",
              className: "h-11 px-3.5 rounded-xl border text-sm font-medium text-white focus:outline-none cursor-pointer",
              style: {
                backgroundColor: "#0c0c0c",
                borderColor: "#DAA520"
              },
              children: [
                u.jsx("option", { value: "NEWEST", children: "↑↓ Newest first" }),
                u.jsx("option", { value: "OLDEST", children: "↑↓ Oldest first" }),
                u.jsx("option", { value: "BEST_SCORE", children: "↑↓ Best score" }),
                u.jsx("option", { value: "AVG_SCORE", children: "↑↓ Avg score" })
              ]
            }),

            /* Archived Toggle Button */
            u.jsxs("button", {
              type: "button",
              onClick: () => setShowArchived((v) => !v),
              className: "h-11 px-4 rounded-xl border text-sm font-medium inline-flex items-center gap-2 transition-colors",
              style: {
                backgroundColor: showArchived ? "#DAA520" : "#0c0c0c",
                borderColor: "#DAA520",
                color: showArchived ? "#0a0a0a" : "#ffffff"
              },
              children: [
                u.jsxs("svg", {
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    u.jsx("rect", { width: "20", height: "5", x: "2", y: "3", rx: "1" }),
                    u.jsx("path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }),
                    u.jsx("path", { d: "M10 12h4" })
                  ]
                }),
                "Archived"
              ]
            })
          ]
        }),

        /* Session Cards Grid (Matches Image 2) */
        loadingCloud && sessions.length === 0
          ? u.jsx("div", {
              className: "p-12 text-center text-gray-300 text-sm",
              children: "Loading your sessions…"
            })
          : filteredSessions.length > 0
          ? u.jsx("div", {
              className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
              children: filteredSessions.map((s) => {
                const { matchCount, best, avg, rp, duration } = computeSessionStats(s);
                const isMenuOpen = openMenuId === s.id;
                return u.jsxs(
                  "div",
                  {
                    onClick: () =>
                      navigate(`${ROUTES.ANALYSIS}?sessionId=${encodeURIComponent(s.id)}`),
                    role: "button",
                    tabIndex: 0,
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`${ROUTES.ANALYSIS}?sessionId=${encodeURIComponent(s.id)}`);
                      }
                    },
                    className:
                      "p-5 rounded-2xl border-2 flex flex-col justify-between gap-3.5 cursor-pointer transition-all hover:scale-[1.01] relative",
                    style: {
                      backgroundColor: "#0c0c0c",
                      borderColor: "#DAA520",
                      color: "#ffffff",
                      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.9)"
                    },
                    children: [
                      /* Card Header: Title + 3-dots Menu */
                      u.jsxs("div", {
                        className: "flex items-start justify-between gap-2",
                        children: [
                          u.jsx("h3", {
                            className: "text-lg font-bold text-white truncate",
                            children: s.sessionName || "Untitled Session"
                          }),
                          u.jsxs("div", {
                            className: "relative shrink-0",
                            children: [
                              u.jsx("button", {
                                type: "button",
                                "aria-label": "Session options",
                                onClick: (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(isMenuOpen ? null : s.id);
                                },
                                className:
                                  "p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors",
                                children: u.jsxs("svg", {
                                  width: "18",
                                  height: "18",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: "2",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  children: [
                                    u.jsx("circle", { cx: "12", cy: "12", r: "1" }),
                                    u.jsx("circle", { cx: "12", cy: "5", r: "1" }),
                                    u.jsx("circle", { cx: "12", cy: "19", r: "1" })
                                  ]
                                })
                              }),
                              isMenuOpen &&
                                u.jsxs("div", {
                                  onClick: (e) => e.stopPropagation(),
                                  className:
                                    "absolute right-0 mt-1 w-52 rounded-xl border p-1.5 shadow-2xl z-30 space-y-1",
                                  style: {
                                    backgroundColor: "#141414",
                                    borderColor: "#DAA520"
                                  },
                                  children: [
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: () =>
                                        navigate(
                                          `${ROUTES.ANALYSIS}?sessionId=${encodeURIComponent(s.id)}`
                                        ),
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10",
                                      children: "📊 View Charts & Stats"
                                    }),
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: () =>
                                        navigate(
                                          `${ROUTES.ANALYSIS}?sessionId=${encodeURIComponent(s.id)}&tab=matches`
                                        ),
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10",
                                      children: "✏️ Edit Matches & Scores"
                                    }),
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: (e) => handleOpenInTracker(s, e),
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10",
                                      children: "➕ Continue in Tracker"
                                    }),
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        setRenamingSession(s);
                                        setRenameText(s.sessionName || "");
                                      },
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10",
                                      children: "🏷️ Rename Session"
                                    }),
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: (e) => handleToggleArchive(s, e),
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10",
                                      children: s.archived ? "📂 Unarchive" : "🗃️ Archive"
                                    }),
                                    u.jsx("button", {
                                      type: "button",
                                      onClick: (e) => handleDelete(s, e),
                                      className:
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/15",
                                      children: "🗑️ Delete"
                                    })
                                  ]
                                })
                            ]
                          })
                        ]
                      }),

                      /* Date Row */
                      u.jsxs("div", {
                        className: "flex items-center gap-2 text-xs text-gray-300",
                        children: [
                          u.jsxs("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            className: "text-gray-400 shrink-0",
                            children: [
                              u.jsx("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }),
                              u.jsx("line", { x1: "16", x2: "16", y1: "2", y2: "6" }),
                              u.jsx("line", { x1: "8", x2: "8", y1: "2", y2: "6" }),
                              u.jsx("line", { x1: "3", x2: "21", y1: "10", y2: "10" })
                            ]
                          }),
                          u.jsx("span", { children: formatSessionDate(s) })
                        ]
                      }),

                      /* Metrics Grid (Best, Matches, Avg Score, Duration, Ranking Points) */
                      u.jsxs("div", {
                        className: "grid grid-cols-3 gap-x-3 gap-y-3 pt-1 text-xs",
                        children: [
                          /* Best */
                          u.jsxs("div", {
                            className: "flex items-center gap-2 min-w-0",
                            children: [
                              u.jsxs("svg", {
                                width: "15",
                                height: "15",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "text-gray-400 shrink-0",
                                children: [
                                  u.jsx("path", { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6" }),
                                  u.jsx("path", { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18" }),
                                  u.jsx("path", { d: "M4 22h16" }),
                                  u.jsx("path", { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" }),
                                  u.jsx("path", { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" }),
                                  u.jsx("path", { d: "M18 2H6v7a6 6 0 0 0 12 0V2Z" })
                                ]
                              }),
                              u.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  u.jsx("div", { className: "text-gray-400 text-[11px]", children: "Best" }),
                                  u.jsxs("div", {
                                    className: "font-bold text-white tabular-nums truncate",
                                    children: [best, " pts"]
                                  })
                                ]
                              })
                            ]
                          }),

                          /* Matches */
                          u.jsxs("div", {
                            className: "flex items-center gap-2 min-w-0",
                            children: [
                              u.jsx("span", {
                                className: "text-gray-400 font-bold text-sm shrink-0",
                                children: "#"
                              }),
                              u.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  u.jsx("div", { className: "text-gray-400 text-[11px]", children: "Matches" }),
                                  u.jsx("div", {
                                    className: "font-bold text-white tabular-nums",
                                    children: matchCount
                                  })
                                ]
                              })
                            ]
                          }),

                          /* Avg Score */
                          u.jsxs("div", {
                            className: "flex items-center gap-2 min-w-0",
                            children: [
                              u.jsxs("svg", {
                                width: "15",
                                height: "15",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "text-gray-400 shrink-0",
                                children: [
                                  u.jsx("path", { d: "m12 14 4-4" }),
                                  u.jsx("path", { d: "M3.34 19a10 10 0 1 1 17.32 0" })
                                ]
                              }),
                              u.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  u.jsx("div", { className: "text-gray-400 text-[11px]", children: "Avg Score" }),
                                  u.jsxs("div", {
                                    className: "font-bold text-white tabular-nums truncate",
                                    children: [avg, " pts"]
                                  })
                                ]
                              })
                            ]
                          }),

                          /* Duration */
                          u.jsxs("div", {
                            className: "flex items-center gap-2 min-w-0",
                            children: [
                              u.jsxs("svg", {
                                width: "15",
                                height: "15",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "text-gray-400 shrink-0",
                                children: [
                                  u.jsx("circle", { cx: "12", cy: "12", r: "10" }),
                                  u.jsx("polyline", { points: "12 6 12 12 16 14" })
                                ]
                              }),
                              u.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  u.jsx("div", { className: "text-gray-400 text-[11px]", children: "Duration" }),
                                  u.jsx("div", {
                                    className: "font-bold text-white tabular-nums",
                                    children: duration
                                  })
                                ]
                              })
                            ]
                          }),

                          /* Ranking Points */
                          u.jsxs("div", {
                            className: "col-span-2 flex items-center gap-2 min-w-0",
                            children: [
                              u.jsxs("svg", {
                                width: "15",
                                height: "15",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "text-gray-400 shrink-0",
                                children: [
                                  u.jsx("circle", { cx: "12", cy: "8", r: "6" }),
                                  u.jsx("path", { d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" })
                                ]
                              }),
                              u.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  u.jsx("div", {
                                    className: "text-gray-400 text-[11px]",
                                    children: "Ranking Points"
                                  }),
                                  u.jsx("div", {
                                    className: "font-bold text-white tabular-nums truncate",
                                    children:
                                      rp.possible > 0
                                        ? `${rp.earned} of ${rp.possible} RP (${rp.rate ?? 0}%)`
                                        : `${rp.earned} RP`
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  },
                  s.id
                );
              })
            })
          : /* Empty State */
            u.jsxs("div", {
              className: "p-8 rounded-2xl border-2 text-center max-w-lg mx-auto my-8 space-y-4",
              style: {
                backgroundColor: "#0c0c0c",
                borderColor: "#DAA520",
                color: "#ffffff",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.9)"
              },
              children: [
                u.jsx("div", { className: "text-4xl", children: "🐝" }),
                u.jsx("h2", {
                  className: "text-xl font-bold text-white",
                  children: showArchived ? "No Archived Sessions" : "No Saved Sessions Yet"
                }),
                u.jsx("p", {
                  className: "text-sm text-gray-300",
                  children: showArchived
                    ? "Sessions you archive will appear here."
                    : "Complete a scoring session in the Match Tracker to see your saved matches, RP stats, and score charts here."
                }),
                !showArchived &&
                  u.jsx("div", {
                    className: "pt-2",
                    children: u.jsx(Link, {
                      to: ROUTES.ACTIVE,
                      className:
                        "inline-flex px-6 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105",
                      style: {
                        backgroundColor: "#DAA520",
                        color: "#0a0a0a"
                      },
                      children: "+ Start New Session"
                    })
                  })
              ]
            }),

        /* Rename Modal */
        renamingSession &&
          u.jsx("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",
            onClick: () => setRenamingSession(null),
            children: u.jsxs("form", {
              onClick: (e) => e.stopPropagation(),
              onSubmit: handleRenameSubmit,
              className: "w-full max-w-sm rounded-2xl border-2 p-6 space-y-4",
              style: {
                backgroundColor: "#0c0c0c",
                borderColor: "#DAA520",
                color: "#ffffff"
              },
              children: [
                u.jsx("h3", {
                  className: "text-lg font-bold text-white",
                  children: "Rename session"
                }),
                u.jsx("input", {
                  type: "text",
                  value: renameText,
                  onChange: (e) => setRenameText(e.target.value),
                  maxLength: 80,
                  autoFocus: true,
                  className:
                    "w-full h-11 px-3.5 rounded-xl border text-sm text-white focus:outline-none",
                  style: {
                    backgroundColor: "#161616",
                    borderColor: "#DAA520"
                  }
                }),
                u.jsxs("div", {
                  className: "flex justify-end gap-2 pt-2",
                  children: [
                    u.jsx("button", {
                      type: "button",
                      onClick: () => setRenamingSession(null),
                      className:
                        "px-4 py-2 rounded-xl border border-gray-600 text-xs font-bold text-gray-200 hover:bg-white/10",
                      children: "Cancel"
                    }),
                    u.jsx("button", {
                      type: "submit",
                      className: "px-5 py-2 rounded-xl text-xs font-bold",
                      style: {
                        backgroundColor: "#DAA520",
                        color: "#0a0a0a"
                      },
                      children: "Save"
                    })
                  ]
                })
              ]
            })
          })
      ]
    })
  });
};

export default Sessions;
