import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authUserService from "../../services/authUserService";
import { ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

const ForcePasswordResetPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (user?.role === "ADMIN") {
        await authUserService.updateAdminUser(user.id, {
          password: newPassword,
          status: "ACTIVE"
        });
      } else {
        // Teacher/Student mock logic (Not implemented in 12.4)
        throw new Error("Only Admin password resets are supported in Phase 12.4.");
      }
      
      setSuccess(true);
    } catch (err) {
      setError("Failed to update password: " + err.message);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f0faff] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#03045e]">Password Updated</h2>
          <p className="text-sm font-bold text-gray-500">Your password has been successfully changed.</p>
          <button 
            onClick={() => {
              logout(); // Force re-login for security
              navigate("/login");
            }}
            className="w-full py-3 bg-[#0077b6] text-white rounded-xl font-black hover:bg-[#03045e] transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faff] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#03045e]">Security Required</h2>
          <p className="text-xs font-bold text-gray-500 mt-2">
            You must change your temporary password before accessing the system.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">New Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
                placeholder="Enter new password"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Confirm Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] outline-none"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newPassword || !confirmPassword}
              className="flex-1 py-3 px-4 bg-[#0077b6] hover:bg-[#03045e] text-white rounded-xl text-sm font-black transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordResetPage;
