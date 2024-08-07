import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import projectCard from '../Styles/Components/ProjectCard.module.scss'

function ProjectCard({img, title, description, button}) {
  return (
    <Card className={projectCard.projectCard}>
      <Card.Img className={projectCard.img} variant="top" src={img}>
      </Card.Img>
      <Card.ImgOverlay>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Button variant="primary">{button}</Button>
      </Card.ImgOverlay>
    </Card>
  )
}

export default ProjectCard