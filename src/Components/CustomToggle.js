import customToggle from '../Styles/Components/CustomToggle.module.scss'
import { useAccordionButton } from 'react-bootstrap/AccordionButton'

function CustomToggle({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey, () => {})

  return (
    <div className={customToggle.container}>
      <button
        type="button"
        className={customToggle.customToggle}
        onClick={decoratedOnClick}
      >
        {children}
      </button>
    </div>
  )
}

export default CustomToggle