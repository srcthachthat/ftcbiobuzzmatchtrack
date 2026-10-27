import { L as Link } from "./vendor-react-BrRUuK2M.js";
import { R as ROUTES, j as u } from "./index-CrUxzRby.js";

const NotFound = () => {
  return u.jsx("div", {
    className: "flex-1 flex items-center justify-center p-4 min-h-[70vh] relative z-10",
    children: u.jsxs("div", {
      className: "w-full max-w-md p-8 rounded-2xl border-2 text-center space-y-4",
      style: {
        backgroundColor: "#0c0c0c",
        borderColor: "#DAA520",
        color: "#ffffff",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.92)"
      },
      children: [
        u.jsx("h1", {
          className: "text-3xl font-montserrat italic font-bold",
          style: { color: "#FFD700" },
          children: "Scienceroboticsclub 28785"
        }),
        u.jsx("p", {
          className: "text-sm",
          style: { color: "#e0e0e0" },
          children: "Go to the Active Match Tracker to score matches."
        }),
        u.jsx("div", {
          className: "pt-2",
          children: u.jsx(Link, {
            to: ROUTES.ACTIVE,
            className: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm",
            style: {
              backgroundColor: "#DAA520",
              color: "#0a0a0a"
            },
            children: "Open Match Tracker"
          })
        })
      ]
    })
  });
};

export default NotFound;
