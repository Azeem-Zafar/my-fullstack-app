import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Projects from './Projects';
import 'leaflet/dist/leaflet.css';
import Map from './Map';
import { LoadScript } from '@react-google-maps/api';
import CurrentWeather from './CurrentWeather';
import AirQuality from './AirQuality';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Header() {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4" style={{ height: '60px' }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          {/* <img
            src="https://tabler-icons.io/static/tabler-icons/icon-128x128.png"
            alt="Logo"
            height="30"
          /> */}
          <span className="ms-2 fw-bold fs-5">Construction Dashboard</span>
        </Link>

        <ul className="navbar-nav d-flex flex-row gap-3 align-items-center mb-0">
          <li className="nav-item"><Link className="nav-link" to="/projects">Projects</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/map">Map</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/weather">Weather</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/air-quality">Air Quality</Link></li>
        </ul>
      </div>
    </header>
  );
}


export default function App() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState(null);

  // Replace this URL with your actual API endpoint for projects
  const PROJECTS_API_URL = 'http://localhost:5000/api/projects';

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoadingProjects(true);
        const response = await fetch(PROJECTS_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data); // Make sure your backend sends an array of projects here
      } catch (error) {
        setErrorProjects(error.message || 'Failed to fetch projects');
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  const googleMapsApiKey = 'AIzaSyDzbklBgDFT_vOe2nIMe59_7KirAekuMJo';
  const openWeatherApiKey = '10a85eefa3d4e3226c6da2c2b7d6a670';

  if (loadingProjects) return <div>Loading projects...</div>;
  if (errorProjects) return <div style={{ color: 'red' }}>Error loading projects: {errorProjects}</div>;

  return (
    <ErrorBoundary>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <Router>
          <div className="page">
            <Header />
            <div className="page-wrapper d-flex" style={{ minHeight: 'calc(100vh - 60px)' }}>
              <main className="page-body flex-grow-1 p-4">
                <Routes>
                  <Route path="/" element={<Navigate to="/projects" replace />} />
                  <Route path="/projects" element={<Projects projects={projects} />} />
                  <Route path="/map" element={<Map projects={projects} apiKey={googleMapsApiKey} />} />
                  <Route
                    path="/weather"
                    element={<CurrentWeather projects={projects} apiKey={openWeatherApiKey} />}
                  />
                  
  <Route
  path="/air-quality"
  element={<AirQuality projects={projects} apiKey="543307576913ff72cbdc3602c8443a5c" />}
/>


                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </LoadScript>
    </ErrorBoundary>
  );
}
