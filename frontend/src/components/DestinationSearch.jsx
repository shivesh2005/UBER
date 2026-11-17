
import React, { useState } from 'react';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import api from '../lib/api';

const DestinationSearch = ({ onSelect }) => {
    const [searchText, setSearchText] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchPlaces = async (e) => {
        e.preventDefault();

        if (searchText.trim().length < 3) {
            setError('Please enter at least 3 characters');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setPlaces([]);

            const response = await api.get('/places/search', {
                params: { q: searchText.trim() }
            });

            setPlaces(response.data.places || []);

            if (!response.data.places?.length) {
                setError('No destinations found');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to search destinations'
            );
        } finally {
            setLoading(false);
        }
    };

    const selectPlace = (place) => {
        setSearchText(place.name);
        setPlaces([]);
        setError('');

        if (onSelect) onSelect(place);
    };

    const clearSearch = () => {
        setSearchText('');
        setPlaces([]);
        setError('');

        if (onSelect) onSelect(null);
    };

    return (
        <div className="w-full">
            <form onSubmit={searchPlaces}>
                <div className="flex items-center bg-gray-100 rounded-xl p-4">
                    <MapPin size={21} className="mr-3" />

                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPlaces([]);
                            setError('');
                            if (onSelect) onSelect(null);
                        }}
                        placeholder="Enter your destination"
                        className="flex-1 bg-transparent outline-none"
                    />

                    {searchText && (
                        <button type="button" onClick={clearSearch}>
                            <X size={19} />
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-3 rounded-xl mt-3 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search size={18} />
                            Search destination
                        </>
                    )}
                </button>
            </form>

            {error && (
                <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            {places.length > 0 && (
                <div className="mt-3 bg-white rounded-xl shadow-lg border overflow-hidden">
                    {places.map((place) => (
                        <button
                            key={place.id}
                            onClick={() => selectPlace(place)}
                            className="w-full flex gap-3 p-4 text-left hover:bg-gray-100 border-b"
                        >
                            <MapPin size={20} className="shrink-0 mt-1" />

                            <div>
                                <p className="font-semibold">
                                    {place.name}
                                </p>

                                <p className="text-gray-500 text-sm">
                                    {place.address}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DestinationSearch;
