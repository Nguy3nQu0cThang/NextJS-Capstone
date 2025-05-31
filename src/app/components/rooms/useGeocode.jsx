export const getCoordinatesFromLocation = async (locationText) => {
  const encoded = encodeURIComponent(locationText);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.length > 0) {
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  }

  return null;
};
