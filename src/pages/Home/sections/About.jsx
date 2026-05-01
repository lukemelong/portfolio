import { Container } from 'react-bootstrap';

function About() {
  return (
    <section className="home-section home-about">
      <Container className="text-center clickable">
        <h2>About Me</h2>
        <p>
          I'm a software developer with over six years of experience building scalable, efficient web applications. I excel in fast-paced, challenging environments that demand strong problem-solving skills, and I take pride in overcoming obstacles through both independent work and collaborative teamwork with clients and colleagues.
        </p>
        <p>
          My experience ranges from building RESTful APIS, frontend design, AI tools, JavaScript frameworks such as React, ASP.NET, SQL and NOSQL databases, Wordpress Plugins, and many more. I have garnered experience in many different languages such as HTML, CSS, JavaScript, C#, Python, PHP, Java and many more!
        </p>
        <p>
          Along with my experience, I have a commitment to life long learning. I enjoy staying up to date with the latest advancements in technology and enjoy exploring ways I can utilize AI in my home. You can find a short video on my explorations of running my own AI models <a href="https://lukemelong.com/videos/LLMsLocal.mp4">here</a>
        </p>
        <p>
          Outside of work I enjoy <a href="https://lukemelong.com/nflscoreboard">sports</a>, travelling, and on occasion you will find me running along the canal.
        </p>
      </Container>
    </section>
  );
}

export default About;
