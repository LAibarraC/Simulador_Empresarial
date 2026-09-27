import { jStat } from 'jstat';

/**
 * Calcula la estimación puntual a partir de un arreglo de datos numéricos o booleanos (matriz)
 * @param {Array} datos - Arreglo de valores
 * @param {string} parametro - 'media', 'proporcion', 'varianza'
 * @param {any} valorExito - Valor considerado "éxito" o "favorable" para proporción
 */
export const calcularEstimacionPuntualMatriz = (datos, parametro, valorExito = null) => {
    if (!datos || datos.length === 0) return { error: 'No hay datos suficientes.' };
    const n = datos.length;

    if (parametro === 'media') {
        const numDatos = datos.map(Number).filter(d => !isNaN(d));
        if (numDatos.length === 0) return { error: 'No hay datos numéricos válidos.' };
        const media = jStat.mean(numDatos);
        const varianza = numDatos.length > 1 ? jStat.variance(numDatos, true) : 0;
        return {
            n,
            estimacion: media,
            simbolo: '\\hat{\\mu} = \\bar{X}',
            calculos: { suma: jStat.sum(numDatos), media, desviacion: Math.sqrt(varianza), numDatos }
        };
    }

    if (parametro === 'proporcion') {
        if (valorExito === null || valorExito === '') return { error: 'Debe especificar el valor favorable.' };
        const x = datos.filter(d => String(d).trim() === String(valorExito).trim()).length;
        const p_hat = x / n;
        return {
            n,
            estimacion: p_hat,
            simbolo: '\\hat{p}',
            calculos: { x, p_hat }
        };
    }

    if (parametro === 'varianza') {
        const numDatos = datos.map(Number).filter(d => !isNaN(d));
        if (numDatos.length < 2) return { error: 'Se requieren al menos 2 datos numéricos para calcular la varianza.' };
        const varianza = jStat.variance(numDatos, true); // true = sample variance
        const media = jStat.mean(numDatos);
        return {
            n,
            estimacion: varianza,
            simbolo: '\\hat{\\sigma}^2 = S^2',
            calculos: { media, varianza, desviacion: Math.sqrt(varianza) }
        };
    }

    return { error: 'Parámetro no soportado.' };
};

/**
 * Calcula la estimación puntual a partir de datos ingresados manualmente
 * @param {Object} datosManuales - { n, x_bar, x, s2 }
 * @param {string} parametro - 'media', 'proporcion', 'varianza'
 */
export const calcularEstimacionPuntualManual = (datosManuales, parametro) => {
    const n = Number(datosManuales.n);
    if (isNaN(n) || n <= 0) return { error: 'Tamaño de muestra (n) inválido.' };

    if (parametro === 'media') {
        const x_bar = Number(datosManuales.x_bar);
        if (isNaN(x_bar)) return { error: 'Media muestral (X̄) inválida.' };
        return {
            n,
            estimacion: x_bar,
            simbolo: '\\hat{\\mu} = \\bar{X}',
            calculos: { media: x_bar }
        };
    }

    if (parametro === 'proporcion') {
        const x = Number(datosManuales.x);
        if (isNaN(x) || x < 0 || x > n) return { error: 'Casos favorables (x) inválidos.' };
        const p_hat = x / n;
        return {
            n,
            estimacion: p_hat,
            simbolo: '\\hat{p}',
            calculos: { x, p_hat }
        };
    }

    if (parametro === 'varianza') {
        if (n < 2) return { error: 'El tamaño de muestra debe ser mayor a 1.' };
        const s2 = Number(datosManuales.s2);
        if (isNaN(s2) || s2 < 0) return { error: 'Varianza muestral (S²) inválida.' };
        return {
            n,
            estimacion: s2,
            simbolo: '\\hat{\\sigma}^2 = S^2',
            calculos: { varianza: s2, desviacion: Math.sqrt(s2) }
        };
    }

    return { error: 'Parámetro no soportado.' };
};

/**
 * Genera N simulaciones de tamaño n según una distribución y calcula el estimador para cada una.
 */
export const generarSimulacionPuntual = (distribucion, paramsDist, n, numSimulaciones, parametro) => {
    if (n <= 0) return { error: 'El tamaño de muestra debe ser mayor a 0.' };
    if (numSimulaciones <= 0 || numSimulaciones > 100000) return { error: 'Número de simulaciones inválido (1 - 100000).' };
    if (parametro === 'varianza' && n < 2) return { error: 'El tamaño de muestra debe ser al menos 2 para varianza.' };

    const simulaciones = [];
    let parametroVerdadero = null;

    // Calcular parámetro verdadero si se puede
    if (parametro === 'media') {
        if (distribucion === 'normal') parametroVerdadero = paramsDist.mu;
        if (distribucion === 'uniforme') parametroVerdadero = (paramsDist.a + paramsDist.b) / 2;
        if (distribucion === 'poisson') parametroVerdadero = paramsDist.lambda;
        if (distribucion === 'bernoulli') parametroVerdadero = paramsDist.p;
        if (distribucion === 'binomial') parametroVerdadero = paramsDist.n_ensayos * paramsDist.p;
    } else if (parametro === 'proporcion') {
        if (distribucion === 'bernoulli' || distribucion === 'binomial') parametroVerdadero = paramsDist.p;
    } else if (parametro === 'varianza') {
        if (distribucion === 'normal') parametroVerdadero = paramsDist.sigma * paramsDist.sigma;
        if (distribucion === 'poisson') parametroVerdadero = paramsDist.lambda;
        if (distribucion === 'bernoulli') parametroVerdadero = paramsDist.p * (1 - paramsDist.p);
        if (distribucion === 'uniforme') parametroVerdadero = Math.pow(paramsDist.b - paramsDist.a, 2) / 12;
    }

    const BoxMuller = (mu, sigma) => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * sigma + mu;
    };

    const generarMuestra = () => {
        const muestra = [];
        for (let i = 0; i < n; i++) {
            let valor = 0;
            if (distribucion === 'normal') {
                valor = BoxMuller(paramsDist.mu, paramsDist.sigma);
            } else if (distribucion === 'bernoulli') {
                valor = Math.random() <= paramsDist.p ? 1 : 0;
            } else if (distribucion === 'poisson') {
                // Knuth's algorithm
                let L = Math.exp(-paramsDist.lambda);
                let k = 0;
                let p = 1;
                do {
                    k++;
                    p *= Math.random();
                } while (p > L);
                valor = k - 1;
            } else if (distribucion === 'uniforme') {
                valor = Math.random() * (paramsDist.b - paramsDist.a) + paramsDist.a;
            } else if (distribucion === 'binomial') {
                let exitos = 0;
                for (let j = 0; j < paramsDist.n_ensayos; j++) {
                    if (Math.random() <= paramsDist.p) exitos++;
                }
                valor = exitos;
            }
            muestra.push(valor);
        }
        return muestra;
    };

    for (let s = 1; s <= numSimulaciones; s++) {
        const muestra = generarMuestra();
        let estimacion = 0;

        if (parametro === 'media') {
            estimacion = jStat.mean(muestra);
        } else if (parametro === 'proporcion') {
            // Para Bernoulli, la proporción de éxitos es la media de (0,1)
            // Para Binomial, si se asume como n_ensayos, p̂ = mean(muestra)/n_ensayos
            if (distribucion === 'binomial') {
                estimacion = jStat.mean(muestra) / paramsDist.n_ensayos;
            } else {
                estimacion = jStat.mean(muestra);
            }
        } else if (parametro === 'varianza') {
            estimacion = jStat.variance(muestra, true);
        }

        simulaciones.push({
            simulacion: s,
            estimacion: estimacion,
            diferencia: parametroVerdadero !== null ? estimacion - parametroVerdadero : null,
            muestra: muestra
        });
    }

    const estimacionesArray = simulaciones.map(s => s.estimacion);
    const mediaEstimaciones = jStat.mean(estimacionesArray);
    const varEstimaciones = numSimulaciones > 1 ? jStat.variance(estimacionesArray, true) : 0;
    
    let sesgo = null;
    let ecm = null;
    if (parametroVerdadero !== null) {
        sesgo = mediaEstimaciones - parametroVerdadero;
        // ECM = Varianza(Estimador) + Sesgo^2
        ecm = varEstimaciones + (sesgo * sesgo);
    }

    return {
        parametro,
        parametroVerdadero,
        distribucion,
        paramsDist,
        simulaciones,
        resumen: {
            promedio: mediaEstimaciones,
            desviacion: Math.sqrt(varEstimaciones),
            min: jStat.min(estimacionesArray),
            max: jStat.max(estimacionesArray),
            sesgo,
            ecm
        }
    };
};

// =======================================================
// ESTIMACIÓN POR INTERVALOS
// =======================================================

export const getZCritical = (alpha) => Math.abs(jStat.normal.inv(alpha / 2, 0, 1));
export const getTCritical = (alpha, df) => Math.abs(jStat.studentt.inv(alpha / 2, df));
export const getChiSquareCritical = (alpha, df) => {
    return {
        lower: jStat.chisquare.inv(1 - alpha / 2, df),
        upper: jStat.chisquare.inv(alpha / 2, df)
    };
};

export const calcularIntervaloMedia = (x_bar, s_or_sigma, n, confianza, sigmaConocida) => {
    if (n <= 0) return { error: 'El tamaño de muestra debe ser mayor a 0.' };
    if (!sigmaConocida && n < 2) return { error: 'Para σ desconocida (t de Student), n debe ser mayor o igual a 2.' };
    
    const alpha = 1 - (confianza / 100);
    const errorEstandar = s_or_sigma / Math.sqrt(n);
    let valorCritico = 0;
    let metodo = '';

    if (sigmaConocida) {
        valorCritico = getZCritical(alpha);
        metodo = 'Normal (Z)';
    } else {
        if (n >= 30) {
            valorCritico = getZCritical(alpha);
            metodo = 'Normal (Z)';
        } else {
            valorCritico = getTCritical(alpha, n - 1);
            metodo = 't de Student';
        }
    }

    const margenError = valorCritico * errorEstandar;
    const LI = x_bar - margenError;
    const LS = x_bar + margenError;

    return { x_bar, s_or_sigma, n, confianza, LI, LS, margenError, valorCritico, errorEstandar, metodo, alpha };
};

export const calcularIntervaloProporcion = (x, n, confianza) => {
    if (n <= 0) return { error: 'El tamaño de muestra n debe ser mayor a 0.' };
    if (x < 0 || x > n) return { error: 'Los casos favorables x deben estar entre 0 y n.' };
    
    const p_hat = x / n;
    const alpha = 1 - (confianza / 100);
    
    const valorCritico = getZCritical(alpha);
    const metodo = 'Normal (Z)';

    const errorEstandar = Math.sqrt((p_hat * (1 - p_hat)) / n);
    const margenError = valorCritico * errorEstandar;
    
    const LI = p_hat - margenError;
    const LS = p_hat + margenError;

    return { x, n, p_hat, confianza, LI, LS, margenError, valorCritico, errorEstandar, alpha, metodo };
};

export const calcularIntervaloVarianza = (s2, n, confianza) => {
    if (n < 2) return { error: 'Para estimar la varianza poblacional n debe ser al menos 2.' };
    if (s2 < 0) return { error: 'La varianza muestral S² no puede ser negativa.' };
    
    const alpha = 1 - (confianza / 100);
    const gl = n - 1;
    const criticos = getChiSquareCritical(alpha, gl);
    
    const numerador = gl * s2;
    const LI = numerador / criticos.lower; 
    const LS = numerador / criticos.upper; 

    return { 
        n,
        s2,
        confianza,
        LI, 
        LS, 
        gl, 
        alpha, 
        criticoInf: criticos.lower, 
        criticoSup: criticos.upper,
        metodo: 'Chi-cuadrada'
    };
};

export const generarSimulacionIntervalos = (distribucion, paramsDist, n, numSimulaciones, parametro, confianza, sigmaConocida = false) => {
    let parametroVerdadero = null;
    let sigmaPoblacional = null;

    if (distribucion === 'normal') {
        if (parametro === 'media') parametroVerdadero = paramsDist.mu;
        if (parametro === 'varianza') parametroVerdadero = paramsDist.sigma * paramsDist.sigma;
        sigmaPoblacional = paramsDist.sigma;
    } else if (distribucion === 'bernoulli') {
        if (parametro === 'media' || parametro === 'proporcion') parametroVerdadero = paramsDist.p;
        if (parametro === 'varianza') parametroVerdadero = paramsDist.p * (1 - paramsDist.p);
    } else if (distribucion === 'poisson') {
        if (parametro === 'media' || parametro === 'varianza') parametroVerdadero = paramsDist.lambda;
    } else if (distribucion === 'uniforme') {
        if (parametro === 'media') parametroVerdadero = (paramsDist.a + paramsDist.b) / 2;
        if (parametro === 'varianza') parametroVerdadero = Math.pow(paramsDist.b - paramsDist.a, 2) / 12;
    } else if (distribucion === 'binomial') {
        if (parametro === 'media') parametroVerdadero = paramsDist.n_ensayos * paramsDist.p;
        if (parametro === 'proporcion') parametroVerdadero = paramsDist.p;
        if (parametro === 'varianza') parametroVerdadero = paramsDist.n_ensayos * paramsDist.p * (1 - paramsDist.p);
    }

    const generarMuestra = () => {
        const muestra = [];
        for (let i = 0; i < n; i++) {
            let valor = 0;
            if (distribucion === 'normal') {
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                valor = z * paramsDist.sigma + paramsDist.mu;
            } else if (distribucion === 'bernoulli') {
                valor = Math.random() <= paramsDist.p ? 1 : 0;
            } else if (distribucion === 'poisson') {
                const L = Math.exp(-paramsDist.lambda);
                let k = 0, p = 1;
                do { k++; p *= Math.random(); } while (p > L);
                valor = k - 1;
            } else if (distribucion === 'uniforme') {
                valor = Math.random() * (paramsDist.b - paramsDist.a) + paramsDist.a;
            } else if (distribucion === 'binomial') {
                let exitos = 0;
                for (let j = 0; j < paramsDist.n_ensayos; j++) {
                    if (Math.random() <= paramsDist.p) exitos++;
                }
                valor = exitos;
            }
            muestra.push(valor);
        }
        return muestra;
    };

    const simulaciones = [];
    let contienenVerdadero = 0;

    for (let s = 1; s <= numSimulaciones; s++) {
        const muestra = generarMuestra();
        let resultadoIntervalo = null;
        let estimacionPuntual = null;

        if (parametro === 'media') {
            const x_bar = jStat.mean(muestra);
            estimacionPuntual = x_bar;
            const s_val = sigmaConocida ? sigmaPoblacional : jStat.stdev(muestra, true);
            resultadoIntervalo = calcularIntervaloMedia(x_bar, s_val, n, confianza, sigmaConocida);
        } else if (parametro === 'proporcion') {
            let exitos = jStat.sum(muestra);
            let totalEnsayos = n;
            if (distribucion === 'binomial') {
                totalEnsayos = n * paramsDist.n_ensayos;
            }
            estimacionPuntual = exitos / totalEnsayos;
            resultadoIntervalo = calcularIntervaloProporcion(exitos, totalEnsayos, confianza);
        } else if (parametro === 'varianza') {
            const s2 = jStat.variance(muestra, true);
            estimacionPuntual = s2;
            resultadoIntervalo = calcularIntervaloVarianza(s2, n, confianza);
        }

        let contiene = false;
        if (parametroVerdadero !== null && !resultadoIntervalo.error) {
            contiene = (parametroVerdadero >= resultadoIntervalo.LI && parametroVerdadero <= resultadoIntervalo.LS);
            if (contiene) contienenVerdadero++;
        }

        simulaciones.push({
            simulacion: s,
            muestra,
            estimacionPuntual,
            LI: resultadoIntervalo?.LI,
            LS: resultadoIntervalo?.LS,
            errorEstandar: resultadoIntervalo?.errorEstandar,
            margenError: resultadoIntervalo?.margenError,
            contiene,
            error: resultadoIntervalo?.error
        });
    }

    const coberturaObservada = numSimulaciones > 0 ? (contienenVerdadero / numSimulaciones) * 100 : 0;

    return {
        parametro,
        parametroVerdadero,
        distribucion,
        paramsDist,
        confianza,
        simulaciones,
        resumen: {
            total: numSimulaciones,
            contienen: contienenVerdadero,
            noContienen: numSimulaciones - contienenVerdadero,
            cobertura: coberturaObservada
        }
    };
};
