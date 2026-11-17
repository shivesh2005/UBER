
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import api, {
  authorizationConfig,
  clearLoginSession,
  getApiErrorMessage,
} from '../lib/api';

import { UserDataContext } from '../context/UserContext';
import { useCaptain } from '../context/CaptainContext';

const UserProtectedWrapper = ({ children }) => {
  const [, setUser] = useContext(UserDataContext);

  const {
    setCaptain,
    resetCaptain,
  } = useCaptain();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const token = localStorage.getItem('token');

  const role =
    localStorage.getItem('role') === 'captain'
      ? 'captain'
      : 'user';

  const loginPath =
    role === 'captain'
      ? '/captain-login'
      : '/login';

  const profilePath =
    role === 'captain'
      ? '/captains/profile'
      : '/users/profile';

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(
          profilePath,
          authorizationConfig(token)
        );

        const profile =
          role === 'captain'
            ? data?.captain
            : data?.user;

        if (!profile) {
          throw new Error(
            'Profile data was not returned by the backend.'
          );
        }

        if (active) {
          if (role === 'captain') {
            setCaptain(profile);
          } else {
            setUser(profile);
          }
        }
      } catch (requestError) {
        if (!active) return;

        console.error(
          'Profile loading error:',
          requestError.response?.data || requestError.message
        );

        if (
          requestError.response?.status === 401 ||
          requestError.response?.status === 403
        ) {
          clearLoginSession();
          setUser({
            email: '',
            fullName: {
              firstName: '',
              lastName: '',
            },
          });
          resetCaptain();
        } else {
          setError(
            getApiErrorMessage(
              requestError,
              'Could not load your profile. Please try again.'
            )
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [
    token,
    role,
    profilePath,
    retry,
    setUser,
    setCaptain,
    resetCaptain,
  ]);

  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />

          <h2 className="text-lg font-semibold">
            Loading your dashboard...
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Please wait while we retrieve your profile.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-600">
            Unable to load your profile
          </h2>

          <p className="mt-3 text-sm text-neutral-600" role="alert">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setRetry((previous) => previous + 1)}
            className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-neutral-800"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return children;
};

export default UserProtectedWrapper;
