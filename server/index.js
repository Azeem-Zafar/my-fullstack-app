require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `Project_id`, `Project Name`, `Description`, `Manager`, `Location`, `Geolocation` FROM projects');

    const projects = rows.map(row => {
      let latitude = null;
      let longitude = null;

      if (row.Geolocation) {
        const parts = row.Geolocation.split(',').map(p => p.trim());
        if (parts.length === 2) {
          latitude = parseFloat(parts[0]);
          longitude = parseFloat(parts[1]);
        }
      }

      return {
        ...row,
        latitude,
        longitude
      };
    });

    res.json(projects);
  } catch (error) {
    console.error('DB query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  const projectId = req.params.id;
  try {
    const query = 'SELECT * FROM projects WHERE Project_id = ?';
    const [rows] = await pool.query(query, [projectId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('DB query error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Insert new project
app.post('/api/projects', async (req, res) => {
  const { name, description, manager, location, geolocation } = req.body;

  if (!name) return res.status(400).json({ message: 'Project name is required' });

  try {
    const query = `
      INSERT INTO projects (\`Project Name\`, \`Description\`, \`Manager\`, \`Location\`, \`Geolocation\`)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [name, description, manager, location, geolocation]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Insert failed:', err);
    res.status(500).json({ message: 'Insert failed' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Missing name or description' });
  }

  try {
    const query = 'UPDATE projects SET `Project Name` = ?, `Description` = ? WHERE `Project_id` = ?';
    const [result] = await pool.execute(query, [name, description, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});


// Delete project by ID
app.delete('/api/projects/:id', async (req, res) => {
  const projectId = req.params.id;
  try {
    const [result] = await pool.execute('DELETE FROM projects WHERE Project_id = ?', [projectId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});
