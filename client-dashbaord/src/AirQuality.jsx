// src/components/AirQuality.jsx
import React, { useState, useEffect } from 'react';

const aqiLabels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
const aqiColors = ["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-500", "bg-purple-600"];

const AirQuality = ({ projects = [], apiKey }) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [aqiData, setAqiData] = useState(null);
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
      setAqiData(null);
      return;
    }

    const fetchAirQuality = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        if (!res.ok) throw new Error("Failed to fetch air quality");
        const data = await res.json();
        setAqiData(data.list[0]);
      } catch (err) {
        setError(err.message);
        setAqiData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAirQuality();
  }, [lat, lon, apiKey]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Project Air Quality Index (AQI)
      </h2>

      <select
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
      >
        <option value="">-- Select Project --</option>
        {projects.map((proj) => (
          <option key={proj.Project_id} value={proj.Project_id}>
            {proj["Project Name"]}
          </option>
        ))}
      </select>

      {loading && <p className="text-center text-blue-700 animate-pulse">Loading air quality...</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}

      {aqiData && (
        <div className="bg-gray-50 p-5 rounded-lg shadow text-center">
          <div className={`text-white font-bold text-xl py-2 px-4 rounded-full inline-block mb-2 ${aqiColors[aqiData.main.aqi - 1]}`}>
            AQI: {aqiData.main.aqi} – {aqiLabels[aqiData.main.aqi - 1]}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700 mt-4">
            <div><strong>PM2.5:</strong> {aqiData.components.pm2_5} μg/m³</div>
            <div><strong>PM10:</strong> {aqiData.components.pm10} μg/m³</div>
            <div><strong>CO:</strong> {aqiData.components.co} μg/m³</div>
            <div><strong>NO₂:</strong> {aqiData.components.no2} μg/m³</div>
            <div><strong>O₃:</strong> {aqiData.components.o3} μg/m³</div>
            <div><strong>SO₂:</strong> {aqiData.components.so2} μg/m³</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirQuality;
