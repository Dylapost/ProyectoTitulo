import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header/Header'
import Home from './Vistas/home/Home';
import Login from './Vistas/login/Login'
import Footer from './components/footer/Footer';
import Registro from './Vistas/Registro/Registro'; 
import './App.css'

function App() {
  return (
    <Router>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

