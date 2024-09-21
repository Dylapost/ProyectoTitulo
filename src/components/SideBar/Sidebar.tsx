import './Sidebar.css';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from 'cdbreact';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <CDBSidebar textColor="#fff" backgroundColor="#333" className={''} breakpoint={0} toggled={false} minWidth={''} maxWidth={''}>
        <CDBSidebarHeader prefix={<i className="fa fa-bars" />}>
          Sidebar
        </CDBSidebarHeader>
        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink to="/inicio" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="home">Inicio</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/clientes" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="users">Clientes</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/gruas" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="wrench">Gruas</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/usuarios" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="user-cog">Usuarios</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/mantenciones" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="clipboard">Mantenciones</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/contratos" className={({ isActive }) => isActive ? "active" : ""}>
              <CDBSidebarMenuItem icon="file-contract">Contratos</CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
        <CDBSidebarFooter>
          <div className="sidebar-btn-wrapper">
            Footer
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
