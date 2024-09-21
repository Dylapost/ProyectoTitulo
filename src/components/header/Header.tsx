import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { auth, db } from '../../firebase'; // Importa Firebase Authentication y Firestore
import { getDoc, doc, updateDoc } from "firebase/firestore"; // Para obtener y actualizar datos
import './header.css';

const Header = () => {
  const [userData, setUserData] = useState({ nombreCompleto: '', correo: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Para verificar si el usuario está autenticado
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal
  const [newNombreCompleto, setNewNombreCompleto] = useState(''); // Estado para nuevo nombre
  const [newCorreo, setNewCorreo] = useState(''); // Estado para nuevo correo
  const navigate = useNavigate();

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Usuario autenticado
        console.log('Usuario autenticado:', user);
        console.log('UID del usuario:', user.uid); // Imprime el UID del usuario para verificar
        setIsAuthenticated(true);
        fetchUserData(user.uid); // Cargar datos del usuario
      } else {
        // Usuario no autenticado
        console.log('Usuario no autenticado');
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Obtener datos del usuario desde Firestore
  const fetchUserData = async (uid: string) => {
    try {
      console.log('Obteniendo datos del usuario para UID:', uid);
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('Datos del usuario obtenidos:', userData);
        setUserData({
          nombreCompleto: userData["Nombre Completo"], 
          correo: userData["Correo"]
        });
      } else {
        console.error('Documento del usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login'); // Redirigir a login
    });
  };

  // Mostrar el modal
  const handleShowModal = () => {
    // Configurar los valores iniciales en el modal (nombre completo y correo actuales)
    setNewNombreCompleto(userData.nombreCompleto || ""); // Si el nombre no está listo, asignar un string vacío temporalmente
    setNewCorreo(userData.correo || ""); // Si el correo no está listo, asignar un string vacío temporalmente
    setShowModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => setShowModal(false);

  // Guardar cambios en Firestore
  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "Nombre Completo": newNombreCompleto,
        "Correo": newCorreo,
      });
      setUserData({ nombreCompleto: newNombreCompleto, correo: newCorreo });
    }
    handleCloseModal();
  };

  return (
    <>
      <Navbar expand="lg" className="bg-primary fixed-top w-100">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand href="/" className="navbar-logo">
            <img
              src="/src/components/Imagenes/logos/logosolo.png" // Ruta actualizada
              alt="Logo"
              height="70"
            />
          </Navbar.Brand>

          <div className="center-logo">
            <img
              src="/src/components/Imagenes/logos/logo cetro.png" // Ruta actualizada
              alt="Logo Central"
              height="40"
            />
          </div>

          <Nav className="ms-auto">
            {isAuthenticated ? (
              // Mostrar Dropdown si el usuario está autenticado
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  {userData.nombreCompleto || "Mi Cuenta"} {/* Mostrar nombre completo en el título del Dropdown */}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleShowModal}>
                    Configurar Información Personal
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/inicio")}>
                    Inicio
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // Mostrar botón "Iniciar Sesión" si el usuario NO está autenticado
              <Link to="/login">
                <Button variant="light">Iniciar Sesión</Button>
              </Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Modal para configurar información personal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Configurar Información Personal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Correo Actual: {userData.correo || "Cargando..."}</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduzca su nuevo correo"
                value={newCorreo}
                onChange={(e) => setNewCorreo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo Actual: {userData.nombreCompleto || "Cargando..."}</Form.Label>
              <Form.Control
                type="text"
                placeholder="Introduzca su nuevo nombre completo"
                value={newNombreCompleto}
                onChange={(e) => setNewNombreCompleto(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;
