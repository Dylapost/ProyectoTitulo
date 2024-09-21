import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Inicio from './Vistas/InicioDash/Inicio';
import Home from './Vistas/home/Home';
import Login from './Vistas/login/Login';
import Registro from './Vistas/Registro/Registro';
import Gruas from './Vistas/Gruas/Gruas';
import Clientes from './Vistas/Clientes/Clientes';
import Usuarios from './Vistas/Usuarios/Usuarios';
import Mantenciones from './Vistas/Mantenciones/Mantenciones';

import Contratos from './Vistas/Contratos/Contratos';
import Detallegrua from './Vistas/Detallegrua/Detallegrua'; // Importa la nueva vista

function App() {
  return (
    <Router>
      <div className="d-flex">
        <div className="content w-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/gruas" element={<Gruas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/mantenciones" element={<Mantenciones />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/gruas/:gruaId" element={<Detallegrua />} /> {/* Cambio aquí */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
