/**
 * logica_Tema2.js
 * Motor de cálculo puro para el Tema 2: Variables Aleatorias.
 */
import { compile } from 'mathjs';

export function integracionNumerica(expr, a, b, n = 1000, varName = 'x') {
    const compiledExpr = typeof expr === 'string' ? compile(expr) : expr;

    const f = (val) => {
        try {
            return compiledExpr.evaluate({ [varName]: val });
        } catch (e) {
            return 0; 
        }
    };

    let start = a;
    let end = b;

    // Búsqueda heurística de cola para límites infinitos
    if (end === Infinity) {
        end = start >= 0 ? start + 10 : 10;
        let max_iters = 500;
        while (f(end) > 1e-6 && max_iters > 0) {
            end += 10;
            max_iters--;
        }
    }
    if (start === -Infinity) {
        start = end <= 0 ? end - 10 : -10;
        let max_iters = 500;
        while (f(start) > 1e-6 && max_iters > 0) {
            start -= 10;
            max_iters--;
        }
    }

    if (n % 2 !== 0) n++; // Asegurar que sea par
    const h = (end - start) / n;
    
    let suma = f(start) + f(end);

    for (let i = 1; i < n; i++) {
        const x_i = start + i * h;
        if (i % 2 === 0) {
            suma += 2 * f(x_i);
        } else {
            suma += 4 * f(x_i);
        }
    }

    return (h / 3) * suma;
}

export function calcularMomentosContinua(fxText, a, b, varName = 'x') {
    if (!fxText || isNaN(a) || isNaN(b) || a >= b) {
        return { error: "Parámetros inválidos para la distribución continua." };
    }

    let compiledExpr;
    try {
        compiledExpr = compile(fxText);
    } catch (e) {
        return { error: "Función de densidad inválida." };
    }

    const areaTotal = integracionNumerica(compiledExpr, a, b, 1000, varName);
    const es_valida = Math.abs(areaTotal - 1.0) <= 0.005;

    let warningMsg = null;
    if (!es_valida) {
        warningMsg = `Advertencia: El área bajo la curva es ${areaTotal.toFixed(4)}. Para que sea una función de densidad válida y se puedan calcular probabilidades, el área debe ser exactamente 1.0.`;
    }

    const esperanzaEvaluador = {
        evaluate: (scope) => scope[varName] * compiledExpr.evaluate(scope)
    };
    const esperanza = integracionNumerica(esperanzaEvaluador, a, b, 1000, varName);

    const varianzaEvaluador = {
        evaluate: (scope) => Math.pow(scope[varName] - esperanza, 2) * compiledExpr.evaluate(scope)
    };
    const varianza = integracionNumerica(varianzaEvaluador, a, b, 1000, varName);
    const desviacion = Math.sqrt(Math.max(0, varianza));

    const asimetriaEvaluador = {
        evaluate: (scope) => Math.pow(scope[varName] - esperanza, 3) * compiledExpr.evaluate(scope)
    };
    const m3 = integracionNumerica(asimetriaEvaluador, a, b, 1000, varName);
    const asimetria = desviacion > 0 ? (m3 / Math.pow(desviacion, 3)) : 0;

    const curtosisEvaluador = {
        evaluate: (scope) => Math.pow(scope[varName] - esperanza, 4) * compiledExpr.evaluate(scope)
    };
    const m4 = integracionNumerica(curtosisEvaluador, a, b, 1000, varName);
    const curtosis = desviacion > 0 ? (m4 / Math.pow(desviacion, 4)) - 3 : 0;

    return {
        es_valida,
        warning: warningMsg,
        funcion: fxText,
        a,
        b,
        area: areaTotal,
        esperanza,
        varianza,
        desviacion,
        asimetria,
        curtosis
    };
}

export function calcularMomentosDiscreta(matrizDatos) {
    if (!matrizDatos || matrizDatos.length === 0) {
        return { error: "No hay datos para procesar." };
    }

    let sumP = 0;
    const datosValidos = [];

    for (let i = 0; i < matrizDatos.length; i++) {
        const x = parseFloat(matrizDatos[i].x);
        const p = parseFloat(matrizDatos[i].p);

        if (isNaN(x) || isNaN(p)) {
            return { error: `La fila ${i + 1} contiene valores no numéricos.` };
        }
        if (p < 0 || p > 1) {
            return { error: `La probabilidad en la fila ${i + 1} debe estar entre 0 y 1.` };
        }
        sumP += p;
        datosValidos.push({ x, p });
    }

    if (Math.abs(sumP - 1.0) > 0.0001) {
        return { error: `La suma de probabilidades debe ser exactamente 1. Suma actual: ${sumP.toFixed(4)}` };
    }

    // Esperanza Matemática (Momento 1)
    const esperanza = datosValidos.reduce((acc, val) => acc + (val.x * val.p), 0);

    // Varianza y Desviación (Momento 2)
    const varianza = datosValidos.reduce((acc, val) => acc + (Math.pow(val.x - esperanza, 2) * val.p), 0);
    const desviacion = Math.sqrt(varianza);

    // Asimetría (Momento 3)
    const m3 = datosValidos.reduce((acc, val) => acc + (Math.pow(val.x - esperanza, 3) * val.p), 0);
    const asimetria = desviacion > 0 ? (m3 / Math.pow(desviacion, 3)) : 0;

    // Curtosis (Momento 4)
    const m4 = datosValidos.reduce((acc, val) => acc + (Math.pow(val.x - esperanza, 4) * val.p), 0);
    const curtosis = desviacion > 0 ? (m4 / Math.pow(desviacion, 4)) - 3 : 0;

    return {
        datos: datosValidos,
        esperanza,
        varianza,
        desviacion,
        asimetria,
        curtosis
    };
}
