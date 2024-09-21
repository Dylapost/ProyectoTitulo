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
import { useNavigate } from 'react-router-dom';

interface Grua {
  id: string;
  equipo: string;
  modelo: string;
  serieDeEquipo: string;
  cliente_asignado?: string;
  proxima_mantencion?: string; // Añadido para la próxima mantención
}

function GruasView() {
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Modal de confirmación para eliminar
  const [showSuccess, setShowSuccess] = useState(false); // Modal de éxito para agregar/modificar
  const [showProgramarMantencion, setShowProgramarMantencion] = useState(false); // Modal para programar mantención
  const [id, setId] = useState('');
  const [equipo, setEquipo] = useState('');
  const [modelo, setModelo] = useState('');
  const [serieDeEquipo, setSerieDeEquipo] = useState('');
  const [clienteAsignado, setClienteAsignado] = useState('');
  const [proximaMantencion, setProximaMantencion] = useState(''); // Estado para la próxima mantención
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // Para manejar la eliminación
  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setCurrentId(null);
    setId('');
    setEquipo('');
    setModelo('');
    setSerieDeEquipo('');
    setClienteAsignado('');
    setProximaMantencion('');
  };

  const handleShow = () => setShow(true);

  const fetchGruas = async () => {
    try {
      const gruasCollection = collection(db, "Gruas");
      const gruasSnapshot = await getDocs(gruasCollection);
      const gruasList = gruasSnapshot.docs.map((doc) => ({
        id: doc.id,
        equipo: doc.data()["Equipo"],
        modelo: doc.data()["Modelo"],
        serieDeEquipo: doc.data()["Serie de Equipo"],
        cliente_asignado: doc.data()["cliente_asignado"] || "Sin cliente",
        proxima_mantencion: doc.data()["proxima_mantencion"] || "-", // Obtener próxima mantención si existe
      })) as Grua[];
      setGruas(gruasList);
    } catch (err) {
      setError("Error al cargar los datos.");
      console.error("Error fetching gruas: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (editMode && currentId) {
      try {
        const gruaDoc = doc(db, "Gruas", currentId);
        await setDoc(gruaDoc, {
          Equipo: equipo,
          Modelo: modelo,
          "Serie de Equipo": serieDeEquipo,
          cliente_asignado: clienteAsignado,
          proxima_mantencion: proximaMantencion, // Guardar la próxima mantención
        });
        handleClose();
        setShowSuccess(true); // Mostrar modal de éxito
        fetchGruas();
      } catch (err) {
        console.error("Error updating grua: ", err);
      }
    } else {
      try {
        const gruaDoc = doc(db, "Gruas", id);
        await setDoc(gruaDoc, {
          Equipo: equipo,
          Modelo: modelo,
          "Serie de Equipo": serieDeEquipo,
          cliente_asignado: clienteAsignado,
          proxima_mantencion: proximaMantencion, // Guardar la próxima mantención
        });
        handleClose();
        setShowSuccess(true); // Mostrar modal de éxito
        fetchGruas();
      } catch (err) {
        console.error("Error adding grua: ", err);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "Gruas", deleteId));
        fetchGruas();
        setShowConfirm(false);
      } catch (err) {
        console.error("Error deleting grua: ", err);
      }
    }
  };

  const handleEdit = (grua: Grua) => {
    setEditMode(true);
    setCurrentId(grua.id);
    setId(grua.id);
    setEquipo(grua.equipo);
    setModelo(grua.modelo);
    setSerieDeEquipo(grua.serieDeEquipo);
    setClienteAsignado(grua.cliente_asignado || "Sin cliente");
    setProximaMantencion(grua.proxima_mantencion || ""); // Obtener la próxima mantención para editar
    handleShow();
  };

  const handleProgramarMantencion = (grua: Grua) => {
    setCurrentId(grua.id);
    setProximaMantencion('');
    setShowProgramarMantencion(true);
  };

  const saveProximaMantencion = async () => {
    if (currentId) {
      try {
        const gruaDoc = doc(db, "Gruas", currentId);
        await setDoc(gruaDoc, {
          proxima_mantencion: proximaMantencion, // Guardar la próxima mantención
        }, { merge: true });
        setShowProgramarMantencion(false);
        fetchGruas();
      } catch (err) {
        console.error("Error updating proxima_mantencion: ", err);
      }
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true); // Mostrar modal de confirmación para eliminar
  };

  useEffect(() => {
    fetchGruas();
  }, []);

  // Separar grúas en stock (sin cliente) y arrendadas (con cliente)
  const gruasEnStock = gruas.filter(grua => grua.cliente_asignado === "Sin cliente");
  const gruasArrendadas = gruas.filter(grua => grua.cliente_asignado !== "Sin cliente");

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="main-content w-100">
        {/* Navbar */}
        <Navbar />

        <div className="container mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Grúas en Stock</h1>
            <Button variant="primary" onClick={handleShow}>
              Agregar Grúa
            </Button>
          </div>

          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {/* Tabla de grúas en stock */}
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Equipo</th>
                    <th>Modelo</th>
                    <th>Serie de Equipo</th>
                    <th>Próxima Mantención</th> {/* Nueva columna */}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gruasEnStock.map((grua) => (
                    <tr key={grua.id}>
                      <td>{grua.id}</td>
                      <td>{grua.equipo}</td>
                      <td>{grua.modelo}</td>
                      <td>{grua.serieDeEquipo}</td>
                      <td>{grua.proxima_mantencion}</td> {/* Mostrar próxima mantención */}
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Opciones
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(grua)}>Modificar</Dropdown.Item>
                            <Dropdown.Item onClick={() => confirmDelete(grua.id)}>Eliminar</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate(`/gruas/${grua.id}`)}>Más Detalle</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleProgramarMantencion(grua)}>Programar Próxima Mantención</Dropdown.Item> {/* Nueva opción */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Título y tabla de grúas arrendadas */}
              <h2 className="mt-5">Grúas Arrendadas</h2>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Equipo</th>
                    <th>Modelo</th>
                    <th>Serie de Equipo</th>
                    <th>Cliente Asignado</th>
                    <th>Próxima Mantención</th> {/* Nueva columna */}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gruasArrendadas.map((grua) => (
                    <tr key={grua.id}>
                      <td>{grua.id}</td>
                      <td>{grua.equipo}</td>
                      <td>{grua.modelo}</td>
                      <td>{grua.serieDeEquipo}</td>
                      <td>{grua.cliente_asignado}</td>
                      <td>{grua.proxima_mantencion}</td> {/* Mostrar próxima mantención */}
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Opciones
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(grua)}>Modificar</Dropdown.Item>
                            <Dropdown.Item onClick={() => confirmDelete(grua.id)}>Eliminar</Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => handleProgramarMantencion(grua)}>Programar Próxima Mantención</Dropdown.Item> {/* Nueva opción */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </div>

        {/* Modal para agregar/modificar una grúa */}
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? "Modificar Grúa" : "Agregar Grúa"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {!editMode && (
                <Form.Group className="mb-3">
                  <Form.Label>ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el ID de la grúa"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    autoFocus
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Equipo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre del equipo"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Modelo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Serie de Equipo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese la serie de equipo"
                  value={serieDeEquipo}
                  onChange={(e) => setSerieDeEquipo(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editMode ? "Guardar Cambios" : "Guardar Grúa"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar esta grúa? Esta acción no se puede deshacer.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para programar la próxima mantención */}
        <Modal show={showProgramarMantencion} onHide={() => setShowProgramarMantencion(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Programar Próxima Mantención</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Próxima Mantención</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Ingrese la fecha de la próxima mantención"
                  value={proximaMantencion}
                  onChange={(e) => setProximaMantencion(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProgramarMantencion(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={saveProximaMantencion}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de éxito al guardar */}
        <Modal show={showSuccess} onHide={() => setShowSuccess(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Éxito</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Grúa {editMode ? "modificada" : "agregada"} exitosamente.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowSuccess(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default GruasView;
