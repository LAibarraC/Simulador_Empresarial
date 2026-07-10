import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

export default function GraficoBivariado({ datos, tipo, selectedColumn, selectedColumnY }) {
  if (!datos || datos.tipo !== "distribucion_bivariada") return null;

  // =========================================================================
  // 1. GRÁFICO DE BARRAS MARGINALES (FIGURA 2.15)
  // =========================================================================
  if (tipo === "marginales") {
    const dataMarginalX = datos.filas.map(catX => ({
      nombre: catX,
      porcentaje: Number(((datos.totalFilas[catX] / datos.granTotal) * 100).toFixed(2)),
      frecuencia: datos.totalFilas[catX]
    }));

    const dataMarginalY = datos.columnas.map(catY => ({
      nombre: catY,
      porcentaje: Number(((datos.totalColumnas[catY] / datos.granTotal) * 100).toFixed(2)),
      frecuencia: datos.totalColumnas[catY]
    }));

    const colorX = "#3b82f6"; // Azul para Variable X
    const colorY = "#10b981"; // Esmeralda para Variable Y

    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Distribución Marginal de X */}
        <div style={{ flex: 1, minWidth: '280px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold' }}>
            Distribución Marginal: {selectedColumn || datos.nombreX || "Variable X"}
          </h5>
          <div style={{ flexGrow: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <BarChart data={dataMarginalX} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="nombre" tick={{ fill: 'var(--text-variable)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-variable)', fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  formatter={(value, name, props) => [`${value}% (Frecuencia: ${props.payload.frecuencia})`, "Porcentaje Marginal"]}
                />
                <Bar dataKey="porcentaje" fill={colorX} name="Porcentaje X" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="porcentaje" position="top" style={{ fill: 'var(--text-variable)', fontSize: '10px', fontWeight: 'bold' }} formatter={(val) => `${val}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución Marginal de Y */}
        <div style={{ flex: 1, minWidth: '280px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold' }}>
            Distribución Marginal: {selectedColumnY || datos.nombreY || "Variable Y"}
          </h5>
          <div style={{ flexGrow: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <BarChart data={dataMarginalY} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="nombre" tick={{ fill: 'var(--text-variable)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-variable)', fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  formatter={(value, name, props) => [`${value}% (Frecuencia: ${props.payload.frecuencia})`, "Porcentaje Marginal"]}
                />
                <Bar dataKey="porcentaje" fill={colorY} name="Porcentaje Y" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="porcentaje" position="top" style={{ fill: 'var(--text-variable)', fontSize: '10px', fontWeight: 'bold' }} formatter={(val) => `${val}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Paleta de colores: celeste, naranja y verde
  const colores = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6b7280", "#14b8a6"];

  // =========================================================================
  // 2. GRÁFICOS DE BARRAS AGRUPADAS (CON FRECUENCIA ABSOLUTA)
  // =========================================================================
  if (tipo === "agrupadas") {
    const dataGrafico = datos.columnas.map(catY => {
      const filaObj = { name: catY };
      datos.filas.forEach(catX => {
        filaObj[catX] = datos.datos[catX][catY] || 0;
      });
      return filaObj;
    });

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <BarChart data={dataGrafico} margin={{ top: 30, right: 30, left: 25, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e0e0e0)" opacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-variable)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            label={{ value: selectedColumnY || "Variable Y", position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontWeight: 'bold', fontSize: 13 }}
          />
          <YAxis
            tick={{ fill: 'var(--text-variable)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            label={{ value: "Frecuencia Absoluta (f_ij)", angle: -90, position: 'insideLeft', offset: -10, style: { fill: 'var(--text-variable)', textAnchor: 'middle', fontWeight: 'bold', fontSize: 13 } }}
            domain={[0, 'auto']}
          />
          <Tooltip
            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
            contentStyle={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px' }}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: 12, fontWeight: 'bold' }} iconType="circle" />

          {datos.filas.map((catX, index) => (
            <Bar 
              key={catX} 
              dataKey={catX} 
              fill={colores[index % colores.length]} 
              name={catX} 
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey={catX}
                position="top"
                style={{ fill: 'var(--text-variable)', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(val) => val === 0 ? "" : val}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // =========================================================================
  // 3. GRÁFICOS DE BARRAS APILADAS (CON FRECUENCIA RELATIVA SOBRE EL GRAN TOTAL)
  // =========================================================================
  if (tipo === "apiladas_100") {
    const dataGrafico = datos.columnas.map(catY => {
      const filaObj = { name: catY };
      datos.filas.forEach(catX => {
        const valor = datos.datos[catX][catY] || 0;
        filaObj[catX] = datos.granTotal > 0 ? Number(((valor / datos.granTotal) * 100).toFixed(2)) : 0;
      });
      return filaObj;
    });

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <BarChart data={dataGrafico} margin={{ top: 30, right: 30, left: 25, bottom: 35 }} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e0e0e0)" opacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-variable)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            label={{ value: selectedColumnY || "Variable Y", position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontWeight: 'bold', fontSize: 13 }}
          />
          <YAxis
            tick={{ fill: 'var(--text-variable)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            label={{ value: "Frecuencia Relativa (%)", angle: -90, position: 'insideLeft', offset: -10, style: { fill: 'var(--text-variable)', textAnchor: 'middle', fontWeight: 'bold', fontSize: 13 } }}
            tickFormatter={(val) => `${val}%`}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
            contentStyle={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px' }}
            formatter={(value, name) => [`${value}%`, name]}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: 12, fontWeight: 'bold' }} iconType="circle" />

          {datos.filas.map((catX, index) => (
            <Bar 
              key={catX} 
              dataKey={catX} 
              fill={colores[index % colores.length]} 
              stackId="a" 
              name={catX}
            >
              <LabelList
                dataKey={catX}
                position="center"
                style={{ fill: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(val) => val === 0 ? "" : `${val}%`}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
}