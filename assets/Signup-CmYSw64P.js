import { r as React, u as useNavigate, L as Link } from "./vendor-react-BrRUuK2M.js";
import { u as useAuth, R as ROUTES, j as u, y as toast } from "./index-CrUxzRby.js";
import { I as Input } from "./input-CclZpOgs.js";
import { L as Label } from "./label-Dv6L1btQ.js";

function formatAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/operation-not-allowed") {
    return "Đăng nhập Google chưa được bật trên Firebase! Hãy vào Firebase -> Authentication -> Sign-in method (Connection method) -> bấm vào Google -> gạt nút Enable (góc trên bên phải) -> chọn Email -> bấm Save.";
  }
  if (code === "auth/unauthorized-domain") {
    return `Tên miền (${window.location.hostname}) chưa được thêm vào Firebase -> Authentication -> Settings -> Authorized domains.`;
  }
  if (code === "auth/popup-blocked") {
    return "Trình duyệt đã chặn cửa sổ bật lên (Popup). Hãy cho phép Popup trên trang này rồi bấm lại.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.";
  }
  if (code === "auth/email-already-in-use") {
    return "Email này đã được đăng ký. Hãy chuyển sang trang Sign in.";
  }
  if (code === "auth/weak-password") {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }
  return err?.message || "Đăng ký thất bại. Vui lòng thử lại.";
}

const Signup = () => {
  const { user, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (user) {
      navigate(ROUTES.SESSIONS, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created!");
      navigate(ROUTES.SESSIONS);
    } catch (err) {
      console.error("Signup error:", err);
      const msg = formatAuthError(err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return u.jsx("div", {
    className: "flex-1 flex items-center justify-center p-4 min-h-screen relative z-10",
    children: u.jsxs("div", {
      className: "w-full max-w-[400px] p-8 rounded-xl border-2 border-[#DAA520] bg-[#1f1f1f] shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-6 relative z-20",
      style: { backgroundColor: "#0c0c0c", borderColor: "#DAA520", color: "#ffffff", boxShadow: "0 12px 36px rgba(0, 0, 0, 0.92)" },
      children: [
        u.jsx("h1", {
          className: "text-4xl font-montserrat italic text-white text-center mb-6",
          children: "Create an account"
        }),
        errorMsg && u.jsx("div", {
          className: "p-3 rounded-lg border border-red-500/80 bg-red-950/80 text-red-200 text-xs leading-relaxed",
          children: errorMsg
        }),
        u.jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [
            u.jsxs("div", {
              className: "space-y-2",
              children: [
                u.jsx(Label, { className: "text-[#DAA520] text-sm font-medium", children: "Name" }),
                u.jsxs("div", {
                  className: "relative",
                  children: [
                    u.jsx("span", {
                      className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
                      children: u.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [u.jsx("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), u.jsx("circle", { cx: "12", cy: "7", r: "4" })] })
                    }),
                    u.jsx(Input, {
                      placeholder: "Your name",
                      className: "pl-10 border-[#DAA520] bg-black text-white focus:ring-[#DAA520] focus:border-[#DAA520]",
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      required: true
                    })
                  ]
                }),
                u.jsx("p", { className: "text-xs text-gray-400", children: "Teammates see this. A first name is fine." })
              ]
            }),
            u.jsxs("div", {
              className: "space-y-2",
              children: [
                u.jsx(Label, { className: "text-[#DAA520] text-sm font-medium", children: "Email" }),
                u.jsxs("div", {
                  className: "relative",
                  children: [
                    u.jsx("span", {
                      className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
                      children: u.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [u.jsx("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }), u.jsx("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })] })
                    }),
                    u.jsx(Input, {
                      type: "email",
                      placeholder: "Enter your email",
                      className: "pl-10 border-[#DAA520] bg-black text-white focus:ring-[#DAA520] focus:border-[#DAA520]",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      required: true
                    })
                  ]
                })
              ]
            }),
            u.jsxs("div", {
              className: "space-y-2",
              children: [
                u.jsx(Label, { className: "text-[#DAA520] text-sm font-medium", children: "Password" }),
                u.jsxs("div", {
                  className: "relative",
                  children: [
                    u.jsx("span", {
                      className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
                      children: u.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [u.jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }), u.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] })
                    }),
                    u.jsx(Input, {
                      type: showPassword ? "text" : "password",
                      placeholder: "Create a password",
                      className: "pl-10 pr-10 border-[#DAA520] bg-black text-white focus:ring-[#DAA520] focus:border-[#DAA520]",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      required: true
                    }),
                    u.jsx("button", {
                      type: "button",
                      onClick: () => setShowPassword(!showPassword),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white",
                      children: u.jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: showPassword ? [u.jsx("path", { d: "M9.88 9.88 3.59 3.59" }), u.jsx("path", { d: "M2 12s3-7 10-7a7.14 7.14 0 0 1 3.77 1.11" }), u.jsx("path", { d: "M21 21 4.89 4.89" }), u.jsx("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }), u.jsx("path", { d: "M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" })] : [u.jsx("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), u.jsx("circle", { cx: "12", cy: "12", r: "3" })] })
                    })
                  ]
                }),
                u.jsx("p", { className: "text-xs text-gray-400", children: "Must be at least 6 characters" })
              ]
            }),
            u.jsxs("div", {
              className: "space-y-2",
              children: [
                u.jsx(Label, { className: "text-[#DAA520] text-sm font-medium", children: "Confirm password" }),
                u.jsxs("div", {
                  className: "relative",
                  children: [
                    u.jsx("span", {
                      className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
                      children: u.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [u.jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }), u.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] })
                    }),
                    u.jsx(Input, {
                      type: showPassword ? "text" : "password",
                      placeholder: "Confirm your password",
                      className: "pl-10 border-[#DAA520] bg-black text-white focus:ring-[#DAA520] focus:border-[#DAA520]",
                      value: confirmPassword,
                      onChange: (e) => setConfirmPassword(e.target.value),
                      required: true
                    })
                  ]
                })
              ]
            }),
            u.jsx("button", {
              type: "submit",
              disabled: loading,
              className: "w-full h-12 rounded-md bg-[#DAA520] text-black font-bold hover:bg-[#B8860B] transition-colors mt-6",
              children: loading ? "Creating account..." : "Create account"
            })
          ]
        }),
        u.jsxs("div", {
          className: "relative my-6",
          children: [
            u.jsx("div", { className: "absolute inset-0 flex items-center", children: u.jsx("span", { className: "w-full border-t border-gray-700" }) }),
            u.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: u.jsx("span", { className: "bg-[#0a0a0a] px-2 text-gray-400", children: "OR" }) })
          ]
        }),
        u.jsxs("button", {
          type: "button",
          onClick: async () => {
            setErrorMsg("");
            try {
              await loginWithGoogle();
              toast.success("Signed in with Google!");
              navigate(ROUTES.SESSIONS);
            } catch (e) {
              console.error("Google sign-in error:", e);
              const msg = formatAuthError(e);
              setErrorMsg(msg);
              toast.error(msg);
            }
          },
          className: "w-full h-12 rounded-md border border-[#DAA520] text-white flex items-center justify-center gap-2 hover:bg-[#DAA520]/10 transition-colors",
          children: [
            u.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", children: [u.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), u.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), u.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" }), u.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }),
            "Continue with Google"
          ]
        }),
        u.jsxs("div", {
          className: "flex justify-center mt-6",
          children: [
            u.jsxs("span", {
              className: "text-white text-sm",
              children: ["Already have an account? ", u.jsx(Link, { to: ROUTES.LOGIN, className: "text-[#DAA520] hover:underline", children: "Sign in" })]
            })
          ]
        })
      ]
    })
  });
};

export default Signup;
