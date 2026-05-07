import React from 'react';
import {FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';

import {IconoCalculadora} from '../../../../ui/iconos';

export default function ControlesConteo({ n, setN, r, setR, ajustar, ejecutar }) {
    return (
        <>
            <div style={{ ...cardStyle, marginBottom: '15px' }}>
                <label style={{ ...labelStyle }}>Valores:</label>
                {[{ label: 'Total (n):', val: n, setVal: setN }, { label: 'Muestra (r):', val: r, setVal: setR }].map(({ label, val, setVal }) => (
                    <div key={label} style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px' }}>{label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => ajustar(setVal, val, '-')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>−</button>
                            <input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="container_cal_input" style={{ textAlign: 'center', flex: 1, borderRadius: RADIUS, fontSize: FS.base }} />
                            <button onClick={() => ajustar(setVal, val, '+')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={ejecutar} className="button_calcular btn-icon" style={{ width: 'fit-content', alignSelf: 'center', padding: '8px 35px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconoCalculadora/>
                CALCULAR 
            </button>
        </>
    )
}