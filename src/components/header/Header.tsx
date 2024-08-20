import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import "./header.css"

const Header = () => {
  return (
    <Navbar expand="lg" className="bg-primary fixed-top w-100">
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand href="/" className="navbar-logo">
          <img
            src="src/components/Imagenes/logos/logosolo.png"
            alt="Logo"
            height="70"
          />
        </Navbar.Brand>

        <div className="center-logo">
          <img
            src="src/components/Imagenes/logos/logo cetro.png"
            alt="Logo Central"
            height="40"
          />
        </div>

        <Nav className="ms-auto">
          <Link to="/login">
            <Button variant="light">Iniciar Sesión</Button>
          </Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
