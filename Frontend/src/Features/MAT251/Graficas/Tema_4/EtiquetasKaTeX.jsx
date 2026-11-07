import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const FormulaKaTeX = ({ formula }) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }} />
);

export const TituloGraficaFormula = ({ antes, formula, despues = "" }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
        <span>{antes}</span>
        <FormulaKaTeX formula={formula} />
        {despues && <span>{despues}</span>}
    </span>
);

export const EtiquetaEjeXKaTeX = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, width, height } = viewBox;
    const cx = x + width / 2;
    const cy = y + height - 5;
    return (
        <foreignObject x={cx - 210} y={cy - 2} width={420} height={30} style={{ overflow: "visible", pointerEvents: "none" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-pure)", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", gap: "4px" }}>
                <span>{prefix}</span>
                <FormulaKaTeX formula={value} />
            </div>
        </foreignObject>
    );
};

export const EtiquetaEjeYKaTeX = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    return (
        <foreignObject x={x -25} y={y} width={80} height={height} style={{ overflow: "visible", pointerEvents: "none" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", color: "var(--text-pure)", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>{prefix}</span>
                    <FormulaKaTeX formula={value} />
                </div>
            </div>
        </foreignObject>
    );
};
