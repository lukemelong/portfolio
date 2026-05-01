import { Carousel, Card, Button, Container } from 'react-bootstrap';
import { projects } from '../../../data/projects';

function Projects() {
  return (
    <section className="home-section home-projects">
      <Container className="project-card-container">
        <h2 className="text-center mb-4">My Projects</h2>
        <Carousel className="clickable">
          {projects.map((project) => {
            const isExternal = project.url.startsWith('http');
            return (
              <Carousel.Item key={project.title}>
                <Card>
                  <Card.Img variant="top" src={project.image} alt={project.title} />
                  <Card.Body>
                    <Card.Title>{project.title}</Card.Title>
                    <Card.Text>{project.description}</Card.Text>
                    <div>
                      <Button
                        href={project.url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                      >
                        View Project
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}

export default Projects;
