import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Contacto</h5>
            <p>Correo: contacto@empresa.com</p>
            <p>Teléfono: +56 9 1234 5678</p>
            <p>Dirección: Calle Falsa 123, Ciudad</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Sobre Nosotros</h5>
            <p>Información breve sobre la empresa.</p>
          </Col>
          <Col md={4} className="text-md-end">
            
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
