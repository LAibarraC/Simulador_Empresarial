import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';
import { BarChart, Bar, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT } from '../../Principal/Constantes';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const CustomCalloutLabel = (props) => {
    const { viewBox, value, isNegative } = props;
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    
    const direction = isNegative ? 'left' : 'right';
    
    // Origin at the reference line
    const x0 = x;
    const y0 = y + (height || 0) + 10;
    
    // Diagonal line displacement
    const dx = direction === 'right' ? 15 : -15;
    const dy = -40; // up
    
    // Horizontal line displacement
    const hx = direction === 'right' ? 10 : -10;
    
    const x1 = x0 + dx;
    const y1 = y0 + dy;
    
    const x2 = x1 + hx;
    const y2 = y1;
    
    return (
        <g style={{ overflow: 'visible', zIndex: 100 }}>
            {/* Punto en el eje */}
            <circle cx={x0} cy={y0 - 10} r={4} fill="var(--text-pure)" />
            
            {/* Línea diagonal */}
            <line x1={x0} y1={y0 - 10} x2={x1} y2={y1} stroke="var(--text-pure)" strokeWidth={2} />
            
            {/* Línea horizontal */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-pure)" strokeWidth={2} />
            
            {/* Texto matemático */}
            <foreignObject 
                x={direction === 'right' ? x2 + 5 : x2 - 95} 
                y={y2 - 15} 
                width={90} 
                height={30} 
                style={{ overflow: 'visible' }}
            >
                <div 
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} 
                    style={{ 
                        color: 'var(--text-pure)', 
                        fontSize: '13px', 
                        fontWeight: 'normal', 
                        display: 'flex', 
                        alignItems: 'center', 
                        height: '100%', 
                        whiteSpace: 'nowrap',
                        justifyContent: direction === 'right' ? 'flex-start' : 'flex-end' 
                    }} 
                />
            </foreignObject>
        </g>
    ); 
};

export default function Grafico_HNP_Signos({ resultados, id = "grafico-hnp-signos", isMaximized }) {
    if (!resultados || !resultados.calculos) return null;
    const { nEfectivo, estadistico: S, calculos } = resultados;
    const { alpha, tipoPrueba } = calculos;
    const numAlpha = parseFloat(alpha);

    const useNormalApprox = nEfectivo > 25;

    // Colores
    const colorRechazo = 'rgba(239, 68, 68, 0.7)'; // Rojo
    const colorRechazoBorder = 'rgba(220, 38, 38, 1)';
    const colorNormal = 'rgba(59, 130, 246, 0.2)'; // Azul claro
    const colorNormalBorder = 'rgba(59, 130, 246, 0.5)';
    const colorMarker = 'var(--text-pure)';

    let chartContent;

    if (!useNormalApprox) {
        // --- GRÁFICO DE BARRAS DISCRETAS (BINOMIAL) ---
        const data = [];
        for (let k = 0; k <= nEfectivo; k++) {
            const prob = jStat.binomial.pdf(k, nEfectivo, 0.5);
            const probCum = jStat.binomial.cdf(k, nEfectivo, 0.5);
            const probCumInv = 1 - jStat.binomial.cdf(k - 1, nEfectivo, 0.5);

            let isRechazo = false;
            if (tipoPrueba === 'izquierda' && probCum <= numAlpha) isRechazo = true;
            if (tipoPrueba === 'derecha' && probCumInv <= numAlpha) isRechazo = true;
            if (tipoPrueba === 'bilateral' && (probCum <= numAlpha / 2 || probCumInv <= numAlpha / 2)) isRechazo = true;

            data.push({
                k,
                prob,
                isRechazo,
                isStat: k === S
            });
        }

        const CustomBar = (props) => {
            const { x, y, width, height, payload } = props;
            if (height === undefined || height < 0) return null;
            
            const { isRechazo, isStat, k } = payload;
            const fill = isRechazo ? colorRechazo : colorNormal;
            const stroke = isRechazo ? colorRechazoBorder : colorNormalBorder;

            return (
                <g>
                    <rect x={x} y={y} width={width} height={height} fill={fill} stroke={stroke} strokeWidth={1} />
                    {isStat && (
                        <CustomCalloutLabel 
                            viewBox={{ x: x + width / 2, y: y, height: height }} 
                            value={`S = ${k}`} 
                            isNegative={k < nEfectivo / 2} 
                        />
                    )}
                </g>
            );
        };

        chartContent = (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right:20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="k" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-pure)' }} axisLine={{ stroke: 'var(--text-pure)' }} tickLine={{ stroke: 'var(--text-pure)' }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-pure)' }} width={55} axisLine={{ stroke: 'var(--text-pure)' }} tickLine={{ stroke: 'var(--text-pure)' }} />
                    <Tooltip 
                        formatter={(value) => value.toFixed(4)} 
                        labelFormatter={(label) => `S = ${label}`}
                        contentStyle={{ borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                    />
                    <Bar dataKey="prob" isAnimationActive={false} shape={<CustomBar />} />
                </BarChart>
            </ResponsiveContainer>
        );
    } else {
        // --- APROXIMACIÓN NORMAL (CURVA Z) ---
        const mu = 0.5 * nEfectivo;
        const sigma = Math.sqrt(nEfectivo * 0.25);
        const zStat = (S - mu) / sigma;

        let zCritical1 = null, zCritical2 = null;
        if (tipoPrueba === 'izquierda') {
            zCritical1 = jStat.normal.inv(numAlpha, 0, 1);
        } else if (tipoPrueba === 'derecha') {
            zCritical2 = jStat.normal.inv(1 - numAlpha, 0, 1);
        } else {
            zCritical1 = jStat.normal.inv(numAlpha / 2, 0, 1);
            zCritical2 = jStat.normal.inv(1 - numAlpha / 2, 0, 1);
        }

        const data = [];
        for (let z = -4; z <= 4; z += 0.05) {
            const prob = jStat.normal.pdf(z, 0, 1);
            
            let zona = 'normal';
            if (tipoPrueba === 'izquierda' && z <= zCritical1) zona = 'rechazo';
            if (tipoPrueba === 'derecha' && z >= zCritical2) zona = 'rechazo';
            if (tipoPrueba === 'bilateral' && (z <= zCritical1 || z >= zCritical2)) zona = 'rechazo';

            data.push({
                z: parseFloat(z.toFixed(2)),
                prob,
                fill: zona === 'rechazo' ? colorRechazo : colorNormal,
                rejectArea: zona === 'rechazo' ? prob : 0,
                acceptArea: zona === 'normal' ? prob : 0,
            });
        }

        chartContent = (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 30, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="z" type="number" domain={[-4, 4]} tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-pure)' }} tickCount={9} axisLine={{ stroke: 'var(--text-pure)' }} tickLine={{ stroke: 'var(--text-pure)' }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-pure)' }} width={55} axisLine={{ stroke: 'var(--text-pure)' }} tickLine={{ stroke: 'var(--text-pure)' }} />
                    <Tooltip 
                        formatter={(value, name) => [value.toFixed(4), name === 'rejectArea' ? 'Probabilidad (Rechazo)' : name === 'acceptArea' ? 'Probabilidad (Aceptación)' : 'Densidad']} 
                        labelFormatter={(label) => `Z = ${label}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                    />
                    <Area type="step" dataKey="acceptArea" fill="rgba(59, 130, 246, 0.1)" stroke="none" isAnimationActive={false} />
                    <Area type="step" dataKey="rejectArea" fill="rgba(220, 38, 38, 0.7)" stroke="none" isAnimationActive={false} />
                    <Area type="monotone" dataKey="prob" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />
                    
                    <ReferenceLine 
                        x={zStat} 
                        stroke="none" 
                        label={<CustomCalloutLabel isNegative={zStat < 0} value={`Z_c = ${zStat.toFixed(2)}`} />} 
                    />
                    {zCritical1 !== null && (
                        <ReferenceLine x={zCritical1} stroke="#f97316" strokeDasharray="4 4" strokeWidth={2} />
                    )}
                    {zCritical2 !== null && (
                        <ReferenceLine x={zCritical2} stroke="#f97316" strokeDasharray="4 4" strokeWidth={2} />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <MarcoWidgetMAT251 
            id={id}
            titulo={`Distribución ${useNormalApprox ? 'Normal (Aproximación)' : 'Binomial'} - Prueba de Signos`}
            anchoCompleto={true} alto="430px"
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 35, left: 0, right: 0, bottom: 0 }}>
                        {chartContent}
                    </div>
                    {!useNormalApprox && (
                        <div style={{ position: 'absolute', top: 15, right: 30, background: 'var(--bg-input)', padding: '5px 12px', borderRadius: '5px', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-pure)', zIndex: 50, display: 'flex', gap: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <span>{renderKatex(`\\mathbf{n} = ${nEfectivo}`)}</span>
                            <span>{renderKatex(`\\mathbf{p} = 0.5`)}</span>
                        </div>
                    )}
                </div>
                <div className="leyenda-grafica-tema6" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', fontFamily: FONT, marginTop: '-15px', paddingBottom: '15px', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '14px', height: '14px', background: 'rgba(220, 38, 38, 0.9)', border: '2px solid #b91c1c', borderRadius: '50%' }}></div>
                        <div style={{ color: 'var(--text-pure)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '14px', height: '14px', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', borderRadius: '50%' }}></div>
                        <div style={{ color: 'var(--text-pure)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de Aceptación <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
