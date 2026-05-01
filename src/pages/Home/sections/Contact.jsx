import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { submitContactForm } from '../../../lib/contactForm';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    try {
      const { ok } = await submitContactForm(formData);
      if (ok) {
        setFormStatus({
          type: 'success',
          message: "Thank you for your message! I'll get back to you soon.",
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus({
          type: 'danger',
          message: 'Sorry, there was an error sending your message. Please try again.',
        });
      }
    } catch {
      setFormStatus({
        type: 'danger',
        message: 'Sorry, there was an error sending your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
}

export default Contact;
