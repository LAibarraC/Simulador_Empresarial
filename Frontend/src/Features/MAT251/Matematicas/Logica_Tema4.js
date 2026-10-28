import { jStat } from 'jstat';

/**
 * Aproximación polinómica para la CDF de una distribución Normal Estándar.
 * @param {number} x Valor Z
 * @returns {number} Probabilidad acumulada P(Z < x)
 */
export function cdfNormal(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804 * Math.exp(-x * x / 2);
    let p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    if (x > 0) {
        p = 1 - p;
    }
    return p;
}

/**
 * Calcula el factor de corrección para una población finita.
 * @param {number} N Tamaño de la población
 * @param {number} n Tamaño de la muestra
 * @returns {number} Factor de corrección
 */
export function calcularFactorFinito(N, n) {
    return (N - n) / (N - 1);
}


// ==========================================
// LÓGICA: PROPORCIÓN
// ==========================================

export function generarDistribucionProporcion(pPoblacional, tamanoMuestra, tamanoPoblacion, tipoPoblacion) {
    if (pPoblacional === '' || pPoblacional === null || pPoblacional === undefined) {
        return { error: "Por favor, ingresa el valor de la proporción poblacional (p)." };
    }
    const p = parseFloat(pPoblacional);
    if (isNaN(p)) {
        return { error: "La proporción poblacional (p) debe ser un número válido." };
    }
    if (p <= 0 || p >= 1) {
        return { error: "La proporción poblacional (p) debe ser un valor entre 0 y 1 exclusivo (0 < p < 1). Por ejemplo: 0.05 o 0.50." };
    }

    if (tamanoMuestra === '' || tamanoMuestra === null || tamanoMuestra === undefined) {
        return { error: "Por favor, ingresa el tamaño de la muestra (n)." };
    }
    const n = parseFloat(tamanoMuestra);
    if (isNaN(n) || n <= 0) {
        return { error: "El tamaño de la muestra (n) debe ser un número entero positivo mayor a 0." };
    }
    if (!Number.isInteger(n)) {
        return { error: "El tamaño de la muestra (n) debe ser un número entero sin decimales." };
    }

    const N = parseFloat(tamanoPoblacion);
    if (tipoPoblacion === 'finita') {
        if (tamanoPoblacion === '' || tamanoPoblacion === null || tamanoPoblacion === undefined || isNaN(N)) {
            return { error: "Para población finita, debes ingresar el tamaño de la población (N)." };
        }
        if (N <= 1) {
            return { error: "El tamaño de la población (N) debe ser un número entero mayor a 1." };
        }
        if (!Number.isInteger(N)) {
            return { error: "El tamaño de la población (N) debe ser un número entero sin decimales." };
        }
        if (N <= n) {
            return { error: "El tamaño de la población (N) debe ser estrictamente mayor que el tamaño de la muestra (n)." };
        }
    }

    const q = 1 - p;
    let varianza = (p * q) / n;
    let esFinita = tipoPoblacion === 'finita';
    let factorStr = '';

    if (esFinita) {
        const factor = calcularFactorFinito(N, n);
        varianza = varianza * factor;
        factorStr = `\\cdot \\left( \\frac{${N} - ${n}}{${N} - 1} \\right)`;
    }

    const se = Math.sqrt(varianza);

    return {
        datosParciales: { p, q, n, N, se, varianza, esFinita, factorStr, tipoPoblacion },
        onCalcularData: { p, se, tipoPoblacion, esFinita }
    };
}

export function calcularProbabilidadProporcion(datosParciales, condicion, x1, x2) {
    if (!datosParciales) {
        return { error: 'Por favor, primero genera los parámetros de la distribución haciendo clic en CALCULAR.' };
    }
    if (!condicion) {
        return { error: 'Por favor selecciona una condición lógica a calcular.' };
    }

    const { p, se, factorStr, varianza } = datosParciales;
    const x1Num = parseFloat(x1);
    const x2Num = parseFloat(x2);

    if (condicion === 'menor_que' || condicion === 'mayor_que') {
        if (x1 === '' || x1 === null || x1 === undefined || isNaN(x1Num)) {
            return { error: 'Por favor, ingresa el valor de la proporción objetivo (x).' };
        }
        if (x1Num < 0 || x1Num > 1) {
            return { error: 'El valor de la proporción (x) debe estar comprendido entre 0 y 1 (0 ≤ x ≤ 1). Por ejemplo: 0.08 o 0.50.' };
        }
    } else if (condicion === 'entre') {
        if (x1 === '' || x1 === null || x1 === undefined || isNaN(x1Num) ||
            x2 === '' || x2 === null || x2 === undefined || isNaN(x2Num)) {
            return { error: 'Por favor, ingresa ambos límites (x₁ y x₂) para la condición "Entre".' };
        }
        if (x1Num < 0 || x1Num > 1) {
            return { error: 'El límite inferior (x₁) debe ser una proporción comprendida entre 0 y 1 (0 ≤ x₁ ≤ 1).' };
        }
        if (x2Num < 0 || x2Num > 1) {
            return { error: 'El límite superior (x₂) debe ser una proporción comprendida entre 0 y 1 (0 ≤ x₂ ≤ 1).' };
        }
        if (x2Num <= x1Num) {
            return { error: 'Para la condición "Entre", el límite superior (x₂) debe ser estrictamente mayor que el límite inferior (x₁).' };
        }
    }

    if (condicion === 'entre' && x1 >= x2) {
        return { error: 'El limite inferior debe ser menor que el superior.' };
    }

    let probFinal = 0;
    let strDesarrollo = '';
    const z1 = (x1Num - p) / se;
    
    let denomStr = `\\sqrt{${parseFloat(varianza.toFixed(6))}}`;
    const pStr = p.toString();
    const x1Str = x1Num.toString();
    const x2Str = !isNaN(x2Num) ? x2Num.toString() : '';
    const z1Str = z1.toFixed(4);

    if (condicion === 'menor_que') {
        probFinal = cdfNormal(z1);
        strDesarrollo = `\\begin{aligned} P(\\hat{p} \\le ${x1Str}) &= P\\left( Z \\le \\frac{${x1Str} - ${pStr}}{${denomStr}} \\right) \\\\ &= P(Z \\le ${z1Str}) = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        let probZ1 = cdfNormal(z1);
        probFinal = 1 - probZ1;
        strDesarrollo = `\\begin{aligned} P(\\hat{p} \\ge ${x1Str}) &= P\\left( Z \\ge \\frac{${x1Str} - ${pStr}}{${denomStr}} \\right) \\\\ &= P(Z \\ge ${z1Str}) \\\\ &= 1 - P(Z \\le ${z1Str}) = 1 - ${probZ1.toFixed(4)} = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    } else if (condicion === 'entre') {
        let z2 = (x2Num - p) / se;
        let probZ2 = cdfNormal(z2);
        let probZ1 = cdfNormal(z1);
        probFinal = probZ2 - probZ1;
        const z2Str = z2.toFixed(4);
        strDesarrollo = `\\begin{aligned} P(${x1Str} \\le \\hat{p} \\le ${x2Str}) &= P\\left( \\frac{${x1Str} - ${pStr}}{${denomStr}} \\le Z \\le \\frac{${x2Str} - ${pStr}}{${denomStr}} \\right) \\\\ &= P(${z1Str} \\le Z \\le ${z2Str}) \\\\ &= P(Z \\le ${z2Str}) - P(Z \\le ${z1Str}) = ${probZ2.toFixed(4)} - ${probZ1.toFixed(4)} = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        x1,
        x2,
        z1,
        z2: condicion === 'entre' ? (x2 - p) / se : null,
        condicion
    };
}


// ==========================================
// LÓGICA: DIFERENCIA DE PROPORCIONES
// ==========================================

export function generarDistribucionDiferenciaProporciones(p1, n1, p2, n2) {
    const prop1 = parseFloat(p1);
    const num1 = parseFloat(n1);
    const prop2 = parseFloat(p2);
    const num2 = parseFloat(n2);

    if (isNaN(prop1) || isNaN(num1) || isNaN(prop2) || isNaN(num2)) {
        return { error: "Por favor, ingresa todos los valores numéricos para ambas muestras." };
    }

    if (prop1 < 0 || prop1 > 1 || prop2 < 0 || prop2 > 1) {
        return { error: "Las proporciones (p1, p2) deben estar entre 0 y 1." };
    }

    if (!Number.isSafeInteger(num1) || !Number.isSafeInteger(num2) || num1 <= 0 || num2 <= 0) {
        return { error: "Los tamaños de muestra deben ser números enteros mayores a 0." };
    }

    const q1 = 1 - prop1;
    const q2 = 1 - prop2;
    
    const esperanza = prop1 - prop2;
    const var1 = (prop1 * q1) / num1;
    const var2 = (prop2 * q2) / num2;
    const varianza = var1 + var2;

    return { prop1, num1, q1, prop2, num2, q2, esperanza, varianza, var1, var2 };
}

export function calcularProbabilidadDiferenciaProporciones(parametrosPrevios, condicion, x1_val, x2_val) {
    if (!parametrosPrevios) return { error: 'Faltan parámetros previos.' };

    const { prop1, num1, q1, prop2, num2, q2, esperanza, varianza, var1, var2 } = parametrosPrevios;
    const x1 = parseFloat(x1_val);
    const x2 = parseFloat(x2_val);

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && isNaN(x1)) {
        return { error: 'Ingresa un valor válido para la condición a calcular.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2))) {
        return { error: 'Ingresa ambos valores para el rango.' };
    }
    const limites = condicion === 'entre' ? [x1, x2] : [x1];
    if (limites.some((limite) => limite < -1 || limite > 1)) {
        return { error: 'Los límites para la diferencia de proporciones deben estar entre -1 y 1.' };
    }
    if (condicion === 'entre' && x2 <= x1) {
        return { error: 'El límite superior debe ser mayor que el límite inferior.' };
    }

    const se = Math.sqrt(varianza);
    let probFinal = 0;
    let statValue = 0; 
    let strDesarrollo = '';
    const formulaLaTeX = 'Z = \\frac{(\\hat{p}_1-\\hat{p}_2)-(p_1-p_2)}{\\sqrt{\\frac{p_1q_1}{n_1}+\\frac{p_2q_2}{n_2}}}';

    if (condicion === 'menor_que') {
        statValue = (x1 - esperanza) / se;
        probFinal = cdfNormal(statValue);
        strDesarrollo = `\\begin{aligned} P(\\hat{p}_1 - \\hat{p}_2 < ${x1}) &= P\\left( Z < \\frac{${x1} - (${esperanza.toFixed(4)})}{\\sqrt{${var1.toFixed(6)} + ${var2.toFixed(6)}}} \\right) \\\\ &= P(Z < ${statValue.toFixed(4)}) \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        statValue = (x1 - esperanza) / se;
        probFinal = 1 - cdfNormal(statValue);
        strDesarrollo = `\\begin{aligned} P(\\hat{p}_1 - \\hat{p}_2 > ${x1}) &= P\\left( Z > \\frac{${x1} - (${esperanza.toFixed(4)})}{\\sqrt{${var1.toFixed(6)} + ${var2.toFixed(6)}}} \\right) \\\\ &= P(Z > ${statValue.toFixed(4)}) \\\\ &= 1 - P(Z < ${statValue.toFixed(4)}) \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'entre') {
        const z1 = (x1 - esperanza) / se;
        const z2 = (x2 - esperanza) / se;
        statValue = z2; 
        const probZ2 = cdfNormal(z2);
        const probZ1 = cdfNormal(z1);
        probFinal = probZ2 - probZ1;
        strDesarrollo = `\\begin{aligned} P(${x1} < \\hat{p}_1 - \\hat{p}_2 < ${x2}) &= P\\left( \\frac{${x1} - (${esperanza.toFixed(4)})}{\\sqrt{${varianza.toFixed(6)}}} < Z < \\frac{${x2} - (${esperanza.toFixed(4)})}{\\sqrt{${varianza.toFixed(6)}}} \\right) \\\\ &= P(${z1.toFixed(4)} < Z < ${z2.toFixed(4)}) \\\\ &= P(Z < ${z2.toFixed(4)}) - P(Z < ${z1.toFixed(4)}) \\\\ &= ${probZ2.toFixed(4)} - ${probZ1.toFixed(4)} \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    }

    return {
        prop1, num1, q1,
        prop2, num2, q2,
        esperanza,
        varianza,
        se,
        condicion,
        x1, x2,
        probFinal,
        statValue,
        statType: 'Z',
        formulaLaTeX,
        strDesarrollo,
        p: esperanza 
    };
}


// ==========================================
// LÓGICA: PROBABILIDAD MUESTRAL (MEDIA)
// ==========================================

export function generarDistribucionProbabilidadMuestral(mediaPoblacional, desviacion, tipoDispersion, tamañoMuestra, poblacionN, tipoPoblacion) {
    const mu = parseFloat(mediaPoblacional);
    let valDispersion = parseFloat(desviacion);
    const varianzaInput = tipoDispersion === 'varianza' ? valDispersion : (valDispersion * valDispersion);
    const n = parseFloat(tamañoMuestra);
    const N = parseFloat(poblacionN);

    if (isNaN(mu) || isNaN(varianzaInput) || varianzaInput <= 0 || isNaN(n) || n <= 0) {
        return { error: `Por favor, completa correctamente los parámetros con números válidos.` };
    }

    if (tipoPoblacion === 'finita' && (isNaN(N) || N <= n)) {
        return { error: "Para población finita, N debe ser mayor que el tamaño de muestra (n)." };
    }

    const sigma = Math.sqrt(varianzaInput); 
    let SE = 0;
    let varianzaMuestralStr = '';

    const formatLatexNum = (num, minDigits = 0) => {
        if (typeof num !== 'number' || isNaN(num)) return '';
        if (Number.isInteger(num) && minDigits === 0) return num.toString();
        return num.toFixed(minDigits > 0 ? minDigits : (Number.isInteger(num) ? 0 : 2));
    };

    const numeradorStr = tipoDispersion === 'desviacion' ? `${formatLatexNum(valDispersion)}^2` : formatLatexNum(varianzaInput);

    let formulaMuStr = `= \\mu = ${formatLatexNum(mu)}`;
    let formulaVarStr = '';
    let formulaSEStr = '';
    let distribucionStr = '';

    if (tipoPoblacion === 'infinita') {
        const varX = varianzaInput / n;
        SE = Math.sqrt(varX);
        formulaVarStr = `= \\frac{\\sigma^2}{n} = \\frac{${numeradorStr}}{${formatLatexNum(n)}} = ${formatLatexNum(varX, 2)}`;
        formulaSEStr = `= \\frac{\\sigma}{\\sqrt{n}} = \\frac{${formatLatexNum(sigma)}}{\\sqrt{${formatLatexNum(n)}}} = ${formatLatexNum(SE, 2)}`;
        distribucionStr = `\\mathbf{\\bar{X} \\sim N\\left(${formatLatexNum(mu)} ; ${formatLatexNum(varX, 2)}\\right)}`;
        varianzaMuestralStr = `\\begin{gathered} E(\\bar{X}) = \\mu = ${formatLatexNum(mu)} \\\\[10px] V(\\bar{X}) = \\frac{\\sigma^2}{n} = \\frac{${numeradorStr}}{${formatLatexNum(n)}} = ${formatLatexNum(varX, 2)} \\\\[10px] \\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${formatLatexNum(sigma)}}{\\sqrt{${formatLatexNum(n)}}} = ${formatLatexNum(SE, 2)} \\\\[10px] \\mathbf{\\bar{X} \\sim N\\left(${formatLatexNum(mu)} ; ${formatLatexNum(varX, 2)}\\right)} \\end{gathered}`;
    } else {
        const factorCorreccion = calcularFactorFinito(N, n);
        const varX = (varianzaInput / n) * factorCorreccion;
        SE = Math.sqrt(varX);
        formulaVarStr = `= \\frac{\\sigma^2}{n} \\left( \\frac{N-n}{N-1} \\right) = \\frac{${numeradorStr}}{${formatLatexNum(n)}} \\left( \\frac{${formatLatexNum(N)} - ${formatLatexNum(n)}}{${formatLatexNum(N)} - 1} \\right) = ${formatLatexNum(varX, 2)}`;
        formulaSEStr = `= \\frac{\\sigma}{\\sqrt{n}} \\sqrt{\\frac{N-n}{N-1}} = \\frac{${formatLatexNum(sigma)}}{\\sqrt{${formatLatexNum(n)}}} \\sqrt{\\frac{${formatLatexNum(N)} - ${formatLatexNum(n)}}{${formatLatexNum(N)} - 1}} = ${formatLatexNum(SE, 2)}`;
        distribucionStr = `\\mathbf{\\bar{X} \\sim N\\left(${formatLatexNum(mu)} ; ${formatLatexNum(varX, 2)}\\right)}`;
        varianzaMuestralStr = `\\begin{gathered} E(\\bar{X}) = \\mu = ${formatLatexNum(mu)} \\\\[10px] V(\\bar{X}) = \\frac{\\sigma^2}{n} \\left( \\frac{N-n}{N-1} \\right) = \\frac{${numeradorStr}}{${formatLatexNum(n)}} \\left( \\frac{${formatLatexNum(N)} - ${formatLatexNum(n)}}{${formatLatexNum(N)} - 1} \\right) = ${formatLatexNum(varX, 2)} \\\\[10px] \\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}} \\sqrt{\\frac{N-n}{N-1}} = \\frac{${formatLatexNum(sigma)}}{\\sqrt{${formatLatexNum(n)}}} \\sqrt{\\frac{${formatLatexNum(N)} - ${formatLatexNum(n)}}{${formatLatexNum(N)} - 1}} = ${formatLatexNum(SE, 2)} \\\\[10px] \\mathbf{\\bar{X} \\sim N\\left(${formatLatexNum(mu)} ; ${formatLatexNum(varX, 2)}\\right)} \\end{gathered}`;
    }

    return { SE, varianzaMuestralStr, formulaMuStr, formulaVarStr, formulaSEStr, distribucionStr, mu, sigma, n, N, tipoPoblacion };
}

export function calcularProbabilidadProbabilidadMuestral(datosParciales, condicion, x1_val, x2_val) {
    if (!datosParciales) return { error: 'Faltan parámetros previos.' };

    const x1 = parseFloat(x1_val);
    const x2 = parseFloat(x2_val);

    if (!condicion) {
        return { error: "Por favor, selecciona una condición a calcular." };
    }

    if (isNaN(x1)) {
        return { error: "Por favor, ingresa el valor objetivo (x) correctamente." };
    }

    if (condicion === 'entre' && (isNaN(x2) || x2 <= x1)) {
        return { error: "Para la condición 'Entre', el Valor Límite Superior (x2) debe ser mayor que el Inferior (x1)." };
    }

    const { SE, mu, sigma, n, tipoPoblacion } = datosParciales;

    let z1 = (x1 - mu) / SE;
    let strDesarrollo = '';
    let probFinal = 0;

    let sigmaFormatted = Number.isInteger(sigma) ? sigma : sigma.toFixed(2);
    let denomStr = tipoPoblacion === 'infinita' ? `${sigmaFormatted}/\\sqrt{${n}}` : `${SE.toFixed(2)}`;

    if (condicion === 'menor_que') {
        probFinal = cdfNormal(z1);
        strDesarrollo = `\\begin{aligned} P(\\bar{X} \\le ${x1}) &= P\\left( Z \\le \\frac{${x1} - ${mu}}{${denomStr}} \\right) \\\\ &= P(Z \\le ${z1.toFixed(4)}) = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        let probZ1 = cdfNormal(z1);
        probFinal = 1 - probZ1;
        strDesarrollo = `\\begin{aligned} P(\\bar{X} \\ge ${x1}) &= P\\left( Z \\ge \\frac{${x1} - ${mu}}{${denomStr}} \\right) \\\\ &= P(Z \\ge ${z1.toFixed(4)}) \\\\ &= 1 - P(Z \\le ${z1.toFixed(4)}) = 1 - ${probZ1.toFixed(4)} = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    } else if (condicion === 'entre') {
        let z2 = (x2 - mu) / SE;
        let probZ2 = cdfNormal(z2);
        let probZ1 = cdfNormal(z1);
        probFinal = probZ2 - probZ1;
        strDesarrollo = `\\begin{aligned} P(${x1} \\le \\bar{X} \\le ${x2}) &= P\\left( \\frac{${x1} - ${mu}}{${denomStr}} \\le Z \\le \\frac{${x2} - ${mu}}{${denomStr}} \\right) \\\\ &= P(${z1.toFixed(4)} \\le Z \\le ${z2.toFixed(4)}) \\\\ &= P(Z \\le ${z2.toFixed(4)}) - P(Z \\le ${z1.toFixed(4)}) = ${probZ2.toFixed(4)} - ${probZ1.toFixed(4)} = \\mathbf{${probFinal.toFixed(4)}} \\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        x1,
        x2,
        z1,
        z2: condicion === 'entre' ? (x2 - mu) / SE : null,
        condicion
    };
}


// ==========================================
// LÓGICA: DIFERENCIA DE MEDIAS
// ==========================================

export function generarDistribucionDiferenciaMedias(mu1, sigma1, n1, mu2, sigma2, n2) {
    const m1 = parseFloat(mu1);
    const s1 = parseFloat(sigma1);
    const nn1 = parseFloat(n1);

    const m2 = parseFloat(mu2);
    const s2 = parseFloat(sigma2);
    const nn2 = parseFloat(n2);

    if (![m1, s1, nn1, m2, s2, nn2].every(Number.isFinite)) {
        return { error: "Por favor, ingresa valores numéricos finitos para ambas poblaciones." };
    }

    if (s1 <= 0 || s2 <= 0 || nn1 <= 0 || nn2 <= 0) {
        return { error: "Las desviaciones estándar y tamaños de muestra deben ser mayores a 0." };
    }
    if (!Number.isSafeInteger(nn1) || !Number.isSafeInteger(nn2)) {
        return { error: "Los tamaños de muestra deben ser números enteros seguros." };
    }

    const esperanza = m1 - m2;
    const varianza = (Math.pow(s1, 2) / nn1) + (Math.pow(s2, 2) / nn2);
    const se = Math.sqrt(varianza);
    if (![esperanza, varianza, se].every(Number.isFinite)) {
        return { error: "Los valores ingresados producen parámetros demasiado grandes para calcularlos." };
    }

    // Calculate exact fraction for variance
    let num = (Math.pow(s1, 2) * nn2) + (Math.pow(s2, 2) * nn1);
    let den = nn1 * nn2;
    num = Math.round(num * 1000000) / 1000000;
    if (!Number.isFinite(num) || !Number.isFinite(den)) {
        return { error: "Los valores ingresados son demasiado grandes para mostrar su cálculo exacto." };
    }
    while (!Number.isInteger(num)) {
        num *= 10;
        den *= 10;
        num = Math.round(num * 1000000) / 1000000;
        if (!Number.isFinite(num) || !Number.isFinite(den)) {
            return { error: "Los valores ingresados son demasiado grandes para mostrar su cálculo exacto." };
        }
    }
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const g = gcd(Math.abs(num), Math.abs(den));
    const varFracNum = num / g;
    const varFracDen = den / g;

    return { m1, s1, nn1, m2, s2, nn2, esperanza, varianza, se, varFracNum, varFracDen };
}

export function calcularProbabilidadDiferenciaMedias(datosParciales, condicion, x1_val, x2_val) {
    if (!datosParciales) return { error: 'Faltan parámetros previos.' };

    const x1 = parseFloat(x1_val);
    const x2 = parseFloat(x2_val);

    if (!condicion) {
        return { error: 'Por favor selecciona una condición.' };
    }

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && isNaN(x1)) {
        return { error: 'Ingresa un valor válido para la condición.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2))) {
        return { error: 'Ingresa ambos valores para el rango.' };
    }
    if (condicion === 'entre' && x2 <= x1) {
        return { error: 'El límite superior debe ser mayor que el límite inferior.' };
    }

    const { m1, s1, nn1, m2, s2, nn2, esperanza, se, varFracNum, varFracDen } = datosParciales;

    let probFinal = 0;
    let strDesarrollo = '';

    let denomStr = varFracDen === 1 ? `${varFracNum}` : `\\frac{${varFracNum}}{${varFracDen}}`;
    denomStr = `\\sqrt{${denomStr}}`;

    const z1 = (x1 - esperanza) / se;

    const formatNumber = (num, dec = 0) => num.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: Math.max(dec, 3) }).replace(',', '{,}');

    if (condicion === 'menor_que') {
        probFinal = cdfNormal(z1);
        strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(x1)}) &= P\\Biggl( Z \\le \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${denomStr}} \\Biggr) \\\\[12pt] &= P(Z \\le ${formatNumber(z1, 2)}) \\\\[6pt] &= ${formatNumber(probFinal, 4)} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        probFinal = 1 - cdfNormal(z1);
        strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\ge ${formatNumber(x1)}) &= P\\Biggl( Z \\ge \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${denomStr}} \\Biggr) \\\\[12pt] &= P(Z \\ge ${formatNumber(z1, 2)}) \\\\[6pt] &= 1 - P(Z \\le ${formatNumber(z1, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
    } else if (condicion === 'entre') {
        let z2 = (x2 - esperanza) / se;
        let probZ2 = cdfNormal(z2);
        let probZ1 = cdfNormal(z1);
        probFinal = probZ2 - probZ1;
        strDesarrollo = `\\begin{aligned} P(${formatNumber(x1)} \\le \\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(x2)}) &= P\\Biggl( \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${denomStr}} \\le Z \\le \\frac{${formatNumber(x2)} - ${formatNumber(esperanza)}}{${denomStr}} \\Biggr) \\\\[12pt] &= P(${formatNumber(z1, 2)} \\le Z \\le ${formatNumber(z2, 2)}) \\\\[6pt] &= P(Z \\le ${formatNumber(z2, 2)}) - P(Z \\le ${formatNumber(z1, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        z1,
        z2: condicion === 'entre' ? (x2 - esperanza) / se : null,
        x1,
        x2,
        condicion,
        esperanza,
        p: esperanza, 
        se: se
    };
}


// ==========================================
// LÓGICA: DIFERENCIA DE MEDIAS DESCONOCIDAS
// ==========================================

export function calcularParametrosDiferenciaMediasDesconocidas(mu1, s1_val, n1_val, mu2, s2_val, n2_val) {
    const m1 = parseFloat(mu1);
    const std1 = parseFloat(s1_val);
    const nn1 = parseFloat(n1_val);

    const m2 = parseFloat(mu2);
    const std2 = parseFloat(s2_val);
    const nn2 = parseFloat(n2_val);

    if (isNaN(m1) || isNaN(std1) || isNaN(nn1) || isNaN(m2) || isNaN(std2) || isNaN(nn2)) {
        return { error: "Por favor, ingresa todos los valores numéricos para ambas poblaciones." };
    }

    if (std1 <= 0 || std2 <= 0 || nn1 <= 0 || nn2 <= 0) {
        return { error: "Las desviaciones estándar y tamaños de muestra deben ser mayores a 0." };
    }

    return { m1, std1, nn1, m2, std2, nn2 };
}

export function calcularProbabilidadDiferenciaMediasDesconocidas(parametrosPrevios, escenario, condicion, x1_val, x2_val) {
    if (!parametrosPrevios) return { error: 'Faltan parámetros previos.' };

    const { m1, std1, nn1, m2, std2, nn2 } = parametrosPrevios;
    const x1 = parseFloat(x1_val);
    const x2 = parseFloat(x2_val);

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && isNaN(x1)) {
        return { error: 'Ingresa un valor válido para la condición a calcular.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2))) {
        return { error: 'Ingresa ambos valores para el rango.' };
    }

    const s1Sq = Math.pow(std1, 2);
    const s2Sq = Math.pow(std2, 2);
    const esperanza = m1 - m2;
    let se = 0;
    let v = 0;
    let statValue = 0;
    let statType = 'Z';
    let formulaLaTeX = '';

    if (escenario === 'grandes') {
        se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
        statValue = (x1 - esperanza) / se;
        statType = 'Z';
        formulaLaTeX = `Z = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{\\sqrt{\\frac{S_1^2}{n_1} + \\frac{S_2^2}{n_2}}}`;
    } else if (escenario === 'iguales') {
        v = nn1 + nn2 - 2;
        const sp2 = ((nn1 - 1) * s1Sq + (nn2 - 1) * s2Sq) / v;
        se = Math.sqrt(sp2 * ((1 / nn1) + (1 / nn2)));
        statValue = (x1 - esperanza) / se;
        statType = 'T';
        formulaLaTeX = `T = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{\\sqrt{\\frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1+n_2-2} \\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}}`;
    } else if (escenario === 'distintas') {
        se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
        const num = Math.pow((s1Sq / nn1) + (s2Sq / nn2), 2);
        const den = (Math.pow(s1Sq / nn1, 2) / (nn1 + 1)) + (Math.pow(s2Sq / nn2, 2) / (nn2 + 1));
        v = (num / den) - 2;
        v = Math.round(v * 100) / 100;
        statValue = (x1 - esperanza) / se;
        statType = 'T';
        formulaLaTeX = `T = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{\\sqrt{\\frac{S_1^2}{n_1} + \\frac{S_2^2}{n_2}}}`;
    }

    let probFinal = 0;
    let val2Stat = (x2 - esperanza) / se;

    if (escenario === 'grandes') {
        if (condicion === 'menor_que') {
            probFinal = cdfNormal(statValue);
        } else if (condicion === 'mayor_que') {
            probFinal = 1 - cdfNormal(statValue);
        } else if (condicion === 'entre') {
            const p1 = cdfNormal(statValue);
            const p2 = cdfNormal(val2Stat);
            probFinal = Math.abs(p2 - p1);
        }
    } else {
        if (condicion === 'menor_que') {
            probFinal = jStat.studentt.cdf(statValue, v);
        } else if (condicion === 'mayor_que') {
            probFinal = 1 - jStat.studentt.cdf(statValue, v);
        } else if (condicion === 'entre') {
            const p1 = jStat.studentt.cdf(statValue, v);
            const p2 = jStat.studentt.cdf(val2Stat, v);
            probFinal = Math.abs(p2 - p1);
        }
    }

    const formatNumber = (num, dec = 0) => num.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: Math.max(dec, 3) }).replace(/,/g, '{,}');
    let strDesarrollo = '';
    let S = statType; 

    if (condicion === 'menor_que') {
        strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(x1)}) &= P\\left( ${S} \\le \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\le ${formatNumber(statValue, 2)}) \\\\ &= ${formatNumber(probFinal, 4)} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\ge ${formatNumber(x1)}) &= P\\left( ${S} \\ge \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\ge ${formatNumber(statValue, 2)}) \\\\ &= 1 - P(${S} \\le ${formatNumber(statValue, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
    } else if (condicion === 'entre') {
        const xMin = Math.min(x1, x2);
        const xMax = Math.max(x1, x2);
        const tMin = Math.min(statValue, val2Stat);
        const tMax = Math.max(statValue, val2Stat);
        strDesarrollo = `\\begin{aligned} P(${formatNumber(xMin)} \\le \\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(xMax)}) &= P\\left( \\frac{${formatNumber(xMin)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\le ${S} \\le \\frac{${formatNumber(xMax)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${formatNumber(tMin, 2)} \\le ${S} \\le ${formatNumber(tMax, 2)}) \\\\ &= P(${S} \\le ${formatNumber(tMax, 2)}) - P(${S} \\le ${formatNumber(tMin, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
    }

    return {
        m1, std1, nn1,
        m2, std2, nn2,
        esperanza,
        se,
        v,
        escenario,
        condicion,
        x1,
        x2,
        probFinal,
        statValue,
        statType,
        formulaLaTeX,
        strDesarrollo,
        mu: esperanza, 
        p: esperanza,
        esDiferenciaMedias: true
    };
}


// ==========================================
// LÓGICA: CHI-CUADRADA
// ==========================================

export function generarDistribucionChiCuadrada(varianzaPoblacional, tamañoMuestra, tipoDispersion) {
    let valDispersion = parseFloat(varianzaPoblacional);
    const varPob = tipoDispersion === 'varianza' ? valDispersion : (valDispersion * valDispersion);
    const n = parseInt(tamañoMuestra);

    if (isNaN(varPob) || varPob <= 0 || isNaN(n) || n <= 1) {
        return { error: `Por favor, completa correctamente los parámetros. La medida de dispersión debe ser > 0 y la muestra n > 1.` };
    }

    const k = n - 1; 

    const formatLatexNum = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '';
        const parsed = parseFloat(num);
        return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(4);
    };

    const varPobStr = formatLatexNum(varPob);
    const valDispStr = tipoDispersion === 'desviacion' ? `${formatLatexNum(valDispersion)}^2` : varPobStr;
    const varS2 = (2 * Math.pow(varPob, 2)) / k;
    const varS2Str = formatLatexNum(varS2);

    return { 
        k, 
        varPob, 
        n, 
        valDispersion, 
        tipoDispersion, 
        varPobStr, 
        valDispStr, 
        varS2, 
        varS2Str 
    };
}

export function calcularProbabilidadChiCuadrada(datosParciales, condicion, valorX1, valorX2) {
    if (!datosParciales) return { error: 'Faltan parámetros previos.' };

    const x1 = parseFloat(valorX1);
    const x2 = parseFloat(valorX2);

    if (!condicion) {
        return { error: "Por favor, selecciona una condición a calcular." };
    }

    if (isNaN(x1) || x1 < 0) {
        return { error: "Por favor, ingresa el valor objetivo correctamente. Debe ser ≥ 0." };
    }

    if (condicion === 'entre' && (isNaN(x2) || x2 <= x1)) {
        return { error: "Para la condición 'Entre', el Valor Límite Superior (S²_2) debe ser mayor que el Inferior (S²_1)." };
    }

    const { k, varPob, n } = datosParciales;

    let chi1 = (k * x1) / varPob;
    let strDesarrollo = '';
    let probFinal = 0;

    const formatLatexNum = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '';
        const parsed = parseFloat(num);
        return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(4);
    };

    const varPobStr = formatLatexNum(varPob);
    const x1Str = formatLatexNum(x1);
    const chi1Str = formatLatexNum(chi1);

    if (condicion === 'menor_que') {
        probFinal = jStat.chisquare.cdf(chi1, k);
        const probStr = formatLatexNum(probFinal);
        strDesarrollo = `\\begin{aligned} P(S^2 \\le ${x1Str}) &= P\\left( \\chi^2 \\le \\frac{(n-1)S^2}{\\sigma^2} \\right) \\\\ &= P\\left( \\chi^2 \\le \\frac{(${n}-1)(${x1Str})}{${varPobStr}} \\right) \\\\ &= P(\\chi^2 \\le ${chi1Str}) = \\mathbf{${probStr}} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        probFinal = 1 - jStat.chisquare.cdf(chi1, k);
        const probStr = formatLatexNum(probFinal);
        strDesarrollo = `\\begin{aligned} P(S^2 \\ge ${x1Str}) &= P\\left( \\chi^2 \\ge \\frac{(n-1)S^2}{\\sigma^2} \\right) \\\\ &= P\\left( \\chi^2 \\ge \\frac{(${n}-1)(${x1Str})}{${varPobStr}} \\right) \\\\ &= P(\\chi^2 \\ge ${chi1Str}) \\\\ &= 1 - P(\\chi^2 \\le ${chi1Str}) = \\mathbf{${probStr}} \\end{aligned}`;
    } else if (condicion === 'entre') {
        let chi2 = (k * x2) / varPob;
        let probChi2 = jStat.chisquare.cdf(chi2, k);
        let probChi1 = jStat.chisquare.cdf(chi1, k);
        probFinal = probChi2 - probChi1;
        const x2Str = formatLatexNum(x2);
        const chi2Str = formatLatexNum(chi2);
        const probChi2Str = formatLatexNum(probChi2);
        const probChi1Str = formatLatexNum(probChi1);
        const probStr = formatLatexNum(probFinal);
        strDesarrollo = `\\begin{aligned} P(${x1Str} \\le S^2 \\le ${x2Str}) &= P\\left( \\frac{(${n}-1)(${x1Str})}{${varPobStr}} \\le \\chi^2 \\le \\frac{(${n}-1)(${x2Str})}{${varPobStr}} \\right) \\\\ &= P(${chi1Str} \\le \\chi^2 \\le ${chi2Str}) \\\\ &= P(\\chi^2 \\le ${chi2Str}) - P(\\chi^2 \\le ${chi1Str}) = ${probChi2Str} - ${probChi1Str} = \\mathbf{${probStr}} \\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        x1,
        x2,
        condicion
    };
}


// ==========================================
// LÓGICA: T-STUDENT
// ==========================================

export function generarDistribucionStudent(mu, s_val, n, tipoDispersion = 'desviacion') {
    const muPob = parseFloat(mu);
    const valDisp = parseFloat(s_val);
    const tamMuestra = parseFloat(n);

    if (isNaN(muPob) || isNaN(valDisp) || isNaN(tamMuestra)) {
        return { error: "Por favor, ingresa todos los valores numéricos." };
    }

    if (valDisp <= 0 || tamMuestra <= 1) {
        return { error: "La desviación / varianza debe ser > 0 y la muestra n > 1." };
    }

    let sMuestral = 0;
    let sCuadrado = 0;
    if (tipoDispersion === 'varianza') {
        sCuadrado = valDisp;
        sMuestral = Math.sqrt(valDisp);
    } else {
        sMuestral = valDisp;
        sCuadrado = valDisp * valDisp;
    }

    const v = tamMuestra - 1;
    const se = sMuestral / Math.sqrt(tamMuestra);
    const varXbar = sCuadrado / tamMuestra;

    return { 
        mu: muPob, 
        s: sMuestral, 
        s2: sCuadrado, 
        n: tamMuestra, 
        v, 
        se, 
        varXbar, 
        tipoDispersion 
    };
}

export function calcularProbabilidadStudent(datosParciales, condicion, valorX1, valorX2) {
    if (!datosParciales) return { error: 'Faltan parámetros previos.' };

    const x1 = parseFloat(valorX1);
    const x2 = parseFloat(valorX2);

    if (!condicion) {
        return { error: 'Por favor selecciona una condición.' };
    }

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && isNaN(x1)) {
        return { error: 'Ingresa un valor válido para la condición.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2))) {
        return { error: 'Ingresa ambos valores para el rango.' };
    }
    if (condicion === 'entre' && x2 <= x1) {
        return { error: "Para la condición 'Entre', el valor x2 debe ser mayor que x1." };
    }

    const { mu: muPob, s: sMuestral, n: tamMuestra, v, se } = datosParciales;

    let probFinal = 0;
    let strDesarrollo = '';

    const t1 = (x1 - muPob) / se;

    const formatNumber = (num, minDec = 0, maxDec = 4) => {
        if (num === undefined || num === null || isNaN(num)) return '0';
        return num.toLocaleString('es-ES', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec }).replace(/,/g, '{,}');
    };

    const sFmt = formatNumber(sMuestral, 0, 4);
    const nFmt = formatNumber(tamMuestra, 0, 0);
    const muFmt = formatNumber(muPob, 0, 4);
    const x1Fmt = formatNumber(x1, 0, 4);
    const t1Fmt = formatNumber(t1, 3, 3);

    if (condicion === 'menor_que') {
        probFinal = jStat.studentt.cdf(t1, v);
        strDesarrollo = `\\begin{aligned} 
P(\\bar{X} \\le ${x1Fmt}) &= P\\left( T \\le \\frac{\\bar{X} - \\mu}{\\frac{S}{\\sqrt{n}}} \\right) \\\\ 
&= P\\left( T \\le \\frac{${x1Fmt} - ${muFmt}}{\\frac{${sFmt}}{\\sqrt{${nFmt}}}} \\right) \\\\ 
&= P(T \\le ${t1Fmt}) \\\\ 
&= ${formatNumber(probFinal, 4, 4)} 
\\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        probFinal = 1 - jStat.studentt.cdf(t1, v);
        strDesarrollo = `\\begin{aligned} 
P(\\bar{X} \\ge ${x1Fmt}) &= P\\left( T \\ge \\frac{\\bar{X} - \\mu}{\\frac{S}{\\sqrt{n}}} \\right) \\\\ 
&= P\\left( T \\ge \\frac{${x1Fmt} - ${muFmt}}{\\frac{${sFmt}}{\\sqrt{${nFmt}}}} \\right) \\\\ 
&= P(T \\ge ${t1Fmt}) = 1 - P(T \\le ${t1Fmt}) \\\\ 
&= ${formatNumber(probFinal, 4, 4)} 
\\end{aligned}`;
    } else if (condicion === 'entre') {
        const t2 = (x2 - muPob) / se;
        const x2Fmt = formatNumber(x2, 0, 4);
        const t2Fmt = formatNumber(t2, 3, 3);
        let probT2 = jStat.studentt.cdf(t2, v);
        let probT1 = jStat.studentt.cdf(t1, v);
        probFinal = Math.abs(probT2 - probT1);
        strDesarrollo = `\\begin{aligned} 
P(${x1Fmt} \\le \\bar{X} \\le ${x2Fmt}) &= P\\left( \\frac{${x1Fmt} - ${muFmt}}{\\frac{${sFmt}}{\\sqrt{${nFmt}}}} \\le T \\le \\frac{${x2Fmt} - ${muFmt}}{\\frac{${sFmt}}{\\sqrt{${nFmt}}}} \\right) \\\\ 
&= P(${t1Fmt} \\le T \\le ${t2Fmt}) \\\\ 
&= P(T \\le ${t2Fmt}) - P(T \\le ${t1Fmt}) \\\\ 
&= ${formatNumber(probFinal, 4, 4)} 
\\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        t1,
        t2: condicion === 'entre' ? (x2 - muPob) / se : undefined,
        x1,
        x2,
        condicion
    };
}


// ==========================================
// LÓGICA: FISHER
// ==========================================

export function generarDistribucionFisher(varPob1, n1, varPob2, n2) {
    const vp1 = parseFloat(varPob1);
    const nn1 = parseFloat(n1);
    const vp2 = parseFloat(varPob2);
    const nn2 = parseFloat(n2);

    if (isNaN(vp1) || isNaN(nn1) || isNaN(vp2) || isNaN(nn2) || vp1 <= 0 || nn1 <= 1 || vp2 <= 0 || nn2 <= 1) {
        return { error: "Por favor, ingrese valores numéricos válidos. Las varianzas deben ser mayores a 0 y las muestras mayores a 1." };
    }

    if (!Number.isInteger(nn1) || !Number.isInteger(nn2)) {
        return { error: "Los tamanos de muestra deben ser numeros enteros." };
    }

    const v1 = nn1 - 1;
    const v2 = nn2 - 1;

    return { v1, v2, varPob1: vp1, varPob2: vp2, n1: nn1, n2: nn2 };
}

export function calcularProbabilidadFisher(datosParciales, condicion, valorX1, valorX2) {
    if (!datosParciales) return { error: 'Faltan parámetros previos.' };

    const x1 = parseFloat(valorX1);
    const x2 = parseFloat(valorX2);

    if (!condicion) {
        return { error: 'Por favor selecciona una condición.' };
    }

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && isNaN(x1)) {
        return { error: 'Ingresa un valor válido para la condición.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2))) {
        return { error: 'Ingresa ambos valores para el rango.' };
    }

    const { v1, v2, varPob1, varPob2 } = datosParciales;
    const razonVarPob = varPob2 / varPob1;

    let probFinal = 0;
    let strDesarrollo = '';

    if (condicion === 'menor_que') {
        const F1 = x1 * razonVarPob;
        probFinal = jStat.centralF.cdf(F1, v1, v2);
        strDesarrollo = `\\begin{aligned} P\\left( \\frac{S_1^2}{S_2^2} < ${x1} \\right) &= P\\left( F < ${x1} \\cdot \\frac{${varPob2}}{${varPob1}} \\right) \\\\ &= P(F < ${F1.toFixed(4)}) \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        const F1 = x1 * razonVarPob;
        probFinal = 1 - jStat.centralF.cdf(F1, v1, v2);
        strDesarrollo = `\\begin{aligned} P\\left( \\frac{S_1^2}{S_2^2} > ${x1} \\right) &= P\\left( F > ${x1} \\cdot \\frac{${varPob2}}{${varPob1}} \\right) \\\\ &= P(F > ${F1.toFixed(4)}) \\\\ &= 1 - P(F < ${F1.toFixed(4)}) = ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'entre') {
        const F1 = x1 * razonVarPob;
        const F2 = x2 * razonVarPob;
        const probZ2 = jStat.centralF.cdf(F2, v1, v2);
        const probZ1 = jStat.centralF.cdf(F1, v1, v2);
        probFinal = probZ2 - probZ1;
        strDesarrollo = `\\begin{aligned} P\\left( ${x1} < \\frac{S_1^2}{S_2^2} < ${x2} \\right) &= P\\left( ${x1} \\cdot \\frac{${varPob2}}{${varPob1}} < F < ${x2} \\cdot \\frac{${varPob2}}{${varPob1}} \\right) \\\\ &= P(${F1.toFixed(4)} < F < ${F2.toFixed(4)}) \\\\ &= P(F < ${F2.toFixed(4)}) - P(F < ${F1.toFixed(4)}) = ${probFinal.toFixed(4)} \\end{aligned}`;
    }

    return {
        strDesarrollo,
        probFinal,
        x1,
        x2,
        condicion
    };
}


// ==========================================
// LÓGICA: RAZÓN DE VARIANZAS
// ==========================================

export function calcularParametrosRazonVarianzas(varPob1, n1, varPob2, n2) {
    const vp1 = parseFloat(varPob1);
    const nn1 = parseFloat(n1);
    const vp2 = parseFloat(varPob2);
    const nn2 = parseFloat(n2);

    if (isNaN(vp1) || isNaN(nn1) || isNaN(vp2) || isNaN(nn2)) {
        return { error: "Por favor, ingresa todos los valores numéricos para ambas poblaciones." };
    }

    if (vp1 <= 0 || vp2 <= 0 || nn1 <= 1 || nn2 <= 1) {
        return { error: "Las varianzas deben ser mayores a 0 y los tamaños de muestra mayores a 1." };
    }

    const v1 = nn1 - 1;
    const v2 = nn2 - 1;
    const razonVarPob = vp2 / vp1; 

    return { vp1, nn1, vp2, nn2, v1, v2, razonVarPob };
}

export function calcularProbabilidadRazonVarianzas(parametrosPrevios, condicion, valorX1, valorX2) {
    if (!parametrosPrevios) return { error: 'Faltan parámetros previos.' };

    const { vp1, nn1, vp2, nn2, v1, v2, razonVarPob } = parametrosPrevios;

    const x1 = parseFloat(valorX1);
    const x2 = parseFloat(valorX2);

    if ((condicion === 'menor_que' || condicion === 'mayor_que') && (isNaN(x1) || x1 < 0)) {
        return { error: 'Ingresa un valor válido y positivo para la condición a calcular.' };
    }
    if (condicion === 'entre' && (isNaN(x1) || isNaN(x2) || x1 < 0 || x2 < 0)) {
        return { error: 'Ingresa ambos valores positivos para el rango.' };
    }

    let probFinal = 0;
    let strDesarrollo = '';
    let statValue = 0; 

    if (condicion === 'menor_que') {
        statValue = x1 * razonVarPob;
        probFinal = jStat.centralF.cdf(statValue, v1, v2);
        strDesarrollo = `\\begin{aligned} P\\left( \\frac{S_1^2}{S_2^2} < ${x1} \\right) &= P\\left( F < ${x1} \\cdot \\frac{${vp2}}{${vp1}} \\right) \\\\ &= P(F < ${statValue.toFixed(4)}) \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'mayor_que') {
        statValue = x1 * razonVarPob;
        probFinal = 1 - jStat.centralF.cdf(statValue, v1, v2);
        strDesarrollo = `\\begin{aligned} P\\left( \\frac{S_1^2}{S_2^2} > ${x1} \\right) &= P\\left( F > ${x1} \\cdot \\frac{${vp2}}{${vp1}} \\right) \\\\ &= P(F > ${statValue.toFixed(4)}) \\\\ &= 1 - P(F < ${statValue.toFixed(4)}) \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    } else if (condicion === 'entre') {
        const F1 = x1 * razonVarPob;
        const F2 = x2 * razonVarPob;
        statValue = F2; 
        const probZ2 = jStat.centralF.cdf(F2, v1, v2);
        const probZ1 = jStat.centralF.cdf(F1, v1, v2);
        probFinal = Math.abs(probZ2 - probZ1);
        strDesarrollo = `\\begin{aligned} P\\left( ${x1} < \\frac{S_1^2}{S_2^2} < ${x2} \\right) &= P\\left( ${x1} \\cdot \\frac{${vp2}}{${vp1}} < F < ${x2} \\cdot \\frac{${vp2}}{${vp1}} \\right) \\\\ &= P(${F1.toFixed(4)} < F < ${F2.toFixed(4)}) \\\\ &= P(F < ${F2.toFixed(4)}) - P(F < ${F1.toFixed(4)}) \\\\ &= ${probZ2.toFixed(4)} - ${probZ1.toFixed(4)} \\\\ &= ${probFinal.toFixed(4)} \\end{aligned}`;
    }

    const formulaLaTeX = `F = \\left( \\frac{S_1^2}{S_2^2} \\right) \\cdot \\left( \\frac{\\sigma_2^2}{\\sigma_1^2} \\right)`;

    return {
        vp1, nn1,
        vp2, nn2,
        v1, v2,
        varPob1: vp1,
        varPob2: vp2,
        condicion,
        x1, x2,
        probFinal,
        statValue,
        formulaLaTeX,
        strDesarrollo,
    };
}
