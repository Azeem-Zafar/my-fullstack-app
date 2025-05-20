import React, { useState } from 'react';

export default function AddProject({ onProjectAdded }) {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    manager: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const geoString = `${formData.latitude},${formData.longitude}`;

  const payload = {
  name: formData.projectName,
  description: formData.description,
  location: formData.location,
  manager: formData.manager,
  geolocation: `${formData.latitude},${formData.longitude}`,
};


    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add project');
      onProjectAdded();
      setFormData({
        projectName: '',
        description: '',
        manager: '',
        location: '',
        latitude: '',
        longitude: '',
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h4 className="mb-3">Add New Project</h4>

      <input className="form-control mb-2" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Project Name" />
      <textarea className="form-control mb-2" name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      <input className="form-control mb-2" name="manager" value={formData.manager} onChange={handleChange} placeholder="Manager" />
      <input className="form-control mb-2" name="location" value={formData.location} onChange={handleChange} placeholder="Location" />

      <div className="d-flex gap-2">
        <input className="form-control mb-2" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" />
        <input className="form-control mb-2" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" />
      </div>

      <button className="btn btn-primary w-100">Add Project</button>
    </form>
  );
}
