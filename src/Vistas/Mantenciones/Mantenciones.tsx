import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { collection, addDoc, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar2 from '../../components/header/Header'; // Navbar2 actual
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar moment para español
moment.locale('es');
const localizer = momentLocalizer(moment); // Localizador de calendario con moment.js

// Mensajes en español para el calendario
const messages = {
  next: "Sig",
  previous: "Ant",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
  showMore: (total: any) => `+ Ver más (${total})`
};

interface Mantencion {
  id: string;
  tipoMantencion: string;
  fecha: any; // Cambiar a any para manejar el timestamp
  equipo: string;
  cliente: string;
  tecnico: string;
  detalle: string;
}

interface Cliente {
  id: string;
  gruas_asignadas: string[];
}

const Mantenciones = () => {
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false); // Modal control
  const [tipoMantencion, setTipoMantencion] = useState('');
  const [fecha, setFecha] = useState('');
  const [equipo, setEquipo] = useState('');
  const [cliente, setCliente] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [detalle, setDetalle] = useState('');
  const [showCalendar, setShowCalendar] = useState(false); // Estado para cambiar entre la vista de lista y calendario

  // Estado para filtro de cliente
  const [filtroCliente, setFiltroCliente] = useState('');

  // Función para abrir/cerrar el modal
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  // Función para cambiar entre vista de lista y calendario
  const handleToggleView = () => {
    setShowCalendar(!showCalendar);
  };

  // Función para agregar una mantención a Firestore
  const handleAddMantencion = async () => {
    try {
      // Añadir la mantención a la colección de mantenciones
      const docRef = await addDoc(collection(db, 'mantenciones'), {
        tipoMantencion,
        fecha: new Date(fecha), // Guardar como fecha de JavaScript
        equipo,
        cliente,
        tecnico,
        detalle,
      });
      console.log('Document written with ID: ', docRef.id);

      // Actualizar la grúa para agregar la mantención
      const gruaDocRef = doc(db, 'Gruas', equipo);
      await updateDoc(gruaDocRef, {
        mantenciones: arrayUnion(docRef.id)
      });

      setMantenciones([
        ...mantenciones,
        { id: docRef.id, tipoMantencion, fecha: new Date(fecha), equipo, cliente, tecnico, detalle },
      ]);
      handleCloseModal();
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  // Función para obtener las mantenciones desde Firestore
  const fetchMantenciones = async () => {
    const querySnapshot = await getDocs(collection(db, 'mantenciones'));
    const mantencionList: Mantencion[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      tipoMantencion: doc.data().tipoMantencion,
      fecha: doc.data().fecha.toDate(), // Convierte el timestamp a una fecha legible
      equipo: doc.data().equipo,
      cliente: doc.data().cliente,
      tecnico: doc.data().tecnico,
      detalle: doc.data().detalle,
    }));

    // Ordenar mantenciones por fecha (más recientes primero)
    mantencionList.sort((a, b) => b.fecha - a.fecha);

    setMantenciones(mantencionList);
  };

  // Función para obtener clientes y sus grúas desde Firestore
  const fetchClientes = async () => {
    const querySnapshot = await getDocs(collection(db, 'Clientes'));
    const clienteList: Cliente[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      gruas_asignadas: doc.data().gruas_asignadas || [],
    }));
    setClientes(clienteList);
  };

  // Manejador de cambio del cliente
  const handleClienteChange = (e: any) => {
    const selectedClienteId = e.target.value;
    setCliente(selectedClienteId);

    // Filtrar las grúas asignadas al cliente seleccionado
    const clienteSeleccionado = clientes.find(cliente => cliente.id === selectedClienteId);
    if (clienteSeleccionado) {
      setEquipos(clienteSeleccionado.gruas_asignadas);
    } else {
      setEquipos([]);
    }
  };

  // Filtrar mantenciones según el cliente seleccionado
  const filtrarMantenciones = () => {
    return mantenciones.filter(mantencion => {
      return filtroCliente ? mantencion.cliente === filtroCliente : true;
    });
  };

  // Función para crear eventos para el calendario
  const generarEventosCalendario = () => {
    return mantenciones.map((mantencion) => ({
      id: mantencion.id,
      title: `${mantencion.tipoMantencion} - ${mantencion.equipo}`,
      start: mantencion.fecha,
      end: mantencion.fecha,
    }));
  };

  useEffect(() => {
    fetchMantenciones();
    fetchClientes();
  }, []);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />
      <div className="main-content w-100">
        {/* Navbar */}
        <Navbar2 />

        <Container className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Mantenciones</h1>
            <div>
              <Button variant="primary" onClick={handleShowModal} className="me-2">
                Registrar Mantención
              </Button>
              <Button variant="secondary" onClick={handleToggleView}>
                {showCalendar ? "Vista de Lista" : "Vista de Calendario"}
              </Button>
            </div>
          </div>

          {/* Mostrar la vista de calendario o la lista de mantenciones */}
          {showCalendar ? (
            <div style={{ height: '80vh' }}>
              <Calendar
                localizer={localizer}
                events={generarEventosCalendario()}
                startAccessor="start"
                endAccessor="end"
                messages={messages} // Aplicar mensajes en español
                style={{ height: 700 }}
              />
            </div>
          ) : (
            <>
              {/* Filtro por Cliente */}
              <div className="d-flex mb-4">
                <Form.Control 
                  as="select" 
                  value={filtroCliente} 
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  className="me-2"
                >
                  <option value="">Filtrar por Cliente</option>
                  {[...new Set(mantenciones.map(m => m.cliente))].map(cliente => (
                    <option key={cliente} value={cliente}>{cliente}</option>
                  ))}
                </Form.Control>
              </div>

              {/* Cards de todas las mantenciones */}
              <h3>Todas las Mantenciones</h3>
              <div className="row">
                {filtrarMantenciones().map((mantencion) => (
                  <div key={mantencion.id} className="col-md-4 mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>{mantencion.tipoMantencion}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {mantencion.fecha.toLocaleDateString()} - Técnico: {mantencion.tecnico}
                        </Card.Subtitle>
                        <Card.Text>
                          <strong>Equipo:</strong> {mantencion.equipo} <br />
                          <strong>Cliente:</strong> {mantencion.cliente} <br />
                          <strong>Detalle:</strong> {mantencion.detalle}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </Container>

        {/* Modal para registrar una mantención */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Registrar Mantención</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formTipoMantencion">
                <Form.Label>Tipo de Mantención</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el tipo de mantención"
                  value={tipoMantencion}
                  onChange={(e) => setTipoMantencion(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formFecha">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCliente">
                <Form.Label>Cliente</Form.Label>
                <Form.Control as="select" value={cliente} onChange={handleClienteChange}>
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.id}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEquipo">
                <Form.Label>Equipo</Form.Label>
                <Form.Control
                  as="select"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                >
                  <option value="">Selecciona un equipo</option>
                  {equipos.map((equipoId) => (
                    <option key={equipoId} value={equipoId}>
                      {equipoId}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTecnico">
                <Form.Label>Técnico a cargo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre del técnico"
                  value={tecnico}
                  onChange={(e) => setTecnico(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDetalle">
                <Form.Label>Detalle</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Detalles del trabajo realizado"
                  value={detalle}
                  onChange={(e) => setDetalle(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddMantencion}>
              Guardar Mantención
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Mantenciones;
