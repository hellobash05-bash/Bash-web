'use client';

import { useEffect, useState } from 'react';

interface Project {
  name: string;
  url: string;
}

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // In a real app, we would fetch from /api/projects/public
    // For now, let's use some placeholders
    setProjects([
      { name: 'Bash Terminal', url: 'https://terminal.bash.tech' },
      { name: 'AI Solutions', url: 'https://ai.bash.tech' },
      { name: 'Robotics Dashboard', url: 'https://robotics.bash.tech' }
    ]);
  }, []);

  return (
    <div className="projects-grid" id="projectsGrid">
      {projects.map((p, i) => (
        <div className="project-card" key={i} data-animate>
          <div className="project-preview">
            <iframe src={p.url} title={p.name} loading="lazy" scrolling="no"></iframe>
          </div>
          <div className="project-info">
            <h3>{p.name}</h3>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="project-link">Visit Site ↗</a>
          </div>
        </div>
      ))}
    </div>
  );
}
