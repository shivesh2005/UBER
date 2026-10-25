
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();

    const data = {
      fullName: {
        firstName,
        lastName,
      },
      email,
      password,
    };

    setUserData(data);
    console.log('Signup Data:', data);
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-16 mb-10"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />

        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">
            What's your name?
          </h3>

          <div className="flex gap-4 mb-5">
            <input
              required
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              required
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <h3 className="text-lg font-medium mb-2">
            What's your email?
          </h3>

          <input
            required
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <h3 className="text-lg font-medium mb-2">
            Enter Password
          </h3>

          <input
            required
            minLength={8}
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-5 rounded px-4 py-2 w-full text-lg"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>

      <div>
        <Link
          to="/captain-login"
          className="bg-[#10b461] flex items-center justify-center text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg"
        >
          Sign in as Captain
        </Link>

        <p className="text-xs text-gray-500 text-center leading-5">
          By continuing, you agree to our Terms of Service and
          acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
