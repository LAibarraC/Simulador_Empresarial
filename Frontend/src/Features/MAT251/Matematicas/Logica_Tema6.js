import { jStat } from 'jstat';

/**
 * Calcula la prueba de hipótesis para una media con varianza conocida (Z)
 */
export const pruebaMediaZ = (n, x_bar, sigma, mu0, alpha, tipoPrueba) => {
    if (n <= 0 || sigma <= 0 || alpha <= 0 || alpha >= 1) return { error: 'Parámetros inválidos.' };

    const Zc = (x_bar - mu0) / (sigma / Math.sqrt(n));
    let valorCritico, pValor, decision, regionRechazo, criterioRechazoMath;

    if (tipoPrueba === 'bilateral') {
        const zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
        valorCritico = { zAlpha2 };
        pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Zc), 0, 1));
        decision = Math.abs(Zc) > zAlpha2 ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c < -${zAlpha2.toFixed(3)} \\text{ o } Z_c > ${zAlpha2.toFixed(3)}`;
        if (Zc > zAlpha2) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} > ${zAlpha2.toFixed(3)}`;
        else if (Zc < -zAlpha2) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} < -${zAlpha2.toFixed(3)}`;
        else criterioRechazoMath = `-${zAlpha2.toFixed(3)} \\le Z_c = ${Zc.toFixed(3)} \\le ${zAlpha2.toFixed(3)}`;
    } else if (tipoPrueba === 'derecha') {
        const zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
        valorCritico = { zAlpha };
        pValor = 1 - jStat.normal.cdf(Zc, 0, 1);
        decision = Zc > zAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c > ${zAlpha.toFixed(3)}`;
        if (Zc > zAlpha) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} > ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} \\le ${zAlpha.toFixed(3)}`;
    } else if (tipoPrueba === 'izquierda') {
        const zAlpha = jStat.normal.inv(alpha, 0, 1);
        valorCritico = { zAlpha };
        pValor = jStat.normal.cdf(Zc, 0, 1);
        decision = Zc < zAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c < ${zAlpha.toFixed(3)}`;
        if (Zc < zAlpha) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} < ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} \\ge ${zAlpha.toFixed(3)}`;
    }

    return {
        estadistico: Zc,
        valorCritico,
        pValor,
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { n, x_bar, sigma, mu0, alpha, tipoPrueba, distribucion: 'normal' }
    };
};

/**
 * Calcula la prueba de hipótesis para una media con varianza desconocida (T)
 */
export const pruebaMediaT = (n, x_bar, s, mu0, alpha, tipoPrueba) => {
    if (n <= 1 || s <= 0 || alpha <= 0 || alpha >= 1) return { error: 'Parámetros inválidos (n debe ser > 1).' };

    const T = (x_bar - mu0) / (s / Math.sqrt(n));
    const df = n - 1;
    let valorCritico, pValor, decision, regionRechazo, criterioRechazoMath;

    if (tipoPrueba === 'bilateral') {
        const tAlpha2 = jStat.studentt.inv(1 - alpha / 2, df);
        valorCritico = { tAlpha2 };
        pValor = 2 * (1 - jStat.studentt.cdf(Math.abs(T), df));
        decision = Math.abs(T) > tAlpha2 ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `T_c < -${tAlpha2.toFixed(3)} \\text{ o } T_c > ${tAlpha2.toFixed(3)}`;
        if (T > tAlpha2) criterioRechazoMath = `T_c = ${T.toFixed(3)} > ${tAlpha2.toFixed(3)}`;
        else if (T < -tAlpha2) criterioRechazoMath = `T_c = ${T.toFixed(3)} < -${tAlpha2.toFixed(3)}`;
        else criterioRechazoMath = `-${tAlpha2.toFixed(3)} \\le T_c = ${T.toFixed(3)} \\le ${tAlpha2.toFixed(3)}`;
    } else if (tipoPrueba === 'derecha') {
        const tAlpha = jStat.studentt.inv(1 - alpha, df);
        valorCritico = { tAlpha };
        pValor = 1 - jStat.studentt.cdf(T, df);
        decision = T > tAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `T_c > ${tAlpha.toFixed(3)}`;
        if (T > tAlpha) criterioRechazoMath = `T_c = ${T.toFixed(3)} > ${tAlpha.toFixed(3)}`;
        else criterioRechazoMath = `T_c = ${T.toFixed(3)} \\le ${tAlpha.toFixed(3)}`;
    } else if (tipoPrueba === 'izquierda') {
        const tAlpha = jStat.studentt.inv(alpha, df);
        valorCritico = { tAlpha };
        pValor = jStat.studentt.cdf(T, df);
        decision = T < tAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `T_c < ${tAlpha.toFixed(3)}`;
        if (T < tAlpha) criterioRechazoMath = `T_c = ${T.toFixed(3)} < ${tAlpha.toFixed(3)}`;
        else criterioRechazoMath = `T_c = ${T.toFixed(3)} \\ge ${tAlpha.toFixed(3)}`;
    }

    return {
        estadistico: T,
        gl: df,
        valorCritico,
        pValor,
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { n, x_bar, s, mu0, alpha, tipoPrueba, distribucion: 't' }
    };
};

/**
 * Calcula la prueba de hipótesis para una proporción (Z)
 */
export const pruebaProporcionZ = (n, x, p0, alpha, tipoPrueba) => {
    if (n <= 0 || x < 0 || x > n || p0 <= 0 || p0 >= 1 || alpha <= 0 || alpha >= 1) return { error: 'Parámetros inválidos.' };

    const p_hat = x / n;
    const q0 = 1 - p0;
    const Zc = (p_hat - p0) / Math.sqrt((p0 * q0) / n);
    let valorCritico, pValor, decision, regionRechazo, criterioRechazoMath;

    if (tipoPrueba === 'bilateral') {
        const zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
        valorCritico = { zAlpha2 };
        pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Zc), 0, 1));
        decision = Math.abs(Zc) > zAlpha2 ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c < -${zAlpha2.toFixed(3)} \\text{ o } Z_c > ${zAlpha2.toFixed(3)}`;
        if (Zc > zAlpha2) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} > ${zAlpha2.toFixed(3)}`;
        else if (Zc < -zAlpha2) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} < -${zAlpha2.toFixed(3)}`;
        else criterioRechazoMath = `-${zAlpha2.toFixed(3)} \\le Z_c = ${Zc.toFixed(3)} \\le ${zAlpha2.toFixed(3)}`;
    } else if (tipoPrueba === 'derecha') {
        const zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
        valorCritico = { zAlpha };
        pValor = 1 - jStat.normal.cdf(Zc, 0, 1);
        decision = Zc > zAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c > ${zAlpha.toFixed(3)}`;
        if (Zc > zAlpha) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} > ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} \\le ${zAlpha.toFixed(3)}`;
    } else if (tipoPrueba === 'izquierda') {
        const zAlpha = jStat.normal.inv(alpha, 0, 1);
        valorCritico = { zAlpha };
        pValor = jStat.normal.cdf(Zc, 0, 1);
        decision = Zc < zAlpha ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `Z_c < ${zAlpha.toFixed(3)}`;
        if (Zc < zAlpha) criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} < ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z_c = ${Zc.toFixed(3)} \\ge ${zAlpha.toFixed(3)}`;
    }

    return {
        estadistico: Zc,
        valorCritico,
        pValor,
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { n, x, p_hat, q0, p0, alpha, tipoPrueba, distribucion: 'normal' }
    };
};

/**
 * Calcula la prueba de hipótesis para una varianza (Chi-cuadrada)
 */
export const pruebaVarianzaChi = (n, s2, sigma02, alpha, tipoPrueba) => {
    if (n <= 1 || s2 < 0 || sigma02 <= 0 || alpha <= 0 || alpha >= 1) return { error: 'Parámetros inválidos.' };

    const df = n - 1;
    const Chi2c = (df * s2) / sigma02;
    let valorCritico, pValor, decision, regionRechazo, criterioRechazoMath;

    if (tipoPrueba === 'bilateral') {
        const chiInf = jStat.chisquare.inv(alpha / 2, df);
        const chiSup = jStat.chisquare.inv(1 - alpha / 2, df);
        valorCritico = { chiInf, chiSup };
        const areaIzquierda = jStat.chisquare.cdf(Chi2c, df);
        const areaDerecha = 1 - areaIzquierda;
        pValor = 2 * Math.min(areaIzquierda, areaDerecha);
        decision = (Chi2c < chiInf || Chi2c > chiSup) ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `\\chi^2_c < ${chiInf.toFixed(3)} \\text{ o } \\chi^2_c > ${chiSup.toFixed(3)}`;
        if (Chi2c < chiInf) criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} < ${chiInf.toFixed(3)}`;
        else if (Chi2c > chiSup) criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} > ${chiSup.toFixed(3)}`;
        else criterioRechazoMath = `${chiInf.toFixed(3)} \\le \\chi^2_c = ${Chi2c.toFixed(3)} \\le ${chiSup.toFixed(3)}`;
    } else if (tipoPrueba === 'derecha') {
        const chiSup = jStat.chisquare.inv(1 - alpha, df);
        valorCritico = { chiSup };
        pValor = 1 - jStat.chisquare.cdf(Chi2c, df);
        decision = Chi2c > chiSup ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `\\chi^2_c > ${chiSup.toFixed(3)}`;
        if (Chi2c > chiSup) criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} > ${chiSup.toFixed(3)}`;
        else criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} \\le ${chiSup.toFixed(3)}`;
    } else if (tipoPrueba === 'izquierda') {
        const chiInf = jStat.chisquare.inv(alpha, df);
        valorCritico = { chiInf };
        pValor = jStat.chisquare.cdf(Chi2c, df);
        decision = Chi2c < chiInf ? 'Rechazar H₀' : 'No rechazar H₀';
        regionRechazo = `\\chi^2_c < ${chiInf.toFixed(3)}`;
        if (Chi2c < chiInf) criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} < ${chiInf.toFixed(3)}`;
        else criterioRechazoMath = `\\chi^2_c = ${Chi2c.toFixed(3)} \\ge ${chiInf.toFixed(3)}`;
    }

    return {
        estadistico: Chi2c,
        gl: df,
        valorCritico,
        pValor,
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { n, s2, sigma02, alpha, tipoPrueba, distribucion: 'chisquare' }
    };
};

/**
 * Simula N pruebas de hipótesis para evaluar la tasa de rechazo
 */
export const simularPruebaHipotesis = (prueba, numSims, n, paramsGeneracion, paramsPrueba) => {
    let rechazos = 0;
    const { alpha, tipoPrueba } = paramsPrueba;
    const historial = [];

    const totalDatos = n * numSims;

    for (let i = 0; i < numSims; i++) {
        let res = null;
        let x_bar_iter = null;
        let s_iter = null;
        let muestras_iter = null;
        if (prueba === 'media_z' || prueba === 'media_t' || prueba === 'varianza') {
            const { muReal, sigmaReal } = paramsGeneracion;
            const stdReal = prueba === 'varianza' ? Math.sqrt(sigmaReal) : sigmaReal;
            let suma = 0;
            let sumaSq = 0;
            
            const guardarMuestras = totalDatos <= 5000;
            if (guardarMuestras) muestras_iter = [];

            for (let j = 0; j < n; j++) {
                // Box-Muller para Normal
                let u = 0, v = 0;
                while(u === 0) u = Math.random(); 
                while(v === 0) v = Math.random();
                let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                let val = z * stdReal + muReal;
                suma += val;
                sumaSq += val * val;
                
                if (guardarMuestras) muestras_iter.push(val);
            }
            const x_bar = suma / n;
            x_bar_iter = x_bar;
            const varianza = n > 1 ? (sumaSq - (suma * suma) / n) / (n - 1) : 0;
            const s = Math.sqrt(varianza);
            s_iter = s;

            if (prueba === 'media_z') {
                res = pruebaMediaZ(n, x_bar, paramsPrueba.sigma, paramsPrueba.mu0, alpha, tipoPrueba);
            } else if (prueba === 'media_t') {
                res = pruebaMediaT(n, x_bar, s, paramsPrueba.mu0, alpha, tipoPrueba);
            } else if (prueba === 'varianza') {
                res = pruebaVarianzaChi(n, varianza, paramsPrueba.sigma02, alpha, tipoPrueba);
            }
        } else if (prueba === 'proporcion') {
            const { pReal } = paramsGeneracion;
            let exitos = 0;
            for (let j = 0; j < n; j++) {
                if (Math.random() < pReal) exitos++;
            }
            res = pruebaProporcionZ(n, exitos, paramsPrueba.p0, alpha, tipoPrueba);
            if (res) {
                historial.push({
                    iteracion: i + 1,
                    x: exitos,
                    p_hat: res.calculos.p_hat,
                    estadistico: res.estadistico,
                    pValor: res.pValor,
                    decision: res.decision
                });
            }
        }

        if (res && res.decision === 'Rechazar H₀') {
            rechazos++;
        }

        // Guardamos historial para media_z, media_t y varianza
        if ((prueba === 'media_z' || prueba === 'media_t' || prueba === 'varianza') && res) {
            historial.push({
                iteracion: i + 1,
                x_bar: x_bar_iter,
                s: s_iter,
                estadistico: res.estadistico,
                pValor: res.pValor,
                decision: res.decision,
                muestras: muestras_iter
            });
        }
    }

    const noRechazos = numSims - rechazos;
    return {
        numSimulaciones: numSims,
        rechazos,
        noRechazos,
        porcentajeRechazos: (rechazos / numSims) * 100,
        porcentajeNoRechazos: (noRechazos / numSims) * 100,
        parametrosPrueba: paramsPrueba,
        parametrosGeneracion: paramsGeneracion,
        historial
    };
};

// ============================================================================
// PRUEBAS NO PARAMÉTRICAS
// ============================================================================

/**
 * Chi-cuadrada Bondad de Ajuste
 */
export const pruebaChiCuadradaBondad = (observadas, esperadas, alpha) => {
    if (!observadas || !esperadas || observadas.length !== esperadas.length || observadas.length < 2) return { error: 'Datos insuficientes.' };
    
    let chi2 = 0;
    let valid = true;
    for(let i=0; i<observadas.length; i++){
        if(esperadas[i] <= 0) valid = false;
        chi2 += Math.pow(observadas[i] - esperadas[i], 2) / esperadas[i];
    }
    
    if(!valid) return { error: 'Las frecuencias esperadas deben ser mayores a 0.' };

    const df = observadas.length - 1;
    const valorCriticoVal = jStat.chisquare.inv(1 - alpha, df);
    const pValor = 1 - jStat.chisquare.cdf(chi2, df);
    const decision = chi2 > valorCriticoVal ? 'Rechazar H₀' : 'No rechazar H₀';
    
    const valorCritico = { chiSup: valorCriticoVal };
    const regionRechazo = `\\chi^2_c > ${valorCriticoVal.toFixed(3)}`;
    const criterioRechazoMath = chi2 > valorCriticoVal ? `\\chi^2_c = ${chi2.toFixed(3)} > ${valorCriticoVal.toFixed(3)}` : `\\chi^2_c = ${chi2.toFixed(3)} \\le ${valorCriticoVal.toFixed(3)}`;
    
    return { 
        estadistico: chi2, 
        df, 
        valorCritico, 
        pValor, 
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { alpha, tipoPrueba: 'derecha', n: df + 1 }
    };
};

/**
 * Chi-cuadrada de Independencia
 */
export const pruebaChiCuadradaIndependencia = (matriz, alpha) => {
    if (!matriz || matriz.length < 2 || matriz[0].length < 2) return { error: 'La matriz debe ser al menos de 2x2.' };
    
    const numFilas = matriz.length;
    const numCols = matriz[0].length;
    
    const totalesFilas = Array(numFilas).fill(0);
    const totalesCols = Array(numCols).fill(0);
    let totalN = 0;
    
    for (let i = 0; i < numFilas; i++) {
        for (let j = 0; j < numCols; j++) {
            const val = Number(matriz[i][j]) || 0;
            totalesFilas[i] += val;
            totalesCols[j] += val;
            totalN += val;
        }
    }
    
    if (totalN <= 0) return { error: 'La suma total debe ser mayor a 0.' };
    
    let chi2 = 0;
    for (let i = 0; i < numFilas; i++) {
        for (let j = 0; j < numCols; j++) {
            const observada = Number(matriz[i][j]) || 0;
            const esperada = (totalesFilas[i] * totalesCols[j]) / totalN;
            if (esperada > 0) {
                chi2 += Math.pow(observada - esperada, 2) / esperada;
            } else if (observada > 0) {
                 return { error: 'Frecuencia esperada es 0 en alguna celda.' };
            }
        }
    }
    
    const df = (numFilas - 1) * (numCols - 1);
    const valorCriticoVal = jStat.chisquare.inv(1 - alpha, df);
    const pValor = 1 - jStat.chisquare.cdf(chi2, df);
    const decision = chi2 > valorCriticoVal ? 'Rechazar H₀' : 'No rechazar H₀';
    
    const valorCritico = { chiSup: valorCriticoVal };
    const regionRechazo = `\\chi^2_c > ${valorCriticoVal.toFixed(3)}`;
    const criterioRechazoMath = chi2 > valorCriticoVal ? `\\chi^2_c = ${chi2.toFixed(3)} > ${valorCriticoVal.toFixed(3)}` : `\\chi^2_c = ${chi2.toFixed(3)} \\le ${valorCriticoVal.toFixed(3)}`;
    
    return { 
        estadistico: chi2, 
        df, 
        valorCritico, 
        pValor, 
        decision,
        regionRechazo,
        criterioRechazoMath,
        calculos: { alpha, tipoPrueba: 'derecha', n: totalN }
    };
};

/**
 * Prueba de Signos
 */
export const pruebaSignos = (datos, valorReferencia, alpha, tipoPrueba) => {
    if (!datos || datos.length === 0) return { error: 'No hay datos.' };

    let positivos = 0;
    let negativos = 0;
    datos.forEach(d => {
        if (d > valorReferencia) positivos++;
        else if (d < valorReferencia) negativos++;
    });

    const nEfectivo = positivos + negativos;
    const empates = datos.length - nEfectivo;

    if (nEfectivo === 0) return { error: 'No hay datos efectivos (todos son empates).' };
    
    const S = positivos; 
    let pValor = 0;
    let estadisticoFinal = S;
    let regionRechazo = '';
    let criterioRechazoMath = '';
    
    if (nEfectivo > 25) {
        // Aproximación Normal
        const mu = 0.5 * nEfectivo;
        const sigma = Math.sqrt(nEfectivo * 0.25);
        
        let correccion = 0;
        if (S < mu) correccion = 0.5;
        else if (S > mu) correccion = -0.5;
        
        const Z_c = (S + correccion - mu) / sigma;
        estadisticoFinal = Z_c;

        if (tipoPrueba === 'bilateral') {
            const zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
            pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Z_c), 0, 1));
            regionRechazo = `|Z_c| > ${zAlpha2.toFixed(3)}`;
        } else if (tipoPrueba === 'derecha') {
            const zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
            pValor = 1 - jStat.normal.cdf(Z_c, 0, 1);
            regionRechazo = `Z_c > ${zAlpha.toFixed(3)}`;
        } else if (tipoPrueba === 'izquierda') {
            const zAlpha = jStat.normal.inv(alpha, 0, 1);
            pValor = jStat.normal.cdf(Z_c, 0, 1);
            regionRechazo = `Z_c < ${zAlpha.toFixed(3)}`;
        }
        
        criterioRechazoMath = `p\\text{-Valor} = ${pValor.toFixed(4)} ${pValor < alpha ? '<' : '\\ge'} \\alpha = ${alpha}`;
    } else {
        // Exacta Binomial
        if (tipoPrueba === 'bilateral') {
            const p1 = jStat.binomial.cdf(S, nEfectivo, 0.5);
            const p2 = 1 - jStat.binomial.cdf(S - 1, nEfectivo, 0.5);
            pValor = Math.min(1, 2 * Math.min(p1, p2));
        } else if (tipoPrueba === 'derecha') {
            pValor = 1 - jStat.binomial.cdf(S - 1, nEfectivo, 0.5);
        } else if (tipoPrueba === 'izquierda') {
            pValor = jStat.binomial.cdf(S, nEfectivo, 0.5);
        }
        
        regionRechazo = `p\\text{-Valor} < \\alpha`;
        criterioRechazoMath = `p\\text{-Valor} = ${pValor.toFixed(4)} ${pValor < alpha ? '<' : '\\ge'} \\alpha = ${alpha}`;
    }
    
    const decision = pValor < alpha ? 'Rechazar H₀' : 'No rechazar H₀';
    
    // El motor ahora enviará la estructura necesaria para que la vista decida qué hacer (si Z o Binomial).
    // Si nEfectivo > 25, devolvemos propiedades compatibles con Grafico_HP (media_z) para reutilizarlo.
    const isNormalApprox = nEfectivo > 25;
    
    // Si usamos la normal, enviamos un objeto que parezca un Z test:
    const returnVal = { 
        positivos, 
        negativos,
        empates,
        nEfectivo, 
        estadisticoOriginal: S, // Guardamos el S original para mostrarlo en las tarjetas
        estadistico: estadisticoFinal, 
        pValor, 
        decision, 
        regionRechazo, 
        criterioRechazoMath, 
        isNormalApprox,
        calculos: { alpha, tipoPrueba, n: nEfectivo } 
    };

    if (isNormalApprox) {
        // Añadir valorCritico falso para que el Grafico_HP lo entienda
        let valorCritico = {};
        if (tipoPrueba === 'bilateral') {
            valorCritico.zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
        } else {
            valorCritico.zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
        }
        returnVal.valorCritico = valorCritico;
    }

    return returnVal;
};

/**
 * Prueba de Signos (Datos Resumidos)
 */
export const pruebaSignosResumida = (positivos, negativos, alpha, tipoPrueba) => {
    positivos = Number(positivos) || 0;
    negativos = Number(negativos) || 0;
    
    const nEfectivo = positivos + negativos;
    if (nEfectivo === 0) return { error: 'No hay datos efectivos (positivos y negativos son 0).' };
    
    const S = positivos; 
    let pValor = 0;
    let estadisticoFinal = S;
    let regionRechazo = '';
    let criterioRechazoMath = '';
    
    if (nEfectivo > 25) {
        // Aproximación Normal
        const mu = 0.5 * nEfectivo;
        const sigma = Math.sqrt(nEfectivo * 0.25);
        const Z_c = (S - mu) / sigma;
        estadisticoFinal = Z_c;

        if (tipoPrueba === 'bilateral') {
            const zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
            pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Z_c), 0, 1));
            regionRechazo = `|Z_c| > ${zAlpha2.toFixed(3)}`;
        } else if (tipoPrueba === 'derecha') {
            const zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
            pValor = 1 - jStat.normal.cdf(Z_c, 0, 1);
            regionRechazo = `Z_c > ${zAlpha.toFixed(3)}`;
        } else if (tipoPrueba === 'izquierda') {
            const zAlpha = jStat.normal.inv(alpha, 0, 1);
            pValor = jStat.normal.cdf(Z_c, 0, 1);
            regionRechazo = `Z_c < ${zAlpha.toFixed(3)}`;
        }
        
        criterioRechazoMath = `p\\text{-Valor} = ${pValor.toFixed(4)} ${pValor < alpha ? '<' : '\\ge'} \\alpha = ${alpha}`;
    } else {
        // Exacta Binomial
        if (tipoPrueba === 'bilateral') {
            const p1 = jStat.binomial.cdf(S, nEfectivo, 0.5);
            const p2 = 1 - jStat.binomial.cdf(S - 1, nEfectivo, 0.5);
            pValor = Math.min(1, 2 * Math.min(p1, p2));
        } else if (tipoPrueba === 'derecha') {
            pValor = 1 - jStat.binomial.cdf(S - 1, nEfectivo, 0.5);
        } else if (tipoPrueba === 'izquierda') {
            pValor = jStat.binomial.cdf(S, nEfectivo, 0.5);
        }
        
        regionRechazo = `p\\text{-Valor} < \\alpha`;
        criterioRechazoMath = `p\\text{-Valor} = ${pValor.toFixed(4)} ${pValor < alpha ? '<' : '\\ge'} \\alpha = ${alpha}`;
    }
    
    const decision = pValor < alpha ? 'Rechazar H₀' : 'No rechazar H₀';
    
    // El motor ahora enviará la estructura necesaria para que la vista decida qué hacer (si Z o Binomial).
    // Si nEfectivo > 25, devolvemos propiedades compatibles con Grafico_HP (media_z) para reutilizarlo.
    const isNormalApprox = nEfectivo > 25;
    
    // Si usamos la normal, enviamos un objeto que parezca un Z test:
    const returnVal = { 
        positivos, 
        negativos, 
        nEfectivo, 
        estadisticoOriginal: S, // Guardamos el S original para mostrarlo en las tarjetas
        estadistico: estadisticoFinal, 
        pValor, 
        decision, 
        regionRechazo, 
        criterioRechazoMath, 
        isNormalApprox,
        calculos: { alpha, tipoPrueba, n: nEfectivo } 
    };

    if (isNormalApprox) {
        // Añadir valorCritico falso para que el Grafico_HP lo entienda
        let valorCritico = {};
        if (tipoPrueba === 'bilateral') {
            valorCritico.zAlpha2 = jStat.normal.inv(1 - alpha / 2, 0, 1);
        } else {
            valorCritico.zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
        }
        returnVal.valorCritico = valorCritico;
    }

    return returnVal;
};

/**
 * Prueba de Rachas
 */
export const pruebaRachas = (n1, n2, rachas, alpha, tipoPrueba = 'bilateral') => {
    if (n1 < 1 || n2 < 1 || rachas < 2) return { error: 'Valores numéricos inválidos para la Prueba de Rachas. Asegúrate de que n1 >= 1, n2 >= 1 y R >= 2.' };
    
    const n = n1 + n2;
    const muR = ((2 * n1 * n2) / n) + 1;
    
    const numVar = 2 * n1 * n2 * (2 * n1 * n2 - n);
    const denVar = Math.pow(n, 2) * (n - 1);
    
    if (denVar <= 0) return { error: 'Error matemático al calcular la varianza. Verifica n1 y n2.' };
    const sigmaR = Math.sqrt(numVar / denVar);
    
    let Zc = 0;
    if (sigmaR > 0) {
        if (rachas > muR) {
            Zc = (rachas - 0.5 - muR) / sigmaR;
        } else if (rachas < muR) {
            Zc = (rachas + 0.5 - muR) / sigmaR;
        }
    }
    
    let pValor, zAlpha, decision, regionRechazo, criterioRechazoMath;

    if (tipoPrueba === 'bilateral') {
        pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Zc), 0, 1));
        zAlpha = jStat.normal.inv(1 - alpha / 2, 0, 1);
        decision = Math.abs(Zc) > zAlpha ? 'Rechazar H₀' : 'Aceptar H₀';
        regionRechazo = `Z < -${zAlpha.toFixed(3)} \\text{ o } Z > ${zAlpha.toFixed(3)}`;
        if (Zc < -zAlpha) {
            criterioRechazoMath = `Z = ${Zc.toFixed(3)} < -${zAlpha.toFixed(3)}`;
        } else if (Zc > zAlpha) {
            criterioRechazoMath = `Z = ${Zc.toFixed(3)} > ${zAlpha.toFixed(3)}`;
        } else {
            criterioRechazoMath = `-${zAlpha.toFixed(3)} \\le Z = ${Zc.toFixed(3)} \\le ${zAlpha.toFixed(3)}`;
        }
    } else if (tipoPrueba === 'izquierda') {
        pValor = jStat.normal.cdf(Zc, 0, 1);
        zAlpha = jStat.normal.inv(alpha, 0, 1);
        decision = Zc <= zAlpha ? 'Rechazar H₀' : 'Aceptar H₀';
        regionRechazo = `Z \\le ${zAlpha.toFixed(3)}`;
        if (Zc <= zAlpha) criterioRechazoMath = `Z = ${Zc.toFixed(3)} \\le ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z = ${Zc.toFixed(3)} > ${zAlpha.toFixed(3)}`;
    } else if (tipoPrueba === 'derecha') {
        pValor = 1 - jStat.normal.cdf(Zc, 0, 1);
        zAlpha = jStat.normal.inv(1 - alpha, 0, 1);
        decision = Zc >= zAlpha ? 'Rechazar H₀' : 'Aceptar H₀';
        regionRechazo = `Z \\ge ${zAlpha.toFixed(3)}`;
        if (Zc >= zAlpha) criterioRechazoMath = `Z = ${Zc.toFixed(3)} \\ge ${zAlpha.toFixed(3)}`;
        else criterioRechazoMath = `Z = ${Zc.toFixed(3)} < ${zAlpha.toFixed(3)}`;
    }
    
    return { rachas, n1, n2, n, muR, sigmaR, estadistico: Zc, valorCritico: zAlpha, pValor, decision, regionRechazo, criterioRechazoMath, calculos: { n1, n2, rachas, alpha, tipoPrueba, distribucion: 'normal_rachas' } };
};
