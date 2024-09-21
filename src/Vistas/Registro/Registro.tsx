import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from '../../firebase'; // Importa Firebase Auth y Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importa la función para crear usuario
import Header from '../../components/header/Header';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import Alert from 'react-bootstrap/Alert'; // Para mostrar mensajes de error
import './registro.css';
import Footer from '../../components/footer/Footer';

const Registro = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');  // Estado para el rol
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Función para manejar el registro de usuario con Firebase Auth
  const handleRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación: Verificar si todos los campos están completos
    if (!nombreCompleto || !correo || !password || !confirmPassword || !role) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    // Validación: Verificar si el nombre completo tiene al menos dos palabras
    if (nombreCompleto.split(' ').length < 2) {
      setError("Por favor, ingresa tu nombre completo, incluyendo tu apellido.");
      return;
    }

    // Validación: Verificar si el correo es válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError("El correo electrónico no es válido. Verifica que tenga el formato correcto (e.g., nombre@dominio.com).");
      return;
    }

    // Validación: Verificar si la contraseña tiene al menos 6 caracteres
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validación: Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Crear usuario con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const user = userCredential.user;

      // Agregar información adicional del usuario a Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,  // Guardar el UID del usuario autenticado
        "Nombre Completo": nombreCompleto,  // Corregido para respetar espacios y mayúsculas
        "Correo": correo,                  // Corregido para respetar espacios y mayúsculas
        role,
        fechaCreacion: new Date() // Guardar la fecha de creación del usuario
      });

      // Redirigir a la vista de usuarios si se completa el registro
      setError(null); // Limpiar cualquier error anterior
      alert("Usuario registrado correctamente."); // Mostrar alerta
      navigate('/usuarios');
    } catch (err) {
      console.error("Error al registrar el usuario: ", err);
      setError("Hubo un error al registrar el usuario. Verifica tu correo o contraseña.");
    }
  };

  // Función para seleccionar el rol del dropdown
  const handleSelectRole = (eventKey: string | null) => {
    if (eventKey) {
      setRole(eventKey);
    }
  };

  return (
    <>
      <Header />
      <div className="main-content">
        <div className="register-container">
          <h2 className="form-title">Registro</h2>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
          <Form onSubmit={handleRegistro}>
            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese su nombre completo"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese su correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            {/* Dropdown para seleccionar el rol */}
            <Dropdown onSelect={handleSelectRole}>
              <Dropdown.Toggle variant="info" id="dropdown-basic">
                {role || "Seleccione un rol"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item eventKey="Operador de Sistema">Operador de Sistema</Dropdown.Item>
                <Dropdown.Item eventKey="Técnico">Técnico</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button variant="primary" type="submit" className="btn-register mt-3">
              Registrar
            </Button>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Registro;
