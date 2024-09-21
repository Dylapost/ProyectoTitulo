import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar from '../../components/header/Header';
import './contratos.css'

// Interfaces para manejar los datos de Firebase
interface Cliente {
  id: string;
  contacto: string;
  telefono: string;
  gruas_asignadas: string[];
}

interface Grua {
  id: string;
  Equipo: string;
  Modelo: string;
  cliente_asignado: string;
}

interface Contrato {
  clienteId: string;
  gruaId: string;
  fechaInicio: string;
  fechaTermino: string;
  estadoDeContrato: boolean;
  contratoId: string;
}

function Contratos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedGrua, setSelectedGrua] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal para contrato creado
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal para confirmación de finalización
  const [contratoSeleccionado, setContratoSeleccionado] = useState<Contrato | null>(null); // Para almacenar el contrato seleccionado


  // Función para obtener datos de Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesSnapshot = await getDocs(collection(db, 'Clientes'));
        const gruasSnapshot = await getDocs(collection(db, 'Gruas'));
        const contratosSnapshot = await getDocs(collection(db, 'Contratos'));

        setClientes(clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[]);
        setGruas(gruasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Grua[]);
        setContratos(contratosSnapshot.docs.map(doc => ({ contratoId: doc.id, ...doc.data() })) as unknown as Contrato[]);
      } catch (error) {
        console.error('Error fetching data from Firestore:', error);
      }
    };

    fetchData();
  }, []);

  // Verificar contratos vencidos
  useEffect(() => {
    const verificarContratosVencidos = async () => {
      const hoy = new Date();

      contratos.forEach(async (contrato) => {
        const fechaTermino = new Date(contrato.fechaTermino);
        if (fechaTermino < hoy && contrato.estadoDeContrato) {
          // Si la fecha de término ha pasado y el contrato sigue activo
          await finalizarContratoAutomatico(contrato);
        }
      });
    };

    verificarContratosVencidos();
  }, [contratos]);

  // Función para finalizar contratos vencidos automáticamente
  const finalizarContratoAutomatico = async (contrato: Contrato) => {
    try {
      const contratoRef = doc(db, 'Contratos', contrato.contratoId);
  
      // Actualiza el estado del contrato a 'finalizado' (false)
      await updateDoc(contratoRef, {
        estadoDeContrato: false
      });
  
      // 1. Quitar la grúa asignada del cliente
      const clienteRef = doc(db, 'Clientes', contrato.clienteId);
      const clienteActual = clientes.find(cliente => cliente.id === contrato.clienteId);
      await updateDoc(clienteRef, {
        gruas_asignadas: clienteActual?.gruas_asignadas.filter(g => g !== contrato.gruaId),
      });
  
      // 2. Quitar el cliente asignado de la grúa
      const gruaRef = doc(db, 'Gruas', contrato.gruaId);
      await updateDoc(gruaRef, {
        cliente_asignado: "",
      });
  
      // 3. Actualizar el estado local de los contratos
      setContratos(prevContratos => prevContratos.map(c => c.contratoId === contrato.contratoId ? { ...c, estadoDeContrato: false } : c));
    } catch (error) {
      console.error("Error finalizando contrato automáticamente:", error);
    }
  };

  // Guardar contrato
  const handleSaveContrato = async () => {
    if (!selectedCliente || !selectedGrua || !fechaInicio || !fechaTermino) return;

    const newContratoId = `${selectedCliente}_${selectedGrua}_${new Date().getTime()}`;

    try {
      // Actualizar el cliente con la grúa asignada
      const clienteRef = doc(db, 'Clientes', selectedCliente);
      const clienteActual = clientes.find(cliente => cliente.id === selectedCliente);
      await updateDoc(clienteRef, {
        gruas_asignadas: [...(clienteActual?.gruas_asignadas || []), selectedGrua],
      });

      // Actualizar la grúa con el cliente asignado
      const gruaRef = doc(db, 'Gruas', selectedGrua);
      await updateDoc(gruaRef, {
        cliente_asignado: selectedCliente,
      });

      // Guardar el contrato en Firestore
      await setDoc(doc(db, 'Contratos', newContratoId), {
        clienteId: selectedCliente,
        gruaId: selectedGrua,
        fechaInicio,
        fechaTermino,
        estadoDeContrato: true, // Contrato activo
      });

      // Actualizar la lista de contratos en el estado
      setContratos([...contratos, {
        clienteId: selectedCliente,
        gruaId: selectedGrua,
        fechaInicio,
        fechaTermino,
        estadoDeContrato: true,
        contratoId: newContratoId,
      }]);

      setShowSuccessModal(true);

      handleClose();
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleFinalizarContrato = (contrato: Contrato) => {
    setContratoSeleccionado(contrato);  // Almacenar el contrato seleccionado
    setShowConfirmModal(true);          // Mostrar el modal de confirmación
  };
  
  const handleConfirmFinalizarContrato = async () => {
    if (!contratoSeleccionado) return;
    await finalizarContratoAutomatico(contratoSeleccionado);
    setShowConfirmModal(false);  // Cerrar el modal después de finalizar
  };

  // Separar contratos vigentes y finalizados
  const contratosVigentes = contratos.filter(contrato => contrato.estadoDeContrato);
  const contratosFinalizados = contratos.filter(contrato => !contrato.estadoDeContrato);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="main-content w-100">
        {/* Navbar */}
        <Navbar />

        <div className="container mt-4">
          {/* Cards para mostrar el resumen de contratos */}
          <div className="d-flex justify-content-between mb-4">
            <div className="summary-card p-3">
              <h5>Contratos Vigentes</h5>
              <p>{contratosVigentes.length}</p>
            </div>

            <div className="summary-card p-3">
              <h5>Contratos Totales</h5>
              <p>{contratos.length}</p>
            </div>
          </div>


          {/* Título de contratos vigentes */}
          <div className="d-flex justify-content-between mb-4">
            <h4>Contratos Vigentes</h4>
            <Button variant="primary" onClick={handleShow}>
              Agregar Contrato
            </Button>
          </div>

          {/* Mostrar los contratos vigentes en formato de 2 columnas */}
          <div className="row">
            {contratosVigentes.map((contrato, index) => {
              const cliente = clientes.find(c => c.id === contrato.clienteId);
              const grua = gruas.find(g => g.id === contrato.gruaId);
              return (
                <div className="col-md-6" key={index}>
                  <Card className="mb-3 card-contrato-vigente">
                    <Card.Body>
                      <Card.Title>{cliente?.id}</Card.Title>
                      <Card.Text>
                        Grúa: {grua?.id} - {grua?.Equipo} - {grua?.Modelo} <br />
                        Fecha Inicio: {contrato.fechaInicio} <br />
                        Fecha Término: {contrato.fechaTermino}
                      </Card.Text>
                      <Button
                        variant="danger"
                        onClick={() => handleFinalizarContrato(contrato)}
                        className="float-end"
                      >
                        Finalizar Contrato
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Título de contratos finalizados */}
          <h4 className="mt-5">Contratos Finalizados</h4>

          {/* Mostrar los contratos finalizados en formato de 2 columnas */}
          <div className="row">
            {contratosFinalizados.map((contrato, index) => {
              const cliente = clientes.find(c => c.id === contrato.clienteId);
              const grua = gruas.find(g => g.id === contrato.gruaId);
              return (
                <div className="col-md-6" key={index}>
                  <Card className="mb-3 card-contrato-finalizado">
                    <Card.Body>
                      <Card.Title>{cliente?.id}</Card.Title>
                      <Card.Text>
                        Grúa: {grua?.id} - {grua?.Equipo} - {grua?.Modelo} <br />
                        Fecha Inicio: {contrato.fechaInicio} <br />
                        Fecha Término: {contrato.fechaTermino}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Contrato Creado</Modal.Title>
          </Modal.Header>
          <Modal.Body>El contrato ha sido creado con éxito.</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
              Aceptar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmación</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Estás seguro de que deseas finalizar este contrato antes de tiempo?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmFinalizarContrato}>
              Finalizar
            </Button>
          </Modal.Footer>
        </Modal>

          {/* Modal para agregar contrato */}
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Agregar Contrato</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Cliente</Form.Label>
                  <Form.Control as="select" value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
                    <option value="">Selecciona un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.id}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Grúa</Form.Label>
                  <Form.Control as="select" value={selectedGrua} onChange={(e) => setSelectedGrua(e.target.value)}>
                    <option value="">Selecciona una grúa</option>
                    {gruas.map((grua) => (
                      <option key={grua.id} value={grua.id}>
                        {grua.id} - {grua.Equipo} - {grua.Modelo}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha Término</Form.Label>
                  <Form.Control type="date" value={fechaTermino} onChange={(e) => setFechaTermino(e.target.value)} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveContrato}>
                Guardar Contrato
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Contratos;
