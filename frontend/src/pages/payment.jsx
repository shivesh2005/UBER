
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Car,
    Clock,
    CreditCard,
    ShieldCheck
} from 'lucide-react';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const booking = location.state;

    if (!booking?.vehicle || !booking?.destination) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold">
                    No booking found
                </h1>
                <button
                    onClick={() => navigate('/home')}
                    className="mt-5 bg-black text-white px-6 py-3 rounded-xl"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const { vehicle, destination, fare, distance } = booking;

    const handlePayment = () => {
        alert(
            'Payment gateway is not connected yet. Your booking is currently a demo.'
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-black text-white px-5 py-5 flex items-center gap-4">
                <button onClick={() => navigate('/home')}>
                    <ArrowLeft size={23} />
                </button>
                <h1 className="text-2xl font-bold">Uber</h1>
                <span className="ml-auto font-semibold">
                    Confirm your ride
                </span>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-100 p-6 text-center">
                        <p className="text-gray-500 text-sm font-semibold">
                            YOUR SELECTED RIDE
                        </p>

                        <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-full h-52 object-contain mt-3"
                        />

                        <h2 className="text-3xl font-bold mt-2">
                            {vehicle.name}
                        </h2>

                        <p className="text-gray-500 mt-1">
                            {vehicle.description}
                        </p>

                        <div className="flex justify-center gap-5 mt-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Car size={16} />
                                {vehicle.capacity}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {vehicle.time}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-5">
                            Trip details
                        </h3>

                        <div className="flex gap-3">
                            <MapPin className="shrink-0 mt-1" />

                            <div>
                                <p className="font-semibold">
                                    Your destination
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {destination.address}
                                </p>
                            </div>
                        </div>

                        {distance != null && (
                            <p className="text-sm text-gray-500 mt-4">
                                Estimated distance: {distance.toFixed(1)} km
                            </p>
                        )}

                        <div className="border-t border-gray-200 mt-6 pt-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">
                                        Estimated total
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Your estimated ride fare
                                    </p>
                                </div>

                                <p className="text-3xl font-bold">
                                    ₹{fare}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <ShieldCheck size={22} />
                            <p className="text-sm text-gray-600">
                                Review your ride details before continuing
                                to payment.
                            </p>
                        </div>

                        <button
                            onClick={handlePayment}
                            className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition"
                        >
                            <CreditCard size={21} />
                            Pay ₹{fare}
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Secure payment integration will be added next.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payment;
