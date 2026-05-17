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

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

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
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
};

// New: Verification endpoint specifically for login check
app.post('/api/auth/verify', authenticate, (req, res) => {
  res.json({ success: true });
});

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
    const projects = JSON.parse(data);
    // Only show items explicitly marked for portfolio
    res.json(projects.filter(p => p.isPortfolio));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

app.get('/api/projects/track', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(data);
    
    // Filter projects by email and only return relevant tracking info
    const clientProjects = projects
      .filter(p => p.email.toLowerCase() === email.toLowerCase())
      .map(p => ({
        name: p.name,
        status: p.status,
        progress: p.progress || 0,
        timestamp: p.timestamp
      }));

    res.json(clientProjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track projects' });
  }
});

app.post('/api/projects', async (req, res) => {
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
      isPortfolio: req.body.isPortfolio === true,
      status: req.body.isPortfolio ? 'active' : 'pending',
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

app.post('/api/projects/:id/approve', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    let projects = JSON.parse(data);
    const id = req.params.id;
    
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });
    
    projects[index].status = 'accepted';
    projects[index].progress = 0; // Initialize progress
    // isPortfolio remains false so it's NOT added to the public site
    const project = projects[index];
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    
    // Send Work Acceptance Email to Client
    const mailOptions = {
      from: `"Bash Solutions" <${process.env.EMAIL_USER || 'hellobash05@gmail.com'}>`,
      to: project.email,
      subject: `✅ Work Accepted: ${project.name} - Bash Build Team`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050608; color: #dce4ee; padding: 40px; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="background: #6cf2cf; padding: 20px; text-align: center;">
              <h1 style="color: #050608; margin: 0; font-size: 24px; letter-spacing: 2px;">WORK ACCEPTED</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #6cf2cf; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">Hello,</h2>
              <p>We are excited to inform you that your project build request for <strong>${project.name}</strong> has been officially accepted by the Bash technical team.</p>
              
              <div style="background: rgba(108, 242, 207, 0.05); border-left: 4px solid #6cf2cf; padding: 15px; margin: 25px 0;">
                <h3 style="margin-top: 0; font-size: 16px; color: #6cf2cf;">BUILD SPECIFICATIONS:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Category:</strong> ${project.type || 'Custom Solution'}</li>
                  <li style="margin-bottom: 8px;"><strong>Timeline:</strong> ${project.timeline || 'TBD'}</li>
                  <li style="margin-bottom: 8px;"><strong>Tech Stack:</strong> ${project.stack || 'Standard Deployment'}</li>
                </ul>
              </div>

              <h3 style="font-size: 16px; color: #6cf2cf;">Next Steps:</h3>
              <p>Our lead developers are currently reviewing your brief. We will reach out to you shortly via <strong>${project.phone}</strong> to schedule a technical deep-dive and finalize the execution roadmap.</p>
              
              <p style="margin-top: 30px; font-style: italic; color: #666;">Thank you for choosing Bash. Let's build the future together.</p>
            </div>
            
            <div style="background: #111; padding: 20px; text-align: center; font-size: 12px; color: #444;">
              <p>© 2026 Bash Tech Solutions. All rights reserved.</p>
              <p>This is an automated confirmation of work acceptance.</p>
            </div>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions).catch(err => console.error('Acceptance Email failed:', err));
    
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve project' });
  }
});

app.patch('/api/projects/:id/progress', authenticate, async (req, res) => {
  try {
    const { progress } = req.body;
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }

    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    let projects = JSON.parse(data);
    const id = req.params.id;

    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    projects[index].progress = progress;
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));

    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

const PORT = 5000;
initStorage().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://localhost:${PORT}`));
});
