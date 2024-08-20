import Header from '../../components/header/Header';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import './login.css';

const Login = () => {
  return (
    <>
      <Header />
      <div className="login-container">
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Correo</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
              Nunca compartas tu correo con nadie.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Recuerdame" />
          </Form.Group>

          <Button variant="primary" type="submit">
            Login
          </Button>

          {/* Botón de Registro */}
          <div className="mt-3">
            <Link to="/Registro">
              <Button variant="secondary">Registrarse</Button>
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Login;
