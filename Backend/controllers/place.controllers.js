
const { searchPlaces } = require('../service/nominatim.service');

module.exports.searchPlacesController = async (req, res) => {
    try {
        const query = req.query.q;

        // Check whether a search query was provided
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                message: 'Please provide a destination to search'
            });
        }

        // Minimum 3 characters required
        if (query.trim().length < 3) {
            return res.status(400).json({
                message: 'Please enter at least 3 characters'
            });
        }

        // Search destination using OpenStreetMap
        const places = await searchPlaces(query.trim());

        return res.status(200).json({
            message: 'Places found successfully',
            places
        });

    } catch (error) {
        console.error('Place search error:', error.message);

        return res.status(503).json({
            message: 'Unable to search destinations right now. Please try again.'
        });
    }
};
