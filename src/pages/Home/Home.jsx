import './Home.scss';
import { useEffect } from 'react';
import SunriseForestScene from '../../components/scenes/SunriseForestScene';
import PhotoTicker from '../../components/PhotoTicker/PhotoTicker';
import Intro from './sections/Intro';
import Projects from './sections/Projects';
import About from './sections/About';
import Contact from './sections/Contact';

function Home() {
  useEffect(() => {
    document.documentElement.classList.add('parallax-enabled');
  }, []);

  return (
    <div className="body-container">
      <div className="snow-background">
        <SunriseForestScene />
      </div>

      <div className="content-wrapper">
        <Intro />
        <Projects />
        <PhotoTicker />
        <About />
        <Contact />
      </div>
    </div>
  );
}

export default Home;
