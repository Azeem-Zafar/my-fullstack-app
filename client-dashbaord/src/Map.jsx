import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

// Simple weather fetching function, can be inside component or extracted as a hook
const fetchWeather = async (lat, lon, apiKey) => {
  if (!lat || !lon || !apiKey) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${"10a85eefa3d4e3226c6da2c2b7d6a670"}&units=metric`
    );
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    return {
      temp: data.main.temp,
      description: data.weather[0].description,
      wind: data.wind.speed,
      icon: data.weather[0].icon,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default function Map({ projects = [], apiKey, openWeatherApiKey }) {
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultCenter = { lat: 40.7128, lng: -74.006 };

  const getPosition = (project) => {
    if (
      project.latitude !== undefined &&
      project.longitude !== undefined &&
      !isNaN(project.latitude) &&
      !isNaN(project.longitude)
    ) {
      return {
        lat: parseFloat(project.latitude),
        lng: parseFloat(project.longitude),
      };
    }
    const geoString = project.geolocation || project.Geolocation;
    if (geoString && typeof geoString === 'string') {
      const parts = geoString.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  const center = projects.length ? getPosition(projects[0]) : defaultCenter;

  // Fetch weather when selected changes
  useEffect(() => {
    if (!selected) {
      setWeather(null);
      return;
    }

    const pos = getPosition(selected);
    if (!pos) {
      setWeather(null);
      return;
    }

    const getWeather = async () => {
      setLoading(true);
      const w = await fetchWeather(pos.lat, pos.lng, openWeatherApiKey);
      setWeather(w);
      setLoading(false);
    };

    getWeather();
  }, [selected, openWeatherApiKey]);

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {projects.map((project) => {
        const position = getPosition(project);
        if (!position) return null;
        return (
          <Marker
            key={project.Project_id}
            position={position}
            onClick={() => setSelected(project)}
          />
        );
      })}

      {selected && (
        <InfoWindow
          position={getPosition(selected)}
          onCloseClick={() => {
            setSelected(null);
            setWeather(null);
          }}
        >
          <div style={{ maxWidth: '250px' }}>
            <h5>{selected['Project Name']}</h5>
            <p>{selected.Description}</p>
            <p>
              <b>Manager:</b> {selected.Manager}
            </p>
            <p>
              <b>Location:</b> {selected.Location}
            </p>

            {/* Weather display */}
            {loading && <p>Loading weather...</p>}
            {!loading && weather && (
              <div>
                <hr />
                <p><b>Temperature:</b> {weather.temp} °C</p>
                <p><b>Description:</b> {weather.description}</p>
                <p><b>Wind Speed:</b> {weather.wind} m/s</p>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="weather icon"
                  style={{ width: '50px', height: '50px' }}
                />
              </div>
            )}
            {!loading && !weather && <p>Weather data not available.</p>}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
