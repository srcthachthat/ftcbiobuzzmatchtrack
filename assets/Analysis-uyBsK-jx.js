import {
  r as React,
  u as useNavigate,
  a as useLocation,
  L as Link
} from "./vendor-react-BrRUuK2M.js";
import {
  E as getGuestSessions,
  F as setGuestSessions,
  i as firebaseService,
  u as useAuth,
  R as ROUTES,
  d as getBreakdown,
  D as getMatchScore,
  a1 as getLeaveParkRates,
  bx as getLeaveParkCounts,
  a2 as getSessionRP,
  a4 as getMatchRP,
  bB as getMatchRPBadges,
  Y as getMatchCycleTimes,
  by as getMatchTipsInCycles,
  bl as getMatchRows,
  am as stripHtml,
  t as toDate,
  y as toast,
  j as u
} from "./index-CrUxzRby.js";

function formatFullDate(session) {
  try {
    const raw = session.createdAt || session.completedAt;
    if (!raw) return "";
    const d = typeof toDate === "function" && session.createdAt ? toDate(session.createdAt) : new Date(raw);
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

function formatDurationHuman(dur) {
  if (!dur || typeof dur !== "string") return "";
  const parts = dur.split(":").map(Number);
  if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    const [m, s] = parts;
    if (m === 0) return `${s} s`;
    if (s === 0) return `${m} m`;
    return `${m}m ${s}s`;
  }
  return dur;
}

const ScoreTrendChart = ({ matches, fallbackType, avgScore }) => {
  const [hoverIdx, setHoverIdx] = React.useState(null);

  const pointsData = matches.map((m, i) => {
    const score =
      typeof m.finalScore === "number" && Number.isFinite(m.finalScore)
        ? m.finalScore
        : getMatchScore(m, fallbackType);
    return {
      idx: i,
      label: `M${m.matchNumber ?? i + 1}`,
      matchNumber: m.matchNumber ?? i + 1,
      score
    };
  });

  const maxScoreRaw = pointsData.reduce((mx, p) => Math.max(mx, p.score), 0);
  const yMax = maxScoreRaw > 0 ? Math.ceil(maxScoreRaw / 4) * 4 : 40;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  const width = 760;
  const height = 250;
  const padLeft = 52;
  const padRight = 36;
  const padTop = 20;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (i) => {
    if (pointsData.length <= 1) return padLeft + plotW / 2;
    const inset = Math.min(80, plotW * 0.14);
    const usableW = plotW - inset * 2;
    return padLeft + inset + (i / (pointsData.length - 1)) * usableW;
  };

  const getY = (val) => {
    return padTop + plotH - (Math.min(Math.max(val, 0), yMax) / yMax) * plotH;
  };

  const polylinePoints = pointsData.map((p, i) => `${getX(i)},${getY(p.score)}`).join(" ");
  const avgY = getY(avgScore);
  const firstX = getX(0);
  const lastX = getX(pointsData.length - 1);

  return u.jsxs("div", {
    className: "p-6 rounded-2xl border-2 space-y-4",
    style: {
      backgroundColor: "#0c0c0c",
      borderColor: "#DAA520",
      color: "#ffffff",
      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.9)"
    },
    children: [
      u.jsx("h2", {
        className: "text-base font-bold text-white",
        children: "Score Trend"
      }),
      u.jsx("div", {
        className: "w-full overflow-x-auto",
        children: u.jsxs("svg", {
          viewBox: `0 0 ${width} ${height}`,
          className: "w-full h-auto min-w-[320px] select-none",
          children: [
            /* Horizontal Grid Lines & Y-Axis Labels */
            yTicks.map((tick) => {
              const y = getY(tick);
              return u.jsxs(
                "g",
                {
                  children: [
                    u.jsx("line", {
                      x1: padLeft,
                      y1: y,
                      x2: width - padRight,
                      y2: y,
                      stroke: "rgba(255,255,255,0.1)",
                      strokeDasharray: tick === 0 ? undefined : "3 3",
                      strokeWidth: "1"
                    }),
                    u.jsx("text", {
                      x: padLeft - 8,
                      y: y + 4,
                      textAnchor: "end",
                      fill: "#94a3b8",
                      fontSize: "11",
                      children: Math.round(tick)
                    })
                  ]
                },
                `y-${tick}`
              );
            }),

            /* Y-axis left line */
            u.jsx("line", {
              x1: padLeft,
              y1: padTop,
              x2: padLeft,
              y2: padTop + plotH,
              stroke: "rgba(255,255,255,0.25)",
              strokeWidth: "1"
            }),

            /* Vertical Grid Lines & X-Axis Labels (M1, M2, ...) */
            pointsData.map((p, i) => {
              const x = getX(i);
              return u.jsxs(
                "g",
                {
                  children: [
                    u.jsx("line", {
                      x1: x,
                      y1: padTop,
                      x2: x,
                      y2: padTop + plotH,
                      stroke: "rgba(255,255,255,0.08)",
                      strokeDasharray: "3 3",
                      strokeWidth: "1"
                    }),
                    u.jsx("text", {
                      x: x,
                      y: padTop + plotH + 20,
                      textAnchor: "middle",
                      fill: "#94a3b8",
                      fontSize: "11",
                      fontWeight: "600",
                      children: p.label
                    })
                  ]
                },
                `x-${p.idx}`
              );
            }),

            /* Session Average Dashed Line */
            pointsData.length > 1 &&
              u.jsx("line", {
                x1: firstX,
                y1: avgY,
                x2: lastX,
                y2: avgY,
                stroke: "#94a3b8",
                strokeWidth: "1.5",
                strokeDasharray: "4 4"
              }),

            /* Final Score Solid Line */
            pointsData.length > 1 &&
              u.jsx("polyline", {
                fill: "none",
                stroke: "#ffffff",
                strokeWidth: "2.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                points: polylinePoints
              }),

            /* Data Points & Hover Tooltips */
            pointsData.map((p, i) => {
              const cx = getX(i);
              const cy = getY(p.score);
              const isHovered = hoverIdx === i;
              return u.jsxs(
                "g",
                {
                  onMouseEnter: () => setHoverIdx(i),
                  onMouseLeave: () => setHoverIdx(null),
                  style: { cursor: "pointer" },
                  children: [
                    u.jsx("circle", {
                      cx,
                      cy,
                      r: "14",
                      fill: "transparent"
                    }),
                    u.jsx("circle", {
                      cx,
                      cy,
                      r: isHovered ? "6.5" : "5",
                      fill: "#ffffff",
                      stroke: "#0c0c0c",
                      strokeWidth: "2"
                    }),
                    isHovered &&
                      u.jsxs("g", {
                        children: [
                          u.jsx("rect", {
                            x: cx - 48,
                            y: Math.max(2, cy - 34),
                            width: "96",
                            height: "24",
                            rx: "6",
                            fill: "#1a1a1a",
                            stroke: "#DAA520",
                            strokeWidth: "1.2"
                          }),
                          u.jsx("text", {
                            x: cx,
                            y: Math.max(2, cy - 34) + 16,
                            textAnchor: "middle",
                            fill: "#ffffff",
                            fontSize: "11",
                            fontWeight: "700",
                            children: `Match ${p.matchNumber}: ${p.score} pts`
                          })
                        ]
                      })
                  ]
                },
                `pt-${p.idx}`
              );
            })
          ]
        })
      }),

      /* Legend */
      u.jsxs("div", {
        className: "flex items-center justify-center gap-6 text-xs text-gray-300 pt-1",
        children: [
          u.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              u.jsxs("svg", {
                width: "22",
                height: "10",
                viewBox: "0 0 22 10",
                children: [
                  u.jsx("line", {
                    x1: "0",
                    y1: "5",
                    x2: "22",
                    y2: "5",
                    stroke: "#ffffff",
                    strokeWidth: "2"
                  }),
                  u.jsx("circle", { cx: "11", cy: "5", r: "3", fill: "#ffffff" })
                ]
              }),
              u.jsx("span", { children: "Final Score" })
            ]
          }),
          u.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              u.jsx("svg", {
                width: "22",
                height: "10",
                viewBox: "0 0 22 10",
                children: u.jsx("line", {
                  x1: "0",
                  y1: "5",
                  x2: "22",
                  y2: "5",
                  stroke: "#94a3b8",
                  strokeWidth: "1.5",
                  strokeDasharray: "4 3"
                })
              }),
              u.jsx("span", { className: "text-gray-400", children: "Session average" })
            ]
          })
        ]
      })
    ]
  });
};

const CategoryBreakdownChart = ({ matches, fallbackType }) => {
  const categories = [
    { key: "tipping", label: "Hive Tips", color: "#f59e0b" },
    { key: "robots", label: "Leave + Park", color: "#64748b" },
    { key: "flower", label: "Owned flower pieces", color: "#a855f7" },
    { key: "flowerBonus", label: "Flower nectar at bottom", color: "#d8b4fe" },
    { key: "hive", label: "Left in Hive", color: "#0ea5e9" },
    { key: "garden", label: "Garden", color: "#10b981" }
  ];

  const rows = matches.map((m, i) => {
    const bd = getBreakdown({ ...m, matchType: m.matchType || fallbackType });
    return {
      label: `M${m.matchNumber ?? i + 1}`,
      total: bd.total,
      values: {
        tipping: bd.tipping,
        robots: bd.leave + bd.park,
        flower: bd.flower,
        flowerBonus: bd.flowerBonus,
        hive: bd.hive,
        garden: bd.garden
      }
    };
  });

  const maxTotal = Math.max(20, ...rows.map((r) => r.total));

  return u.jsxs("div", {
    className: "p-6 rounded-2xl border-2 space-y-4",
    style: {
      backgroundColor: "#0c0c0c",
      borderColor: "#DAA520",
      color: "#ffffff",
      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.9)"
    },
    children: [
      u.jsx("h2", {
        className: "text-base font-bold text-white",
        children: "Score Breakdown by Category"
      }),
      u.jsx("div", {
        className: "space-y-3",
        children: rows.map((r) =>
          u.jsxs(
            "div",
            {
              className: "space-y-1",
              children: [
                u.jsxs("div", {
                  className: "flex justify-between text-xs font-semibold",
                  children: [
                    u.jsx("span", { className: "text-gray-300", children: r.label }),
                    u.jsxs("span", { className: "text-white tabular-nums", children: [r.total, " pts"] })
                  ]
                }),
                u.jsx("div", {
                  className: "h-5 w-full rounded-lg bg-white/5 overflow-hidden flex",
                  children: categories.map((cat) => {
                    const pts = r.values[cat.key] || 0;
                    if (pts <= 0) return null;
                    const pct = (pts / maxTotal) * 100;
                    return u.jsx(
                      "div",
                      {
                        title: `${cat.label}: ${pts} pts`,
                        style: {
                          width: `${pct}%`,
                          backgroundColor: cat.color
                        },
                        className: "h-full transition-all first:rounded-l-lg last:rounded-r-lg"
                      },
                      cat.key
                    );
                  })
                })
              ]
            },
            r.label
          )
        )
      }),
      u.jsx("div", {
        className: "flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-gray-300",
        children: categories.map((cat) =>
          u.jsxs(
            "div",
            {
              className: "flex items-center gap-1.5",
              children: [
                u.jsx("span", {
                  className: "inline-block w-3 h-3 rounded-sm shrink-0",
                  style: { backgroundColor: cat.color }
                }),
                u.jsx("span", { children: cat.label })
              ]
            },
            cat.key
          )
        )
      })
    ]
  });
};

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sessionId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("sessionId") || "";
  }, [location.search]);

  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("summary");
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameText, setRenameText] = React.useState("");
  const [highlightedMatchId, setHighlightedMatchId] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const localSessions = getGuestSessions() || [];
        let found = sessionId
          ? localSessions.find((s) => s.id === sessionId)
          : localSessions[0] || null;

        if (!found && sessionId && !sessionId.startsWith("guest_")) {
          found = await firebaseService.getSession(sessionId);
        }
        if (!found && !sessionId && user?.uid) {
          const userSessions = await firebaseService.getUserSessions(user.uid);
          if (userSessions && userSessions.length > 0) {
            found = userSessions[0];
          }
        }
        if (!cancelled) {
          setSession(found || null);
          if (found?.sessionName) {
            document.title = `${found.sessionName} - Scienceroboticsclub 28785`;
          }
        }
      } catch (e) {
        console.error("Error loading session for analysis:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, user?.uid]);

  if (loading) {
    return u.jsx("div", {
      className: "flex-1 flex items-center justify-center p-12 text-gray-300 text-sm",
      children: "Loading session analysis…"
    });
  }

  if (!session) {
    return u.jsx("div", {
      className: "flex-1 flex items-center justify-center p-6 relative z-10",
      children: u.jsxs("div", {
        className: "max-w-md w-full p-8 rounded-2xl border-2 text-center space-y-4",
        style: {
          backgroundColor: "#0c0c0c",
          borderColor: "#DAA520",
          color: "#ffffff"
        },
        children: [
          u.jsx("h1", {
            className: "text-xl font-bold text-white",
            children: "Session not found"
          }),
          u.jsx("p", {
            className: "text-sm text-gray-300",
            children: "This session may have been deleted or isn't available."
          }),
          u.jsxs("div", {
            className: "flex justify-center gap-3 pt-2",
            children: [
              u.jsx(Link, {
                to: ROUTES.SESSIONS,
                className: "px-5 py-2.5 rounded-xl font-bold text-sm",
                style: { backgroundColor: "#DAA520", color: "#0a0a0a" },
                children: "← Go to Sessions"
              }),
              u.jsx(Link, {
                to: ROUTES.ACTIVE,
                className: "px-5 py-2.5 rounded-xl font-bold text-sm border border-[#DAA520] text-white",
                children: "New Session"
              })
            ]
          })
        ]
      })
    });
  }

  const matches = Array.isArray(session.matches) ? session.matches : [];
  const fallbackType = session.matchType || "Full Game";
  const matchCount = matches.length;

  const scoredMatches = matches.map((m, idx) => {
    const score =
      typeof m.finalScore === "number" && Number.isFinite(m.finalScore)
        ? m.finalScore
        : getMatchScore(m, fallbackType);
    return {
      match: m,
      matchNumber: m.matchNumber ?? idx + 1,
      score
    };
  });

  const scores = scoredMatches.map((x) => x.score);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  let bestItem = scoredMatches[0] || { matchNumber: 1, score: 0, match: null };
  let worstItem = scoredMatches[0] || { matchNumber: 1, score: 0, match: null };
  for (const item of scoredMatches) {
    if (item.score > bestItem.score) bestItem = item;
    if (item.score < worstItem.score) worstItem = item;
  }

  const typicalSwing =
    scores.length > 1
      ? Math.round(
          Math.sqrt(
            scores.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / scores.length
          )
        )
      : 0;

  const { leaves, parks } = getLeaveParkCounts(matches, fallbackType);
  const { leaveRate, parkRate } = getLeaveParkRates(matches, fallbackType);
  const rp = getSessionRP(matches, fallbackType);

  const allCycleTimes = matches.flatMap((m) => getMatchCycleTimes(m));
  const totalTipsInCycles = matches.reduce((sum, m) => sum + getMatchTipsInCycles(m), 0);
  const totalTipsRaw = matches.reduce((sum, m) => sum + (Number(m.tipping) || 0), 0);
  const avgCycleTime =
    allCycleTimes.length > 0
      ? (allCycleTimes.reduce((a, b) => a + b, 0) / allCycleTimes.length).toFixed(1)
      : null;

  const handleRenameSave = async (e) => {
    e.preventDefault();
    const trimmed = renameText.trim();
    if (!trimmed) return;
    setIsRenaming(false);
    setSession((prev) => (prev ? { ...prev, sessionName: trimmed } : prev));
    try {
      const localList = getGuestSessions() || [];
      if (localList.some((s) => s.id === session.id)) {
        setGuestSessions(
          localList.map((s) => (s.id === session.id ? { ...s, sessionName: trimmed } : s))
        );
      }
      if (user?.uid && !String(session.id).startsWith("guest_")) {
        await firebaseService.updateSession(session.id, { sessionName: trimmed });
      }
      toast.success("Session renamed");
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Match",
        "Final Score",
        "Hive Tips",
        "Robot 1 Leave",
        "Robot 2 Leave",
        "Robot 1 Park Auto",
        "Robot 2 Park Auto",
        "Robot 1 Park End",
        "Robot 2 Park End",
        "Owned Flower Pieces",
        "Flower Nectar Bottom",
        "Left in Hive",
        "Garden",
        "Minor Fouls",
        "Major Fouls"
      ];
      const rows = matches.map((m, idx) => {
        const s =
          typeof m.finalScore === "number"
            ? m.finalScore
            : getMatchScore(m, fallbackType);
        return [
          m.matchNumber ?? idx + 1,
          s,
          m.tipping ?? 0,
          m.robot1Leave ? 1 : 0,
          m.robot2Leave ? 1 : 0,
          m.robot1ParkAuto ? 1 : 0,
          m.robot2ParkAuto ? 1 : 0,
          m.robot1ParkTeleop ? 1 : 0,
          m.robot2ParkTeleop ? 1 : 0,
          m.flower ?? 0,
          m.flowerBonus ?? 0,
          m.ballsInHive ?? 0,
          m.garden ?? 0,
          m.minorPenalties ?? 0,
          m.majorPenalties ?? 0
        ].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(session.sessionName || "session").replace(/[^a-z0-9-_]+/gi, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Exported CSV");
    } catch (err) {
      console.error(err);
      toast.error("Could not export CSV");
    }
  };

  const jumpToMatch = (matchObj) => {
    if (!matchObj) return;
    setActiveTab("matches");
    setHighlightedMatchId(matchObj.id);
    setTimeout(() => {
      const el = document.getElementById(`analysis-match-${matchObj.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const statCardStyle = {
    backgroundColor: "#0c0c0c",
    borderColor: "#DAA520",
    color: "#ffffff",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.85)"
  };

  const metaParts = [
    session.sessionType || "Practice",
    fallbackType,
    formatFullDate(session),
    `${matchCount} ${matchCount === 1 ? "match" : "matches"}`,
    formatDurationHuman(session.sessionDuration)
  ].filter(Boolean);

  const cleanNotes = stripHtml ? stripHtml(session.notes || "") : session.notes || "";

  return u.jsx("div", {
    className: "flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10",
    children: u.jsxs("div", {
      className: "space-y-6",
      children: [
        /* Page Header (Matches Image 3 + All Sessions Button) */
        u.jsxs("div", {
          className: "flex flex-wrap items-start justify-between gap-4",
          children: [
            u.jsxs("div", {
              className: "space-y-1 min-w-0",
              children: [
                isRenaming
                  ? u.jsxs("form", {
                      onSubmit: handleRenameSave,
                      className: "flex items-center gap-2",
                      children: [
                        u.jsx("input", {
                          type: "text",
                          value: renameText,
                          onChange: (e) => setRenameText(e.target.value),
                          maxLength: 80,
                          autoFocus: true,
                          className:
                            "h-10 px-3 rounded-xl border text-lg font-bold text-white focus:outline-none",
                          style: {
                            backgroundColor: "#0c0c0c",
                            borderColor: "#DAA520"
                          }
                        }),
                        u.jsx("button", {
                          type: "submit",
                          className: "px-3 py-1.5 rounded-lg text-xs font-bold",
                          style: { backgroundColor: "#DAA520", color: "#0a0a0a" },
                          children: "Save"
                        }),
                        u.jsx("button", {
                          type: "button",
                          onClick: () => setIsRenaming(false),
                          className: "px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 border border-gray-600",
                          children: "Cancel"
                        })
                      ]
                    })
                  : u.jsxs("div", {
                      className: "flex items-center gap-2.5",
                      children: [
                        u.jsx("h1", {
                          className: "text-2xl sm:text-3xl font-bold text-white truncate",
                          children: session.sessionName || "Untitled Session"
                        }),
                        u.jsx("button", {
                          type: "button",
                          title: "Rename session",
                          onClick: () => {
                            setRenameText(session.sessionName || "");
                            setIsRenaming(true);
                          },
                          className:
                            "p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors",
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
                              u.jsx("path", {
                                d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                              }),
                              u.jsx("path", { d: "m15 5 4 4" })
                            ]
                          })
                        })
                      ]
                    }),
                u.jsx("div", {
                  className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300 font-medium",
                  children: metaParts.map((part, i) =>
                    u.jsx("span", { children: part }, i)
                  )
                })
              ]
            }),

            /* Action Buttons: All Sessions + Export CSV */
            u.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                u.jsxs("button", {
                  type: "button",
                  onClick: () => navigate(ROUTES.SESSIONS),
                  className:
                    "h-10 px-4 rounded-xl border-2 text-xs font-bold inline-flex items-center gap-2 transition-transform hover:scale-105",
                  style: {
                    backgroundColor: "#0c0c0c",
                    borderColor: "#DAA520",
                    color: "#FFD700"
                  },
                  children: ["← All Sessions"]
                }),
                u.jsx("button", {
                  type: "button",
                  onClick: handleExportCSV,
                  title: "Export session to CSV",
                  "aria-label": "Export session to CSV",
                  className:
                    "h-10 w-10 rounded-xl border-2 inline-flex items-center justify-center text-gray-200 hover:text-white transition-colors",
                  style: {
                    backgroundColor: "#0c0c0c",
                    borderColor: "#DAA520"
                  },
                  children: u.jsxs("svg", {
                    width: "17",
                    height: "17",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      u.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                      u.jsx("polyline", { points: "7 10 12 15 17 10" }),
                      u.jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
                    ]
                  })
                })
              ]
            })
          ]
        }),

        /* Segmented Tabs: Summary | Matches | Side by Side (Matches Image 3) */
        u.jsx("div", {
          className: "grid grid-cols-3 p-1 rounded-xl border-2",
          style: {
            backgroundColor: "#0c0c0c",
            borderColor: "#DAA520"
          },
          children: [
            { id: "summary", label: "Summary", icon: "📊" },
            { id: "matches", label: "Matches", icon: "☷" },
            { id: "sideBySide", label: "Side by Side", icon: "⇄" }
          ].map((tab) => {
            const active = activeTab === tab.id;
            return u.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveTab(tab.id),
                className:
                  "h-9 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
                style: active
                  ? {
                      backgroundColor: "#26200d",
                      color: "#FFD700",
                      border: "1px solid #DAA520"
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "#d4d4d4"
                    },
                children: [
                  u.jsx("span", { "aria-hidden": true, children: tab.icon }),
                  u.jsx("span", { children: tab.label })
                ]
              },
              tab.id
            );
          })
        }),

        /* TAB 1: SUMMARY (Matches Image 3) */
        activeTab === "summary" &&
          u.jsxs("div", {
            className: "space-y-4",
            children: [
              /* 8 Stat Tiles Grid (2 rows x 4 columns) */
              u.jsxs("div", {
                className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
                children: [
                  /* 1. AVERAGE SCORE */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsx("div", {
                        className: "text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: "AVERAGE SCORE"
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: avgScore
                      }),
                      u.jsxs("div", {
                        className: "text-xs text-gray-400",
                        children: [
                          "across ",
                          matchCount,
                          " ",
                          matchCount === 1 ? "match" : "matches"
                        ]
                      })
                    ]
                  }),

                  /* 2. BEST MATCH */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsx("div", {
                        className: "text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: "BEST MATCH"
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold tabular-nums my-1",
                        style: { color: "#10b981" },
                        children: bestItem.score
                      }),
                      u.jsxs("button", {
                        type: "button",
                        onClick: () => jumpToMatch(bestItem.match),
                        className:
                          "text-xs text-gray-300 hover:text-white underline inline-flex items-center gap-1 w-fit",
                        children: ["Match ", bestItem.matchNumber, " ›"]
                      })
                    ]
                  }),

                  /* 3. WORST MATCH */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsx("div", {
                        className: "text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: "WORST MATCH"
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold tabular-nums my-1",
                        style: { color: "#ef4444" },
                        children: worstItem.score
                      }),
                      u.jsxs("button", {
                        type: "button",
                        onClick: () => jumpToMatch(worstItem.match),
                        className:
                          "text-xs text-gray-300 hover:text-white underline inline-flex items-center gap-1 w-fit",
                        children: ["Match ", worstItem.matchNumber, " ›"]
                      })
                    ]
                  }),

                  /* 4. TYPICAL SWING */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsxs("div", {
                        className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: [
                          u.jsx("span", { children: "TYPICAL SWING" }),
                          u.jsx("span", {
                            title: "Typical score variation from your session average",
                            className: "cursor-help text-gray-500",
                            children: "ⓘ"
                          })
                        ]
                      }),
                      u.jsxs("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: ["±", typicalSwing, " pts"]
                      }),
                      u.jsx("div", {
                        className: "text-xs text-gray-400",
                        children: "from session avg"
                      })
                    ]
                  }),

                  /* 5. LEAVE RATE */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsxs("div", {
                        className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: [
                          u.jsx("span", { children: "LEAVE RATE" }),
                          u.jsx("span", {
                            title: "Percentage of robot starts that earned Leave points in Auto",
                            className: "cursor-help text-gray-500",
                            children: "ⓘ"
                          })
                        ]
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: leaveRate !== null ? `${leaveRate}%` : "—"
                      }),
                      u.jsxs("div", {
                        className: "text-xs text-gray-400",
                        children: ["Leave ", leaves.made, " of ", leaves.chances]
                      })
                    ]
                  }),

                  /* 6. PARK RATE */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsxs("div", {
                        className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: [
                          u.jsx("span", { children: "PARK RATE" }),
                          u.jsx("span", {
                            title: "Percentage of robot opportunities that earned Park points",
                            className: "cursor-help text-gray-500",
                            children: "ⓘ"
                          })
                        ]
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: parkRate !== null ? `${parkRate}%` : "—"
                      }),
                      u.jsxs("div", {
                        className: "text-xs text-gray-400",
                        children: ["Park ", parks.made, " of ", parks.chances]
                      })
                    ]
                  }),

                  /* 7. RP RATE */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsxs("div", {
                        className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: [
                          u.jsx("span", { children: "RP RATE" }),
                          u.jsx("span", {
                            title: "Ranking Points earned out of total possible across all matches",
                            className: "cursor-help text-gray-500",
                            children: "ⓘ"
                          })
                        ]
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: rp.rate !== null ? `${rp.rate}%` : "0%"
                      }),
                      u.jsxs("div", {
                        className: "text-xs text-gray-400",
                        children: [rp.earned, " of ", rp.possible, " RP"]
                      })
                    ]
                  }),

                  /* 8. AVG TIME BETWEEN TIPS */
                  u.jsxs("div", {
                    className: "p-4 rounded-xl border-2 flex flex-col justify-between min-h-[108px]",
                    style: statCardStyle,
                    children: [
                      u.jsxs("div", {
                        className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400",
                        children: [
                          u.jsx("span", { children: "AVG TIME BETWEEN TIPS" }),
                          u.jsx("span", {
                            title: "Average cycle time between live Hive Tips",
                            className: "cursor-help text-gray-500",
                            children: "ⓘ"
                          })
                        ]
                      }),
                      u.jsx("div", {
                        className: "text-3xl font-bold text-white tabular-nums my-1",
                        children: avgCycleTime !== null ? `${avgCycleTime}s` : "—"
                      }),
                      u.jsx("div", {
                        className: "text-xs text-gray-400",
                        children:
                          totalTipsInCycles > 0
                            ? `from ${totalTipsInCycles} tips`
                            : totalTipsRaw > 0
                            ? `${totalTipsRaw} total tips`
                            : "no timed tips"
                      })
                    ]
                  })
                ]
              }),

              /* Score Trend Line Chart (Matches Image 3) */
              u.jsx(ScoreTrendChart, {
                matches,
                fallbackType,
                avgScore
              }),

              /* Score Breakdown by Category Chart */
              u.jsx(CategoryBreakdownChart, {
                matches,
                fallbackType
              }),

              /* Session Notes (if any) */
              cleanNotes &&
                u.jsxs("div", {
                  className: "p-5 rounded-2xl border-2 space-y-2",
                  style: statCardStyle,
                  children: [
                    u.jsx("h3", {
                      className: "text-sm font-bold text-[#DAA520] uppercase tracking-wider",
                      children: "Session Notes"
                    }),
                    u.jsx("p", {
                      className: "text-sm text-gray-200 whitespace-pre-wrap",
                      children: cleanNotes
                    })
                  ]
                })
            ]
          }),

        /* TAB 2: MATCHES */
        activeTab === "matches" &&
          u.jsx("div", {
            className: "space-y-4",
            children: scoredMatches.map(({ match: m, matchNumber, score }) => {
              const rows = getMatchRows({ ...m, matchType: m.matchType || fallbackType });
              const matchRp = getMatchRP({ ...m, matchType: m.matchType || fallbackType });
              const badges = getMatchRPBadges(matchRp);
              const cycles = getMatchCycleTimes(m);
              const isHighlighted = highlightedMatchId === m.id;

              return u.jsxs(
                "div",
                {
                  id: `analysis-match-${m.id}`,
                  className: "p-5 rounded-2xl border-2 space-y-4 transition-all",
                  style: {
                    backgroundColor: "#0c0c0c",
                    borderColor: isHighlighted ? "#22c55e" : "#DAA520",
                    color: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.85)"
                  },
                  children: [
                    u.jsxs("div", {
                      className: "flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10",
                      children: [
                        u.jsxs("div", {
                          className: "flex items-center gap-3",
                          children: [
                            u.jsxs("h3", {
                              className: "text-lg font-bold text-white",
                              children: ["Match ", matchNumber]
                            }),
                            badges.map((b) =>
                              u.jsx(
                                "span",
                                {
                                  className:
                                    "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#26200d] text-[#FFD700] border border-[#DAA520]",
                                  children: b
                                },
                                b
                              )
                            )
                          ]
                        }),
                        u.jsxs("div", {
                          className: "text-2xl font-bold text-[#FFD700] tabular-nums",
                          children: [score, " pts"]
                        })
                      ]
                    }),

                    u.jsx("div", {
                      className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs",
                      children: rows.map((r) =>
                        u.jsxs(
                          "div",
                          {
                            className: "p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1",
                            children: [
                              u.jsx("div", {
                                className: "text-gray-400 font-medium truncate",
                                children: r.label
                              }),
                              u.jsxs("div", {
                                className: "flex items-baseline justify-between gap-2",
                                children: [
                                  u.jsxs("span", {
                                    className: "text-base font-bold text-white tabular-nums",
                                    children: ["×", r.count]
                                  }),
                                  u.jsxs("span", {
                                    className: `font-semibold tabular-nums ${
                                      r.informational ? "text-red-400" : "text-[#DAA520]"
                                    }`,
                                    children: [
                                      r.informational && r.points > 0 ? "+" : "",
                                      r.points,
                                      " pts"
                                    ]
                                  })
                                ]
                              })
                            ]
                          },
                          r.key
                        )
                      )
                    }),

                    cycles.length > 0 &&
                      u.jsxs("div", {
                        className: "pt-2 text-xs text-gray-300 flex flex-wrap items-center gap-2",
                        children: [
                          u.jsx("span", {
                            className: "font-semibold text-gray-400",
                            children: "Time between tips:"
                          }),
                          cycles.map((c, idx) =>
                            u.jsxs(
                              "span",
                              {
                                className: "px-2 py-0.5 rounded bg-white/10 text-white tabular-nums",
                                children: [c, "s"]
                              },
                              idx
                            )
                          )
                        ]
                      })
                  ]
                },
                m.id || matchNumber
              );
            })
          }),

        /* TAB 3: SIDE BY SIDE */
        activeTab === "sideBySide" &&
          u.jsx("div", {
            className: "p-5 rounded-2xl border-2 overflow-x-auto",
            style: statCardStyle,
            children: u.jsxs("table", {
              className: "w-full text-left border-collapse text-xs sm:text-sm",
              children: [
                u.jsx("thead", {
                  children: u.jsxs("tr", {
                    className: "border-b border-white/15 text-gray-400",
                    children: [
                      u.jsx("th", { className: "py-3 pr-4 font-semibold", children: "Metric" }),
                      scoredMatches.map((item) =>
                        u.jsxs(
                          "th",
                          {
                            className: "py-3 px-3 font-bold text-white text-right tabular-nums",
                            children: ["M", item.matchNumber]
                          },
                          item.matchNumber
                        )
                      ),
                      u.jsx("th", {
                        className: "py-3 pl-4 font-bold text-[#FFD700] text-right",
                        children: "Avg"
                      })
                    ]
                  })
                }),
                u.jsxs("tbody", {
                  className: "divide-y divide-white/10",
                  children: [
                    {
                      label: "Total Score (pts)",
                      getVal: (m) => getMatchScore(m, fallbackType),
                      bold: true
                    },
                    {
                      label: "Hive Tips (count)",
                      getVal: (m) => m.tipping ?? 0
                    },
                    {
                      label: "Leave + Park (pts)",
                      getVal: (m) => {
                        const bd = getBreakdown({ ...m, matchType: m.matchType || fallbackType });
                        return bd.leave + bd.park;
                      }
                    },
                    {
                      label: "Owned flower pieces",
                      getVal: (m) => m.flower ?? 0
                    },
                    {
                      label: "Flower nectar at bottom",
                      getVal: (m) => m.flowerBonus ?? 0
                    },
                    {
                      label: "Left in Hive",
                      getVal: (m) => m.ballsInHive ?? 0
                    },
                    {
                      label: "Garden",
                      getVal: (m) => m.garden ?? 0
                    },
                    {
                      label: "Ranking Points (RP)",
                      getVal: (m) =>
                        getMatchRP({ ...m, matchType: m.matchType || fallbackType }).total
                    },
                    {
                      label: "Fouls (pts to opponent)",
                      getVal: (m) =>
                        getBreakdown({ ...m, matchType: m.matchType || fallbackType }).penalties
                    }
                  ].map((row) => {
                    const vals = scoredMatches.map((item) => row.getVal(item.match));
                    const rowAvg =
                      vals.length > 0
                        ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1).replace(/\.0$/, "")
                        : "0";
                    return u.jsxs(
                      "tr",
                      {
                        className: row.bold ? "font-bold text-white bg-white/[0.03]" : "text-gray-200",
                        children: [
                          u.jsx("td", { className: "py-3 pr-4", children: row.label }),
                          vals.map((v, idx) =>
                            u.jsx(
                              "td",
                              {
                                className: "py-3 px-3 text-right tabular-nums",
                                children: v
                              },
                              idx
                            )
                          ),
                          u.jsx("td", {
                            className: "py-3 pl-4 text-right tabular-nums font-bold text-[#FFD700]",
                            children: rowAvg
                          })
                        ]
                      },
                      row.label
                    );
                  })
                })
              ]
            })
          })
      ]
    })
  });
};

export default Analysis;
