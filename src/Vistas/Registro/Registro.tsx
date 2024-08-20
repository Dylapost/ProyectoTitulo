import Header from '../../components/header/Header';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './registro.css';

const Registro = () => {
  return (
    <>
      <Header />
      <div className="main-content">
        <div className="register-container">
          <h2 className="form-title">Registro</h2>
          <Form>
            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control type="text" placeholder="Ingrese su nombre completo" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" placeholder="Ingrese su correo electrónico" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Ingrese una contraseña" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Confirme su contraseña" />
            </Form.Group>

            <Button variant="primary" type="submit" className="btn-register">
              Registrar
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Registro;
