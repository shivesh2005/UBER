
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// In-memory cache to avoid repeating the same searches
const cache = new Map();

// Nominatim public service requires requests to be at least 1 second apart
let lastRequestTime = 0;
let requestQueue = Promise.resolve();

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const makeRequest = async (url) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent':
                process.env.NOMINATIM_USER_AGENT ||
                'UberClone/1.0 (contact: developer@example.com)',
            'Accept-Language': 'en'
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
    }

    return response.json();
};

const searchPlaces = async (query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }

    // Return cached results if available
    const cachedResult = cache.get(normalizedQuery);

    if (cachedResult && Date.now() - cachedResult.time < 60 * 60 * 1000) {
        return cachedResult.data;
    }

    const request = requestQueue.then(async () => {
        const timeSinceLastRequest = Date.now() - lastRequestTime;

        if (timeSinceLastRequest < 1100) {
            await delay(1100 - timeSinceLastRequest);
        }

        lastRequestTime = Date.now();

        const params = new URLSearchParams({
            q: query,
            format: 'jsonv2',
            addressdetails: '1',
            limit: '5',
            countrycodes: 'in'
        });

        const url = `${NOMINATIM_URL}?${params.toString()}`;

        const data = await makeRequest(url);

        const places = data.map((place) => ({
            id: place.place_id,
            name:
                place.name ||
                place.display_name.split(',')[0],
            address: place.display_name,
            latitude: Number(place.lat),
            longitude: Number(place.lon),
            type: place.type
        }));

        // Save results in cache for one hour
        cache.set(normalizedQuery, {
            time: Date.now(),
            data: places
        });

        return places;
    });

    // Keep the queue usable even if one request fails
    requestQueue = request.catch(() => {});

    return request;
};

module.exports = {
    searchPlaces
};
