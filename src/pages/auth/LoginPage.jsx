import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap } from "lucide-react";
import LoginForm from "../../components/auth/LoginForm";
import RoleSelector from "../../components/auth/RoleSelector";
import MainCard from "../../components/MainCard";
import { resetERPData } from "../../initialization/initializeERP";

const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated && role) {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }

  const handleLogin = async (roleCtx, username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(roleCtx, username, password);
      // navigation is handled by the redirect above once isAuthenticated is true
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center p-6">
      <MainCard className="w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px] shadow-2xl p-0">
        {/* Left/Main Section - ERP Branding */}
        <div className="bg-[#03045e] p-12 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4 leading-tight">
              Welcome to
              <br />
              <span className="text-[#00b4d8]">EduDash ERP</span>
            </h1>
            <p className="text-blue-200 font-medium leading-relaxed max-w-sm">
              The centralized institutional management system. Access your
              personalized dashboard, manage records, and stay connected with
              the academic ecosystem.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">
              Secure Relational Portal
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00b4d8]"></div>
              <div className="w-2 h-2 rounded-full bg-[#00b4d8]/50"></div>
              <div className="w-2 h-2 rounded-full bg-[#00b4d8]/30"></div>
            </div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-[#0077b6] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#00b4d8] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        </div>

        {/* Right Section - Login Form */}
        <div className="p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#03045e] mb-2">Sign In</h2>
            <p className="text-gray-500 font-medium text-sm">
              Enter your institutional credentials to continue
            </p>
          </div>

          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />

          <LoginForm
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to completely reset all institutional ERP data to standard seeds? This will clear all custom inputs.",
                  )
                ) {
                  resetERPData();
                }
              }}
              className="text-[10px] font-black text-[#0077b6] hover:text-[#03045e] transition-colors uppercase tracking-widest outline-none"
            >
              Reset Demo ERP Database
            </button>
          </div>
        </div>
      </MainCard>
    </div>
  );
};

export default LoginPage;
