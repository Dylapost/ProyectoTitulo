import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar from '../../components/header/Header';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

interface Usuario {
  id: string;
  nombreCompleto: string;
  correo: string;
  role: string;
  fechaCreacion: string; // Campo de fecha, que podría ser un string
}

function Usuarios() {
  const [operadores, setOperadores] = useState<Usuario[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>(''); // Estado para la búsqueda
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal para confirmar la eliminación
  const [userToDelete, setUserToDelete] = useState<string | null>(null); // Usuario a eliminar
  const navigate = useNavigate();  // Hook para navegar entre vistas

  // Función para obtener los datos de la colección "users"
  const fetchUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, "users");
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosList = usuariosSnapshot.docs.map((doc) => {
        const data = doc.data();
        let fechaCreacion = "Desconocida";
        
        // Verificar si `fechaCreacion` es un `timestamp` de Firebase
        if (data.fechaCreacion && data.fechaCreacion.toDate) {
          fechaCreacion = data.fechaCreacion.toDate().toLocaleDateString();
        }

        return {
          id: doc.id,
          nombreCompleto: data["Nombre Completo"],
          correo: data["Correo"],
          role: data["role"],
          fechaCreacion,  // Usar la fecha formateada
        } as Usuario;
      });

      // Filtrar los usuarios por rol
      const operadoresList = usuariosList.filter(usuario => usuario.role.toLowerCase() === "operador de sistema".toLowerCase());
      const tecnicosList = usuariosList.filter(usuario => usuario.role.toLowerCase() === "técnico".toLowerCase());

      // Actualiza el estado con las listas filtradas
      setOperadores(operadoresList);
      setTecnicos(tecnicosList);
    } catch (err) {
      setError("Error al cargar los datos.");
      console.error("Error fetching users: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar los usuarios en base a la búsqueda
  const filterUsuarios = (usuarios: Usuario[]) => {
    return usuarios.filter(usuario =>
      usuario.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Función para redirigir a la vista de registro
  const handleAddUser = () => {
    navigate('/registro');  // Redirige a la vista de registro
  };

  // Función para mostrar el modal de confirmación para eliminar un usuario
  const handleShowDeleteModal = (userId: string) => {
    setUserToDelete(userId);
    setShowConfirmModal(true);
  };

  // Función para cerrar el modal de confirmación
  const handleCloseConfirmModal = () => {
    setUserToDelete(null);
    setShowConfirmModal(false);
  };

  // Función para eliminar un usuario de Firebase
  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        const userRef = doc(db, "users", userToDelete);
        await deleteDoc(userRef);
        fetchUsuarios(); // Refrescar la lista de usuarios
        handleCloseConfirmModal(); // Cerrar el modal después de eliminar
      } catch (err) {
        console.error("Error deleting user: ", err);
      }
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="main-content w-100">
        {/* Navbar */}
        <Navbar />

        <div className="container mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Usuarios</h1>
            <div>
              <Button variant="primary" onClick={handleAddUser} className="me-2">
                Agregar Usuario
              </Button>
            </div>
          </div>

          {/* Búsqueda */}
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o correo"
            className="mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {/* Tabla de Operadores de Sistema */}
              <h2>Operadores de Sistema</h2>
              {operadores.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>Correo</th>
                      <th>Fecha Creación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsuarios(operadores).map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.nombreCompleto}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.fechaCreacion}</td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => handleShowDeleteModal(usuario.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No hay operadores de sistema registrados.</p>
              )}

              {/* Tabla de Técnicos */}
              <h2>Técnicos</h2>
              {tecnicos.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Nombre Completo</th>
                      <th>Correo</th>
                      <th>Fecha Creación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsuarios(tecnicos).map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.nombreCompleto}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.fechaCreacion}</td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => handleShowDeleteModal(usuario.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No hay técnicos registrados.</p>
              )}

              {/* Modal de confirmación para eliminar usuario */}
              <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseConfirmModal}>
                    Cancelar
                  </Button>
                  <Button variant="danger" onClick={handleDeleteUser}>
                    Eliminar Usuario
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
