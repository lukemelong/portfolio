import '../Styles/Home.scss';
import { Carousel, Card, Button, Container, Form, Alert } from 'react-bootstrap';
import SnowScene from '../Components/Three';
import PhotoTicker from '../Components/PhotoTicker';
import { useEffect, useRef, useState } from "react";

function Home() {
  const textRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Just ensure body scroll behaves normally
    document.documentElement.classList.add('parallax-enabled');
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://lukemelong.com/send-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus({
          type: 'success',
          message: 'Thank you for your message! I\'ll get back to you soon.'
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus({
          type: 'danger',
          message: 'Sorry, there was an error sending your message. Please try again.'
        });
      }
    } catch (error) {
      setFormStatus({
        type: 'danger',
        message: 'Sorry, there was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="body-container">
      <div className="snow-background">
        <SnowScene />
      </div>

      {/* Foreground content */}
      <div className="content-wrapper">
        <section className="home-section home-intro">
          <div className="name-container">
            <svg viewBox="0 0 1500 130" className="handwrite">
              <text ref={textRef} x="0" y="100">Luke Melong</text>
            </svg>
          </div>
          <p>Full Stack Developer</p>
        </section>

        <section className="home-section home-projects">
          <Container className="project-card-container">
            <h2 className="text-center mb-4">My Projects</h2>
            <Carousel className="clickable">
              <Carousel.Item>
                <Card>
                  <Card.Img variant="top" src="images/scoreboard.png" alt="Project 1" />
                  <Card.Body>
                    <Card.Title>NFL Scoreboard</Card.Title>
                    <Card.Text>A personal project for a live updating scoreboard for viewing scores and stats of NFL games each week</Card.Text>
                    <div>
                      <Button href="/nflscoreboard">View Project</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
              <Carousel.Item>
                <Card>
                  <Card.Img variant="top" src="images/br.png" alt="Project 2" />
                  <Card.Body>
                    <Card.Title>Bleacher Report Redesign</Card.Title>
                    <Card.Text>Contributed to the Bleacher Report website redesign to align with its mobile apps. Developed using Next.js.</Card.Text>
                    <div>
                      <Button href="https://www.bleacherreport.com" target="_blank">View Project</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
              <Carousel.Item>
                <Card>
                  <Card.Img variant="top" src="images/pbskids.png" alt="Project 3" />
                  <Card.Body>
                    <Card.Title>PBS Kids Games</Card.Title>
                    <Card.Text>I supported the PBS Games division by debugging games, providing automated insights into game statistics, supporting legacy site features, and building new site features</Card.Text>
                    <div>
                      <Button href="https://pbskids.org/games" target="_blank">View Project</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
              <Carousel.Item>
                <Card>
                  <Card.Img variant="top" src="images/fivestar.png" alt="Project 4" />
                  <Card.Body>
                    <Card.Title>Five Star Wellbeing</Card.Title>
                    <Card.Text>Lead designer and developer for the FiveStar Wellbeings website overhaul; built the Wellbeing Assessment tool from the ground up.</Card.Text>
                    <div>
                      <Button href="https://fivestarwellbeing.com/wellbeing-assessment/" target="_blank">View Project</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
              <Carousel.Item>
                <Card>
                  <Card.Img variant="top" src="images/shubi.png" alt="Project 5" />
                  <Card.Body>
                    <Card.Title>REDSpace Shubi</Card.Title>
                    <Card.Text>Lead API developer for the streaming boilerplate product Shubi at REDSpace. Designed and implemented data structure for each endpoint</Card.Text>
                    <div>
                      <Button href="https://www.redspace.com/shubi" target="_blank">View Project</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            </Carousel>
          </Container>
        </section>

        <PhotoTicker />
        <section className="home-section home-about">
          <Container className="text-center clickable">
            <h2>About Me</h2>
            <p>I'm a software developer with over six years of experience building scalable, efficient web applications. I excel in fast-paced, challenging environments that demand strong problem-solving skills, and I take pride in overcoming obstacles through both independent work and collaborative teamwork with clients and colleagues.</p>
            <p>My experience ranges from building RESTful APIS, frontend design, AI tools, JavaScript frameworks such as React, ASP.NET, SQL and NOSQL databases, Wordpress Plugins, and many more. I have garnered experience in many different languages such as HTML, CSS, JavaScript, C#, Python, PHP, Java and many more!</p>
            <p>Along with my experience, I have a commitment to life long learning. I enjoy staying up to date with the latest advancements in technology and enjoy exploring ways I can utilize AI in my home. You can find a short video on my explorations of running my own AI models <a href="https://lukemelong.com/videos/LLMsLocal.mp4">here</a></p>
            <p>Outside of work I enjoy <a href="https://lukemelong.com/nflscoreboard">sports</a>, travelling, and on occasion you will find me running along the canal.</p>
          </Container>
        </section>

        <section className="home-section home-contact">
          <Container className="contact-container clickable">
            <Form onSubmit={handleSubmit}>
              <h2>Contact Me</h2>

              {formStatus.message && (
                <Alert variant={formStatus.type} className="mb-3">
                  {formStatus.message}
                </Alert>
              )}

              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="message">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Form>
          </Container>
        </section>
      </div>
    </div>
  );
}

export default Home;