
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import UserSignup from './pages/UserSignup';
import UserLogin from './pages/UserLogin';
import CaptainLogin from './pages/CaptainLogin';
import CaptainSignup from './pages/CaptainSignup';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/Captain-Login" element={<CaptainLogin />} />
      <Route path="/Captain-Signup" element={<CaptainSignup />} />
    </Routes>
  );
};

export default App;
