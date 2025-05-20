import React, { useEffect, useState } from 'react';
import AddProject from './AddProject';
import Map from './Map'

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProject, setEditProject] = useState(null); // For edit modal
  const [formData, setFormData] = useState({ projectName: '', description: '',latitude: '',longitude: ''});
const GOOGLE_MAPS_API_KEY = 'AIzaSyAivL37bWt2MkzrZiii7AZV_a3-qoHtick';

  const fetchProjects = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
         console.log('Fetched projects:', data);
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle delete
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    fetch(`http://localhost:5000/api/projects/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete project');
        fetchProjects();
      })
      .catch(err => alert(err.message));
  };

  // Handle edit button click
  const startEdit = (project) => {
    setEditProject(project);
    setFormData({ 
      projectName: project['Project Name'], 
      description: project.Description 
    });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit edit form
const handleEditSubmit = (e) => {
  e.preventDefault();
  fetch(`http://localhost:5000/api/projects/${editProject.Project_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.projectName,
      description: formData.description,
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update project');
      setEditProject(null);
      fetchProjects();
    })
    .catch(err => alert(err.message));
};


  if (loading) return <p style={styles.loadingText}>Loading projects...</p>;
  if (error) return <p style={styles.errorText}>Error: {error}</p>;

  return (
    
    <div style={styles.pageContainer}>
      <h2 style={styles.title}>Projects Dashboard</h2>

      {/* Edit Modal */}
      {editProject && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Project #{editProject.Project_id}</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Project Name:
                <input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  required
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditProject(null)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.saveButton}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
       <AddProject onProjectAdded={fetchProjects} />
        <div style={{ margin: '30px 0' }}>
      <Map projects={projects} apiKey="AIzaSyDzbklBgDFT_vOe2nIMe59_7KirAekuMJo"  openWeatherApiKey={"10a85eefa3d4e3226c6da2c2b7d6a670"}/>
    </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{ ...styles.tableHeaderCell, borderRadius: '12px 0 0 12px' }}>Project ID</th>
              <th style={styles.tableHeaderCell}>Project Name</th>
              <th style={styles.tableHeaderCell}>Description</th>
              <th style={{ ...styles.tableHeaderCell, borderRadius: '0 12px 12px 0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr
                key={project.Project_id}
                style={styles.tableRow}
              >
                <td style={styles.tableCellId}>{project.Project_id}</td>
                <td style={styles.tableCellName}>{project['Project Name']}</td>
                <td style={styles.tableCellDesc}>{project.Description}</td>
                <td style={styles.tableCellActions}>
                  <button onClick={() => startEdit(project)} style={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(project.Project_id)} style={styles.deleteButton}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: 960,
    margin: '40px auto',
    padding: 30,
    background: 'radial-gradient(circle at top left, #e6f0ff, #ffffff)',
    borderRadius: 20,
    boxShadow: '0 18px 40px rgba(0, 123, 255, 0.25)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: 'center',
  },
  title: {
    fontSize: '2.8rem',
    color: '#003366',
    marginBottom: 30,
    fontWeight: '800',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 14px',
    backgroundColor: 'transparent',
  },
  tableHeaderRow: {
    background: 'linear-gradient(90deg, #007bff, #004a99)',
    color: '#fff',
    fontWeight: '700',
    letterSpacing: '0.12em',
    fontSize: '1.05rem',
    userSelect: 'none',
  },
  tableHeaderCell: {
    padding: '18px 25px',
    textAlign: 'left',
  },
  tableRow: {
    backgroundColor: 'white',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: 14,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
  },
  tableCellId: {
    padding: '18px 25px',
    fontWeight: '700',
    color: '#0056b3',
    width: '10%',
  },
  tableCellName: {
    padding: '18px 25px',
    fontWeight: '600',
    color: '#007bff',
    width: '30%',
  },
  tableCellDesc: {
    padding: '18px 25px',
    color: '#444',
    width: '40%',
  },
  tableCellActions: {
    padding: '18px 25px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-start',
    width: '20%',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    width: 400,
    boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
},
input: {
width: '100%',
padding: '10px 14px',
borderRadius: 8,
border: '1.8px solid #007bff',
fontSize: 16,
marginTop: 6,
},
textarea: {
width: '100%',
padding: '10px 14px',
borderRadius: 8,
border: '1.8px solid #007bff',
fontSize: 16,
marginTop: 6,
minHeight: 80,
},
cancelButton: {
padding: '8px 18px',
borderRadius: 8,
border: 'none',
backgroundColor: '#6c757d',
color: 'white',
cursor: 'pointer',
fontWeight: '600',
},
saveButton: {
padding: '8px 18px',
borderRadius: 8,
border: 'none',
backgroundColor: '#007bff',
color: 'white',
cursor: 'pointer',
fontWeight: '700',
},
loadingText: {
marginTop: 100,
fontSize: 20,
color: '#555',
fontWeight: '600',
},
errorText: {
marginTop: 100,
fontSize: 20,
color: '#b00020',
fontWeight: '700',
},
};