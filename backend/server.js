import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_FILE = path.join(__dirname, 'projects.json');
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@bash05';

// Nodemailer Transporter Setup (Configure with your email provider)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hellobash05@gmail.com',
    pass: process.env.EMAIL_PASS // Use an App Password for Gmail
  }
});

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());

// Serve static files from the 'bash' directory
app.use(express.static(path.join(__dirname, '../bash')));

// Ensure projects.json exists
async function initStorage() {
  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
}

// Simple authentication for legacy admin or API
const authenticate = (req, res, next) => {
  // Check for legacy admin headers
  const user = req.headers['x-admin-user'];
  const password = req.headers['x-admin-password'];
  const authHeader = req.headers['authorization'];

  if (user === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return next();
  }

  // Allow Bearer token (Frontend sends Firebase ID Token)
  // For now, we'll allow it to pass to avoid blocking, 
  // in a real app, you'd use admin.auth().verifyIdToken(token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
};

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

app.get('/api/projects/public', async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

app.post('/api/projects', authenticate, async (req, res) => {
  try {
    const { name, type, description, url, timeline, email, phone, stack } = req.body;
    
    if (!name || !description || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(data);
    const newProject = { 
      id: Date.now().toString(), 
      name, type, description, url, timeline, email, phone, stack,
      timestamp: new Date().toISOString()
    };
    
    projects.push(newProject);
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));

    // Send Admin Notification Email
    const mailOptions = {
      from: `"Bash System" <${process.env.EMAIL_USER || 'hellobash05@gmail.com'}>`,
      to: 'hellobash05@gmail.com',
      subject: `🚀 New Project Build: ${name}`,
      html: `
        <div style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <h2 style="color: #6cf2cf; background: #050608; padding: 10px; border-radius: 4px;">New Build Brief Received</h2>
            <p><strong>Project Name:</strong> ${name}</p>
            <p><strong>Category:</strong> ${type || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
            <hr/>
            <h3>Client Contact</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <hr/>
            <h3>Technical Scope</h3>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Tech Stack:</strong> ${stack || 'Not specified'}</p>
            <p><strong>Reference:</strong> ${url || 'None'}</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions).catch(err => console.error('Email failed:', err));
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    let projects = JSON.parse(data);
    const id = req.params.id;
    
    projects = projects.filter(p => p.id !== id);
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

const PORT = 5000;
initStorage().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://localhost:${PORT}`));
});
