import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar from '../../components/header/Header';

interface Grua {
  id: string;
  Equipo: string;
  Modelo: string;
  ["Serie de Equipo"]: string;
  cliente_asignado: string;
  proxima_mantencion: string;
  modelo_bateria?: string;
  año_bateria?: string;
  desulfatacion_bateria?: string;
  enchufe_bateria?: string;
  modelo_cargador?: string;
  serie_cargador?: string;
  enchufe_cargador?: string;
}

interface Mantencion {
  id: string;
  tipoMantencion: string;
  fecha: Date;
  equipo: string;
  cliente: string;
  tecnico: string;
  detalle: string;
}

function Detallegrua() {
  const { gruaId } = useParams<{ gruaId: string }>();
  const [grua, setGrua] = useState<Grua | null>(null);
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [showModal, setShowModal] = useState(false); // Modal control
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirm modal control
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Campos de batería y cargador
  const [modeloBateria, setModeloBateria] = useState('');
  const [añoBateria, setAñoBateria] = useState('');
  const [desulfatacionBateria, setDesulfatacionBateria] = useState('');
  const [enchufeBateria, setEnchufeBateria] = useState('');
  const [modeloCargador, setModeloCargador] = useState('');
  const [serieCargador, setSerieCargador] = useState('');
  const [enchufeCargador, setEnchufeCargador] = useState('');

  useEffect(() => {
    const fetchGrua = async () => {
      try {
        if (gruaId) {
          const gruaRef = doc(db, "Gruas", gruaId);
          const gruaDoc = await getDoc(gruaRef);
          if (gruaDoc.exists()) {
            const gruaData = gruaDoc.data() as Grua;
            setGrua(gruaData);

            // Establecer los valores iniciales en el estado
            setModeloBateria(gruaData.modelo_bateria || '');
            setAñoBateria(gruaData.año_bateria || '');
            setDesulfatacionBateria(gruaData.desulfatacion_bateria || '');
            setEnchufeBateria(gruaData.enchufe_bateria || '');
            setModeloCargador(gruaData.modelo_cargador || '');
            setSerieCargador(gruaData.serie_cargador || '');
            setEnchufeCargador(gruaData.enchufe_cargador || '');
          } else {
            setError("No se encontró la grúa.");
          }

          // Fetch mantenciones asociadas a la grúa
          const mantencionesSnapshot = await getDocs(collection(db, "mantenciones"));
          const mantencionesList = mantencionesSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              fecha: doc.data().fecha.toDate(),
            }) as Mantencion)
            .filter(mantencion => mantencion.equipo === gruaId); // Filtrar por ID de la grúa

          setMantenciones(mantencionesList);
        }
      } catch (err) {
        setError("Error al cargar la grúa.");
        console.error("Error fetching grua: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrua();
  }, [gruaId]);

  // Abrir y cerrar modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Abrir y cerrar modal de confirmación
  const handleShowConfirmModal = () => setShowConfirmModal(true);
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  // Guardar los cambios en la base de datos
  const handleSaveChanges = async () => {
    if (gruaId) {
      try {
        const gruaRef = doc(db, "Gruas", gruaId);
        await updateDoc(gruaRef, {
          modelo_bateria: modeloBateria,
          año_bateria: añoBateria,
          desulfatacion_bateria: desulfatacionBateria,
          enchufe_bateria: enchufeBateria,
          modelo_cargador: modeloCargador,
          serie_cargador: serieCargador,
          enchufe_cargador: enchufeCargador
        });
        handleCloseConfirmModal();
        setShowModal(false); // Cerrar el modal después de confirmar
        setError(null); // Limpiar el error
      } catch (err) {
        console.error("Error updating battery and charger details: ", err);
      }
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <Navbar />
        <div className="container mt-3">
          <h1>ID de la Grúa: {gruaId}</h1>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : grua ? (
            <>
              <div className="d-flex justify-content-between">
                <Card>
                  <Card.Body>
                    <Card.Title>Detalles del Equipo</Card.Title>
                    <Card.Text>
                      <strong>Equipo:</strong> {grua.Equipo} <br />
                      <strong>Modelo:</strong> {grua.Modelo} <br />
                      <strong>Serie de Equipo:</strong> {grua["Serie de Equipo"] || '-'} <br />
                    </Card.Text>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <Card.Title>Cliente Asignado</Card.Title>
                    <Card.Text>
                      {grua.cliente_asignado || 'Sin Cliente'}
                    </Card.Text>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <Card.Title>Próxima Mantención</Card.Title>
                    <Card.Text>
                      {grua.proxima_mantencion || 'No definida'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>

              <h2 className="mt-4 d-flex justify-content-between">
                Especificaciones de la Batería y Cargador
                <Button variant="outline-primary" size="sm" onClick={handleShowModal}>
                  Editar
                </Button>
              </h2>
              
              <div className="d-flex justify-content-between">
                <Card>
                  <Card.Body>
                    <Card.Title>Especificaciones de la Batería</Card.Title>
                    <Card.Text>
                      <strong>Modelo:</strong> {grua.modelo_bateria || '-'} <br />
                      <strong>Año:</strong> {grua.año_bateria || '-'} <br />
                      <strong>Desulfatación:</strong> {grua.desulfatacion_bateria || '-'} <br />
                      <strong>Enchufe Batería:</strong> {grua.enchufe_bateria || '-'} <br />
                    </Card.Text>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <Card.Title>Especificaciones del Cargador</Card.Title>
                    <Card.Text>
                      <strong>Modelo Cargador:</strong> {grua.modelo_cargador || '-'} <br />
                      <strong>Número de Serie:</strong> {grua.serie_cargador || '-'} <br />
                      <strong>Enchufe Cargador:</strong> {grua.enchufe_cargador || '-'} <br />
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>

              {/* Modal para editar las especificaciones de la batería y el cargador */}
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Editar Especificaciones</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <h5>Especificaciones de la Batería</h5>
                  <Form.Group className="mb-3" controlId="formModeloBateria">
                    <Form.Label>Modelo de Batería</Form.Label>
                    <Form.Control
                      type="text"
                      value={modeloBateria}
                      onChange={(e) => setModeloBateria(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formAñoBateria">
                    <Form.Label>Año de Batería</Form.Label>
                    <Form.Control
                      type="text"
                      value={añoBateria}
                      onChange={(e) => setAñoBateria(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formDesulfatacionBateria">
                    <Form.Label>Fecha de Desulfatación</Form.Label>
                    <Form.Control
                      type="text"
                      value={desulfatacionBateria}
                      onChange={(e) => setDesulfatacionBateria(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEnchufeBateria">
                    <Form.Label>Enchufe Batería</Form.Label>
                    <Form.Control
                      type="text"
                      value={enchufeBateria}
                      onChange={(e) => setEnchufeBateria(e.target.value)}
                    />
                  </Form.Group>

                  <h5>Especificaciones del Cargador</h5>
                  <Form.Group className="mb-3" controlId="formModeloCargador">
                    <Form.Label>Modelo de Cargador</Form.Label>
                    <Form.Control
                      type="text"
                      value={modeloCargador}
                      onChange={(e) => setModeloCargador(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formSerieCargador">
                    <Form.Label>Serie de Cargador</Form.Label>
                    <Form.Control
                      type="text"
                      value={serieCargador}
                      onChange={(e) => setSerieCargador(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEnchufeCargador">
                    <Form.Label>Enchufe Cargador</Form.Label>
                    <Form.Control
                      type="text"
                      value={enchufeCargador}
                      onChange={(e) => setEnchufeCargador(e.target.value)}
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleShowConfirmModal}>
                    Guardar Cambios
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Modal de confirmación */}
              <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirmar Cambios</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>¿Estás seguro de que deseas guardar los cambios en las especificaciones?</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseConfirmModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSaveChanges}>
                    Confirmar y Guardar
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Mantenciones asociadas */}
              <h2 className="mt-4">Mantenciones Asociadas</h2>
              <div className="d-flex flex-wrap">
                {mantenciones.length > 0 ? (
                  mantenciones.map(mantencion => (
                    <Card key={mantencion.id} className="m-2" style={{ width: '22rem' }}>
                      <Card.Body>
                        <Card.Title>{mantencion.tipoMantencion}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {mantencion.fecha.toLocaleDateString()} - Técnico: {mantencion.tecnico}
                        </Card.Subtitle>
                        <Card.Text>
                          <strong>Detalle:</strong> {mantencion.detalle}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <p>No hay mantenciones asociadas a esta grúa.</p>
                )}
              </div>
            </>
          ) : (
            <p>No se encontró información de la grúa.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Detallegrua;
