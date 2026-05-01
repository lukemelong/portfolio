import { useRef } from 'react';

function Intro() {
  const textRef = useRef(null);

  return (
    <section className="home-section home-intro">
      <div className="name-container">
        <svg viewBox="0 0 1500 130" className="handwrite">
          <text ref={textRef} x="0" y="100">Luke Melong</text>
        </svg>
      </div>
      <p className="page-subtitle">Full Stack Developer</p>
    </section>
  );
}

export default Intro;
