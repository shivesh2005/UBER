
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Start from './pages/Start';
import UserSignup from './pages/UserSignup';
import UserLogin from './pages/UserLogin';
import CaptainLogin from './pages/CaptainLogin';
import CaptainSignup from './pages/CaptainSignup';
import Home from './pages/Home';
import Payment from './pages/payment';

import UserProtectedWrapper from './pages/UserProtectedWrapper';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Start />} />

            {/* User Authentication */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />

            {/* Captain Authentication */}
            <Route path="/captain-login" element={<CaptainLogin />} />
            <Route path="/captain-signup" element={<CaptainSignup />} />

            {/* Protected Home Page */}
            <Route
                path="/home"
                element={
                    <UserProtectedWrapper>
                        <Home />
                    </UserProtectedWrapper>
                }
            />

            {/* Payment Page */}
            <Route
                path="/payment"
                element={
                    <UserProtectedWrapper>
                        <Payment />
                    </UserProtectedWrapper>
                }
            />

            {/* Unknown Routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
