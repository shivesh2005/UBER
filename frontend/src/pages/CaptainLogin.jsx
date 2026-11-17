
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Car,
} from 'lucide-react';

import api, {
  getApiErrorMessage,
  saveLoginSession,
} from '../lib/api';

import { useCaptain } from '../context/CaptainContext';

const CaptainLogin = () => {
  const navigate = useNavigate();

  const {
    setCaptain,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useCaptain();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await api.post('/captains/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.captain || !data?.token) {
        throw new Error(
          'The server returned an incomplete login response.'
        );
      }

      // Update Captain Context
      setCaptain(data.captain);

      // Save captain authentication session
      saveLoginSession(data.token, 'captain');

      // Clear form
      setEmail('');
      setPassword('');

      // Navigate to captain home
      navigate('/home', { replace: true });

    } catch (requestError) {
      console.error(
        'Captain login error:',
        requestError.response?.data || requestError.message
      );

      setError(
        getApiErrorMessage(
          requestError,
          requestError instanceof Error
            ? requestError.message
            : 'Captain login failed. Please try again.'
        )
      );

    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5';

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8 sm:px-6">

      <div className="w-full max-w-md">

        {/* Brand */}
        <header className="mb-7 flex items-center justify-between">
          <Link to="/" className="text-3xl font-extrabold tracking-tight">
            Uber
          </Link>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
            Captain Portal
          </span>
        </header>

        {/* Login Card */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-200/60">

          {/* Card Header */}
          <div className="bg-black px-7 py-9 text-white sm:px-9">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Car size={29} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-neutral-300">
              Sign in to continue your journey with Uber.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6 p-7 sm:p-9">

            {/* Email */}
            <div>
              <label
                htmlFor="captain-email"
                className="block text-sm font-semibold text-neutral-800"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="captain-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="captain-password"
                className="block text-sm font-semibold text-neutral-800"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="captain-password"
                  name="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  className={`${inputClass} pl-12 pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to your account
                  <ArrowRight size={19} />
                </>
              )}
            </button>

            {/* Signup Link */}
            <p className="text-center text-sm text-neutral-600">
              New to Uber?{' '}
              <Link
                to="/captain-signup"
                className="font-semibold text-black underline underline-offset-4"
              >
                Create a captain account
              </Link>
            </p>

          </form>
        </section>

        {/* Rider Login */}
        <Link
          to="/login"
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700"
        >
          Sign in as a rider
        </Link>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Secure sign-in for Uber Captain accounts.
        </p>

      </div>
    </main>
  );
};

export default CaptainLogin;
