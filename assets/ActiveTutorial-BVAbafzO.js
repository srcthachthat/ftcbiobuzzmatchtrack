import { r as c } from "./vendor-react-BrRUuK2M.js";
import { j as u, ar as useSession, bQ as useClock, S as V, bd as START_EVENT } from "./index-CrUxzRby.js";

const STEPS = [
  {
    id: "start",
    title: "Bắt đầu trận đấu (Start a Match)",
    selectors: ['[data-tutorial="timer"]', '[data-tutorial="controls"]'],
    placement: "bottom-right",
    body: [
      "Bấm Start Match để chạy đồng hồ đếm ngược 2:30 (0:30 Auto → 3s nhặt tay cầm → 2:00 Teleop) kèm âm thanh sân đấu chuẩn FTC.",
      "Bấm nút ⋮ ở góc phải để Đổi tên (Rename), chọn chế độ đấu (Full Game, Autonomous, Teleop) hoặc hủy phiên."
    ],
    note: "Mọi thao tác bấm thử trong hướng dẫn này đều không làm ảnh hưởng dữ liệu thật."
  },
  {
    id: "live",
    title: "Ghi điểm trong trận (Hive Tips, Robot & Fouls)",
    selectors: ['[data-tutorial="live"]'],
    placement: "bottom-right",
    body: [
      "Ô Hive Tips (+20đ/tip): Bấm +1 Tip hoặc -1 Tip ngay trong ô (hoặc phím tắt T) để cộng/trừ điểm và tự động đo Cycle Time.",
      "Robot 1 & Robot 2: Tích chọn Leave (+3đ), Park (Auto) (+5đ), Park (End) (+5đ). Ô FOULS ghi nhận lỗi Minor (+5đ) và Major (+20đ cho đối thủ)."
    ],
    note: "Bạn có thể bấm thử trực tiếp vào các nút đang sáng! Trong trận có thể bấm Pause (phím P) hoặc Skip."
  },
  {
    id: "end-of-match",
    title: "Đếm điểm cuối trận (End of Match)",
    selectors: ['[data-tutorial="end-of-match"]'],
    placement: "bottom-right",
    body: [
      "Mở khóa khi hết giờ (buzzer) hoặc khi bấm Pause. Dùng nút - / + để đếm:",
      "• Owned flower pieces (+2đ/mảnh) & Flower nectar at bottom (+5đ/hoa, tối đa 4).",
      "• Left in Hive (+2đ/viên) & Garden (+1đ/mảnh)."
    ],
    note: "Hãy thử bấm nút + / - trên các ô đang sáng để xem điểm số tự động cộng."
  },
  {
    id: "breakdown",
    title: "Tổng điểm & Ranking Points (Total & RP)",
    selectors: ['[data-tutorial="breakdown"]', '[data-breakdown-card]'],
    placement: "top-right",
    body: [
      "TOTAL tự động tổng hợp điểm số toàn trận theo thời gian thực.",
      "• SWARM RP: Đạt khi tổng điểm Leave + Park của 2 robot đủ 16/16 điểm.",
      "• POLLINATOR RP: Đạt mốc khi ghi được 4 hoặc 7 Hive Tips."
    ],
    note: "Điểm lỗi FOULS của đội mình được hiển thị riêng (+pts to opponent)."
  },
  {
    id: "save-finish",
    title: "Lưu trận, Hoàn tất & Xem Biểu đồ (Save & Finish)",
    selectors: ['[data-tutorial="controls"]'],
    placement: "below-target",
    body: [
      "Bấm Save Match sau mỗi trận để lưu vào danh sách. Khi đấu xong, bấm Complete Session để lưu toàn bộ phiên về trang Sessions.",
      "Tại trang Sessions, bấm vào bất kỳ phiên nào để mở trang Analysis xem Biểu đồ xu hướng, sửa lại điểm từng trận hoặc Xuất file CSV."
    ],
    note: "Nếu đang đấu dở mà thoát ra trang Sessions, đồng hồ sẽ tự dừng và trận đang dở sẽ bị hủy."
  }
];

const PAD = 8;

export const ActiveTutorial = ({ openOnMount = false }) => {
  const session = useSession();
  const clock = useClock();
  const {
    sessionData,
    updateSessionData,
    matchActive,
    setMatchActive,
    matchPhase,
    setMatchPhase,
    isTimerRunning,
    setIsTimerRunning,
    isPickupPaused,
    setIsPickupPaused,
    editingMatchId,
    setEditingMatchId,
    setIsTutorialActive
  } = session;
  const { setTimer } = clock;

  const [open, setOpen] = c.useState(() => {
    try {
      if (sessionStorage.getItem(V.START_TUTORIAL) !== null) {
        sessionStorage.removeItem(V.START_TUTORIAL);
        return true;
      }
    } catch {}
    return !!openOnMount;
  });
  const [stepIdx, setStepIdx] = c.useState(0);
  const [rects, setRects] = c.useState([]);
  const [viewport, setViewport] = c.useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800
  });
  const snapshotRef = c.useRef(null);
  const cardRef = c.useRef(null);

  const captureSnapshot = c.useCallback(() => {
    if (snapshotRef.current) return;
    let currentTimer = 150;
    try {
      currentTimer = session.getTimers ? session.getTimers().timer : clock.timer;
    } catch {}
    snapshotRef.current = {
      sessionData: JSON.parse(JSON.stringify(sessionData)),
      matchActive,
      matchPhase,
      isTimerRunning,
      isPickupPaused,
      editingMatchId,
      timer: currentTimer
    };
  }, [sessionData, matchActive, matchPhase, isTimerRunning, isPickupPaused, editingMatchId, session, clock]);

  const restoreSnapshot = c.useCallback(() => {
    const snap = snapshotRef.current;
    if (!snap) return;
    snapshotRef.current = null;
    try {
      setIsTimerRunning(false);
      setEditingMatchId(snap.editingMatchId ?? null);
      updateSessionData(snap.sessionData);
      setMatchActive(snap.matchActive);
      setMatchPhase(snap.matchPhase);
      setIsPickupPaused(snap.isPickupPaused);
      if (typeof setTimer === "function" && typeof snap.timer === "number") {
        setTimer(snap.timer);
      }
    } catch {}
  }, [setIsTimerRunning, setEditingMatchId, updateSessionData, setMatchActive, setMatchPhase, setIsPickupPaused, setTimer]);

  const startTutorial = c.useCallback(() => {
    try {
      sessionStorage.removeItem(V.START_TUTORIAL);
    } catch {}
    captureSnapshot();
    setIsTutorialActive(true);
    setStepIdx(0);
    setOpen(true);
  }, [captureSnapshot, setIsTutorialActive]);

  const closeTutorial = c.useCallback(() => {
    setOpen(false);
    restoreSnapshot();
    setIsTutorialActive(false);
    try {
      localStorage.setItem(V.TUTORIAL_SEEN, "true");
    } catch {}
  }, [restoreSnapshot, setIsTutorialActive]);

  c.useEffect(() => {
    if (open) {
      captureSnapshot();
      setIsTutorialActive(true);
    }
  }, [open, captureSnapshot, setIsTutorialActive]);

  c.useEffect(() => {
    const onStartEvent = () => startTutorial();
    window.addEventListener(START_EVENT, onStartEvent);
    return () => window.removeEventListener(START_EVENT, onStartEvent);
  }, [startTutorial]);

  c.useEffect(() => {
    return () => {
      if (snapshotRef.current) {
        restoreSnapshot();
        setIsTutorialActive(false);
      }
    };
  }, [restoreSnapshot, setIsTutorialActive]);

  // Apply simulated UI state for each tutorial step so controls unlock just like the video
  c.useEffect(() => {
    if (!open) return;
    setEditingMatchId(null);
    setIsTimerRunning(false);

    if (stepIdx === 0) {
      setMatchActive(false);
      setMatchPhase("auton");
      if (typeof setTimer === "function") setTimer(150);
      updateSessionData({
        sessionName: (snapshotRef.current?.sessionData?.sessionName || "Match 1"),
        matchType: "Full Game",
        sessionType: "Match",
        robots: 2,
        matches: [],
        tipping: 0,
        robot1Leave: false,
        robot1ParkAuto: false,
        robot1ParkTeleop: false,
        robot2Leave: false,
        robot2ParkAuto: false,
        robot2ParkTeleop: false,
        minorPenalties: 0,
        majorPenalties: 0,
        flower: 0,
        flowerBonus: 0,
        ballsInHive: 0,
        garden: 0
      });
    } else if (stepIdx === 1) {
      setMatchActive(true);
      setMatchPhase("teleop");
      if (typeof setTimer === "function") setTimer(105);
    } else if (stepIdx === 2) {
      setMatchActive(true);
      setMatchPhase("ended");
      if (typeof setTimer === "function") setTimer(0);
    } else if (stepIdx === 3) {
      setMatchActive(true);
      setMatchPhase("ended");
      if (typeof setTimer === "function") setTimer(0);
      if ((sessionData.tipping ?? 0) === 0 && !sessionData.robot1Leave && (sessionData.flower ?? 0) === 0) {
        updateSessionData({
          tipping: 4,
          robot1Leave: true,
          robot1ParkAuto: true,
          robot2Leave: true,
          robot2ParkTeleop: true,
          flower: 4,
          flowerBonus: 2,
          ballsInHive: 2,
          garden: 3
        });
      }
    } else if (stepIdx === 4) {
      setMatchActive(false);
      setMatchPhase("auton");
      if (typeof setTimer === "function") setTimer(150);
      updateSessionData({
        matches: [
          {
            id: "tutorial-sample-1",
            matchNumber: 1,
            matchType: "Full Game",
            totalScore: 125,
            tipping: 4,
            robot1Leave: true,
            robot1ParkAuto: true,
            robot1ParkTeleop: false,
            robot2Leave: true,
            robot2ParkAuto: false,
            robot2ParkTeleop: true,
            flower: 4,
            flowerBonus: 2,
            ballsInHive: 2,
            garden: 3,
            minorPenalties: 0,
            majorPenalties: 0
          }
        ]
      });
    }
  }, [open, stepIdx]);

  const measureTargets = c.useCallback(() => {
    if (!open) return;
    const step = STEPS[stepIdx];
    if (!step) return;
    const found = [];
    for (const sel of step.selectors) {
      const nodes = document.querySelectorAll(sel);
      for (const el of nodes) {
        if (!(el instanceof HTMLElement)) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 4 && r.height > 4) {
          found.push({
            top: r.top - PAD,
            left: r.left - PAD,
            width: r.width + PAD * 2,
            height: r.height + PAD * 2,
            bottom: r.bottom + PAD,
            right: r.right + PAD
          });
        }
      }
    }
    setRects(found);
    setViewport({ w: window.innerWidth, h: window.innerHeight });
  }, [open, stepIdx]);

  // Scroll highlighted element into view smoothly when step changes
  c.useEffect(() => {
    if (!open) return;
    const step = STEPS[stepIdx];
    if (!step) return;
    const timerId = setTimeout(() => {
      for (const sel of step.selectors) {
        const el = document.querySelector(sel);
        if (el instanceof HTMLElement) {
          const r = el.getBoundingClientRect();
          if (r.width > 4 && r.height > 4) {
            const headerH = document.querySelector("header")?.getBoundingClientRect().bottom ?? 72;
            if (r.top < headerH + 16 || r.bottom > window.innerHeight - 80) {
              const targetY = Math.max(0, window.scrollY + r.top - headerH - 24);
              window.scrollTo({ top: targetY, behavior: "smooth" });
            }
            break;
          }
        }
      }
      measureTargets();
    }, 60);
    return () => clearTimeout(timerId);
  }, [open, stepIdx, measureTargets]);

  c.useEffect(() => {
    if (!open) return;
    measureTargets();
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measureTargets);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [open, stepIdx, sessionData, matchActive, matchPhase, measureTargets]);

  // Keyboard shortcuts: Escape to close, ArrowRight / ArrowLeft to navigate
  c.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeTutorial();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (stepIdx < STEPS.length - 1) setStepIdx((s) => s + 1);
        else closeTutorial();
      } else if (e.key === "ArrowLeft" && stepIdx > 0) {
        e.preventDefault();
        setStepIdx((s) => s - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stepIdx, closeTutorial]);

  if (!open) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  // Compute card position so it looks like the video and doesn't cover the spotlight target
  let cardStyle = {
    position: "fixed",
    zIndex: 9999,
    width: "min(25rem, calc(100vw - 2rem))",
    backgroundColor: "#0c0c0c",
    borderColor: "#DAA520",
    color: "#ffffff",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 24px rgba(218, 165, 32, 0.28)"
  };

  if (step.placement === "below-target" && rects.length > 0) {
    const primary = rects[0];
    const topPos = Math.min(viewport.h - 240, Math.max(80, primary.bottom + 14));
    cardStyle.top = `${topPos}px`;
    cardStyle.left = "50%";
    cardStyle.transform = "translateX(-50%)";
  } else if (step.placement === "top-right") {
    cardStyle.top = "5.5rem";
    cardStyle.right = "1.25rem";
  } else {
    cardStyle.bottom = "1.25rem";
    cardStyle.right = "1.25rem";
  }

  return u.jsxs(c.Fragment, {
    children: [
      u.jsxs("svg", {
        "aria-hidden": "true",
        className: "fixed inset-0 pointer-events-none",
        style: { zIndex: 9990, width: "100vw", height: "100vh" },
        children: [
          u.jsx("defs", {
            children: u.jsxs("mask", {
              id: "biobuzz-tutorial-mask",
              children: [
                u.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: "white" }),
                rects.map((r, idx) =>
                  u.jsx(
                    "rect",
                    {
                      x: Math.max(0, r.left),
                      y: Math.max(0, r.top),
                      width: Math.max(0, r.width),
                      height: Math.max(0, r.height),
                      rx: "18",
                      ry: "18",
                      fill: "black"
                    },
                    idx
                  )
                )
              ]
            })
          }),
          u.jsx("rect", {
            x: "0",
            y: "0",
            width: "100%",
            height: "100%",
            fill: "rgba(0, 0, 0, 0.74)",
            mask: "url(#biobuzz-tutorial-mask)"
          })
        ]
      }),
      rects.map((r, idx) =>
        u.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "fixed pointer-events-none rounded-[18px] transition-all duration-200",
            style: {
              zIndex: 9991,
              top: `${r.top}px`,
              left: `${r.left}px`,
              width: `${r.width}px`,
              height: `${r.height}px`,
              border: "2px solid #DAA520",
              boxShadow: "0 0 22px rgba(218, 165, 32, 0.45), inset 0 0 12px rgba(218, 165, 32, 0.15)"
            }
          },
          `ring-${idx}`
        )
      ),
      u.jsxs("div", {
        ref: cardRef,
        role: "dialog",
        "aria-modal": "false",
        "aria-label": step.title,
        "data-tutorial-card": "true",
        className: "rounded-2xl border-2 p-5 transition-all duration-200",
        style: cardStyle,
        children: [
          u.jsxs("div", {
            className: "flex items-start justify-between gap-3 mb-2.5",
            children: [
              u.jsx("h3", {
                className: "text-base sm:text-lg font-bold leading-snug",
                style: { color: "#ffffff" },
                children: step.title
              }),
              u.jsxs("span", {
                className: "text-xs font-semibold tabular-nums shrink-0 pt-0.5",
                style: { color: "#9ca3af" },
                children: [stepIdx + 1, " / ", STEPS.length]
              })
            ]
          }),
          u.jsx("div", {
            className: "space-y-2 text-xs sm:text-sm leading-relaxed",
            style: { color: "#f3f4f6" },
            children: step.body.map((line, i) => u.jsx("p", { children: line }, i))
          }),
          step.note &&
            u.jsx("p", {
              className: "mt-2.5 text-xs leading-relaxed",
              style: { color: "#9ca3af" },
              children: step.note
            }),
          u.jsxs("div", {
            className: "mt-4 pt-2 flex items-center justify-between gap-2",
            children: [
              u.jsx("button", {
                type: "button",
                onClick: closeTutorial,
                className: "text-xs sm:text-sm font-semibold px-2 py-1.5 rounded-lg transition-colors hover:text-white",
                style: { color: "#9ca3af" },
                children: "Skip"
              }),
              u.jsxs("div", {
                className: "flex items-center gap-2 ml-auto",
                children: [
                  stepIdx > 0 &&
                    u.jsx("button", {
                      type: "button",
                      onClick: () => setStepIdx((s) => Math.max(0, s - 1)),
                      className: "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-colors hover:bg-white/10",
                      style: {
                        backgroundColor: "transparent",
                        borderColor: "#6b7280",
                        color: "#ffffff"
                      },
                      children: "Back"
                    }),
                  u.jsx("button", {
                    type: "button",
                    onClick: () => {
                      if (isLast) closeTutorial();
                      else setStepIdx((s) => s + 1);
                    },
                    className: "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all hover:brightness-110",
                    style: {
                      backgroundColor: "#DAA520",
                      borderColor: "#DAA520",
                      color: "#0a0a0a"
                    },
                    children: isLast ? "Done" : "Next"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};
export default ActiveTutorial;
