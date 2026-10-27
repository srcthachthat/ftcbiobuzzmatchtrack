import { r as React, L as Link } from "./vendor-react-BrRUuK2M.js";
import { u as useAuth, R as ROUTES, j as u } from "./index-CrUxzRby.js";
import { I as Input } from "./input-CclZpOgs.js";
import { L as Label } from "./label-Dv6L1btQ.js";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error("Reset error:", err);
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
          className: "text-3xl font-montserrat italic text-white text-center mb-8",
          children: "Reset Password"
        }),
        success ? u.jsxs("div", {
          className: "text-center space-y-4",
          children: [
            u.jsx("p", { className: "text-white", children: "Check your email for reset instructions." }),
            u.jsx(Link, { to: ROUTES.LOGIN, className: "text-[#DAA520] hover:underline block", children: "Back to login" })
          ]
        }) : u.jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [
            u.jsxs("div", {
              className: "space-y-2",
              children: [
                u.jsx(Label, { className: "text-[#DAA520] text-sm font-medium", children: "Email" }),
                u.jsx(Input, {
                  type: "email",
                  placeholder: "Enter your email address",
                  className: "border-[#DAA520] bg-black text-white focus:ring-[#DAA520] focus:border-[#DAA520]",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true
                })
              ]
            }),
            u.jsx("button", {
              type: "submit",
              disabled: loading,
              className: "w-full h-12 rounded-md bg-[#DAA520] text-black font-bold hover:bg-[#B8860B] transition-colors mt-6",
              children: loading ? "Sending..." : "Send Reset Link"
            }),
            u.jsx(Link, {
              to: ROUTES.LOGIN,
              className: "text-[#DAA520] hover:underline text-center block text-sm",
              children: "Back to login"
            })
          ]
        })
      ]
    })
  });
};

export default ForgotPassword;
