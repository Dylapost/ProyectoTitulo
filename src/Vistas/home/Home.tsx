import Accordion from 'react-bootstrap/Accordion';
import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './Home.css';

const Home: React.FC = () => {
    return (
      <>
        {/* Imagen con Título, Subtítulo y Botón */}
        <div className="hero-image">
          <div className="hero-text">
            <h1>Tenemos la Grúa Eléctrica que necesita</h1>
            <p>TU EQUIPO PERFECTO
            AL PRECIO PERFECTO</p>
            <Button variant="primary">Cotizar</Button>
          </div>
        </div>

        {/* Información Cards */}
        <div className="info-cards">
          <Card className="info-card">
            <Card.Body>
              <p>Inluye despacho a tu domicilio</p>
            </Card.Body>
          </Card>
          <Card className="info-card">
            <Card.Body>
              <p>Contantanos al +5691234567</p>
            </Card.Body>
          </Card>
        </div>

        <div className="main-content">
          {/* Cards con imágenes */}
          <Card style={{ width: '25rem' }}>
            <img
              src="src/components/Imagenes/gruas/Apilador-electrico-ETV-214-7-Cetro.cl_.jpg"
              alt="Apiladores Eléctricos"
              className="accordion-image"
            />
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Apiladores Eléctricos (Reach Truck)</Accordion.Header>
                <Accordion.Body>
                  <p>
                    Los apiladores eléctricos son la mejor solución cuando se trata de apilar tu mercadería...
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>

          <Card className="card-middle" style={{ width: '25rem' }}>
            <img
              src="src/components/Imagenes/gruas/Grua-EFG-220-año-2003-cetro.cl-12.jpg"
              alt="Grua Horquilla"
              className="accordion-image"
            />
            <Accordion defaultActiveKey="1">
              <Accordion.Item eventKey="1">
                <Accordion.Header>Grua Horquilla Eléctrica de 3 ó 4 ruedas</Accordion.Header>
                <Accordion.Body>
                  <p>
                    Este tipo de grúa horquilla eléctrica...
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>

          <Card style={{ width: '25rem' }}>
            <img
              src="src/components/Imagenes/gruas/Apilador-ERC214.jpg"
              alt="Apilador Eléctrico"
              className="accordion-image"
            />
            <Accordion defaultActiveKey="2">
              <Accordion.Item eventKey="2">
                <Accordion.Header>Apilador Eléctrico (Stacker)</Accordion.Header>
                <Accordion.Body>
                  <p>
                    Apiladores Eléctricos hombre caminando...
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>
        </div>
      </>
    );
};

export default Home;
