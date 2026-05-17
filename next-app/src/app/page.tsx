"use client";

import { Show, SignInButton, SignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import TerminalAnimation from "@/components/TerminalAnimation";
import ProjectsGrid from "@/components/ProjectsGrid";
import HeroCanvas from "@/components/HeroCanvas";

// Dynamically import client components that use Three.js or browser APIs
const ScrollScene = dynamic(() => import("@/components/ScrollScene"), { ssr: false });
const Robotics3D = dynamic(() => import("@/components/Robotics3D"), { ssr: false });
const Printing3D = dynamic(() => import("@/components/Printing3D"), { ssr: false });

export default function Home() {
  return (
    <main>
      <ScrollScene>
      </ScrollScene>

      <main className="content" id="top">
        <section className="section about-section" id="about" aria-label="About us">
          <h1 className="about-title" data-animate>
            <span className="reveal-text">ABOUT US</span>
          </h1>
          <div className="about-copy">
            <p data-animate>
              We are a forward-thinking technology company driven by innovation and creativity. Our mission
              is to transform ideas into powerful digital and physical solutions that shape the future.
              With expertise across multiple domains, we specialize in building modern websites and
              applications that are fast, scalable, and user-focused. Our work extends into Artificial
              Intelligence and Machine Learning, where we create intelligent systems that solve real-world
              problems and enhance automation.
            </p>
            <p data-animate>
              Beyond software, we explore the physical side of technology through robotics, designing smart
              systems that bridge the gap between digital intelligence and real-world interaction. Our
              capabilities also include 3D designing and 3D printing, allowing us to bring concepts to life
              with precision and creativity.
            </p>
            <p data-animate>
              We believe in combining technology, design, and innovation to deliver solutions that are not
              only functional but also impactful. Whether it's a digital product or a physical prototype,
              we focus on quality, performance, and future-ready solutions.
            </p>
          </div>
        </section>

        <section className="section services-heading-section" aria-label="Our Services">
          <h2 className="services-heading" data-animate>
            <span className="reveal-text">OUR SERVICES</span>
          </h2>
        </section>

        <section className="webdev-section" id="webdev" aria-label="Web Development">
          <div className="webdev-left">
            <h2 className="webdev-title" data-animate>Web Development</h2>
            <p className="webdev-desc" data-animate>
              We design and develop modern, responsive, and high-performance websites tailored to your brand.
              From business sites to advanced web applications, we focus on speed, user experience, and scalability.
            </p>
          </div>
          <div className="webdev-right" data-animate aria-hidden="true">
            <TerminalAnimation />
          </div>
        </section>

        <section className="appdev-section" id="appdev" aria-label="App Development">
          <div className="appdev-image-container" data-animate>
            <img src="/app-dev-bg-removed.png" alt="App Development Preview" className="appdev-final-image" />
          </div>
          <div className="appdev-content">
            <p className="appdev-desc" data-animate>
              We build powerful mobile and desktop applications with intuitive interfaces and seamless performance.
              Our apps are designed to deliver real value and engage users effectively.
            </p>
          </div>
        </section>

        <section className="aiml-section" id="aiml" aria-label="AI & ML">
          <div className="aiml-content">
            <div className="aiml-left" data-animate>
              <HeroCanvas />
              <div className="ai-visual">
                <div className="ai-node n1"></div>
                <div className="ai-node n2"></div>
                <div className="ai-node n3"></div>
                <div className="ai-node n4"></div>
                <div className="ai-node n5"></div>
                <div className="ai-connection c1"></div>
                <div className="ai-connection c2"></div>
                <div className="ai-connection c3"></div>
                <div className="ai-connection c4"></div>
              </div>
            </div>
            <div className="aiml-right">
              <h2 className="aiml-title" data-animate>AI & Machine Learning</h2>
              <p className="aiml-desc" data-animate>
                We design and deploy intelligent systems that process data, recognize patterns, and make informed decisions.
                Our AI solutions range from predictive modeling to computer vision, helping businesses automate complexity and unlock new insights.
              </p>
            </div>
          </div>
        </section>

        <section className="robotics-section" id="robotics" aria-label="Robotics">
          <div className="robotics-content">
            <div className="robotics-left">
              <h2 className="robotics-title" data-animate>Robotics</h2>
              <p className="robotics-desc" data-animate>
                We bridge the gap between digital intelligence and the physical world through advanced robotics. 
                Our focus is on designing autonomous systems and smart hardware that can interact with and manipulate 
                their environment with precision and efficiency.
              </p>
            </div>
            <div className="robotics-right" data-animate>
              <Robotics3D />
            </div>
          </div>
        </section>

        <section className="printing-section" id="printing" aria-label="3D Designing & Printing">
          <div className="printing-content">
            <div className="printing-left" data-animate>
              <Printing3D />
            </div>
            <div className="printing-right">
              <h2 className="printing-title" data-animate>3D Designing & Printing</h2>
              <p className="printing-desc" data-animate>
                We bring digital concepts into the physical realm with high-precision 3D modeling and printing. 
                From rapid prototyping to custom functional parts, we utilize advanced additive manufacturing 
                techniques to deliver durable and detailed physical solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="section projects-section" id="projects" aria-label="Our Projects">
          <h2 className="projects-title" data-animate>
            <span className="reveal-text">OUR PROJECTS</span>
          </h2>
          <ProjectsGrid />
        </section>

        <section className="contact-section" id="contact" aria-label="Contact Us">
          <h2 className="contact-title" data-animate>GET IN TOUCH</h2>
          <div className="contact-container">
            <div className="contact-info" data-animate>
              <p>Ready to start your next project? We're here to help you bring your ideas to life.</p>
              <div className="contact-details">
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">hello@bash.tech</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">Digital Nomad / Earth</span>
                </div>
              </div>
            </div>
            <form className="contact-form" action="#" method="POST" data-animate>
              <div className="form-group">
                <input type="text" id="name" name="name" placeholder="Name" required />
              </div>
              <div className="form-group">
                <input type="email" id="email" name="email" placeholder="Email" required />
              </div>
              <div className="form-group">
                <textarea id="message" name="message" rows={4} placeholder="Message" required></textarea>
              </div>
              <button type="submit" className="submit-btn">SEND MESSAGE</button>
            </form>
          </div>
        </section>

        <footer className="main-footer">
          <div className="footer-grid">
            <div className="footer-brand" data-animate>
              <a className="footer-logo" href="#top">&lt;/&gt;Bash</a>
              <p className="footer-tagline">Transforming ideas into powerful digital and physical solutions that shape the future.</p>
            </div>
            
            <div className="footer-links" data-animate>
              <div className="link-col">
                <h3>Services</h3>
                <ul>
                  <li><a href="#webdev">Web Development</a></li>
                  <li><a href="#appdev">App Development</a></li>
                  <li><a href="#aiml">AI & ML</a></li>
                  <li><a href="#robotics">Robotics</a></li>
                  <li><a href="#printing">3D Printing</a></li>
                </ul>
              </div>
              
              <div className="link-col">
                <h3>Connect</h3>
                <ul>
                  <li><a href="#">LinkedIn</a></li>
                  <li><a href="#">Twitter</a></li>
                  <li><a href="#">GitHub</a></li>
                  <li><a href="#">Instagram</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 &lt;/&gt;Bash. All rights reserved.</p>
            <a href="#top" className="back-to-top">Back to top ↑</a>
          </div>
        </footer>
      </main>
    </main>
  );
}
