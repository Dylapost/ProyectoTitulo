import { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Sidebar from '../../components/SideBar/Sidebar';
import Navbar2 from '../../components/header/Header';
import { FaWarehouse, FaClipboardList, FaWrench, FaFileContract } from 'react-icons/fa'; // Iconos
import './inicio.css'; // Archivo CSS para estilos personalizados
import { useNavigate } from 'react-router-dom'; // Para la navegación

const Inicio = () => {
  const [gruasEnStock, setGruasEnStock] = useState<number>(0);
  const [clientesConContrato, setClientesConContrato] = useState<number>(0);
  const [mantencionesUltimoMes, setMantencionesUltimoMes] = useState<number>(0);
  const [contratosActivos, setContratosActivos] = useState<number>(0);
  const [contratosTotales, setContratosTotales] = useState<number>(0);
  const navigate = useNavigate(); // Navegación

  const fetchGruasEnStock = async () => {
    const q = query(collection(db, 'Gruas'), where('cliente_asignado', '==', 'Sin cliente'));
    const querySnapshot = await getDocs(q);
    setGruasEnStock(querySnapshot.size);
  };

  const fetchClientesConContrato = async () => {
    const querySnapshot = await getDocs(collection(db, 'Clientes'));
    const clientesConGrúa = querySnapshot.docs.filter(doc => (doc.data().gruas_asignadas || []).length > 0);
    setClientesConContrato(clientesConGrúa.length);
  };

  const fetchMantencionesUltimoMes = async () => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    const querySnapshot = await getDocs(collection(db, 'mantenciones'));
    const mantencionesList = querySnapshot.docs.filter(doc => doc.data().fecha.toDate() >= haceUnMes);
    setMantencionesUltimoMes(mantencionesList.length);
  };

  const fetchContratos = async () => {
    const querySnapshot = await getDocs(collection(db, 'Contratos'));
    const totalContratos = querySnapshot.size;
    const activos = querySnapshot.docs.filter(doc => doc.data().estado === 'activo').length;
    setContratosTotales(totalContratos);
    setContratosActivos(activos);
  };

  useEffect(() => {
    fetchGruasEnStock();
    fetchClientesConContrato();
    fetchMantencionesUltimoMes();
    fetchContratos();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <Navbar2 />
        <Container className="inicio-container mt-5">
          <Row className="inicio-row justify-content-between">
            {/* Primera fila con dos tarjetas grandes */}
            <Col md={6} className="mb-4">
              <Card className="inicio-card card-stock" onClick={() => navigate('/gruas')}>
                <Card.Body>
                  <FaWarehouse className="card-icon" />
                  <Card.Title className="inicio-card-title">Grúas en Stock</Card.Title>
                  <Card.Text className="inicio-card-number">{gruasEnStock}</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="inicio-card card-cliente" onClick={() => navigate('/clientes')}>
                <Card.Body>
                  <FaClipboardList className="card-icon" />
                  <Card.Title className="inicio-card-title">Clientes con Contrato</Card.Title>
                  <Card.Text className="inicio-card-number">{clientesConContrato}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="inicio-row justify-content-between">
            {/* Segunda fila con tres tarjetas más pequeñas */}
            <Col md={4} className="mb-4">
              <Card className="inicio-card card-mantencion" onClick={() => navigate('/mantenciones')}>
                <Card.Body>
                  <FaWrench className="card-icon" />
                  <Card.Title className="inicio-card-title">Mantenciones del Último Mes</Card.Title>
                  <Card.Text className="inicio-card-number">{mantencionesUltimoMes}</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="inicio-card card-activos" onClick={() => navigate('/contratos')}>
                <Card.Body>
                  <FaFileContract className="card-icon" />
                  <Card.Title className="inicio-card-title">Contratos Activos</Card.Title>
                  <Card.Text className="inicio-card-number">{contratosActivos}</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="inicio-card card-totales" onClick={() => navigate('/contratos')}>
                <Card.Body>
                  <FaFileContract className="card-icon" />
                  <Card.Title className="inicio-card-title">Contratos Totales</Card.Title>
                  <Card.Text className="inicio-card-number">{contratosTotales}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Inicio;
