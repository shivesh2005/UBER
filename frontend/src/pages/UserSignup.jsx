import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, {
  getApiErrorMessage,
  saveLoginSession,
} from '../lib/api';
import { UserDataContext } from '../context/UserContext';

function UserSignup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (event) => {
    event.preventDefault();
    setError('');

    if (firstName.trim().length < 3 || lastName.trim().length < 3) {
      setError('First and last names must be at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/users/register', {
        fullName: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        email: email.trim(),
        password,
      });

      if (!data?.user || !data?.token) {
        throw new Error('The server returned an incomplete registration response.');
      }

      const profile = { ...data.user };
      delete profile.password;
      setUser(profile);
      saveLoginSession(data.token, 'user');
      navigate('/home');
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          requestError instanceof Error
            ? requestError.message
            : 'Registration failed. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between p-7">
      <section>
        <Link to="/" className="mb-8 inline-block text-2xl font-bold">
          Uber
        </Link>
        <form onSubmit={submitHandler}>
          <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
          <div className="mb-5 flex gap-3">
            <label className="w-1/2 text-sm font-medium">
              First name
              <input
                required
                minLength={3}
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded border bg-neutral-100 px-3 py-3" />
            </label>
            <label className="w-1/2 text-sm font-medium">
              Last name
              <input
                required
                minLength={3}
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-2 w-full rounded border bg-neutral-100 px-3 py-3" />
            </label>
          </div>
          <label className="mb-5 block text-sm font-medium">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded border bg-neutral-100 px-4 py-3"
              placeholder="email@example.com" />
          </label>
          <label className="mb-5 block text-sm font-medium">
            Password
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded border bg-neutral-100 px-4 py-3"
              placeholder="At least 6 characters" />
          </label>
          {error && (
            <p className="mb-4 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      </section>
      <Link
        to="/captain-signup"
        className="mt-8 rounded bg-emerald-600 px-4 py-3 text-center font-semibold text-white"
      >
        Create a captain account
      </Link>
    </main>
  );
}

export default UserSignup;
