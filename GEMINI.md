# Guía del Proyecto

## Módulo MAT251
Consultar las reglas completas en:
👉 [Frontend/src/features/MAT251/REGLAS_MAT251.md](file:///c:/Users/OMEN/Documents/10mo%20Semestre-02-2026/Proyecto_Simulador_Empresarial/Simulador_Empresarial/Frontend/src/features/MAT251/REGLAS_MAT251.md)

### Reglas Clave:
- **Inputs con Placeholder**: Es obligatorio usar `className="input-mat251 placeholder-small"` en todo `<input>` con `placeholder` para mantener tipografía compacta (`0.72rem`), opacidad sutil y coherencia visual con el sistema de diseño.
- **Tarjetas de Métricas y Resultados**: Títulos en MAYÚSCULAS de simulación unificados a `0.7rem` (desktop) y `0.55rem` (móvil). Títulos en formato normal/Title Case de cálculo unificados a `0.8rem` (desktop) y `0.65rem` (móvil) con `fontWeight: 700`. Valores numéricos y KaTeX unificados a `0.9rem` (desktop) y `0.95rem` (móvil) con `fontWeight: 'normal'` (prohibido negrillas en números). Radio universal `5px` y `.katex { text-transform: none; }` en títulos.
- **Tooltips Estadísticos Pedagógicos (`StatLabel`) y Diccionario (`diccionario.js`)**: Cabeceras de tablas con símbolos matemáticos ($X$, $P(X)$, $x_i$, $f_i$) deben usar `<StatLabel formulaKey="..." />`. Registrados en `Frontend/src/features/MAT251/utils/diccionario.js`. Fondo oscuro `#1e293b`, fórmula en KaTeX dorado `#fbbf24`, subrayado punteado `1px dashed`. **Alineación estrictamente centrada obligatoria** (`align="center"`, `left: 50%`, `transform: translateX(-50%)`, flecha al centro `left: 50%`), prohibido usar alineaciones asimétricas como `align="left"` que desfasen el globo. `display: none` en reposo para prevenir scrollbars horizontales fantasma y sin `overflow: hidden` en el wrapper de la tabla para evitar recortes.
- **Encabezados de Tablas de Entrada**: Usar exclusivamente los símbolos matemáticos formales (ej. $X$ y $P(X)$), suprimiendo palabras redundantes como "Valor" o "Probabilidad".
- **Botones de Eliminar Fila (Acción Destructiva)**: Usar clase con prefijo `btn-` (ej. `.btn-eliminar-fila-mat251`) para prevenir hover azul de `App.css`. Reposo: transparente y rojo `#ef4444`. Hover: fondo rojo `#ef4444 !important` con ícono blanco `#ffffff !important`.
- **Blindaje de Color en Modo Oscuro**: Botones secundarios (`.btn-primary`) deben mantener su color azul `var(--primary-color)` en ambos temas. Prohibido aplicar clases globales de otros temas (como `.btn-icon` de Tema 1) que inyecten bordes naranja `#ff6e00`.
- **Flujo de Cálculos y Limpieza**: Prohibido mostrar cálculos directamente o al cargar; siempre requieren clic en `CALCULAR`. Al modificar o vaciar datos, deseleccionar variable o cambiar columna/modo, llamar inmediatamente a `onCalcular(null)`.

