# Análisis Empresarial: mapa de la carpeta

`AnalisisEmpresarial.jsx` es el contenedor. Tiene el catálogo de casos, la simulación por fases, la Lluvia de ideas y la Matriz FODA. Todo lo demás está agrupado por fase y por herramienta. Cada herramienta tiene en su carpeta su componente, sus estilos, sus datos o cálculos y su reporte PDF.

| Carpeta | Qué contiene |
|---|---|
| `caso/` | Crear y editar caso (`ModalCrearCaso`), selector de herramientas, editor de texto del contexto y dossier del caso |
| `simulacion/` | Avance guardado, progreso de las fases, iconos, navegación «Volver / Continuar» (`PieNavegacion`) y límite de errores |
| `compartido/` | Piezas comunes: barra superior, indicadores y notas (`ComponentesHerramienta`), botón PDF, modales, documentos de respaldo, exportación PDF y estilos base |
| `fase2-identificacion-problema/` | Árbol de problemas y el PDF de la Fase 2 (lluvia + árbol) |
| `fase3-diagnostico-externo/` | `pestel/`, `porter/`, `mpc/`, `poam/` |
| `fase4-diagnostico-interno/` | `analisis-vertical-horizontal/`, `customer-journey/`, `flujogramas/`, `matriz-efi/`, `auditoria-redes/`, `evaluacion-360/`, `inventarios/` |
| `fase5-analisis-resultados/` | `foda/` (armado de la bandeja FODA) y `resumenes/` (reportes de las fases 2, 3 y 4) |
| `fase6-planificacion/` | `dafo/`, `ansoff/` y sus cálculos compartidos |

## Convenciones de nombres

- **Componentes:** en PascalCase (`MatrizEFI.jsx`). El CSS va al lado, con el mismo nombre.
- **Datos iniciales:** `datos*.js`.
- **Cálculos sin interfaz:** `calculos*.js`.
- **Reportes que se exportan a PDF:** `ReportePdf*.jsx`.
- **Hooks:** `use*.js`.
- **Clases CSS:** conservan sus prefijos (`hf-`, `cjm-`, `avh-`, `f6-`, `r5-`…). Si cambias uno, búscalo también en el CSS.
- **Herramientas nuevas:** al agregar una, regístrala en `simulacion/iconosHerramientas.js`, `caso/herramientasCaso.js` y `simulacion/progresoFases.js`.
