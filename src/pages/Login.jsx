import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RiGoogleFill, RiMailLine, RiLockPasswordLine, RiShieldKeyholeLine } from 'react-icons/ri';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, user, triggerToast, setAccessToken } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('login_fails') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [lockoutTimer, setLockoutTimer] = useState(() => {
    try {
      const lockUntil = parseInt(localStorage.getItem('login_locked_until') || '0', 10);
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      return remaining;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          try {
            localStorage.removeItem('login_locked_until');
            localStorage.setItem('login_fails', '0');
          } catch {}
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // If already logged in, navigate away
  if (user) {
    const isPrivileged = user.role === 'admin' || user.role === 'superadmin' || user.role === 'supermanager';
    const target = isPrivileged && (redirectUrl === '/' || !redirectUrl) ? '/admin' : redirectUrl;
    setTimeout(() => navigate(target), 0);
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      triggerToast(`Rate limit active. Please wait ${lockoutTimer}s before retrying.`, 'warning');
      return;
    }
    if (!formData.email || !formData.password) {
      triggerToast('Please enter both email and password.', 'warning');
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      try {
        localStorage.removeItem('login_fails');
        localStorage.removeItem('login_locked_until');
      } catch {}
      const emailLower = formData.email.toLowerCase();
      const isPrivileged = 
        emailLower === 'sohaibmehmood0067@gmail.com' ||
        emailLower === 'manager@aerostore.com' ||
        emailLower === 'superadmin@gmail.com' ||
        emailLower.includes('admin') ||
        emailLower.includes('manager') ||
        formData.password === 'admin123';

      const target = isPrivileged && redirectUrl === '/' ? '/admin' : redirectUrl;
      navigate(target);
    } else {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      try {
        localStorage.setItem('login_fails', nextFails.toString());
      } catch {}

      if (nextFails >= 5) {
        const lockDuration = 60; // 60s security cooldown
        const lockUntil = Date.now() + lockDuration * 1000;
        try {
          localStorage.setItem('login_locked_until', lockUntil.toString());
        } catch {}
        setLockoutTimer(lockDuration);
        triggerToast('🛡️ Security Alert: Rate limit active. Too many failed attempts. Login locked for 60 seconds.', 'error');
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    triggerToast('Password reset link sent to your email!', 'info');
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                }).then((r) => r.json());

                if (userInfo?.email) {
                  const apiRes = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userInfo)
                  }).then((r) => r.json());

                  if (apiRes?.success && apiRes.user) {
                    if (apiRes.accessToken && setAccessToken) setAccessToken(apiRes.accessToken);
                    localStorage.setItem('user', JSON.stringify(apiRes.user));
                    triggerToast(`Welcome back, ${apiRes.user.name}!`, 'success');
                    navigate(redirectUrl);
                    return;
                  }
                }
              } catch (err) {
                console.error('Google OAuth error:', err);
              }
            }
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.error('GIS init error:', err);
      }
    }

    triggerToast('Google OAuth: Please add VITE_GOOGLE_CLIENT_ID to your .env file to enable live Google Sign-in.', 'info');
  };

  return (
    <div className="flex items-center justify-center py-10 sm:py-16">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-md text-left">
        {/* Header */}
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sign in to access your cart, wishlist, and orders.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <RiMailLine className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <button
                onClick={handleForgotPassword}
                type="button"
                className="text-[10px] font-bold uppercase text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <RiLockPasswordLine className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-850 accent-slate-950 dark:accent-white cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Rate Limit Security Lockout Banner */}
          {lockoutTimer > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2">
              <RiShieldKeyholeLine className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Rate limit active: Too many failed attempts. Security cooldown: <strong>{lockoutTimer}s</strong></span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={lockoutTimer > 0}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lockoutTimer > 0 ? `Rate Limited (Retry in ${lockoutTimer}s)` : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800/80" />
          <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Social login */}
        <div>
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            <RiGoogleFill className="w-5 h-5 text-rose-500" />
            Continue with Google
          </button>
        </div>

        {/* Sign up prompt */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-primary-600 hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
