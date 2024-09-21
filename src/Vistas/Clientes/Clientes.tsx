import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar from '../../components/header/Header';

interface Cliente {
  id: string;
  contrato: string;
  contacto: string;
  telefono: string;
  personaACargo: string;  // Campo para la persona a cargo
  gruas_asignadas: string[];
}

interface Grua {
  id: string;
  equipo: string;
  modelo: string;
  serieDeEquipo: string;
  cliente_asignado: string;
}

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [id, setId] = useState('');
  const [contrato, setContrato] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [personaACargo, setPersonaACargo] = useState(''); // Estado para la persona a cargo
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setCurrentId(null);
    setId('');
    setContrato('');
    setContacto('');
    setTelefono('');
    setPersonaACargo(''); // Limpiar también el estado de persona a cargo
  };

  const handleShow = () => setShow(true);

  // Función para obtener clientes desde Firestore
  const fetchClientes = async () => {
    try {
      const clientesCollection = collection(db, "Clientes");
      const clientesSnapshot = await getDocs(clientesCollection);
      const clientesList = clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        contrato: doc.data()["Contrato"],
        contacto: doc.data()["Contacto"] || "",
        telefono: doc.data()["Telefono"] || "",
        personaACargo: doc.data()["PersonaACargo"] || "", // Agregar este campo al cliente
        gruas_asignadas: doc.data()["gruas_asignadas"] || [],
      })) as Cliente[];
      setClientes(clientesList);
    } catch (err) {
      setError("Error al cargar los datos.");
      console.error("Error fetching clientes: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener grúas desde Firestore
  const fetchGruas = async () => {
    try {
      const gruasCollection = collection(db, "Gruas");
      const gruasSnapshot = await getDocs(gruasCollection);
      const gruasList = gruasSnapshot.docs.map((doc) => ({
        id: doc.id,
        equipo: doc.data()["Equipo"],
        modelo: doc.data()["Modelo"],
        serieDeEquipo: doc.data()["Serie de Equipo"],
        cliente_asignado: doc.data()["cliente_asignado"] || "Sin asignar",
      })) as Grua[];
      setGruas(gruasList);
    } catch (err) {
      console.error("Error fetching gruas: ", err);
    }
  };

  // Guardar el cliente
  const handleSave = async () => {
    try {
      const clienteData = {
        Contrato: contrato,
        Contacto: contacto,
        Telefono: telefono,
        PersonaACargo: personaACargo, // Guardar la persona a cargo
      };

      if (editMode && currentId) {
        const clienteDoc = doc(db, "Clientes", currentId);
        await setDoc(clienteDoc, clienteData, { merge: true });
      } else {
        const clienteDoc = doc(db, "Clientes", id);
        await setDoc(clienteDoc, clienteData);
      }
      handleClose();
      fetchClientes(); // Refrescar lista de clientes
    } catch (err) {
      console.error("Error saving cliente: ", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Clientes", id));
      fetchClientes(); // Refrescar la lista después de la eliminación
    } catch (err) {
      console.error("Error deleting cliente: ", err);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditMode(true);
    setCurrentId(cliente.id);
    setId(cliente.id);
    setContrato(cliente.contrato);
    setContacto(cliente.contacto);
    setTelefono(cliente.telefono);
    setPersonaACargo(cliente.personaACargo); // Establecer el valor de persona a cargo en el modal
    handleShow();
  };

  useEffect(() => {
    fetchClientes();
    fetchGruas(); // Cargar las grúas disponibles
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="main-content w-100">
        <Navbar />

        <div className="container mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Tabla de Clientes</h1>
            <Button variant="primary" onClick={handleShow}>
              Agregar Cliente
            </Button>
          </div>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID (Nombre Empresa)</th>  {/* Orden cambiado */}
                  <th>Persona a Cargo</th>       {/* Orden cambiado */}
                  <th>Correo</th>              {/* Orden cambiado */}
                  <th>Telefono</th>              {/* Orden cambiado */}
                  <th>Grúas Asignadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.personaACargo}</td>  {/* Mostrar persona a cargo */}
                    <td>{cliente.telefono}</td>
                    <td>{cliente.contacto}</td>
                    <td>
                      <ul>
                        {cliente.gruas_asignadas.length > 0 ? (
                          cliente.gruas_asignadas.map((gruaId) => {
                            const grua = gruas.find(g => g.id === gruaId);
                            return grua ? (
                              <li key={gruaId}>
                                {`ID: ${grua.id} - ${grua.equipo} - ${grua.modelo}`}
                              </li>
                            ) : null;
                          })
                        ) : (
                          <li>Sin asignar</li>
                        )}
                      </ul>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                          Opciones
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEdit(cliente)}>
                            Modificar
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(cliente.id)}>
                            Eliminar
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? "Modificar Cliente" : "Agregar Cliente"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {!editMode && (
                <Form.Group className="mb-3">
                  <Form.Label>ID (Nombre Empresa)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el ID (Nombre de la Empresa)"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    autoFocus
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Persona a Cargo</Form.Label> {/* Cambio de orden */}
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre de la persona a cargo"
                  value={personaACargo}
                  onChange={(e) => setPersonaACargo(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label> {/* Cambio de orden */}
                <Form.Control
                  type="text"
                  placeholder="Ingrese el número de teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Telefono</Form.Label> {/* Cambio de orden */}
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre del contacto"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editMode ? "Guardar Cambios" : "Guardar Cliente"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Clientes;
