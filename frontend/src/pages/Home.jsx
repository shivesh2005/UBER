
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline,
    useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import {
    MapPin,
    Navigation,
    Car,
    Bike,
    Clock,
    IndianRupee,
    LogOut,
    User,
    ChevronDown,
    ChevronUp,
    CreditCard
} from 'lucide-react';

import DestinationSearch from '../components/DestinationSearch';
import api from '../lib/api';

// --------------------------------------------------
// DEFAULT PICKUP LOCATION
// Bhopal is used until the user allows geolocation.
// --------------------------------------------------

const DEMO_PICKUP = {
    lat: 23.2599,
    lng: 77.4126
};

// --------------------------------------------------
// VEHICLE OPTIONS
// --------------------------------------------------

const vehicles = [
    {
        id: 'uberx',
        name: 'UberX',
        description: 'Affordable everyday rides',
        image: 'https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=851/height=638/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYTlmZTg3My0xZjE2LTRjODktYmE0MS0yNzEyMjExMzgwYTkucG5n',
        seats: 4,
        baseFare: 40,
        perKm: 12,
        minimumFare: 70,
        eta: '3 min'
    },
    {
        id: 'auto',
        name: 'Uber Auto',
        description: 'Quick and affordable auto rides',
        image: 'https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=0/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy80ZTcxOGQ1Yy1lNDMxLTU5YzUtYWNiNS1hYzQwYzI2YzI0ZGYud2VicA==',
        seats: 3,
        baseFare: 25,
        perKm: 9,
        minimumFare: 50,
        eta: '2 min'
    },
    {
        id: 'comfort',
        name: 'Comfort',
        description: 'More comfort for your journey',
        image: 'https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy80NDNiODUwYi1mYTg0LTQ4MWQtOTE4NC04ZWU0MWM0NzgwZWUucG5n',
        seats: 4,
        baseFare: 60,
        perKm: 16,
        minimumFare: 100,
        eta: '5 min'
    }
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getCoordinates = (place) => {
    if (!place) return null;

    const lat = Number(
        place.latitude ?? place.lat
    );

    const lng = Number(
        place.longitude ?? place.lon ?? place.lng
    );

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
};

const calculateDistance = (start, end) => {
    const earthRadius = 6371;

    const toRadians = (degrees) => (
        degrees * (Math.PI / 180)
    );

    const latDifference = toRadians(end.lat - start.lat);
    const lngDifference = toRadians(end.lng - start.lng);

    const value =
        Math.sin(latDifference / 2) ** 2 +
        Math.cos(toRadians(start.lat)) *
        Math.cos(toRadians(end.lat)) *
        Math.sin(lngDifference / 2) ** 2;

    const distance =
        2 * earthRadius *
        Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

    return distance;
};

const calculateFare = (vehicle, distance) => {
    const estimatedFare = Math.max(
        vehicle.minimumFare,
        vehicle.baseFare + distance * vehicle.perKm
    );

    return Math.ceil(estimatedFare / 5) * 5;
};

// --------------------------------------------------
// MAP RECENTER COMPONENT
// --------------------------------------------------

function MapRecenter({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(
                [center.lat, center.lng],
                13,
                { duration: 1 }
            );
        }
    }, [center, map]);

    return null;
}

// --------------------------------------------------
// HOME COMPONENT
// --------------------------------------------------

function Home() {
    const navigate = useNavigate();

    const [role] = useState(
        localStorage.getItem('role') || 'user'
    );

    const [pickup, setPickup] = useState(DEMO_PICKUP);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [routeDistance, setRouteDistance] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState('');

    const [showVehicleSheet, setShowVehicleSheet] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    // --------------------------------------------------
    // GET USER'S CURRENT LOCATION
    // --------------------------------------------------

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setPickup({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            () => {
                console.log(
                    'Location permission not granted. Using default location.'
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000
            }
        );
    }, []);

    // --------------------------------------------------
    // DESTINATION COORDINATES
    // --------------------------------------------------

    const destinationCoordinates = useMemo(
        () => getCoordinates(selectedDestination),
        [selectedDestination]
    );

    // --------------------------------------------------
    // GET ROUTE FROM OSRM
    // --------------------------------------------------

    useEffect(() => {
        if (!destinationCoordinates || !pickup) {
            setRouteDistance(null);
            setRouteCoordinates([]);
            setRouteError('');
            return;
        }

        const controller = new AbortController();

        const getRoute = async () => {
            setLoadingRoute(true);
            setRouteError('');

            try {
                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${pickup.lng},${pickup.lat};` +
                    `${destinationCoordinates.lng},${destinationCoordinates.lat}` +
                    `?overview=full&geometries=geojson`;

                const response = await fetch(url, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error('Unable to calculate route.');
                }

                const data = await response.json();

                if (!data.routes || !data.routes.length) {
                    throw new Error('No route found.');
                }

                const route = data.routes[0];

                setRouteDistance(route.distance / 1000);

                setRouteCoordinates(
                    route.geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    )
                );
            } catch (error) {
                if (error.name === 'AbortError') return;

                console.error('Route error:', error);

                // Fallback: straight-line distance
                const fallbackDistance = calculateDistance(
                    pickup,
                    destinationCoordinates
                );

                setRouteDistance(fallbackDistance);

                setRouteCoordinates([
                    [pickup.lat, pickup.lng],
                    [
                        destinationCoordinates.lat,
                        destinationCoordinates.lng
                    ]
                ]);

                setRouteError(
                    'Showing an approximate route. Road distance could not be loaded.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingRoute(false);
                }
            }
        };

        getRoute();

        return () => controller.abort();
    }, [pickup, destinationCoordinates]);

    // --------------------------------------------------
    // SELECT DESTINATION
    // --------------------------------------------------

    const handleDestinationSelect = (place) => {
        setSelectedDestination(place);
        setSelectedVehicle(null);
        setShowVehicleSheet(true);
    };

    // --------------------------------------------------
    // SELECT VEHICLE
    // --------------------------------------------------

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    // --------------------------------------------------
    // CONTINUE TO PAYMENT PAGE
    // --------------------------------------------------

    const handleContinue = () => {
        if (!selectedDestination) {
            alert('Please select your destination first.');
            return;
        }

        if (!destinationCoordinates) {
            alert('The selected destination does not have valid coordinates.');
            return;
        }

        if (!selectedVehicle) {
            alert('Please select a vehicle.');
            return;
        }

        if (routeDistance === null) {
            alert('Please wait while we calculate your route.');
            return;
        }

        const fare = calculateFare(
            selectedVehicle,
            routeDistance
        );

        // Send booking details to the Payment page.
        navigate('/payment', {
            state: {
                vehicle: selectedVehicle,
                destination: selectedDestination,
                pickup,
                fare,
                distance: routeDistance
            }
        });
    };

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            if (role === 'captain') {
                await api.post('/captains/logout');
            } else {
                await api.post('/users/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
            setLoggingOut(false);
        }
    };

    // --------------------------------------------------
    // CAPTAIN DASHBOARD
    // --------------------------------------------------

    if (role === 'captain') {
        return (
            <div className="min-h-screen bg-gray-100">
                <header className="flex items-center justify-between bg-black px-6 py-5 text-white">
                    <h1 className="text-2xl font-bold">
                        Uber Captain
                    </h1>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-black disabled:opacity-50"
                    >
                        <LogOut size={18} />
                        {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </header>

                <main className="mx-auto max-w-3xl p-6">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-full bg-gray-100 p-3">
                                <User size={28} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold">
                                    Captain Dashboard
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Welcome to your captain account.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-100 p-5">
                            <h3 className="font-semibold">
                                Your dashboard
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Your captain account is logged in.
                                Ride requests and trip management can
                                be added here.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --------------------------------------------------
    // RIDER HOME PAGE
    // --------------------------------------------------

    const mapCenter = destinationCoordinates || pickup;

    return (
        <div className="uber-home relative h-screen w-full overflow-hidden bg-gray-100">

            {/* MAP */}

            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[mapCenter.lat, mapCenter.lng]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="uber-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapRecenter center={mapCenter} />

                    {/* PICKUP MARKER */}

                    <CircleMarker
                        center={[pickup.lat, pickup.lng]}
                        radius={9}
                        pathOptions={{
                            color: '#ffffff',
                            fillColor: '#111111',
                            fillOpacity: 1,
                            weight: 3
                        }}
                    >
                        <Popup>Your pickup location</Popup>
                    </CircleMarker>

                    {/* DESTINATION MARKER */}

                    {destinationCoordinates && (
                        <CircleMarker
                            center={[
                                destinationCoordinates.lat,
                                destinationCoordinates.lng
                            ]}
                            radius={9}
                            pathOptions={{
                                color: '#ffffff',
                                fillColor: '#16a34a',
                                fillOpacity: 1,
                                weight: 3
                            }}
                        >
                            <Popup>
                                {selectedDestination?.name ||
                                    selectedDestination?.display_name ||
                                    'Destination'}
                            </Popup>
                        </CircleMarker>
                    )}

                    {/* ROUTE LINE */}

                    {routeCoordinates.length > 0 && (
                        <Polyline
                            positions={routeCoordinates}
                            pathOptions={{
                                color: '#111111',
                                weight: 5,
                                opacity: 0.8
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            {/* TOP HEADER */}

            <header className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between p-4">
                <div className="rounded-xl bg-white px-5 py-3 shadow-lg">
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Uber
                    </h1>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold shadow-lg disabled:opacity-50"
                >
                    <LogOut size={18} />
                    {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </header>

            {/* SEARCH AND BOOKING PANEL */}

            <div className="absolute bottom-0 left-0 right-0 z-[1000] max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:bottom-auto md:left-5 md:top-24 md:max-h-[calc(100vh-130px)] md:w-[410px] md:rounded-2xl">

                <div className="mb-5">
                    <h2 className="text-2xl font-bold">
                        Where to?
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Choose your destination and book a ride.
                    </p>
                </div>

                {/* PICKUP */}

                <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-100 p-4">
                    <div className="rounded-full bg-black p-2 text-white">
                        <Navigation size={17} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs text-gray-500">
                            Pickup location
                        </p>
                        <p className="truncate text-sm font-semibold">
                            {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                        </p>
                    </div>
                </div>

                {/* DESTINATION SEARCH */}

                <div className="mb-5">
                    <div className="mb-2 flex items-center gap-2">
                        <MapPin size={18} />
                        <p className="font-semibold">
                            Enter destination
                        </p>
                    </div>

                    <DestinationSearch
                        onSelect={handleDestinationSelect}
                    />

                    {selectedDestination && (
                        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                            <p className="text-xs text-green-700">
                                Selected destination
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {selectedDestination.name ||
                                    selectedDestination.display_name ||
                                    selectedDestination.formatted_address}
                            </p>
                        </div>
                    )}
                </div>

                {/* ROUTE INFORMATION */}

                {selectedDestination && (
                    <div className="mb-5 rounded-xl bg-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Estimated distance
                            </span>

                            <span className="font-bold">
                                {loadingRoute
                                    ? 'Calculating...'
                                    : routeDistance !== null
                                        ? `${routeDistance.toFixed(1)} km`
                                        : '--'}
                            </span>
                        </div>

                        {routeError && (
                            <p className="mt-2 text-xs text-orange-600">
                                {routeError}
                            </p>
                        )}
                    </div>
                )}

                {/* VEHICLE OPTIONS */}

                {selectedDestination && (
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                Choose a ride
                            </h3>

                            <span className="text-xs text-gray-500">
                                Estimated prices
                            </span>
                        </div>

                        <div className="space-y-3">
                            {vehicles.map((vehicle) => {
                                const fare = routeDistance !== null
                                    ? calculateFare(vehicle, routeDistance)
                                    : null;

                                const isSelected =
                                    selectedVehicle?.id === vehicle.id;

                                return (
                                    <button
                                        key={vehicle.id}
                                        type="button"
                                        onClick={() =>
                                            handleVehicleSelect(vehicle)
                                        }
                                        className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                                            isSelected
                                                ? 'border-black bg-gray-100'
                                                : 'border-gray-200 bg-white hover:border-gray-400'
                                        }`}
                                    >
                                        <img
                                            src={vehicle.image}
                                            alt={vehicle.name}
                                            className="h-16 w-24 object-contain"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold">
                                                    {vehicle.name}
                                                </h4>

                                                {isSelected && (
                                                    <span className="rounded-full bg-black px-2 py-1 text-[10px] text-white">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {vehicle.description}
                                            </p>

                                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User size={13} />
                                                    {vehicle.seats}
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} />
                                                    {vehicle.eta}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="flex items-center justify-end font-bold">
                                                <IndianRupee size={15} />
                                                {fare !== null
                                                    ? fare
                                                    : '--'}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-500">
                                                Estimated
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* CONTINUE BUTTON */}

                {selectedDestination && (
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={
                            !selectedVehicle ||
                            loadingRoute ||
                            routeDistance === null
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        <CreditCard size={19} />
                        Okay, Continue
                    </button>
                )}

                {!selectedDestination && (
                    <div className="rounded-xl bg-gray-100 p-4 text-center">
                        <Car className="mx-auto mb-2 text-gray-500" size={25} />

                        <p className="text-sm font-semibold">
                            Your ride starts here
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Search for a destination to see available rides.
                        </p>
                    </div>
                )}

                <p className="mt-4 text-center text-[11px] text-gray-400">
                    Fares shown are demo estimates, not live Uber prices.
                </p>
            </div>
        </div>
    );
}

export default Home;
