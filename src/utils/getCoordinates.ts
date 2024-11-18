export async function getCoordinates(address: {
  street: string;
  city: string;
  zip: string;
}) {
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${process.env.LOCATION_IQ_API_KEY}&q=${address.street},${address.city},${address.zip}&format=json&`,
    );
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(
        'No coordinates found for the given address. Please provide a valid address.',
      );
    }

    const { lat, lon } = data[0];
    return {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    };
  } catch (error) {
    throw new Error(`Error getting coordinates: ${error}`);
  }
}
