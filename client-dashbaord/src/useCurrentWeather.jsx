// src/hooks/useCurrentWeather.js
import { useEffect, useState } from 'react';

const useCurrentWeather = (lat, lon, apiKey) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lon || !apiKey) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        if (!res.ok) throw new Error('Failed to fetch weather');

        const data = await res.json();

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

  return { weather, loading, error };
};

export default useCurrentWeather;
