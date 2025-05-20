import React, { useState, useEffect } from 'react';

const CurrentWeather = ({ projects = [], apiKey }) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedProject = projects.find(
    (p) => p.Project_id.toString() === selectedProjectId
  );

  const getLatLon = (project) => {
    if (!project) return { lat: null, lon: null };
    if (project.latitude && project.longitude) {
      return { lat: parseFloat(project.latitude), lon: parseFloat(project.longitude) };
    }
    const [lat, lon] = (project.geolocation || project.Geolocation || "").split(',') || [];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  };

  const { lat, lon } = getLatLon(selectedProject);

  useEffect(() => {
    if (!lat || !lon || !apiKey) {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeather({
          temp: data.main.temp,
          description: data.weather[0].description,
          wind: data.wind.speed,
          icon: data.weather[0].icon,
        });
      } catch (err) {
        setError(err.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon, apiKey]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Select a Project to View Live Weather
      </h2>

      <select
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
      >
        <option value="">-- Select Project --</option>
        {projects.map((proj) => (
          <option key={proj.Project_id} value={proj.Project_id}>
            {proj['Project Name']}
          </option>
        ))}
      </select>

      {loading && (
        <div className="mt-6 text-blue-600 text-center font-medium animate-pulse">
          Loading weather...
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 font-semibold text-center">
          Error: {error}
        </div>
      )}

      {weather && (
        <div className="mt-6 bg-white p-5 rounded-lg shadow-md text-center">
          <div className="flex justify-center">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather icon"
              className="w-20 h-20"
            />
          </div>
          <p className="text-xl font-semibold text-gray-700">
            {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
          </p>
          <p className="text-2xl font-bold text-blue-800 mt-2">
            {weather.temp}°C
          </p>
          <p className="text-sm text-gray-500 mt-1">Wind: {weather.wind} m/s</p>
        </div>
      )}
    </div>
  );
};

export default CurrentWeather;
