import home from '../Styles/Home.module.scss'
import ProjectCard from '../Components/ProjectCard'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import CustomToggle from '../Components/CustomToggle'

function Home() {

  return (
    <div className='bodyContainer'>
      <div className={home.header}>
        <h1 className={home.headerTitle}>Luke Melong</h1>
        <h2 className={home.headerSubtitle}>Full Stack Developer</h2>
      </div>
      <div className={home.section}>
        <div className={home.aboutContainer}>
          <div className={home.aboutText}>
            <h1>About</h1>
            <p>I am an experienced full stack developer with a range of skills. From designing and building REST APIs from scratch, to creating front end applications utilizing multiple data sources, I have the capability to fit into any part of your team.</p>
          </div>
          <div className={home.aboutImageContainer}>
            <div className={home.aboutImage}></div>
          </div>
        </div>
        <div className={home.aboutContainer}>
          <div className={home.description}>
            <h1>This is text</h1>
            <p>More text about me that panders to employers</p>
          </div>
        </div>
      </div>
      <div className={home.section}>
        <div className={home.cardsContainer}>
          <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
          <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
          <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
        </div>
        <Accordion className={home.accordion} flush>
          <Card className={home.accordionCard}>
            <Card.Header className={home.accordionHeader}>
              <CustomToggle>See more</CustomToggle>
            </Card.Header>
            <Accordion.Collapse>
              <Card.Body>
                <div className={home.cardsContainer}>
                  <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
                  <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
                  <ProjectCard title="Title" description="Look at my cool project" img="/images/test.png" button="Push me"></ProjectCard>
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
      <div className={home.section}>
        <h1>Contact</h1>
      </div>
    </div>
  )
}

export default Home