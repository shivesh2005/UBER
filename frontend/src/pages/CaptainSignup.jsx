
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Car,
  Bike,
  Truck,
  Palette,
  Hash,
  Users,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

import api, {
  getApiErrorMessage,
  saveLoginSession,
} from '../lib/api';

import { useCaptain } from '../context/CaptainContext';

const CaptainSignup = () => {
  const navigate = useNavigate();

  const { setCaptain, isLoading, setIsLoading, error, setError } =
    useCaptain();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    vehicleColor: '',
    vehiclePlate: '',
    vehicleCapacity: '',
    vehicleModel: '',
    vehicleType: '',
  });

  const [success, setSuccess] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError(null);
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      vehicleColor,
      vehiclePlate,
      vehicleCapacity,
      vehicleModel,
      vehicleType,
    } = formData;

    if (firstName.trim().length < 3) {
      return 'First name must contain at least 3 characters.';
    }

    if (lastName.trim().length < 3) {
      return 'Last name must contain at least 3 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must contain at least 6 characters.';
    }

    if (vehicleColor.trim().length < 3) {
      return 'Please enter a valid vehicle color.';
    }

    if (vehiclePlate.trim().length < 3) {
      return 'Please enter a valid vehicle plate number.';
    }

    if (vehicleModel.trim().length < 2) {
      return 'Please enter your vehicle model.';
    }

    if (
      !Number.isInteger(Number(vehicleCapacity)) ||
      Number(vehicleCapacity) < 1
    ) {
      return 'Vehicle capacity must be a whole number greater than zero.';
    }

    if (!['car', 'bike', 'van'].includes(vehicleType)) {
      return 'Please select a vehicle type.';
    }

    return null;
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setError(null);
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        fullName: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        },
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        vehicle: {
          color: formData.vehicleColor.trim(),
          plate: formData.vehiclePlate.trim().toUpperCase(),
          capacity: Number(formData.vehicleCapacity),
          model: formData.vehicleModel.trim(),
          vehicleType: formData.vehicleType,
        },
      };

      const { data } = await api.post('/captains/register', payload);

      if (!data?.captain || !data?.token) {
        throw new Error(
          'Registration response is incomplete. Please check your backend.'
        );
      }

      setCaptain(data.captain);

      saveLoginSession(data.token, 'captain');

      setSuccess('Your captain account has been created successfully!');

      navigate('/home', { replace: true });

    } catch (requestError) {
      console.error(
        'Captain registration error:',
        requestError.response?.data || requestError.message
      );

      setError(
        getApiErrorMessage(
          requestError,
          requestError instanceof Error
            ? requestError.message
            : 'Registration failed. Please try again.'
        )
      );

    } finally {
      setIsLoading(false);
    }
  };

  const vehicleOptions = [
    {
      value: 'car',
      label: 'Car',
      description: 'Comfortable rides',
      Icon: Car,
    },
    {
      value: 'bike',
      label: 'Bike',
      description: 'Quick trips',
      Icon: Bike,
    },
    {
      value: 'van',
      label: 'Van',
      description: 'More passengers',
      Icon: Truck,
    },
  ];

  const inputClass =
    'mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5';

  const labelClass = 'block text-sm font-semibold text-neutral-800';

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-7 flex items-center justify-between">
          <Link to="/" className="text-3xl font-extrabold tracking-tight">
            Uber
          </Link>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
            Captain registration
          </span>
        </header>

        {/* Main Card */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-200/60">

          <div className="bg-black px-6 py-8 text-white sm:px-9">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Car size={25} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Become a Captain
            </h1>

            <p className="mt-2 text-sm text-neutral-300">
              Create your account and start earning with Uber.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-8 p-6 sm:p-9">

            {/* Personal Information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-bold text-neutral-900">
                    Personal information
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Enter your basic details.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  First name
                  <input
                    required
                    minLength={3}
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={updateField}
                    placeholder="First name"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Last name
                  <input
                    required
                    minLength={3}
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={updateField}
                    placeholder="Last name"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className={`${labelClass} mt-4`}>
                Email address

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </label>

              <label className={`${labelClass} mt-4`}>
                Password

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={updateField}
                    placeholder="Create a password"
                    className={`${inputClass} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <span className="mt-2 block text-xs font-normal text-neutral-500">
                  Use at least 6 characters.
                </span>
              </label>
            </section>

            <div className="border-t border-neutral-100" />

            {/* Vehicle Information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <Car size={18} />
                </div>

                <div>
                  <h2 className="font-bold text-neutral-900">
                    Vehicle information
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tell us about the vehicle you drive.
                  </p>
                </div>
              </div>

              <label className={labelClass}>
                Vehicle model
                <input
                  required
                  minLength={2}
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={updateField}
                  placeholder="e.g. Swift, Activa, Innova"
                  className={inputClass}
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Vehicle color

                  <div className="relative">
                    <Palette
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      required
                      minLength={3}
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={updateField}
                      placeholder="e.g. White"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </label>

                <label className={labelClass}>
                  Number plate

                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      required
                      minLength={3}
                      name="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={updateField}
                      placeholder="e.g. MP 04 AB 1234"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </label>
              </div>

              <label className={`${labelClass} mt-4`}>
                Passenger capacity

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    name="vehicleCapacity"
                    value={formData.vehicleCapacity}
                    onChange={updateField}
                    placeholder="e.g. 4"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </label>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-neutral-800">
                  Select vehicle type
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {vehicleOptions.map(({ value, label, description, Icon }) => {
                    const selected = formData.vehicleType === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setFormData((previous) => ({
                            ...previous,
                            vehicleType: value,
                          }))
                        }
                        className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                          selected
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                        }`}
                        aria-pressed={selected}
                      >
                        <Icon size={27} />

                        <span className="mt-2 text-sm font-bold">
                          {label}
                        </span>

                        <span
                          className={`mt-1 text-[10px] ${
                            selected ? 'text-neutral-300' : 'text-neutral-500'
                          }`}
                        >
                          {description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Error / Success */}
            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"
                role="status"
              >
                <CheckCircle2 size={19} />
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create captain account
                  <ArrowRight size={19} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/captain-login"
                className="font-semibold text-black underline underline-offset-4"
              >
                Login
              </Link>
            </p>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By creating an account, you agree to the applicable terms and conditions.
        </p>

        <Link
          to="/signup"
          className="mt-5 block text-center text-sm font-semibold text-neutral-700 hover:text-black"
        >
          Register as a rider instead
        </Link>
      </div>
    </main>
  );
};

export default CaptainSignup;
