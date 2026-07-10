import Menu from "../components/Menu";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      {/* Encabezado */}
      <header className="header">
        <h1>Mi Proyecto React + FastAPI</h1>
      </header>

      {/* Menú */}
      <nav className="menu">
        <Menu />
      </nav>

      {/* Contenido dinámico */}
      <main className="content">
        {children}
      </main>

      {/* Pie de página */}
      <footer className="footer">
        <p>© 2025 - Proyecto de práctica</p>
      </footer>
    </div>
  );
}
