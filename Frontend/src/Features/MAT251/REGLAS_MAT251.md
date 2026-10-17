# Reglas MAT251

Este documento contiene las reglas de diseño, maquetación y comportamiento exclusivas para el módulo **MAT251**. Cualquier cambio o nuevo componente dentro de esta feature debe adherirse estrictamente a estas directrices.

---

## 1. Bordes y Radios (`border-radius`)
* **1.1. Radio estándar universal**: Todo elemento interactivo, contenedor, tarjeta, input, selector y modal debe usar obligatoriamente **`borderRadius: '5px'`** (o la constante `RADIUS = '5px'`). Queda prohibido usar radios grandes por defecto (como `8px`, `12px` o superiores).

---

## 2. Selectores Personalizados Desplegables
* **2.1. Prohibición de selectores nativos `<select>`**: Todo selector en paneles de configuración, herramientas, formularios y cálculos debe implementarse mediante un menú desplegable personalizado (`custom select`). Queda prohibido el uso de la etiqueta `<select>` nativa con flechas grises y apariencia desalineada del navegador.
* **2.2. Aislamiento del contenedor relativo**: El contenedor con `position: relative` (`selectRef` o `dropdownRef`) debe envolver **única y exclusivamente al selector** (es decir, al trigger y a la lista flotante de opciones).
* **2.3. Estructura y estilos del Trigger**:
  * **Dimensiones y bordes**: `minHeight: '38px'`, `padding: '8px 12px'`, `borderRadius: RADIUS` (**`5px`**), `fontFamily: FONT`, `boxSizing: 'border-box'`.
  * **Colores**: `background: 'var(--bg-input)'` (o `var(--bg-card)`), `border: '1px solid var(--border-color)'`, `color: 'var(--text-pure)'`.
  * **Estado abierto**: Borde de resalte `1px solid var(--primary-color)` y halo de enfoque `boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'`.
  * **Flecha indicadora chevron**: `<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>` con rotación suave `transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'` y `transition: 'transform 0.2s ease'`.
  * **Estado inactivo / deshabilitado**: Si depende de una selección previa, debe mostrar `opacity: 0.6`, `cursor: 'not-allowed'` y texto descriptivo (ej. *"-- Selecciona experimento primero --"*).
* **2.4. Posicionamiento del menú flotante**:
  El menú desplegable flotante debe posicionarse con:
  ```css
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  max-height: 260px;
  overflow-y: auto;
  animation: fadeInDropdown 0.2s ease;
  ```
  Debe desplegarse inmediatamente debajo del trigger y sobreponerse limpiamente sobre cualquier elemento inferior.
* **2.5. Opciones del menú (Diseño limpio y sobrio)**:
  * **Texto limpio sin iconos**: Las opciones y el trigger deben mostrar exclusivamente texto claro y legible, evitando recargar el selector con iconos SVG, gráficos o emojis innecesarios salvo que se justifique académicamente.
  * **Espaciado y tipografía**: `padding: '9px 12px'`, `cursor: 'pointer'`, `fontSize: FS.sm`, `fontFamily: FONT`.
  * **Efecto Hover**: `background: 'var(--bg-input, rgba(0,0,0,0.04))'`.
  * **Opción activa/seleccionada**: `color: 'var(--primary-color)'`, `fontWeight: 600`, `background: 'rgba(37, 99, 235, 0.08)'`.
* **2.6. Cierre automático por clic externo**:
  * Debe incorporar un listener global `mousedown` en `document` para cerrar el dropdown si el usuario hace clic fuera de su contenedor `ref`.
* **2.7. Ubicación de inputs condicionales**:
  * Cualquier campo de formulario o input condicional que dependa de la opción seleccionada (por ejemplo, el campo de texto de *"Elementos personalizados"*) debe colocarse **fuera del contenedor del selector**, situándose en el flujo normal debajo de este.

---

## 3. Modales de Alerta (`ModalAlerta`)
* **3.1. Esquinas redondeadas**: El contenedor del modal debe tener esquinas redondeadas de **`5px`** (`borderRadius: '5px'`).
* **3.2. Borde superior de acento**: Debe conservar una línea de acento superior de **`4px solid ${colorTheme}`** (rojo `#ef4444` para errores y amarillo/ámbar `#f59e0b` para advertencias).
* **3.3. Jerarquía y color de textos**:
  * Título destacado en negrita (`fontWeight: 'bold'`).
  * Mensaje descriptivo con color claro puro: **`color: 'var(--text-pure)'`**.
* **3.4. Botón de acción ("Entendido")**: Debe mantener un espaciado compacto con **`style={{ padding: '5px 20px' }}`** y estilos consistentes (`btn-danger` o `btn-accent`).

---

## 4. Barra de Resumen de Datos y Edición (`Barra de Datos`)
* **4.1. Contenedor horizontal**:
  * Debe utilizar **`...cardStyle`** (`background: 'var(--bg-card)'`, `border: '1px solid var(--border-color)'`, `borderRadius: RADIUS` de **`5px`**, `padding: '10px'`).
  * Distribución flexbox alineada: `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `marginBottom: '15px'`.
* **4.2. Título y contadores numéricos (Lado izquierdo)**:
  * **Título `Datos:`**: Negrita (`fontWeight: 'bold'`), tamaño `FS.sm` y color **`var(--text-pure)`** (`#000` en tema claro / `#fff` en tema oscuro). Queda prohibido usar color azul primario en este título.
  * **Fila de métricas**: `display: 'flex'`, `gap: '10px'`, `marginTop: '2px'`.
  * **Etiquetas y números**:
    * Las etiquetas descriptivas (*"Cargados:"*, *"Agregados:"*, *"Total:"*) deben usar `<small>` con `color: 'var(--text-muted)'`, `fontSize: FS.xs` y `cursor: 'help'`.
    * **Los valores numéricos** dentro de `<strong>` deben usar obligatoriamente **`color: 'var(--text-pure)'`**. Queda estrictamente prohibido usar azul (`var(--primary-color)` o `#3b82f6`) en los números.
* **4.3. Botón de acción ("Editar Datos") (Lado derecho)**:
  * Clase `btn-primary` (o `btn-primary btn-icon`).
  * Espaciado compacto estándar: `padding: '5px 14px'`, `fontSize: FS.sm`, `borderRadius: RADIUS` (`5px`), **`fontFamily: FONT`**.
  * Ícono de edición (`<EditarDatos />`) a la izquierda del texto con `gap: '6px'`.
* **4.4. Estructura JSX canónica**:
  ```jsx
  <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
      <div>
          <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
              <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                  Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.cargados || 0}</strong>
              </small>
              <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                  Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.agregados || 0}</strong>
              </small>
              <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                  Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.total || 0}</strong>
              </small>
          </div>
      </div>
      <button
          onClick={abrirEditor}
          className="btn-primary"
          style={{ padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT }}
      >
          <EditarDatos />
          Editar Datos
      </button>
  </div>
  ```

---

## 5. Tipografía Unificada (`font-family`)
* **5.1. Fuente global estándar**: Todo el módulo MAT251 (textos, títulos, subtítulos, etiquetas, tarjetas, tablas y modales) debe utilizar obligatoriamente la tipografía del sistema estandarizada mediante la constante **`FONT = 'system-ui, -apple-system, sans-serif'`** (o `font-family: inherit`).
* **5.2. Controles de formulario y botones**: Debido a que los navegadores no heredan por defecto la tipografía en etiquetas interactivas, todo botón (`<button>`), campo de entrada (`<input>`) y selector (`<select>`) debe tener explícitamente `fontFamily: FONT` o `font-family: inherit`. Queda terminantemente prohibido que los botones queden con fuentes por defecto del navegador (como Arial o fuentes del sistema incompatibles).
* **5.3. Prohibición de fuentes disonantes**: Queda prohibido el uso de fuentes serif (como *"Times New Roman"*) o familias no estandarizadas dentro de tablas académicas, tarjetas o paneles. Todo debe conservar la misma familia tipográfica limpia y moderna.

---

## 6. Selectores Segmentados de Modo (`.contenedor-selector-modos-mat251`)
* **6.1. Contenedor de modos estándar**:
  Todo selector de modos (pestañas tipo switch/píldora para alternar modos como *Matriz*, *Simulación*, *Manual*, etc.) debe utilizar obligatoriamente la clase **`.contenedor-selector-modos-mat251`**, garantizando `border-radius: 5px` (`RADIUS`), fondo de entrada `var(--bg-input, #f1f5f9)`, borde sutil `1px solid var(--border-color, #e2e8f0)` y `padding: 4px`.
* **6.2. Botones de opciones (`.btn-mat251-modo`)**:
  * Deben utilizar la clase **`.btn-mat251-modo`** (y `.active` para la opción activa).
  * Radio obligatorio de **`5px`** (`RADIUS`).
  * En estado activo (`.active`): fondo de acento `var(--accent-color)`, texto blanco `#ffffff` y sombra de resalte.
  * Deben declarar obligatoriamente la tipografía del sistema (`fontFamily: FONT` o `font-family: inherit`).
* **6.3. Adaptabilidad responsiva en pantallas móviles (`@media (max-width: 640px)`)**:
  * **Prohibición de desborde horizontal**: Queda estrictamente prohibido mantener anchos o paddings fijos de escritorio (`20px`) en móvil que desborden las tarjetas o la pantalla.
  * En vista móvil, el contenedor debe abarcar el ancho completo (`width: 100%`) con distribución uniforme (`display: flex`).
  * Cada botón `.btn-mat251-modo` en móvil debe distribuirse proporcionalmente con **`flex: 1`**, `min-width: 0`, texto centrado (`text-align: center`), espaciado compacto (`padding: 6px 4px`) y tamaño de fuente legible (`font-size: 0.72rem`).
  * El contenedor debe incorporar prevención de scroll suave (`overflow-x: auto; scrollbar-width: none;`) para salvaguardar la maquetación en pantallas ultra estrechas.
* **6.4. Estructura JSX canónica**:
  ```jsx
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
      <div className="contenedor-selector-modos-mat251">
          <button
              type="button"
              className={`btn-mat251-modo ${inputMode === 'matriz' ? 'active' : ''}`}
              onClick={() => setInputMode('matriz')}
              style={{ fontFamily: FONT }}
          >
              Análisis de Matriz
          </button>
          <button
              type="button"
              className={`btn-mat251-modo ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
              style={{ fontFamily: FONT }}
          >
              Modo Manual
          </button>
      </div>
  </div>
  ```

---

## 7. Campos de Entrada e Inputs con Placeholder (`.input-mat251.placeholder-small`)
* **7.1. Regla Universal Obligatoria**: Todo elemento `<input>` (número, texto o búsqueda) que incluya un atributo `placeholder` (ej. valores sugeridos *"Ej: 100"*, *"0.00"*, o textos explicativos) debe incluir obligatoriamente las clases:
  ```jsx
  className="input-mat251 placeholder-small"
  ```
* **7.2. Prohibición de Placeholders sin Estilo o con Tamaño por Defecto**:
  * Queda estrictamente prohibido usar placeholders con el tamaño de fuente predeterminado del navegador (14px–16px / `1rem`), ya que compiten visualmente con los datos ingresados y desalinean las tarjetas.
  * El placeholder debe ser sutil, discreto y tener un tamaño compacto secundario.
* **7.3. Definición CSS Obligatoria del Placeholder (`.placeholder-small`)**:
  ```css
  .placeholder-small::placeholder,
  .input-mat251.placeholder-small::placeholder,
  .input-mat251::placeholder {
    font-size: 0.72rem !important;
    opacity: 0.65;
    color: var(--text-muted);
  }
  ```
* **7.4. Definición CSS Obligatoria del Input (`.input-mat251`)**:
  ```css
  .input-mat251 {
    border-radius: 5px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-card);
    color: var(--text-pure);
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .input-mat251:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }
  ```
* **7.5. Ejemplo JSX Canónico**:
  ```jsx
  <input
      type="number"
      min="1"
      placeholder="Ej: 100"
      className="input-mat251 placeholder-small"
      value={repeticiones}
      onChange={(e) => setRepeticiones(e.target.value)}
      style={{
          padding: '8px 12px',
          minHeight: '38px',
          borderRadius: RADIUS,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-input)',
          color: 'var(--text-pure)',
          fontSize: FS.sm,
          outline: 'none',
          fontFamily: FONT,
          width: '100%',
          boxSizing: 'border-box'
      }}
  />
  ```

---

## 8. Botones del Sistema (`<button>`, `.button_calcular`, `.btn-primary`)
* **8.1. Tipografía Obligatoria**:
  * Todo `<button>` debe incluir explícitamente **`fontFamily: FONT`** (`'system-ui, -apple-system, sans-serif'`) o `font-family: inherit`.
  * Queda estrictamente prohibido permitir que el navegador aplique fuentes por defecto (Arial, Times New Roman, etc.).
* **8.2. Radio de Borde (`border-radius`)**:
  * Obligatorio **`borderRadius: RADIUS`** (**`5px`**). Prohibido usar radios grandes o desalineados (`8px`, `12px`).
* **8.3. Tamaño de Letra (`font-size`) y Peso (`font-weight`)**:
  * **Peso estándar universal**: Todo botón debe usar obligatoriamente **`fontWeight: 600`** (numérico). Queda descartado el uso de palabras clave como `'bold'` o pesos pesados como `700` para mantener una tipografía limpia, sobria y uniforme.
  * **Botón Principal de Cálculo / Simulación (`.button_calcular`)**:
    * Tamaño: **`FS.sm` (`0.85rem`)** o **`FS.md` (`0.9rem`)**.
    * Peso: **`fontWeight: 600`**.
    * Texto en mayúsculas destacadas (ej. *"INICIAR SIMULACIÓN"*, *"CALCULAR"*).
  * **Botón Secundario / Acción con Icono (`.btn-primary`, `.btn-secondary`, "Editar Datos")**:
    * Tamaño: **`FS.sm` (`0.85rem`)**.
    * Peso: **`fontWeight: 600`**.
  * **Botones de Modos (`.btn-mat251-modo`)**:
    * Desktop: **`0.85rem`** (`FS.sm`) con **`fontWeight: 600`**.
    * Móvil (`<= 640px`): **`0.72rem`** con `padding: 6px 4px`.
* **8.4. Espaciado y Relleno (`padding`)**:
  * **Botón de Cálculo Principal**: **`padding: '5px 20px'`** (o `'5px 15px'`).
  * **Botón de Acción Compacto con Ícono**: **`padding: '5px 14px'`**.
  * **Botón de Alerta / Modal ("Entendido")**: **`padding: '5px 20px'`**.
  * **Ancho estándar**: Siempre **`width: 'fit-content'`** centrado en su fila (`margin: '0 auto'` o contenedor `justifyContent: 'center'`). Prohibido colocar botones de 100% de ancho en escritorio a menos que sea un modal móvil.
* **8.5. Alineación e Iconos**:
  * `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'center'`.
  * Espaciado con íconos SVG: **`gap: '6px'`** a **`10px`**.
* **8.6. Estado Deshabilitado (`disabled`)**:
  * `opacity: 0.6`, `cursor: 'not-allowed'`.
* **8.7. Colores Estándar**:
  * **`.button_calcular` (Acción de Cálculo/Simulación)**:
    * Reposo: Borde sutil `1px solid var(--accent-color)`, texto `var(--accent-color)`, fondo transparente.
    * Hover: Fondo `var(--accent-color)`, texto blanco `#ffffff`, sombra sutil `0 4px 12px rgba(217, 119, 6, 0.25)`.
  * **`.btn-primary` (Acción Positiva Principal)**:
    * Fondo `var(--primary-color)`, texto `#ffffff`, borde `none` o `1px solid transparent`.
  * **`.btn-danger` (Acción Destructiva / Cancelación)**:
    * Fondo o borde rojo `#ef4444`, texto blanco o rojo.
* **8.8. Ejemplo JSX Canónico (Botón Principal)**:
  ```jsx
  <button
      type="button"
      onClick={handleCalcular}
      disabled={enProceso}
      className="button_calcular"
      style={{
          width: 'fit-content',
          padding: '5px 20px',
          borderRadius: RADIUS,
          fontSize: FS.md,
          fontWeight: 600,
          fontFamily: FONT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: enProceso ? 0.6 : 1,
          cursor: enProceso ? 'not-allowed' : 'pointer'
      }}
  >
      {enProceso ? 'CALCULANDO...' : 'CALCULAR'}
  </button>
  ```

---

## 9. Tarjetas de Métricas y Resultados
* **9.1. Escala tipográfica para Títulos**:
  * **Títulos de Simulación en MAYÚSCULAS** (`.tarjeta-prob-titulo`, `.titulo-metrica-empirica`):
    * **Desktop**: Obligatorio **`0.7rem`** (`FS.xs`).
    * **Móvil (`<= 768px`)**: **`0.55rem`**.
  * **Títulos de Cálculo en formato normal / Title Case** (`.tarjeta-calculo-titulo` para *Resultados Favorables $k$*, *Resultados Posibles $n$*, *Porcentaje*):
    * **Desktop**: Obligatorio **`0.8rem`** (`FS.sl`), compensando un punto más debido a que al no estar en mayúsculas la altura visual de las letras minúsculas es menor.
    * **Móvil (`<= 768px`)**: **`0.65rem`**.
  * **Peso (`font-weight`)**: `700` o `'bold'`.
  * **Color y Fuente**: `var(--text-pure)` con `fontFamily: FONT`.
* **9.2. Escala tipográfica unificada para Valores / Números**:
  * **Desktop**: Obligatorio **`0.9rem`** (o constante `FS.md`). Queda prohibido mezclar escalas desiguales (`1.1rem`, `1.2rem`, etc.).
  * **Móvil (`<= 768px`)**: **`0.95rem`**.
  * **Prohibición de Negrillas en Números**: Todo valor numérico y resultado en KaTeX debe llevar obligatoriamente **`fontWeight: 'normal'`** (o peso numérico `400`). Queda prohibido aplicar `fontWeight: 'bold'` u `800` para mantener la legibilidad y nitidez matemática.
* **9.3. Protección contra `text-transform` en Símbolos Matemáticos**:
  * Cuando un contenedor de título utilice `text-transform: uppercase`, es obligatorio incluir la regla `.katex { text-transform: none; }` para evitar que el navegador altere símbolos matemáticos (por ejemplo, evitando que la desviación estándar minúscula $\sigma$ se convierta en la sumatoria $\Sigma$).
* **9.4. Estructura de Contenedor y Bordes**:
  * **Borde**: `1px solid var(--border-color)`.
  * **Radio (`border-radius`)**: `5px` (`RADIUS = '5px'`).
  * **Fondo**: `var(--bg-input)` o `var(--bg-card)`.
  * **Alineación**: Texto y valores siempre centrados (`textAlign: 'center'`).

---

## 10. Tooltips Estadísticos Pedagógicos (`StatLabel`) y Diccionario Centralizado (`diccionario.js`)
* **10.1. Diccionario Centralizado (`glosarioMAT251`)**:
  * Todo concepto, variable, frecuencia o fórmula matemática formal debe registrarse en `Frontend/src/features/MAT251/utils/diccionario.js`.
  * Estructura de cada entrada:
    ```javascript
    "clave": {
        texto: "Nombre formal del concepto o métrica",
        math: "Fórmula KaTeX (ej. P(X = x_i) = p_i)"
    }
    ```
* **10.2. Uso Obligatorio de `StatLabel` en Encabezados**:
  * En cabeceras de tablas de entrada manual y tablas de resultados que representen símbolos matemáticos ($X$, $P(X)$, $x_i$, $f_i$, etc.), se debe usar obligatoriamente el componente `<StatLabel formulaKey="..." />`.
* **10.3. Estética y Comportamiento del Tooltip**:
  * **Indicador visual en reposo**: Subrayado punteado sutil `border-bottom: 1px dashed var(--text-pure)` (o `var(--text-muted)`) y cursor de ayuda `cursor: 'help'`.
  * **Globo emergente (`.mat251-stat-tooltip`)**:
    * Fondo oscuro de alto contraste `#1e293b`.
    * Borde fino `1px solid rgba(255, 255, 255, 0.12)`.
    * Flecha indicadora superior centrada hacia el símbolo.
    * Sombra envolvente `box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45)`.
    * Texto del concepto en blanco `#ffffff` con peso `600` (`.mat251-tooltip-text`).
    * Fórmula matemática KaTeX en color dorado `#fbbf24` (`.mat251-tooltip-math`).
    * `pointer-events: none` y animación suave de opacidad y desplazamiento al hacer hover.
* **10.4. Alineación Estrictamente Centrada (`align="center"`)**:
  * **Centrado Obligatorio y Simétrico**: El tooltip debe estar **siempre centrado** por defecto respecto al encabezado o símbolo matemático (`align="center"` por defecto en `<StatLabel>`, con `left: 50%`, `transform: translateX(-50%)` y flecha indicadora centrada `left: 50%`).
  * **Prohibición de Alineaciones Asimétricas**: Queda terminantemente prohibido usar alineaciones como `align="left"` o descentramientos manuales en las cabeceras, ya que anclan el globo al borde izquierdo y desvían la flecha a un lateral (`left: 14px`), rompiendo la simetría visual y causando que el tooltip aparezca desplazado hacia un lado en lugar de estar enfocado directamente sobre su símbolo.
* **10.5. Prevención de Recorte en Contenedores**:
  * Los contenedores y wrappers de tablas que usen `StatLabel` **no deben llevar `overflow: hidden`**, permitiendo que el globo emergente flote libremente sobre las celdas sin ser cortado.
* **10.6. Prevención de Scrollbar Horizontal Fantasma**:
  * Para evitar barras de desplazamiento horizontal innecesarias dentro de contenedores con `overflow-x: auto`, el globo `.mat251-stat-tooltip` debe tener obligatoriamente `display: none` en reposo (y `display: flex` en hover). Al no ocupar espacio en el layout del navegador cuando está en reposo, el centrado simétrico no genera scroll horizontal fantasma.

---

## 11. Tablas de Entrada de Datos y Encabezados Matemáticos
* **11.1. Nombres de Encabezados Concisos y Puros**:
  * En tablas de distribución y frecuencias, las cabeceras deben mostrar directamente el símbolo matemático formal mediante KaTeX / `StatLabel` (por ejemplo, **$X$** y **$P(X)$**).
  * Queda descartado anteponer palabras redundantes como *"Valor (X)"* o *"Probabilidad P(X)"* para mantener una presentación compacta y limpia.
* **11.2. Bordes y Estructura**:
  * Borde de tabla unificado: `1px solid var(--text-pure)`.
  * Colapso de bordes: `borderCollapse: 'collapse'`.
  * Filas internas con borde inferior `1px solid var(--text-pure)` (excepto la última fila).

---

## 12. Botones de Acción en Tablas (Eliminar Fila) y Blindaje de Modo Oscuro
* **12.1. Botones de Acción Destructiva / Eliminar (`IconoBasura`)**:
  * Deben llevar una clase con prefijo `btn-` (ej. `className="btn-eliminar-fila-mat251"`) para evitar que el CSS genérico global de `App.css` les asigne fondo azul al pasar el cursor.
  * **Reposo**: Fondo transparente `background: transparent !important`, color rojo `#ef4444 !important`, sin bordes.
  * **Hover (`:hover:not(:disabled)`)**: Fondo rojo sólido `#ef4444 !important`, color del ícono en blanco `#ffffff !important`, escala sutil `scale(1.08)` y sombra suave `0 2px 8px rgba(239, 68, 68, 0.35)`.
  * **Deshabilitado (`:disabled`)**: `opacity: 0.25 !important; cursor: not-allowed !important; background: transparent !important;`.
* **12.2. Blindaje de Colores de Tema en Modo Oscuro**:
  * Botones estándar secundarios como *"Agregar Fila"* o *"Editar Datos"* (`.btn-primary`, `.btn-agregar-fila-discreta`) deben mantener estrictamente su color azul `var(--primary-color)` tanto en modo claro como en modo oscuro.
  * Queda prohibido aplicar clases de tema de otros módulos (como `.btn-icon` de Tema 1) que inyecten bordes de color naranja (`#ff6e00`) u otros tonos no correspondientes en modo oscuro.
  * Cualquier estilo específico de tema en modo oscuro debe estar rigurosamente encapsulado bajo su clase contenedora (ej. `.tema1-container`, `.tema2-container`).

---

## 13. Flujo de Ejecución de Cálculos y Limpieza de Resultados
* **13.1. Obligatoriedad del Botón `CALCULAR`**:
  * Los cálculos nunca deben ejecutarse ni mostrarse de forma automática o directa al cargar la página o al modificar parámetros de entrada.
  * Todo resultado o simulación requiere un clic explícito del usuario en el botón principal **`CALCULAR`**.
* **13.2. Limpieza Inmediata ante Cambios de Datos**:
  * Al deseleccionar la variable, borrar filas en el editor, vaciar datos globales (`statsDatos.total === 0`), cambiar de columna o alternar de modo (`matriz` / `manual`), el componente debe llamar de inmediato a `onCalcular(null)` (y `setDatosDiscretos(null)`).
  * Los resultados anteriores no deben permanecer en pantalla si los datos base han sido modificados o eliminados.
