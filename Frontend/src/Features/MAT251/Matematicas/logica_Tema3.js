import { jStat } from 'jstat';
// Solo presentación: no modifica los parámetros usados en los cálculos ni el historial.
export const formatearParametroDiscreto = valor => {
    if (valor === null || valor === undefined || String(valor).trim() === '') return '';
    const numero = Number(String(valor).replace(',', '.'));
    if (!Number.isFinite(numero)) return '—';
    return Number.isInteger(numero) ? String(numero) : numero.toFixed(4);
};

export const formatearResultadoDiscreto = valor => typeof valor === 'number' && Number.isFinite(valor)
    ? valor.toFixed(4) : '—';
// src/components/MAT251/Temas/Tema_3/logica_Tema3.js

// Cálculos discretos en escala logarítmica para evitar factoriales infinitos.
const limitarProbabilidad = valor => Math.min(1, Math.max(0, valor));
const logCombinacion = (n, r) => r < 0 || r > n ? -Infinity
    : r === 0 || r === n ? 0
        : jStat.gammaln(n + 1) - jStat.gammaln(r + 1) - jStat.gammaln(n - r + 1);
export const puntualBinomial = (n, p, x) => {
    if (!Number.isInteger(x) || x < 0 || x > n) return 0;
    if (p === 0 || p === 1 || n === 0) return x === n * p ? 1 : 0;
    return limitarProbabilidad(Math.exp(logCombinacion(n, x) + x * Math.log(p) + (n - x) * Math.log1p(-p)));
};
export const puntualPoisson = (lambda, x) => {
    if (!Number.isInteger(x) || x < 0) return 0;
    if (lambda === 0) return x === 0 ? 1 : 0;
    return limitarProbabilidad(Math.exp(-lambda + x * Math.log(lambda) - jStat.gammaln(x + 1)));
};
export const puntualHipergeometrica = (N, K, n, x) => {
    if (!Number.isInteger(x) || x < Math.max(0, n - (N - K)) || x > Math.min(K, n)) return 0;
    return limitarProbabilidad(Math.exp(logCombinacion(K, x) + logCombinacion(N - K, n - x) - logCombinacion(N, n)));
};
// Sumar la cola por recurrencia evita depender de un factorial o de bucles
// proporcionales a un umbral de búsqueda extremadamente grande.
const colaPoisson = (inicio, lambda) => {
    if (inicio <= 0) return 1;
    if (lambda === 0) return 0;
    if (inicio <= lambda) return limitarProbabilidad(jStat.lowRegGamma(inicio, lambda));
    let termino = puntualPoisson(lambda, inicio);
    let suma = termino;
    for (let paso = 1; paso <= 100000 && termino > 0; paso++) {
        termino *= lambda / (inicio + paso);
        suma += termino;
        if (termino <= suma * 1e-14) break;
    }
    return limitarProbabilidad(suma);
};
const acumuladaPoisson = (limite, lambda) => {
    if (limite < 0) return 0;
    if (lambda === 0) return 1;
    const x = Math.floor(limite);
    if (x >= lambda) return limitarProbabilidad(1 - colaPoisson(x + 1, lambda));
    let termino = puntualPoisson(lambda, x);
    let suma = termino;
    for (let k = x; k > 0 && termino > 0; k--) {
        termino *= k / lambda;
        suma += termino;
        if (termino <= suma * 1e-14) break;
    }
    return limitarProbabilidad(suma);
};
export const calcularDistribucionModelo = (modelo, params, condicion) => {
    let esperanza = 0;
    let varianza = 0;
    let maximo = Infinity;
    let minimo = 0;
    const puntual = x => {
        if (modelo === 'Bernoulli') return x === 0 ? 1 - params.p : x === 1 ? params.p : 0;
        if (modelo === 'Binomial') return puntualBinomial(params.n, params.p, x);
        if (modelo === 'Poisson') return puntualPoisson(params.lambda, x);
        return puntualHipergeometrica(params.N, params.K, params.n, x);
    };
    if (modelo === 'Bernoulli') {
        esperanza = params.p; varianza = params.p * (1 - params.p); maximo = 1;
    } else if (modelo === 'Binomial') {
        esperanza = params.n * params.p; varianza = params.n * params.p * (1 - params.p); maximo = params.n;
    } else if (modelo === 'Poisson') {
        esperanza = params.lambda; varianza = params.lambda;
    } else if (modelo === 'Hipergeometrica') {
        const p = params.K / params.N;
        esperanza = params.n * p;
        varianza = params.N === 1 ? 0 : params.n * p * (1 - p) * ((params.N - params.n) / (params.N - 1));
        minimo = Math.max(0, params.n - (params.N - params.K)); maximo = Math.min(params.K, params.n);
    }
    const acumulada = x => {
        if (x < minimo) return 0;
        if (x >= maximo) return 1;
        if (modelo === 'Bernoulli') return 1 - params.p;
        if (modelo === 'Binomial') {
            if (params.p === 0) return 1;
            if (params.p === 1) return 0;
            return jStat.ibeta(1 - params.p, params.n - Math.floor(x), Math.floor(x) + 1);
        }
        if (modelo === 'Poisson') return acumuladaPoisson(x, params.lambda);
        return jStat.hypgeom.cdf(Math.floor(x), params.N, params.K, params.n);
    };
    let probabilidadFinal = null;
    if (condicion) {
        const { tipo, valorX, valorB } = condicion;
        if (tipo === 'exacta') probabilidadFinal = puntual(valorX);
        else if (tipo === 'menor_igual') probabilidadFinal = acumulada(valorX);
        else if (tipo === 'mayor_igual') probabilidadFinal = modelo === 'Poisson' && valorX > 0 && params.lambda > 0
            ? colaPoisson(valorX, params.lambda) : 1 - acumulada(valorX - 1);
        else if (tipo === 'intervalo') probabilidadFinal = valorB < valorX ? 0 : acumulada(valorB) - acumulada(valorX - 1);
        if (probabilidadFinal !== null) probabilidadFinal = limitarProbabilidad(probabilidadFinal);
    }
    return { probabilidadFinal, esperanza, varianza, desviacion: Math.sqrt(Math.max(0, varianza)) };
};
export const generarDatosGrafico = (modelo, params) => {
    if (modelo === 'Bernoulli') return [{ x: 0, p: 1 - params.p }, { x: 1, p: params.p }];
    let inicio = 0;
    let fin = modelo === 'Binomial' ? params.n : modelo === 'Hipergeometrica'
        ? Math.min(params.K, params.n) : Math.max(10, Math.ceil(params.lambda + 10 * Math.sqrt(params.lambda + 1)));
    if (modelo === 'Hipergeometrica') inicio = Math.max(0, params.n - (params.N - params.K));
    // Evitar crear una cantidad ilimitada de barras al reabrir entradas extremas.
    if (!Number.isSafeInteger(fin) || fin - inicio > 20000) return [];
    const datos = [];
    for (let x = inicio; x <= fin; x++) {
        const p = modelo === 'Binomial' ? puntualBinomial(params.n, params.p, x)
            : modelo === 'Poisson' ? puntualPoisson(params.lambda, x)
                : puntualHipergeometrica(params.N, params.K, params.n, x);
        datos.push({ x, p });
    }
    return datos;
};
// --- Distribución Uniforme Continua ---

// Función de Distribución Acumulada F(x) = P(X <= x)
export const acumuladaUniforme = (a, b, x) => {
    if (x < a) return 0;
    if (x > b) return 1;
    return (x - a) / (b - a);
};

// Función de Densidad de Probabilidad f(x)
export const densidadUniforme = (a, b, x) => {
    if (x >= a && x <= b) return 1 / (b - a);
    return 0;
};

// --- Distribución Normal ---

export const acumuladaNormal = (mu, sigma, x) => {
    return jStat.normal.cdf(x, mu, sigma);
};

export const densidadNormal = (mu, sigma, x) => {
    return jStat.normal.pdf(x, mu, sigma);
};

// --- Distribución Chi-cuadrado ---

export const acumuladaChiCuadrado = (k, x) => {
    if (x <= 0) return 0;
    return jStat.chisquare.cdf(x, k);
};

export const densidadChiCuadrado = (k, x) => {
    if (x <= 0) return 0;
    return jStat.chisquare.pdf(x, k);
};

// --- Distribución F de Fisher ---

export const acumuladaFisher = (v1, v2, x) => {
    if (x <= 0) return 0;
    return jStat.centralF.cdf(x, v1, v2);
};

export const densidadFisher = (v1, v2, x) => {
    if (x <= 0) return 0;
    return jStat.centralF.pdf(x, v1, v2);
};

// --- Distribución T de Student ---

export const acumuladaStudent = (n, x) => {
    return jStat.studentt.cdf(x, n);
};

export const densidadStudent = (n, x) => {
    return jStat.studentt.pdf(x, n);
};

// Función de bisección para encontrar inversas (usada cuando no hay inv directa o para mantener consistencia)
const bisectionInverse = (targetProb, isRightTail, cdfFunc, minRange = -10000, maxRange = 10000) => {
    let low = minRange;
    let high = maxRange;
    const tol = 1e-6;
    let mid = 0;
    
    // Para Uniforme, acotamos los rangos a los parámetros a y b en la llamada.

    for (let i = 0; i < 100; i++) {
        mid = (low + high) / 2;
        let p = cdfFunc(mid);
        if (isRightTail) p = 1 - p;

        if (Math.abs(p - targetProb) < tol) break;
        if (p < targetProb) {
            if (isRightTail) high = mid;
            else low = mid;
        } else {
            if (isRightTail) low = mid;
            else high = mid;
        }
    }
    return mid;
};

// --- Cálculo Principal de Distribución Continua ---
export const calcularDistribucionContinua = (modelo, params, condicion) => {
    let prob = 0;
    let E = 0;
    let V = 0;
    let resultExtra = {}; // Para guardar valores de x calculados (inversas)

    if (modelo === 'Uniforme') {
        const { a, b } = params;
        E = (a + b) / 2;
        V = Math.pow(b - a, 2) / 12;

        if (condicion) {
            const { tipo, valX, valX2, valP, intervals } = condicion;
            const x = Number(valX);
            const x2 = Number(valX2);
            const pInput = Number(valP);

            const cdf = (v) => acumuladaUniforme(a, b, v);

            switch (tipo) {
                case 'menor':
                case 'menor_igual': // compatibilidad
                    prob = cdf(x);
                    break;
                case 'mayor':
                case 'mayor_igual':
                    prob = 1 - cdf(x);
                    break;
                case 'entre':
                case 'intervalo':
                    prob = cdf(Math.max(x, x2)) - cdf(Math.min(x, x2));
                    break;
                case 'exterior':
                    prob = cdf(Math.min(x, x2)) + (1 - cdf(Math.max(x, x2)));
                    break;
                case 'suma_intervalos':
                    if (intervals && intervals.length > 0) {
                        prob = intervals.reduce((acc, intv) => {
                            const minVal = parseFloat(intv.min);
                            const maxVal = parseFloat(intv.max);
                            if (!isNaN(minVal) && !isNaN(maxVal)) {
                                return acc + (cdf(Math.max(minVal, maxVal)) - cdf(Math.min(minVal, maxVal)));
                            }
                            return acc;
                        }, 0);
                    }
                    break;
                case 'inversa_menor':
                    resultExtra.c = bisectionInverse(pInput, false, cdf, a, b);
                    prob = pInput;
                    break;
                case 'inversa_mayor':
                    resultExtra.c = bisectionInverse(pInput, true, cdf, a, b);
                    prob = pInput;
                    break;
                case 'inversa_entre':
                    const tailProbUni = (1 - pInput) / 2;
                    resultExtra.c1 = bisectionInverse(tailProbUni, false, cdf, a, b);
                    resultExtra.c2 = bisectionInverse(tailProbUni, true, cdf, a, b);
                    prob = pInput;
                    break;
                case 'inversa_exterior':
                    const halfPUni = pInput / 2;
                    resultExtra.c1 = bisectionInverse(halfPUni, false, cdf, a, b);
                    resultExtra.c2 = bisectionInverse(halfPUni, true, cdf, a, b);
                    prob = pInput;
                    break;
                default:
                    prob = 0;
            }
        }
    } else if (modelo === 'Normal' || modelo === 'NormalEstandar') {
        const mu = modelo === 'NormalEstandar' ? 0 : params.mu;
        const sigma = modelo === 'NormalEstandar' ? 1 : params.sigma;
        E = mu;
        V = Math.pow(sigma, 2);

        if (condicion) {
            const { tipo, valX, valX2, valP, intervals } = condicion;
            const x = Number(valX);
            const x2 = Number(valX2);
            const pInput = Number(valP);

            const cdf = (v) => acumuladaNormal(mu, sigma, v);

            switch (tipo) {
                case 'menor':
                case 'menor_igual': // compatibilidad
                    prob = cdf(x);
                    break;
                case 'mayor':
                case 'mayor_igual':
                    prob = 1 - cdf(x);
                    break;
                case 'entre':
                case 'intervalo':
                    prob = cdf(Math.max(x, x2)) - cdf(Math.min(x, x2));
                    break;
                case 'exterior':
                    prob = cdf(Math.min(x, x2)) + (1 - cdf(Math.max(x, x2)));
                    break;
                case 'suma_intervalos':
                    if (intervals && intervals.length > 0) {
                        prob = intervals.reduce((acc, intv) => {
                            const minVal = parseFloat(intv.min);
                            const maxVal = parseFloat(intv.max);
                            if (!isNaN(minVal) && !isNaN(maxVal)) {
                                return acc + (cdf(Math.max(minVal, maxVal)) - cdf(Math.min(minVal, maxVal)));
                            }
                            return acc;
                        }, 0);
                    }
                    break;
                case 'inversa_menor':
                    resultExtra.c = jStat.normal.inv(pInput, mu, sigma);
                    prob = pInput;
                    break;
                case 'inversa_mayor':
                    resultExtra.c = jStat.normal.inv(1 - pInput, mu, sigma);
                    prob = pInput;
                    break;
                case 'inversa_entre':
                    const tailProb = (1 - pInput) / 2;
                    resultExtra.c1 = jStat.normal.inv(tailProb, mu, sigma);
                    resultExtra.c2 = jStat.normal.inv(1 - tailProb, mu, sigma);
                    prob = pInput;
                    break;
                case 'inversa_exterior':
                    const halfP = pInput / 2;
                    resultExtra.c1 = jStat.normal.inv(halfP, mu, sigma);
                    resultExtra.c2 = jStat.normal.inv(1 - halfP, mu, sigma);
                    prob = pInput;
                    break;
                default:
                    prob = 0;
            }
        }
    } else if (modelo === 'ChiCuadrado') {
        const { k } = params;
        E = k;
        V = 2 * k;

        if (condicion) {
            const { tipo, valX, valX2, valP, intervals } = condicion;
            const x = Number(valX);
            const x2 = Number(valX2);
            const pInput = Number(valP);

            const cdf = (v) => acumuladaChiCuadrado(k, v);

            switch (tipo) {
                case 'menor':
                case 'menor_igual':
                    prob = cdf(x);
                    break;
                case 'mayor':
                case 'mayor_igual':
                    prob = 1 - cdf(x);
                    break;
                case 'entre':
                case 'intervalo':
                    prob = cdf(Math.max(x, x2)) - cdf(Math.min(x, x2));
                    break;
                case 'exterior':
                    prob = cdf(Math.min(x, x2)) + (1 - cdf(Math.max(x, x2)));
                    break;
                case 'suma_intervalos':
                    if (intervals && intervals.length > 0) {
                        prob = intervals.reduce((acc, intv) => {
                            const minVal = parseFloat(intv.min);
                            const maxVal = parseFloat(intv.max);
                            if (!isNaN(minVal) && !isNaN(maxVal)) {
                                return acc + (cdf(Math.max(minVal, maxVal)) - cdf(Math.min(minVal, maxVal)));
                            }
                            return acc;
                        }, 0);
                    }
                    break;
                case 'inversa_menor':
                    resultExtra.c = jStat.chisquare.inv(pInput, k);
                    prob = pInput;
                    break;
                case 'inversa_mayor':
                    resultExtra.c = jStat.chisquare.inv(1 - pInput, k);
                    prob = pInput;
                    break;
                case 'inversa_entre':
                    const tailProb = (1 - pInput) / 2;
                    resultExtra.c1 = jStat.chisquare.inv(tailProb, k);
                    resultExtra.c2 = jStat.chisquare.inv(1 - tailProb, k);
                    prob = pInput;
                    break;
                case 'inversa_exterior':
                    const halfP = pInput / 2;
                    resultExtra.c1 = jStat.chisquare.inv(halfP, k);
                    resultExtra.c2 = jStat.chisquare.inv(1 - halfP, k);
                    prob = pInput;
                    break;
                default:
                    prob = 0;
            }
        }
    } else if (modelo === 'FFisher') {
        const { v1, v2 } = params;
        
        // E y V matemáticamente están indefinidas para ciertos v2
        E = v2 > 2 ? (v2 / (v2 - 2)) : undefined;
        V = v2 > 4 ? (2 * Math.pow(v2, 2) * (v1 + v2 - 2)) / (v1 * Math.pow(v2 - 2, 2) * (v2 - 4)) : undefined;

        if (condicion) {
            const { tipo, valX, valX2, valP, intervals } = condicion;
            const x = Number(valX);
            const x2 = Number(valX2);
            const pInput = Number(valP);

            const cdf = (v) => acumuladaFisher(v1, v2, v);

            switch (tipo) {
                case 'menor':
                case 'menor_igual':
                    prob = cdf(x);
                    break;
                case 'mayor':
                case 'mayor_igual':
                    prob = 1 - cdf(x);
                    break;
                case 'entre':
                case 'intervalo':
                    prob = cdf(Math.max(x, x2)) - cdf(Math.min(x, x2));
                    break;
                case 'exterior':
                    prob = cdf(Math.min(x, x2)) + (1 - cdf(Math.max(x, x2)));
                    break;
                case 'suma_intervalos':
                    if (intervals && intervals.length > 0) {
                        prob = intervals.reduce((acc, intv) => {
                            const minVal = parseFloat(intv.min);
                            const maxVal = parseFloat(intv.max);
                            if (!isNaN(minVal) && !isNaN(maxVal)) {
                                return acc + (cdf(Math.max(minVal, maxVal)) - cdf(Math.min(minVal, maxVal)));
                            }
                            return acc;
                        }, 0);
                    }
                    break;
                case 'inversa_menor':
                    resultExtra.c = jStat.centralF.inv(pInput, v1, v2);
                    prob = pInput;
                    break;
                case 'inversa_mayor':
                    resultExtra.c = jStat.centralF.inv(1 - pInput, v1, v2);
                    prob = pInput;
                    break;
                case 'inversa_entre':
                    const tailProb = (1 - pInput) / 2;
                    resultExtra.c1 = jStat.centralF.inv(tailProb, v1, v2);
                    resultExtra.c2 = jStat.centralF.inv(1 - tailProb, v1, v2);
                    prob = pInput;
                    break;
                case 'inversa_exterior':
                    const halfP = pInput / 2;
                    resultExtra.c1 = jStat.centralF.inv(halfP, v1, v2);
                    resultExtra.c2 = jStat.centralF.inv(1 - halfP, v1, v2);
                    prob = pInput;
                    break;
                default:
                    prob = 0;
            }
        }
    } else if (modelo === 'TStudent') {
        const { n } = params;
        
        E = n > 1 ? 0 : undefined;
        V = n > 2 ? (n / (n - 2)) : undefined;

        if (condicion) {
            const { tipo, valX, valX2, valP, intervals } = condicion;
            const x = Number(valX);
            const x2 = Number(valX2);
            const pInput = Number(valP);

            const cdf = (v) => acumuladaStudent(n, v);

            switch (tipo) {
                case 'menor':
                case 'menor_igual':
                    prob = cdf(x);
                    break;
                case 'mayor':
                case 'mayor_igual':
                    prob = 1 - cdf(x);
                    break;
                case 'entre':
                case 'intervalo':
                    prob = cdf(Math.max(x, x2)) - cdf(Math.min(x, x2));
                    break;
                case 'exterior':
                    prob = cdf(Math.min(x, x2)) + (1 - cdf(Math.max(x, x2)));
                    break;
                case 'suma_intervalos':
                    if (intervals && intervals.length > 0) {
                        prob = intervals.reduce((acc, intv) => {
                            const minVal = parseFloat(intv.min);
                            const maxVal = parseFloat(intv.max);
                            if (!isNaN(minVal) && !isNaN(maxVal)) {
                                return acc + (cdf(Math.max(minVal, maxVal)) - cdf(Math.min(minVal, maxVal)));
                            }
                            return acc;
                        }, 0);
                    }
                    break;
                case 'inversa_menor':
                    resultExtra.c = jStat.studentt.inv(pInput, n);
                    prob = pInput;
                    break;
                case 'inversa_mayor':
                    resultExtra.c = jStat.studentt.inv(1 - pInput, n);
                    prob = pInput;
                    break;
                case 'inversa_entre': {
                    const tailProb = (1 - pInput) / 2;
                    resultExtra.c1 = jStat.studentt.inv(tailProb, n);
                    resultExtra.c2 = jStat.studentt.inv(1 - tailProb, n);
                    prob = pInput;
                    break;
                }
                case 'inversa_exterior': {
                    const halfP = pInput / 2;
                    resultExtra.c1 = jStat.studentt.inv(halfP, n);
                    resultExtra.c2 = jStat.studentt.inv(1 - halfP, n);
                    prob = pInput;
                    break;
                }
                default:
                    prob = 0;
            }
        }
    }
    return {
        probabilidadFinal: condicion ? prob : null,
        esperanza: E,
        varianza: V,
        ...resultExtra
    };
};

export const generarDatosGraficoContinua = (modelo, params, condicion, resultados = {}) => {
    const datos = [];
    const puntos = 100; // Resolución del gráfico

    const isInsideCondition = (x) => {
        if (!condicion || !condicion.tipo) return false;
        const tipo = condicion.tipo;
        
        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            return x <= Number(condicion.valX ?? condicion.valorX);
        } else if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            return x >= Number(condicion.valX ?? condicion.valorX);
        } else if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            const v1 = Number(condicion.valX ?? condicion.valorX);
            const v2 = Number(condicion.valX2 ?? condicion.valorB);
            return x >= Math.min(v1, v2) && x <= Math.max(v1, v2);
        } else if (tipo === 'exterior') {
            const v1 = Number(condicion.valX);
            const v2 = Number(condicion.valX2);
            return x <= Math.min(v1, v2) || x >= Math.max(v1, v2);
        } else if (tipo === 'suma_intervalos') {
            if (!condicion.intervals) return false;
            return condicion.intervals.some(intv => {
                const min = parseFloat(intv.min);
                const max = parseFloat(intv.max);
                if (isNaN(min) || isNaN(max)) return false;
                return x >= Math.min(min, max) && x <= Math.max(min, max);
            });
        } else if (tipo === 'inversa_menor') {
            return x <= (resultados.c ?? 0);
        } else if (tipo === 'inversa_mayor') {
            return x >= (resultados.c ?? 0);
        } else if (tipo === 'inversa_entre') {
            return x >= (resultados.c1 ?? 0) && x <= (resultados.c2 ?? 0);
        } else if (tipo === 'inversa_exterior') {
            return x <= (resultados.c1 ?? 0) || x >= (resultados.c2 ?? 0);
        }
        return false;
    };

    if (modelo === 'Uniforme') {
        const { a, b } = params;
        const rango = b - a;
        const padding = rango * 0.2; // Mostrar 20% más allá de a y b
        const inicio = a - padding;
        const fin = b + padding;
        const step = (fin - inicio) / puntos;

        const agregarPunto = (x) => {
            const y = densidadUniforme(a, b, x);
            let fillY = null;
            if (y > 0 && isInsideCondition(x)) {
                fillY = y;
            }
            datos.push({ x, y, fillY });
        };

        for (let i = 0; i <= puntos; i++) {
            agregarPunto(inicio + i * step);
        }
        
        // Puntos exactos en a y b para que la línea caiga recta
        datos.push({ x: a - 0.0001, y: 0, fillY: 0 });
        datos.push({ x: a, y: 1 / (b - a), fillY: isInsideCondition(a) ? 1 / (b - a) : null });
        datos.push({ x: b, y: 1 / (b - a), fillY: isInsideCondition(b) ? 1 / (b - a) : null });
        datos.push({ x: b + 0.0001, y: 0, fillY: 0 });

        // Inyectar puntos frontera exactos para eliminar huecos visuales
        const inyectarFrontera = (frontera) => {
            if (frontera === undefined || isNaN(frontera)) return;
            agregarPunto(frontera - 0.00001);
            agregarPunto(frontera);
            agregarPunto(frontera + 0.00001);
        };

        if (condicion) {
            if (condicion.valX !== undefined) inyectarFrontera(Number(condicion.valX));
            if (condicion.valorX !== undefined) inyectarFrontera(Number(condicion.valorX));
            if (condicion.valX2 !== undefined) inyectarFrontera(Number(condicion.valX2));
            if (condicion.valorB !== undefined) inyectarFrontera(Number(condicion.valorB));
            if (resultados && resultados.c !== undefined) inyectarFrontera(resultados.c);
            if (resultados && resultados.c1 !== undefined) inyectarFrontera(resultados.c1);
            if (resultados && resultados.c2 !== undefined) inyectarFrontera(resultados.c2);
            if (condicion.intervals) {
                condicion.intervals.forEach(intv => {
                    inyectarFrontera(parseFloat(intv.min));
                    inyectarFrontera(parseFloat(intv.max));
                });
            }
        }

        // Ordenar datos por x
        datos.sort((p1, p2) => p1.x - p2.x);
    } else if (modelo === 'Normal' || modelo === 'NormalEstandar') {
        const mu = modelo === 'NormalEstandar' ? 0 : params.mu;
        const sigma = modelo === 'NormalEstandar' ? 1 : params.sigma;
        const desviaciones = 4; 
        const inicio = mu - desviaciones * sigma;
        const fin = mu + desviaciones * sigma;
        const puntosAumentados = 200; // Mayor resolución para la curva suave
        const step = (fin - inicio) / puntosAumentados;

        const agregarPunto = (x) => {
            const y = densidadNormal(mu, sigma, x);
            let fillY = null;
            if (y > 0 && isInsideCondition(x)) {
                fillY = y;
            }
            datos.push({ x, y, fillY });
        };

        // 1. Puntos regulares de la curva
        for (let i = 0; i <= puntosAumentados; i++) {
            agregarPunto(inicio + i * step);
        }

        // 2. Inyectar puntos frontera exactos para eliminar huecos visuales
        const inyectarFrontera = (frontera) => {
            if (frontera === undefined || isNaN(frontera)) return;
            // Inyectamos el punto exacto y deltas microscópicos para cortes perfectos del área
            agregarPunto(frontera - 0.00001);
            agregarPunto(frontera);
            agregarPunto(frontera + 0.00001);
        };

        if (condicion) {
            if (condicion.valX !== undefined) inyectarFrontera(Number(condicion.valX));
            if (condicion.valorX !== undefined) inyectarFrontera(Number(condicion.valorX));
            if (condicion.valX2 !== undefined) inyectarFrontera(Number(condicion.valX2));
            if (condicion.valorB !== undefined) inyectarFrontera(Number(condicion.valorB));
            if (resultados && resultados.c !== undefined) inyectarFrontera(resultados.c);
            if (resultados && resultados.c1 !== undefined) inyectarFrontera(resultados.c1);
            if (resultados && resultados.c2 !== undefined) inyectarFrontera(resultados.c2);
            if (condicion.intervals) {
                condicion.intervals.forEach(intv => {
                    inyectarFrontera(parseFloat(intv.min));
                    inyectarFrontera(parseFloat(intv.max));
                });
            }
        }

        // Ordenar datos por x para que Recharts dibuje el path de izquierda a derecha correctamente
        datos.sort((p1, p2) => p1.x - p2.x);
    } else if (modelo === 'ChiCuadrado') {
        const { k } = params;
        const inicio = 0;
        // La cola derecha de chi-cuadrado puede ser larga. Encontramos el valor donde cdf = 0.999
        let fin = jStat.chisquare.inv(0.999, k);
        // Si el valor máximo es muy pequeño (ej. k=1), damos un poco más de margen
        if (fin < 10) fin = 10;
        
        const puntosAumentados = 200;
        const step = (fin - inicio) / puntosAumentados;

        const agregarPunto = (x) => {
            const y = densidadChiCuadrado(k, x);
            let fillY = null;
            if (y > 0 && isInsideCondition(x)) {
                fillY = y;
            }
            // Para x muy cercano a 0 con k=1, la PDF tiende a infinito. Lo limitamos visualmente
            const cappedY = y > 2 ? 2 : y;
            datos.push({ x, y: cappedY, fillY: fillY !== null ? (fillY > 2 ? 2 : fillY) : null });
        };

        // 1. Puntos regulares de la curva
        // Si k=1, evitamos evaluar exactamente en 0 para no tener infinito
        for (let i = 0; i <= puntosAumentados; i++) {
            let x = inicio + i * step;
            if (x === 0 && k === 1) x = 0.001; 
            agregarPunto(x);
        }

        // 2. Inyectar puntos frontera exactos
        const inyectarFrontera = (frontera) => {
            if (frontera === undefined || isNaN(frontera) || frontera < 0) return;
            agregarPunto(Math.max(0.001, frontera - 0.00001));
            agregarPunto(frontera);
            agregarPunto(frontera + 0.00001);
        };

        if (condicion) {
            if (condicion.valX !== undefined) inyectarFrontera(Number(condicion.valX));
            if (condicion.valorX !== undefined) inyectarFrontera(Number(condicion.valorX));
            if (condicion.valX2 !== undefined) inyectarFrontera(Number(condicion.valX2));
            if (condicion.valorB !== undefined) inyectarFrontera(Number(condicion.valorB));
            if (resultados && resultados.c !== undefined) inyectarFrontera(resultados.c);
            if (resultados && resultados.c1 !== undefined) inyectarFrontera(resultados.c1);
            if (resultados && resultados.c2 !== undefined) inyectarFrontera(resultados.c2);
            if (condicion.intervals) {
                condicion.intervals.forEach(intv => {
                    inyectarFrontera(parseFloat(intv.min));
                    inyectarFrontera(parseFloat(intv.max));
                });
            }
        }

        // Ordenar datos por x
        datos.sort((p1, p2) => p1.x - p2.x);
    } else if (modelo === 'FFisher') {
        const { v1, v2 } = params;
        const inicio = 0;
        // La cola de Fisher puede ser extremadamente larga. Usamos el 99% para escalar.
        let fin = jStat.centralF.inv(0.99, v1, v2);
        if (fin < 5) fin = 5;
        if (fin > 30) fin = 30; // Evitar gráficos ridículamente largos
        
        const puntosAumentados = 200;
        const step = (fin - inicio) / puntosAumentados;

        const agregarPunto = (x) => {
            const y = densidadFisher(v1, v2, x);
            let fillY = null;
            if (y > 0 && isInsideCondition(x)) {
                fillY = y;
            }
            // Limitar valores visualmente por si tiende a infinito en x=0 (e.g. v1=1)
            const cappedY = y > 3 ? 3 : y;
            datos.push({ x, y: cappedY, fillY: fillY !== null ? (fillY > 3 ? 3 : fillY) : null });
        };

        for (let i = 0; i <= puntosAumentados; i++) {
            let x = inicio + i * step;
            if (x === 0 && v1 <= 2) x = 0.001; 
            agregarPunto(x);
        }

        const inyectarFrontera = (frontera) => {
            if (frontera === undefined || isNaN(frontera) || frontera < 0) return;
            agregarPunto(Math.max(0.001, frontera - 0.00001));
            agregarPunto(frontera);
            agregarPunto(frontera + 0.00001);
        };

        if (condicion) {
            if (condicion.valX !== undefined) inyectarFrontera(Number(condicion.valX));
            if (condicion.valorX !== undefined) inyectarFrontera(Number(condicion.valorX));
            if (condicion.valX2 !== undefined) inyectarFrontera(Number(condicion.valX2));
            if (condicion.valorB !== undefined) inyectarFrontera(Number(condicion.valorB));
            if (resultados && resultados.c !== undefined) inyectarFrontera(resultados.c);
            if (resultados && resultados.c1 !== undefined) inyectarFrontera(resultados.c1);
            if (resultados && resultados.c2 !== undefined) inyectarFrontera(resultados.c2);
            if (condicion.intervals) {
                condicion.intervals.forEach(intv => {
                    inyectarFrontera(parseFloat(intv.min));
                    inyectarFrontera(parseFloat(intv.max));
                });
            }
        }

        datos.sort((p1, p2) => p1.x - p2.x);
    } else if (modelo === 'TStudent') {
        const { n } = params;
        
        let desviaciones = 4;
        let sigma = Math.sqrt(n / (n - 2));
        if (n <= 2) {
            sigma = 2; // Arbitrario para mostrar la campana cuando varianza es indefinida
        }

        const inicio = -desviaciones * sigma;
        const fin = desviaciones * sigma;
        const puntosAumentados = 200;
        const step = (fin - inicio) / puntosAumentados;

        const agregarPunto = (x) => {
            const y = densidadStudent(n, x);
            let fillY = null;
            if (y > 0 && isInsideCondition(x)) {
                fillY = y;
            }
            datos.push({ x, y, fillY });
        };

        for (let i = 0; i <= puntosAumentados; i++) {
            agregarPunto(inicio + i * step);
        }

        const inyectarFrontera = (frontera) => {
            if (frontera === undefined || isNaN(frontera)) return;
            agregarPunto(frontera - 0.00001);
            agregarPunto(frontera);
            agregarPunto(frontera + 0.00001);
        };

        if (condicion) {
            if (condicion.valX !== undefined) inyectarFrontera(Number(condicion.valX));
            if (condicion.valorX !== undefined) inyectarFrontera(Number(condicion.valorX));
            if (condicion.valX2 !== undefined) inyectarFrontera(Number(condicion.valX2));
            if (condicion.valorB !== undefined) inyectarFrontera(Number(condicion.valorB));
            if (resultados && resultados.c !== undefined) inyectarFrontera(resultados.c);
            if (resultados && resultados.c1 !== undefined) inyectarFrontera(resultados.c1);
            if (resultados && resultados.c2 !== undefined) inyectarFrontera(resultados.c2);
            if (condicion.intervals) {
                condicion.intervals.forEach(intv => {
                    inyectarFrontera(parseFloat(intv.min));
                    inyectarFrontera(parseFloat(intv.max));
                });
            }
        }

        datos.sort((p1, p2) => p1.x - p2.x);
    }

    return datos;
};

// Desarrollo de las probabilidades de distribuciones discretas.
const numero = valor => formatearParametroDiscreto(valor).replace(/e([+-]?\d+)/i, '\\times 10^{$1}');

export function desarrollarProbabilidadDiscreta(modelo, params, condicion, probabilidad) {
    if (!params || !condicion?.tipo || !Number.isFinite(probabilidad)) return null;
    const p = numero(params.p);
    const n = numero(params.n);
    const lambda = numero(params.lambda);
    const N = numero(params.N);
    const K = numero(params.K);
    const distribuciones = {
        Bernoulli: {
            formula: 'P(X=x)=p^x(1-p)^{1-x}',
            sustituir: x => `(${p})^{${x}}(1-${p})^{1-${x}}`,
            puntual: x => x === 0 ? 1 - params.p : x === 1 ? params.p : 0,
            minimo: 0, maximo: 1
        },
        Binomial: {
            formula: 'P(X=x)=\\binom{n}{x}p^x(1-p)^{n-x}',
            sustituir: x => `\\binom{${n}}{${x}}(${p})^{${x}}(1-${p})^{${n}-${x}}`,
            puntual: x => puntualBinomial(params.n, params.p, x),
            minimo: 0, maximo: params.n
        },
        Poisson: {
            formula: 'P(X=x)=\\frac{e^{-\\lambda}\\lambda^x}{x!}',
            sustituir: x => `\\frac{e^{-${lambda}}(${lambda})^{${x}}}{${x}!}`,
            puntual: x => puntualPoisson(params.lambda, x),
            minimo: 0, maximo: Infinity
        },
        Hipergeometrica: {
            formula: 'P(X=x)=\\frac{\\binom{K}{x}\\binom{N-K}{n-x}}{\\binom{N}{n}}',
            sustituir: x => `\\frac{\\binom{${K}}{${x}}\\binom{${N}-${K}}{${n}-${x}}}{\\binom{${N}}{${n}}}`,
            puntual: x => puntualHipergeometrica(params.N, params.K, params.n, x),
            minimo: Math.max(0, params.n - (params.N - params.K)), maximo: Math.min(params.K, params.n)
        }
    };
    const distribucion = distribuciones[modelo];
    if (!distribucion) return null;
    const { tipo, valorX: x, valorB: b } = condicion;
    if (!Number.isInteger(x) || (tipo.includes('intervalo') && !Number.isInteger(b))) return null;
    const expresiones = {
        exacta: `P(X=${x})`, menor_igual: `P(X\\leq ${x})`, mayor_igual: `P(X\\geq ${x})`,
        menor_estricto: `P(X<${x})`, mayor_estricto: `P(X>${x})`,
        intervalo: `P(${x}\\leq X\\leq ${b})`, intervalo_estricto: `P(${x}<X<${b})`
    };
    const objetivo = expresiones[tipo];
    if (!objetivo) return null;
    const complemento = tipo === 'mayor_igual' || tipo === 'mayor_estricto';
    let inicio = 0;
    let fin = x;
    if (tipo === 'exacta') inicio = x;
    if (tipo === 'menor_estricto' || tipo === 'mayor_igual') fin = x - 1;
    if (tipo === 'intervalo' || tipo === 'intervalo_estricto') {
        inicio = tipo === 'intervalo' ? x : x + 1;
        fin = tipo === 'intervalo' ? b : b - 1;
    }
    const cantidad = Math.max(0, fin - inicio + 1);
    const sustituir = valor => Number.isInteger(valor) && (valor < distribucion.minimo || valor > distribucion.maximo)
        ? '0' : distribucion.sustituir(valor);
    const sumatoria = contenido => cantidad === 0 ? '0' : `\\sum_{x=${inicio}}^{${fin}}${contenido}`;
    const condicionEquivalente = {
        menor_estricto: `P(X\\leq ${fin})`,
        mayor_igual: `1-P(X\\leq ${fin})`,
        mayor_estricto: `1-P(X\\leq ${fin})`,
        intervalo_estricto: `P(${inicio}\\leq X\\leq ${fin})`
    }[tipo];
    const planteamiento = tipo === 'exacta' ? objetivo
        : `${objetivo}=${complemento ? '1-' : ''}${sumatoria('P(X=x)')}`;
    const sustitucion = `${objetivo}=${complemento ? '1-' : ''}${tipo === 'exacta' ? sustituir(x) : sumatoria(distribucion.sustituir('x'))}`;
    // Los intervalos extensos conservan su sumatoria completa y muestran
    // los extremos del desglose, evitando miles de tarjetas en la página.
    const abreviado = cantidad > 12;
    const valores = abreviado
        ? [...Array.from({ length: 3 }, (_, i) => inicio + i), ...Array.from({ length: 3 }, (_, i) => fin - 2 + i)]
        : Array.from({ length: cantidad }, (_, i) => inicio + i);
    return {
        formula: distribucion.formula, objetivo, complemento, planteamiento, sustitucion,
        equivalente: condicionEquivalente ? `${objetivo}=${condicionEquivalente}` : null,
        cantidad, abreviado,
        terminos: valores.map(valor => ({ x: valor, formula: sustituir(valor), probabilidad: distribucion.puntual(valor) }))
    };
}

// Fórmulas y desarrollo de las distribuciones continuas para los reportes PDF.
export const numeroContinuo = valor => {
    if (valor === Infinity) return '\\infty';
    if (valor === -Infinity) return '-\\infty';
    if (!Number.isFinite(valor)) return '\\text{No definida}';
    return String(valor).replace(/e([+-]?\d+)/i, '\\times 10^{$1}');
};

export const decimalContinuo = valor => Number.isFinite(valor)
    ? valor.toFixed(valor !== 0 && Math.abs(valor) < 0.001 ? Math.min(10, Math.max(4, -Math.floor(Math.log10(Math.abs(valor))) + 1)) : 4)
    : numeroContinuo(valor);

export function modeloContinuoPDF(modelo, parametros) {
    const params = modelo === 'NormalEstandar' ? { mu: 0, sigma: 1 } : parametros;
    const { a, b, mu, sigma, k, v1, v2, n } = params;
    const t = numeroContinuo;
    const modelos = {
        Uniforme: {
            nombre: 'Uniforme', variable: 'X', acumulada: 'F_X',
            densidad: `f(x)=\\frac{1}{b-a}\\quad\\implies\\quad\\frac{1}{${b < 0 ? `(${t(b)})` : t(b)}-${a < 0 ? `(${t(a)})` : t(a)}}`,
            esperanza: '\\frac{a+b}{2}', esperanzaValores: `\\frac{${t(a)}+(${t(b)})}{2}`,
            varianza: '\\frac{(b-a)^2}{12}', varianzaValores: `\\frac{(${t(b)}-(${t(a)}))^2}{12}`,
            cdf: x => acumuladaUniforme(a, b, x)
        },
        Normal: {
            nombre: 'Normal', variable: 'X', acumulada: 'F_X', soporte: '-\\infty<x<\\infty',
            densidad: 'f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
            esperanza: '\\mu', esperanzaValores: t(mu), varianza: '\\sigma^2', varianzaValores: `(${t(sigma)})^2`,
            cdf: x => acumuladaNormal(mu, sigma, x)
        },
        NormalEstandar: {
            nombre: 'Normal Estándar', variable: 'Z', acumulada: '\\Phi', soporte: '-\\infty<z<\\infty',
            densidad: '\\phi(z)=\\frac{1}{\\sqrt{2\\pi}}e^{-z^2/2}',
            esperanza: '0', esperanzaValores: '0', varianza: '1', varianzaValores: '1',
            cdf: x => acumuladaNormal(0, 1, x)
        },
        ChiCuadrado: {
            nombre: 'Chi-cuadrada', variable: '\\chi^2', acumulada: `F_{\\chi^2_{${t(k)}}}`, soporte: 'x>0',
            densidad: 'f(x)=\\frac{x^{k/2-1}e^{-x/2}}{2^{k/2}\\Gamma(k/2)}',
            esperanza: 'k', esperanzaValores: t(k), varianza: '2k', varianzaValores: `2(${t(k)})`,
            cdf: x => acumuladaChiCuadrado(k, x)
        },
        FFisher: {
            nombre: 'F de Fisher', variable: 'F', acumulada: `G_{${t(v1)},${t(v2)}}`, soporte: 'x>0',
            densidad: 'f(x)=\\frac{(v_1/v_2)^{v_1/2}x^{v_1/2-1}}{\\mathrm{B}(v_1/2,v_2/2)(1+v_1x/v_2)^{(v_1+v_2)/2}}',
            esperanza: '\\frac{v_2}{v_2-2}', esperanzaValores: v2 > 2 ? `\\frac{${t(v2)}}{${t(v2)}-2}` : '\\text{No definida}',
            varianza: '\\frac{2v_2^2(v_1+v_2-2)}{v_1(v_2-2)^2(v_2-4)}',
            varianzaValores: v2 > 4 ? `\\frac{2(${t(v2)})^2(${t(v1)}+${t(v2)}-2)}{${t(v1)}(${t(v2)}-2)^2(${t(v2)}-4)}` : '\\text{No definida}',
            restriccionEsperanza: 'v_2>2', restriccionVarianza: 'v_2>4',
            cdf: x => acumuladaFisher(v1, v2, x)
        },
        TStudent: {
            nombre: 't de Student', variable: 'T', acumulada: `F_{t_{${t(n)}}}`, soporte: '-\\infty<t<\\infty',
            densidad: 'f(t)=\\frac{\\Gamma((\\nu+1)/2)}{\\sqrt{\\nu\\pi}\\Gamma(\\nu/2)}\\left(1+\\frac{t^2}{\\nu}\\right)^{-(\\nu+1)/2}',
            esperanza: '0', esperanzaValores: n > 1 ? '0' : '\\text{No definida}',
            varianza: '\\frac{\\nu}{\\nu-2}', varianzaValores: n > 2 ? `\\frac{${t(n)}}{${t(n)}-2}` : '\\text{No definida}',
            restriccionEsperanza: '\\nu>1', restriccionVarianza: '\\nu>2',
            cdf: x => acumuladaStudent(n, x)
        }
    };
    const config = modelos[modelo];
    if (!config) return null;
    return {
        ...config, params,
        evaluar: x => x === -Infinity ? 0 : x === Infinity ? 1 : config.cdf(x)
    };
}

export function desarrolloContinuoPDF(modelo, parametros, condicion, resultados = {}) {
    const config = modeloContinuoPDF(modelo, parametros);
    if (!config || !condicion?.tipo || !Number.isFinite(resultados.probabilidadFinal)) return null;
    const { tipo } = condicion;
    const { variable: Y, acumulada: C, params, evaluar } = config;
    const t = numeroContinuo;
    const d = decimalContinuo;
    const probabilidad = resultados.probabilidadFinal;
    const inversa = tipo.startsWith('inversa_');
    const filas = [];
    const regiones = [];
    const cuantiles = [];
    const normal = modelo === 'Normal' || modelo === 'NormalEstandar';
    let objetivo;
    if (inversa) {
        const p = Number(condicion.valP);
        const doble = tipo === 'inversa_entre' || tipo === 'inversa_exterior';
        if (tipo === 'inversa_menor') objetivo = `P(${Y}\\leq c)=${t(p)}`;
        else if (tipo === 'inversa_mayor') objetivo = `P(${Y}\\geq c)=${t(p)}`;
        else if (tipo === 'inversa_entre') objetivo = `P(c_1\\leq ${Y}\\leq c_2)=${t(p)}`;
        else objetivo = `P(${Y}\\leq c_1)+P(${Y}\\geq c_2)=${t(p)}`;
        const q = doble
            ? tipo === 'inversa_entre' ? [(1 - p) / 2, 1 - (1 - p) / 2] : [p / 2, 1 - p / 2]
            : [tipo === 'inversa_mayor' ? 1 - p : p];
        if (doble) filas.push(`q_1= ${tipo === 'inversa_entre' ? '\\frac{1-p}{2}' : '\\frac{p}{2}'}=${d(q[0])},\\qquad q_2=1-q_1=${d(q[1])}`);
        else filas.push(`${C}(c)=${tipo === 'inversa_mayor' ? `1-${t(p)}` : t(p)}=${d(q[0])}`);
        q.forEach((objetivoCDF, i) => {
            const c = doble ? i === 0 ? resultados.c1 : resultados.c2 : resultados.c;
            const etiqueta = doble ? `c_${i + 1}` : modelo === 'NormalEstandar' ? 'z' : 'c';
            if (!Number.isFinite(c)) return;
            if (normal) {
                const z = (c - params.mu) / params.sigma;
                filas.push(`${doble ? `z_${i + 1}` : 'z'}=\\Phi^{-1}(${d(objetivoCDF)})=${d(z)}`);
                if (modelo === 'Normal') filas.push(`${etiqueta}=\\mu+\\sigma z=${t(params.mu)}+(${t(params.sigma)})(${d(z)})=${d(c)}`);
                else filas.push(`${etiqueta}=${d(c)}`);
            } else if (modelo === 'Uniforme') {
                filas.push(`${etiqueta}=a+q(b-a)=${t(params.a)}+${d(objetivoCDF)}(${t(params.b)}-(${t(params.a)}))=${d(c)}`);
            } else filas.push(`${etiqueta}=${C}^{-1}(${d(objetivoCDF)})=${d(c)}`);
            cuantiles.push({ etiqueta, q: objetivoCDF, valor: c, acumulada: evaluar(c) });
        });
    } else {
        const x = Number(condicion.valX ?? condicion.valorX);
        const x2 = Number(condicion.valX2 ?? condicion.valorB);
        const izquierda = ['menor', 'menor_igual', 'menor_estricto'].includes(tipo);
        const derecha = ['mayor', 'mayor_igual', 'mayor_estricto'].includes(tipo);
        const intervalo = ['entre', 'intervalo', 'intervalo_estricto'].includes(tipo);
        if (izquierda || derecha) {
            objetivo = `P(${Y}${izquierda ? '\\leq' : '\\geq'}${t(x)})`;
            regiones.push({ inferior: izquierda ? -Infinity : x, superior: izquierda ? x : Infinity });
            filas.push(`${objetivo}=${derecha ? '1-' : ''}${C}(${t(x)})`);
        } else if (intervalo || tipo === 'exterior') {
            const a = Math.min(x, x2), b = Math.max(x, x2);
            objetivo = intervalo ? `P(${t(a)}\\leq ${Y}\\leq ${t(b)})` : `P(${Y}\\leq ${t(a)})+P(${Y}\\geq ${t(b)})`;
            if (intervalo) regiones.push({ inferior: a, superior: b });
            else regiones.push({ inferior: -Infinity, superior: a }, { inferior: b, superior: Infinity });
            filas.push(`${objetivo}=${intervalo ? `${C}(${t(b)})-${C}(${t(a)})` : `${C}(${t(a)})+1-${C}(${t(b)})`}`);
        } else if (tipo === 'suma_intervalos') {
            (condicion.intervals || []).forEach(intervalo => {
                if (intervalo.min === '' || intervalo.max === '') return;
                const a = Number(intervalo.min), b = Number(intervalo.max);
                if (Number.isFinite(a) && Number.isFinite(b)) regiones.push({ inferior: Math.min(a, b), superior: Math.max(a, b) });
            });
            objetivo = `\\sum_{j=1}^{${regiones.length}}P(a_j\\leq ${Y}\\leq b_j)`;
            filas.push(`${objetivo}=\\sum_{j=1}^{${regiones.length}}\\left[${C}(b_j)-${C}(a_j)\\right]`);
        } else return null;
        // Las áreas se evalúan dentro del soporte real de la distribución.
        const limiteInferior = modelo === 'Uniforme' ? params.a : ['ChiCuadrado', 'FFisher'].includes(modelo) ? 0 : -Infinity;
        const limiteSuperior = modelo === 'Uniforme' ? params.b : Infinity;
        const acotar = valor => Math.max(limiteInferior, Math.min(limiteSuperior, valor));
        regiones.forEach(region => {
            region.inferior = acotar(region.inferior);
            region.superior = acotar(region.superior);
        });
        const extremos = [...new Set(regiones.flatMap(r => [r.inferior, r.superior]).filter(Number.isFinite))];
        if (normal) extremos.forEach((valor, i) => {
            const z = (valor - params.mu) / params.sigma;
            if (modelo === 'Normal') filas.push(`z_${i + 1}=\\frac{x_${i + 1}-\\mu}{\\sigma}=\\frac{${t(valor)}-(${t(params.mu)})}{${t(params.sigma)}}=${d(z)}`);
            filas.push(`${C}(${t(valor)})=\\Phi(${d(z)})=${d(evaluar(valor))}`);
        });
        if (modelo === 'Uniforme') extremos.forEach(valor => {
            const calculo = valor <= params.a ? '0' : valor >= params.b ? '1' : `\\frac{${t(valor)}-(${t(params.a)})}{${t(params.b)}-(${t(params.a)})}`;
            filas.push(`${C}(${t(valor)})=${calculo}=${d(evaluar(valor))}`);
        });
        regiones.forEach((region, i) => {
            region.cdfInferior = evaluar(region.inferior);
            region.cdfSuperior = evaluar(region.superior);
            region.probabilidad = region.cdfSuperior - region.cdfInferior;
            filas.push(`P_${i + 1}=${d(region.cdfSuperior)}-${d(region.cdfInferior)}=${d(region.probabilidad)}`);
        });
        if (regiones.length > 1) {
            for (let inicio = 0; inicio < regiones.length; inicio += 3) {
                const suma = regiones.slice(inicio, inicio + 3).map(r => d(r.probabilidad)).join('+');
                filas.push(`${inicio === 0 ? '\\sum_j P_j=' : '\\phantom{\\sum_j P_j=}+'}${suma}`);
            }
            filas.push(`\\sum_j P_j=${d(probabilidad)}`);
        }
        filas.push(`${objetivo}=\\mathbf{${d(probabilidad)}}`);
    }
    return { config, objetivo, inversa, filas, regiones, cuantiles, probabilidad };
}
