/** Si una herramienta falla al dibujarse, muestra el error y permite reintentar sin romper toda la simulación. */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class LimiteErroresHerramienta extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("LimiteErroresHerramienta capturó un error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px 24px', margin: '20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
          <AlertTriangle size={36} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
            Se presentó un error al renderizar la vista
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #888)', marginBottom: '16px', maxWidth: '600px', margin: '0 auto 16px auto' }}>
            {this.state.error?.message || 'Error inesperado de ejecución'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '8px 18px', background: 'var(--accent-color, #ea580c)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Reintentar vista
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
