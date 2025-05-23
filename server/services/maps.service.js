const axios = require('axios');

module.exports.getAddressCoordinate = async (address) => {
    const apikey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apikey}`;
    console.log("Megha", url);
    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        } else {
            throw new Error('No coordinates found for the given address.');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        throw error;
    }
};
