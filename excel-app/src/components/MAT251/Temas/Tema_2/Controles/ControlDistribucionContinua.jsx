import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import { calcularMomentosContinua, integracionNumerica } from '../../../Matematicas/logica_Tema2';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { parse, fraction, evaluate } from 'mathjs';
import ModalDespejeConstante from '../Modales/ModalDespejeConstante';

const MATH_FONT = "'Cambria Math', 'Times New Roman', serif";

// ─── FACTORY ────────────────────────────────────────────────────────────────
const crearBloque = (tipo, valor = '') => ({
    id: Date.now() + Math.random(),
    tipo,
    valor,
    coef: tipo === 'constante' ? valor : '',
    exp: '',
    numerador: [],   // Usado por fraccion, euler (exponente), absoluto (interior)
    denominador: [], // Usado sólo por fraccion
    variable_adjunta: null,
    exp_adjunto: '',
});

// ─── PARSER RECURSIVO ────────────────────────────────────────────────────────
const parsearArray = (arr, activeVar = 'x') => {
    const parts = arr.map(b => {
        if (b.tipo === 'incognita_dinamica') return `(${b.valor || 'k'})`;
        if (b.tipo === 'pi') return 'pi';
        if (b.tipo === 'signo') return b.valor;
        if (b.tipo === 'paren_abre') return '(';
        if (b.tipo === 'paren_cierra') return ')';
        if (b.tipo === 'corchete_abre') return '(';
        if (b.tipo === 'corchete_cierra') return ')';
        if (b.tipo === 'fraccion') {
            const numStr = parsearArray(b.numerador, activeVar) || '1';
            const denStr = parsearArray(b.denominador, activeVar) || '1';
            const baseStr = `((${numStr}) / (${denStr}))`;
            if (b.variable_adjunta) {
                if (b.variable_adjunta === 'termino_lineal') return `${baseStr} * (${activeVar})`;
                if (b.variable_adjunta === 'termino_cuadratico') return `${baseStr} * (${activeVar}^2)`;
                if (b.variable_adjunta === 'termino_potencia') {
                    let e = parseFloat(b.exp_adjunto);
                    if (isNaN(e)) e = 1;
                    return `${baseStr} * (${activeVar}^${e})`;
                }
            }
            return baseStr;
        }
        if (b.tipo === 'euler') {
            const expStr = parsearArray(b.numerador, activeVar) || '1';
            return `exp(${expStr})`;
        }
        if (b.tipo === 'absoluto') {
            const intStr = parsearArray(b.numerador, activeVar) || '0';
            return `abs(${intStr})`;
        }
        let c = parseFloat(b.coef);
        if (isNaN(c)) c = 1;
        if (b.tipo === 'constante') {
            if (!b.coef?.trim()) return '0';
            return `(${parseFloat(b.coef)})`;
        }
        if (b.tipo === 'termino_lineal') return `(${c} * ${activeVar})`;
        if (b.tipo === 'termino_cuadratico') return `(${c} * ${activeVar}^2)`;
        if (b.tipo === 'termino_potencia') {
            let e = parseFloat(b.exp);
            if (isNaN(e)) e = 1;
            return `(${c} * ${activeVar}^${e})`;
        }
        return '';
    }).filter(p => p !== '');
    return parts.join(' ');
};

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export default function ControlDistribucionContinua({ onCalcular }) {
    const [bloques, setBloques] = useState([]);
    const bloquesRef = useRef([]);
    const setBloquesSync = (nuevos) => {
        bloquesRef.current = nuevos;
        setBloques(nuevos);
    };

    const [modo, setModo] = useState('densidad'); // 'densidad' | 'acumulada'
    const [limiteA, setLimiteA] = useState('');
    const [limiteB, setLimiteB] = useState('');
    const [error, setError] = useState('');
    const [mensajeInfo, setMensajeInfo] = useState('');
    const [mensajeK, setMensajeK] = useState(null); // Ahora será un objeto con los datos o null
    const [mostrarModalK, setMostrarModalK] = useState(false);

    // RECURSION STATE
    const [activeId, setActiveId] = useState(null);
    const activeIdRef = useRef(null);
    const setActiveIdSync = (val) => {
        activeIdRef.current = val;
        setActiveId(val);
    };

    // { parentId, slot: 'numerador' | 'denominador' }
    const [focusSlot, setFocusSlot] = useState(null);
    const focusSlotRef = useRef(null);
    const setFocusSlotSync = (val) => {
        focusSlotRef.current = val;
        setFocusSlot(val);
    };

    const [isTyping, setIsTyping] = useState(false);

    const activeVariable = modo === 'acumulada' ? 't' : 'x';

    // ── utilidades ─────────────────────────────────────────────────────────────
    const deepClone = (arr) => JSON.parse(JSON.stringify(arr));

    const buscarYEjecutar = (arr, callback) => {
        let encontrado = false;
        const traverse = (list, parentBlock = null, slotName = null) => {
            if (encontrado) return list;
            for (let i = 0; i < list.length; i++) {
                const result = callback(list, i, parentBlock, slotName);
                if (result) {
                    encontrado = true;
                    return list;
                }
                const b = list[i];
                if (b.numerador) b.numerador = traverse(b.numerador, b, 'numerador');
                if (b.denominador) b.denominador = traverse(b.denominador, b, 'denominador');
            }
            return list;
        };
        return traverse(arr, null, null);
    };

    // ── soporte teclado físico ───────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const getFlattenedPositions = (lista, currentParentSlot = null) => {
                    let positions = [];
                    
                    if (currentParentSlot !== null) {
                        if (lista.length === 0) {
                            positions.push({ activeId: null, focusSlot: currentParentSlot });
                        } else {
                            positions.push({ activeId: 'START_SLOT', focusSlot: currentParentSlot });
                        }
                    }

                    lista.forEach(b => {
                        if (b.tipo === 'fraccion') {
                            positions = positions.concat(getFlattenedPositions(b.numerador, { parentId: b.id, slot: 'numerador' }));
                            positions = positions.concat(getFlattenedPositions(b.denominador, { parentId: b.id, slot: 'denominador' }));
                        } else if (b.tipo === 'euler' || b.tipo === 'absoluto') {
                            positions = positions.concat(getFlattenedPositions(b.numerador, { parentId: b.id, slot: 'numerador' }));
                        }
                        positions.push({ activeId: b.id, focusSlot: currentParentSlot });
                    });
                    return positions;
                };

                let positions = getFlattenedPositions(bloquesRef.current, null);
                positions.unshift({ activeId: 'START', focusSlot: null });
                positions.push({ activeId: null, focusSlot: null });

                let currentIndex = positions.findIndex(p => {
                    if (p.activeId !== activeIdRef.current) return false;
                    if (p.activeId !== null && p.activeId !== 'START' && p.activeId !== 'START_SLOT') return true;

                    if (!p.focusSlot && !focusSlotRef.current) return true;
                    if (p.focusSlot && focusSlotRef.current) {
                        return p.focusSlot.parentId === focusSlotRef.current.parentId && p.focusSlot.slot === focusSlotRef.current.slot;
                    }
                    return false;
                });

                if (currentIndex !== -1 || e.key === 'ArrowLeft') {
                    let newIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
                    if (newIndex >= 0 && newIndex < positions.length) {
                        const newPos = positions[newIndex];
                        setActiveIdSync(newPos.activeId);
                        setFocusSlotSync(newPos.focusSlot);
                    } else if (newIndex >= positions.length) {
                        setActiveIdSync(null);
                        setFocusSlotSync(null);
                    }
                }
                e.preventDefault();
                return;
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                let currentParentId = null;
                let currentSlot = null;

                if (focusSlotRef.current) {
                    currentParentId = focusSlotRef.current.parentId;
                    currentSlot = focusSlotRef.current.slot;
                } else if (activeIdRef.current && activeIdRef.current !== 'START' && activeIdRef.current !== 'START_SLOT') {
                    const buscarParent = (list, pBlock, pSlot) => {
                        for (let b of list) {
                            if (b.id === activeIdRef.current) {
                                currentParentId = pBlock ? pBlock.id : null;
                                currentSlot = pSlot;
                                return true;
                            }
                            if (b.numerador && buscarParent(b.numerador, b, 'numerador')) return true;
                            if (b.denominador && buscarParent(b.denominador, b, 'denominador')) return true;
                        }
                        return false;
                    };
                    buscarParent(bloquesRef.current, null, null);
                }

                if (currentParentId) {
                    let parentBlock = null;
                    const findParent = (list) => {
                        for (let b of list) {
                            if (b.id === currentParentId) parentBlock = b;
                            if (b.numerador) findParent(b.numerador);
                            if (b.denominador) findParent(b.denominador);
                        }
                    };
                    findParent(bloquesRef.current);

                    if (parentBlock && parentBlock.tipo === 'fraccion') {
                        if (e.key === 'ArrowDown' && currentSlot === 'numerador') {
                            setFocusSlotSync({ parentId: currentParentId, slot: 'denominador' });
                            setActiveIdSync(null);
                            e.preventDefault();
                            return;
                        } else if (e.key === 'ArrowUp' && currentSlot === 'denominador') {
                            setFocusSlotSync({ parentId: currentParentId, slot: 'numerador' });
                            setActiveIdSync(null);
                            e.preventDefault();
                            return;
                        }
                    }
                }
            }

            if (/^[0-9.]$/.test(e.key)) {
                let appended = false;
                const newBloques = deepClone(bloquesRef.current);

                buscarYEjecutar(newBloques, (list, i) => {
                    const b = list[i];
                    if (focusSlotRef.current && focusSlotRef.current.parentId === b.id) {
                        const targetArr = b[focusSlotRef.current.slot];
                        if (targetArr.length > 0) {
                            const lastBlock = targetArr[targetArr.length - 1];
                            if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(lastBlock.tipo)) {
                                targetArr[targetArr.length - 1].coef += e.key;
                                appended = true;
                                return true;
                            }
                        }
                    }
                    if (activeIdRef.current === b.id && ['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(b.tipo)) {
                        b.coef += e.key;
                        appended = true;
                        return true;
                    }
                    return false;
                });

                if (appended) {
                    setBloquesSync(newBloques);
                } else {
                    agregarBloque('constante', e.key);
                }

            } else if (/^[a-zA-Z]$/.test(e.key) && e.key.toLowerCase() !== 'x') {
                let updated = false;
                const newBloques = deepClone(bloquesRef.current);

                buscarYEjecutar(newBloques, (list, i) => {
                    const b = list[i];
                    if (activeIdRef.current === b.id && b.tipo === 'incognita_dinamica') {
                        b.valor = e.key;
                        updated = true;
                        return true;
                    }
                    return false;
                });

                if (updated) {
                    setBloquesSync(newBloques);
                }
            } else if (e.key === '+' || e.key === '-') {
                let updated = false;
                const newBloques = deepClone(bloquesRef.current);

                buscarYEjecutar(newBloques, (list, i) => {
                    const b = list[i];
                    if (activeIdRef.current === b.id && b.tipo === 'signo') {
                        b.valor = e.key;
                        updated = true;
                        return true;
                    }
                    return false;
                });

                if (updated) {
                    setBloquesSync(newBloques);
                } else {
                    agregarBloque('signo', e.key);
                }
            } else if (e.key.toLowerCase() === 'x') {
                agregarBloque('termino_lineal');
            } else if (e.key === '(') {
                agregarBloque('paren_abre');
            } else if (e.key === ')') {
                agregarBloque('paren_cierra');
            } else if (e.key === '[') {
                agregarBloque('corchete_abre');
            } else if (e.key === ']') {
                agregarBloque('corchete_cierra');
            } else if (e.key === 'Backspace') {
                borrarBloque();
            } else if (e.key === '/') {
                agregarBloque('fraccion');
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const getAnchoInput = (valor, minCh = 1) => {
        const str = valor !== undefined && valor !== null ? valor.toString() : '';
        return `${Math.max(str.length, minCh) + 1.5}ch`;
    };

    // ── mutaciones del estado recursivo ───────────────────────────────────────
    const agregarBloque = (tipo, valor = '') => {
        const b = crearBloque(tipo, valor);
        const currentBloques = deepClone(bloquesRef.current);
        let inserted = false;

        // Envoltura recursiva
        if ((tipo === 'fraccion' || tipo === 'euler' || tipo === 'absoluto') && focusSlotRef.current === null) {
            if (activeIdRef.current === 'START') {
                currentBloques.unshift(b);
                inserted = true;
            } else {
                buscarYEjecutar(currentBloques, (list, i) => {
                    const bloque = list[i];
                    if (activeIdRef.current === bloque.id || (activeIdRef.current === null && i === list.length - 1)) {
                        if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(bloque.tipo)) {
                            b.numerador = [bloque];
                            list.splice(i, 1, b);
                            inserted = true;
                            return true;
                        } else {
                            list.splice(i + 1, 0, b);
                            inserted = true;
                            return true;
                        }
                    }
                    return false;
                });
            }
        }

        if (!inserted) {
            const traverseAndInsert = (list) => {
                if (inserted) return list;

                if (activeIdRef.current === 'START') {
                    if (list === currentBloques) {
                        list.unshift(b);
                        inserted = true;
                        return list;
                    }
                }

                if (activeIdRef.current === 'START_SLOT' && focusSlotRef.current) {
                    const parent = list.find(bl => bl.id === focusSlotRef.current.parentId);
                    if (parent && parent[focusSlotRef.current.slot]) {
                        parent[focusSlotRef.current.slot].unshift(b);
                        inserted = true;
                        return list;
                    }
                }

                if (focusSlotRef.current) {
                    const parent = list.find(bl => bl.id === focusSlotRef.current.parentId);
                    if (parent && parent[focusSlotRef.current.slot]) {
                        parent[focusSlotRef.current.slot].push(b);
                        inserted = true;
                        return list;
                    }
                }

                if (activeIdRef.current) {
                    const idx = list.findIndex(bl => bl.id === activeIdRef.current);
                    if (idx !== -1) {
                        list.splice(idx + 1, 0, b);
                        inserted = true;
                        return list;
                    }
                }

                for (let i = 0; i < list.length; i++) {
                    const bl = list[i];
                    if (bl.numerador) bl.numerador = traverseAndInsert(bl.numerador);
                    if (bl.denominador) bl.denominador = traverseAndInsert(bl.denominador);
                }
                return list;
            };

            const newArr = traverseAndInsert(currentBloques);
            if (!inserted) newArr.push(b);

            setActiveIdSync(b.id);
            if (tipo === 'fraccion' || tipo === 'euler' || tipo === 'absoluto') {
                setFocusSlotSync({ parentId: b.id, slot: 'numerador' });
            }
            setBloquesSync(newArr);
        } else {
            setBloquesSync(currentBloques);
        }
    };

    const handleSignoClick = (val) => {
        let updated = false;
        const newBloques = deepClone(bloquesRef.current);
        buscarYEjecutar(newBloques, (list, i) => {
            const b = list[i];
            if (activeIdRef.current === b.id && b.tipo === 'signo') {
                b.valor = val;
                updated = true;
                return true;
            }
            return false;
        });
        if (updated) {
            setBloquesSync(newBloques);
        } else {
            agregarBloque('signo', val);
        }
    };

    const borrarBloque = () => {
        const currentBloques = deepClone(bloquesRef.current);
        let deleted = false;

        buscarYEjecutar(currentBloques, (list, i, parentBlock, slotName) => {
            const b = list[i];
            if (activeIdRef.current === b.id) {
                list.splice(i, 1);
                if (i > 0) {
                    setActiveIdSync(list[i - 1].id);
                    setFocusSlotSync(null);
                } else {
                    if (parentBlock) {
                        setActiveIdSync(null);
                        setFocusSlotSync({ parentId: parentBlock.id, slot: slotName });
                    } else {
                        setActiveIdSync('START');
                        setFocusSlotSync(null);
                    }
                }
                deleted = true;
                return true;
            }

            if (focusSlotRef.current && focusSlotRef.current.parentId === b.id) {
                const targetArr = b[focusSlotRef.current.slot];
                if (targetArr.length > 0) {
                    const last = targetArr[targetArr.length - 1];
                    if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(last.tipo)) {
                        last.coef = last.coef.slice(0, -1);
                        if (last.coef === '' && last.tipo === 'constante') {
                            targetArr.pop();
                        }
                    } else {
                        targetArr.pop();
                    }
                    deleted = true;
                    return true;
                }
            }
            return false;
        });

        if (!deleted && currentBloques.length > 0) {
            const last = currentBloques[currentBloques.length - 1];
            if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(last.tipo)) {
                last.coef = last.coef.slice(0, -1);
                if (last.coef === '' && last.tipo === 'constante') currentBloques.pop();
            } else {
                currentBloques.pop();
            }
            if (currentBloques.length > 0) {
                setActiveIdSync(currentBloques[currentBloques.length - 1].id);
            } else {
                setActiveIdSync(null);
            }
        }
        setBloquesSync(currentBloques);
    };

    const updateBlockById = (id, campo, valor) => {
        const currentBloques = deepClone(bloquesRef.current);
        buscarYEjecutar(currentBloques, (list, i) => {
            if (list[i].id === id) {
                list[i][campo] = valor;
                return true;
            }
            return false;
        });
        setBloquesSync(currentBloques);
    };

    // ── validacion ────────────────────────────────────────────────────────────
    const formatearParaMathJs = () => {
        let finalString = parsearArray(bloques, activeVariable);

        // Reemplazos de seguridad (Regex) para asegurar multiplicación implícita
        // Multiplica números seguidos de paréntesis: 0.75( => 0.75*(
        finalString = finalString.replace(/(\d)(\()/g, '$1*$2');
        // Multiplica paréntesis seguidos de paréntesis: )( => )*(
        finalString = finalString.replace(/(\))(\()/g, '$1*$2');
        // Multiplica números seguidos de variables: 0.75x => 0.75*x
        finalString = finalString.replace(new RegExp(`(\\d)(${activeVariable})`, 'g'), '$1*$2');

        console.log("String a evaluar:", finalString);
        return finalString;
    };

    const manejarValidacion = () => {
        setMensajeInfo('');
        const stringMath = formatearParaMathJs();
        if (stringMath === '0' || stringMath === '') { setError("La función no puede ser nula."); return; }

        let a, b_v;
        try {
            const cleanA = limiteA === '∞' ? 'Infinity' : limiteA === '-∞' ? '-Infinity' : limiteA.replace(/π/g, 'pi');
            a = evaluate(cleanA);
            if (typeof a !== 'number' || isNaN(a)) throw new Error();
        } catch (e) {
            setError("El límite inferior debe ser una expresión matemática válida (ej: 0, 10, π, -∞)."); return;
        }

        let cleanB = limiteB === '∞' ? 'Infinity' : limiteB === '-∞' ? '-Infinity' : limiteB.replace(/π/g, 'pi');
        let esPuntualAcumulada = false;

        try {
            b_v = evaluate(cleanB);
            if (typeof b_v !== 'number' || isNaN(b_v)) throw new Error();
            if (modo === 'acumulada') esPuntualAcumulada = true;
        } catch (e) {
            if (cleanB.toLowerCase().includes('x')) {
                if (/\bx\b/.test(stringMath)) {
                    setError("Error de Notación: La variable de integración no puede ser la misma que el límite superior. Por favor, usa la variable 't' en tu ecuación (ej. dt).");
                    return;
                }
                b_v = Infinity;
            } else if (cleanB.toLowerCase().includes('t')) {
                if (/\bt\b/.test(stringMath)) {
                    setError("Error de Notación: La variable de integración no puede ser la misma que el límite superior.");
                    return;
                }
                b_v = Infinity;
            } else {
                setError("El límite superior debe ser una expresión matemática válida o la variable 'x'."); return;
            }
        }

        if (modo !== 'acumulada' && a >= b_v) {
            setError("El límite inferior 'a' debe ser estrictamente menor que 'b'."); return;
        }

        // --- INTERCEPTAR INCÓGNITA DINÁMICA ---
        let stringMathFinal = stringMath;
        let incognitaVar = null;

        // Buscar si existe alguna incógnita dinámica en el AST
        buscarYEjecutar(bloquesRef.current, list => {
            const bl = list.find(b => b.tipo === 'incognita_dinamica');
            if (bl) incognitaVar = bl.valor || 'k';
            return !!bl; // true si encontró para detener la búsqueda (aunque buscarYEjecutar normal usa función diferente, ajustamos esto:
        });

        // Forma correcta de buscar en el AST (ya que buscarYEjecutar llama al callback con (list, index))
        const buscarIncognita = (list) => {
            for (let b of list) {
                if (b.tipo === 'incognita_dinamica') { incognitaVar = b.valor || 'k'; return; }
                if (b.numerador) buscarIncognita(b.numerador);
                if (b.denominador) buscarIncognita(b.denominador);
            }
        };
        buscarIncognita(bloquesRef.current);

        if (incognitaVar) {
            const regexVar = new RegExp(`\\(${incognitaVar}\\)`, 'g');
            const stringTemp = stringMath.replace(regexVar, '(1)');
            const areaParcial = integracionNumerica(stringTemp, a, b_v);

            if (areaParcial === 0 || !isFinite(areaParcial)) {
                setError(`El área evaluada con ${incognitaVar}=1 es 0 o diverge. No se puede despejar ${incognitaVar}.`); return;
            }

            const kVal = 1 / areaParcial;

            // Convertir a fracción exacta si es posible
            let kStr = kVal.toFixed(4);
            let kFracObj = null;
            try {
                const kLimpio = Math.round(kVal * 10000) / 10000;
                const f = fraction(kLimpio);
                if (f.d !== 1 && f.d < 10000) {
                    kStr = `${f.s < 0 ? '-' : ''}${f.n}/${f.d}`;
                    kFracObj = f;
                } else if (f.d === 1) {
                    kStr = `${f.s < 0 ? '-' : ''}${f.n}`;
                }
            } catch (e) { }

            let latexTemp = `(${stringTemp})`;
            try { latexTemp = parse(stringTemp).toTex(); } catch (e) { }

            setMensajeK({
                texto: `¡Constante encontrada! Para que el área sea 1, ${incognitaVar} = ${kStr}`,
                datos: {
                    a, b: b_v, stringTemp, areaParcial, kVal, kStr, stringMathOriginal: stringMath, incognitaVar, latexTemp
                }
            });

            // Mutar el estado para reemplazar las incógnitas por la constante o fracción
            const currentBloques = deepClone(bloquesRef.current);
            const reemplazarKRecursivo = (list) => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].tipo === 'incognita_dinamica') {
                        if (kFracObj) {
                            const fracBloque = crearBloque('fraccion');
                            let numStr = kFracObj.n.toString();
                            if (kFracObj.s < 0) numStr = '-' + numStr;
                            fracBloque.numerador = [crearBloque('constante', numStr)];
                            fracBloque.denominador = [crearBloque('constante', kFracObj.d.toString())];
                            list[i] = fracBloque;
                        } else {
                            list[i] = crearBloque('constante', Math.round(kVal * 10000) / 10000);
                        }
                    } else {
                        if (list[i].numerador) reemplazarKRecursivo(list[i].numerador);
                        if (list[i].denominador) reemplazarKRecursivo(list[i].denominador);
                    }
                }
            };
            reemplazarKRecursivo(currentBloques);
            setBloquesSync(currentBloques);
            stringMathFinal = parsearArray(currentBloques, activeVariable);
        }

        const resultado = calcularMomentosContinua(stringMathFinal, a, b_v, activeVariable);
        if (resultado.error) { setError(resultado.error); return; }
        setError('');

        let modoParaGraficar = modo;
        if (esPuntualAcumulada) {
            const numLimit = Number.isInteger(b_v) ? b_v : b_v.toFixed(2);
            const areaFormat = resultado.area !== undefined ? resultado.area.toFixed(4) : '';
            setMensajeInfo(`Probabilidad acumulada P(X ≤ ${numLimit}) calculada (${areaFormat}). Tip: Para ver la curva de la función F(x), ingresa la variable 'x' en el límite superior.`);
            delete resultado.warning; // Omitir el warning de que el área no es 1
            modoParaGraficar = 'densidad'; // Para la puntual, dibujamos la densidad sombreada hasta el número
        }

        let latexString = `(${stringMathFinal})`;
        try {
            latexString = parse(stringMathFinal).toTex({ parenthesis: 'auto' });
        } catch (e) { }

        onCalcular({ ...resultado, funcion: stringMathFinal, latexString, modo: modoParaGraficar });
    };

    const handleLimiteChange = (setter, val) => {
        let v = val;
        const vLower = v.toLowerCase();
        if (vLower === 'i' || vLower === 'inf' || vLower === 'infinity') v = '∞';
        else if (vLower === '-i' || vLower === '-inf' || vLower === '-infinity') v = '-∞';
        v = v.replace(/pi/gi, 'π');
        setter(v);
    };

    const limpiarTodo = () => {
        setBloquesSync([]);
        setActiveIdSync(null);
        setFocusSlotSync(null);
        setLimiteA('');
        setLimiteB('');
    };

    const handleBtnMouseDown = (e, charToAppend, blockAction) => {
        e.preventDefault(); // Evita que el botón quite el foco del input
        const a = document.activeElement;

        if (charToAppend === 'Limpiar') {
            limpiarTodo();
            return;
        }

        // Si el usuario está tecleando en ALGÚN input (límites, coeficientes, exponentes)
        if (a && a.tagName === 'INPUT') {
            if (charToAppend === 'Backspace') {
                if (a.selectionStart > 0 || a.selectionStart !== a.selectionEnd) {
                    const start = a.selectionStart;
                    const end = a.selectionEnd;
                    const val = a.value;
                    const isSelection = start !== end;
                    
                    const newVal = isSelection 
                        ? val.substring(0, start) + val.substring(end)
                        : val.substring(0, start - 1) + val.substring(end);
                        
                    const newCursorPos = isSelection ? start : start - 1;

                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeInputValueSetter.call(a, newVal);
                    a.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    a.setSelectionRange(newCursorPos, newCursorPos);
                }
            } else if (charToAppend !== null) {
                const start = a.selectionStart;
                const end = a.selectionEnd;
                const val = a.value;
                const newVal = val.substring(0, start) + charToAppend + val.substring(end);
                
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(a, newVal);
                a.dispatchEvent(new Event('input', { bubbles: true }));
                
                a.setSelectionRange(start + charToAppend.length, start + charToAppend.length);
            }
            return;
        }

        // Si no está en un input, se aplican los comandos de bloques en el lienzo principal
        if (typeof blockAction === 'function') blockAction();
        else if (typeof blockAction === 'string') {
            if (blockAction === '+') handleSignoClick('+');
            else if (blockAction === '-') handleSignoClick('-');
            else agregarBloque(blockAction);
        } else if (Array.isArray(blockAction)) {
            agregarBloque(blockAction[0], blockAction[1]);
        }
    };

    // ── helpers ast ───────────────────────────────────────────────────────────────
    const handleInputKeyDown = (e, bloqueId) => {
        let parentBlock = null;
        let parentSlot = null;
        
        const buscarParent = (list, pBlock, pSlot) => {
            for (let b of list) {
                if (b.id === bloqueId) {
                    parentBlock = pBlock;
                    parentSlot = pSlot;
                    return true;
                }
                if (b.numerador && buscarParent(b.numerador, b, 'numerador')) return true;
                if (b.denominador && buscarParent(b.denominador, b, 'denominador')) return true;
            }
            return false;
        };
        buscarParent(bloquesRef.current, null, null);

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (parentBlock && parentBlock.tipo === 'fraccion') {
                if (e.key === 'ArrowDown' && parentSlot === 'numerador') {
                    e.preventDefault();
                    e.target.blur();
                    setFocusSlotSync({ parentId: parentBlock.id, slot: 'denominador' });
                    setActiveIdSync(null);
                } else if (e.key === 'ArrowUp' && parentSlot === 'denominador') {
                    e.preventDefault();
                    e.target.blur();
                    setFocusSlotSync({ parentId: parentBlock.id, slot: 'numerador' });
                    setActiveIdSync(null);
                }
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
                e.preventDefault();
                e.target.blur();
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })), 10);
            } else if (e.key === 'ArrowRight' && e.target.selectionEnd === e.target.value.length) {
                e.preventDefault();
                e.target.blur();
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })), 10);
            }
        }
    };

    const CursorMain = ({ height = '24px' }) => (
        <div style={{
            width: '2px', height, background: '#3b82f6',
            margin: '0 2px', borderRadius: '1px',
            animation: 'blinkCursorMat251 1s step-end infinite'
        }} title="Inserción" />
    );

    const baseInputStyle = { background: 'white', border: '1px dashed #ccc', borderRadius: '4px', color: '#0f172a', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, transition: 'all 0.2s', lineHeight: 1 };

    const handleFocus = (e) => { e.target.style.border = '1px solid #3b82f6'; setIsTyping(true); };
    const handleBlur = (e) => { e.target.style.border = '1px dashed #ccc'; setIsTyping(false); };

    const renderListaBloques = (lista, esRaiz = false, isNestedInExponent = false, parentId = null, slotName = null) => {
        const elementos = [];
        
        if (esRaiz) {
            if (activeId === 'START' && !isTyping) {
                elementos.push(<CursorMain key="c-start" />);
            }
        } else if (parentId && slotName) {
            if (activeId === 'START_SLOT' && focusSlot?.parentId === parentId && focusSlot?.slot === slotName && !isTyping) {
                elementos.push(<CursorMain key="c-start-slot" height={isNestedInExponent ? '12px' : '24px'} />);
            }
        }

        lista.forEach((bloque, index) => {
            const clickBloque = (e) => {
                e.stopPropagation();
                setActiveIdSync(bloque.id);
                setFocusSlotSync(null);
            };

            let blockJSX = null;

            if (bloque.tipo === 'signo') {
                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'inline-flex', cursor: 'pointer', padding: '1px' }}>
                        <input
                            type="text"
                            value={bloque.valor}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val === '+' || val === '-') {
                                    updateBlockById(bloque.id, 'valor', val);
                                } else {
                                    const stripped = val.replace(bloque.valor, '');
                                    if (stripped === '+' || stripped === '-') {
                                        updateBlockById(bloque.id, 'valor', stripped);
                                    } else {
                                        const last = val.slice(-1);
                                        if (last === '+' || last === '-') {
                                            updateBlockById(bloque.id, 'valor', last);
                                        }
                                    }
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }}
                            onBlur={handleBlur}
                            style={{ ...baseInputStyle, width: '2.5ch', fontSize: '1em', padding: '0' }}
                        />
                    </div>
                );
            } else if (bloque.tipo === 'paren_abre' || bloque.tipo === 'paren_cierra') {
                const isLeft = bloque.tipo === 'paren_abre';
                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', cursor: 'pointer', padding: '0 2px', userSelect: 'none' }}>
                        <div style={{ width: '8px', height: '100%', minHeight: '30px', borderLeft: isLeft ? '2px solid #1e293b' : 'none', borderRight: !isLeft ? '2px solid #1e293b' : 'none', borderTopLeftRadius: isLeft ? '10px 50%' : '0', borderBottomLeftRadius: isLeft ? '10px 50%' : '0', borderTopRightRadius: !isLeft ? '10px 50%' : '0', borderBottomRightRadius: !isLeft ? '10px 50%' : '0', transition: 'all 0.15s' }} title={isLeft ? '(' : ')'} />
                    </div>
                );
            } else if (bloque.tipo === 'corchete_abre' || bloque.tipo === 'corchete_cierra') {
                const isLeft = bloque.tipo === 'corchete_abre';
                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', cursor: 'pointer', padding: '0 2px', userSelect: 'none' }}>
                        <div style={{ width: '6px', height: '100%', minHeight: '30px', borderLeft: isLeft ? '2px solid #1e293b' : 'none', borderRight: !isLeft ? '2px solid #1e293b' : 'none', borderTop: '2px solid #1e293b', borderBottom: '2px solid #1e293b', transition: 'all 0.15s' }} title={isLeft ? '[' : ']'} />
                    </div>
                );
            } else if (bloque.tipo === 'constante') {
                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'inline-flex', cursor: 'pointer', padding: '1px' }}>
                        <input type="number" step="any" className="ghost-input" value={bloque.coef} onChange={(e) => updateBlockById(bloque.id, 'coef', e.target.value)} onClick={(e) => e.stopPropagation()} onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }} onBlur={handleBlur} onKeyDown={(e) => handleInputKeyDown(e, bloque.id)} style={{ ...baseInputStyle, width: getAnchoInput(bloque.coef, 2), fontSize: '0.8em', padding: '0' }} />
                    </div>
                );
            } else if (bloque.tipo === 'pi') {
                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'inline-flex', cursor: 'pointer', padding: '1px' }}>
                        <div style={{ ...baseInputStyle, width: '2ch', border: '1px solid transparent', background: 'transparent', fontSize: '1.2em', paddingTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <InlineMath math="\pi" />
                        </div>
                    </div>
                );
            } else if (['termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(bloque.tipo)) {
                const isActive = activeId === bloque.id;
                const hideCoef = bloque.coef === '' && !isActive;
                const varStr = modo === 'acumulada' ? 't' : 'x';

                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer', padding: '1px' }}>
                        {!hideCoef && (
                            <input type="number" step="any" className="ghost-input" placeholder="c" value={bloque.coef} onChange={(e) => updateBlockById(bloque.id, 'coef', e.target.value)} onClick={(e) => e.stopPropagation()} onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }} onBlur={handleBlur} onKeyDown={(e) => handleInputKeyDown(e, bloque.id)} style={{ ...baseInputStyle, width: getAnchoInput(bloque.coef, 1), fontSize: '0.8em', padding: '0', border: bloque.coef === '' ? '1.5px dashed #3b82f6' : '1px solid transparent', background: bloque.coef === '' ? 'rgba(59, 130, 246, 0.05)' : 'white' }} />
                        )}
                        <div style={{ fontSize: '0.8em', margin: '0 2px' }}>
                            {bloque.tipo === 'termino_lineal' && <InlineMath math={varStr} />}
                            {bloque.tipo === 'termino_cuadratico' && <InlineMath math={`${varStr}^2`} />}
                            {bloque.tipo === 'termino_potencia' && <InlineMath math={varStr} />}
                        </div>
                        {bloque.tipo === 'termino_potencia' && (
                            <input
                                type="number"
                                step="any"
                                value={bloque.exp}
                                onChange={(e) => updateBlockById(bloque.id, 'exp', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }}
                                onBlur={handleBlur}
                                onKeyDown={(e) => handleInputKeyDown(e, bloque.id)}
                                placeholder="n"
                                style={{
                                    ...baseInputStyle,
                                    width: getAnchoInput(bloque.exp || 'n', 1),
                                    minWidth: '1.6ch',
                                    fontSize: '0.72em',
                                    padding: '0 2px',
                                    position: 'relative',
                                    top: '-0.85em',
                                    marginLeft: '1px',
                                    background: 'white',
                                    border: '1px dashed #ccc',
                                    borderRadius: '3px',
                                    color: '#0f172a',
                                }}
                            />
                        )}
                    </div>
                );
            } else if (bloque.tipo === 'fraccion' || bloque.tipo === 'euler' || bloque.tipo === 'absoluto') {
                const isNum = focusSlot?.parentId === bloque.id && focusSlot?.slot === 'numerador' && activeId !== 'START_SLOT';
                const isDen = focusSlot?.parentId === bloque.id && focusSlot?.slot === 'denominador' && activeId !== 'START_SLOT';
                const sStyle = (focused, slotType = 'center') => ({ minWidth: '20px', minHeight: '20px', display: 'flex', alignItems: slotType === 'numerador' ? 'flex-end' : (slotType === 'denominador' ? 'flex-start' : 'center'), justifyContent: 'center', padding: '0 2px', border: focused ? '1.5px solid #3b82f6' : '1px dashed transparent', borderRadius: '3px', transition: 'all 0.15s' });

                if (bloque.tipo === 'fraccion') {
                    blockJSX = (
                        <div key={bloque.id} className="fraction-block" onClick={clickBloque} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px', cursor: 'pointer', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1px solid transparent' }}>
                            <div className={`ghost-slot ${bloque.numerador.length === 0 ? 'empty-slot' : ''} ${isNum ? 'focused-slot' : ''}`} onClick={(e) => { e.stopPropagation(); setActiveIdSync(null); setFocusSlotSync({ parentId: bloque.id, slot: 'numerador' }); }} style={{ ...sStyle(isNum, 'numerador'), border: isNum ? '1.5px solid #3b82f6' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                {bloque.numerador.length === 0 ? <span className="ghost-text" style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic', transition: 'opacity 0.2s' }}>num</span> : renderListaBloques(bloque.numerador, false, isNestedInExponent, bloque.id, 'numerador')}
                                {isNum && <CursorMain height="16px" />}
                            </div>
                            <div style={{ width: '100%', height: '1.5px', background: isNum || isDen || activeId === bloque.id ? '#3b82f6' : '#334155', margin: '2px 0' }} />
                            <div className={`ghost-slot ${bloque.denominador.length === 0 ? 'empty-slot' : ''} ${isDen ? 'focused-slot' : ''}`} onClick={(e) => { e.stopPropagation(); setActiveIdSync(null); setFocusSlotSync({ parentId: bloque.id, slot: 'denominador' }); }} style={{ ...sStyle(isDen, 'denominador'), border: isDen ? '1.5px solid #3b82f6' : (bloque.denominador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                {bloque.denominador.length === 0 ? <span className="ghost-text" style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic', transition: 'opacity 0.2s' }}>den</span> : renderListaBloques(bloque.denominador, false, isNestedInExponent, bloque.id, 'denominador')}
                                {isDen && <CursorMain height="16px" />}
                            </div>
                        </div>
                    );
                } else if (bloque.tipo === 'euler') {
                    blockJSX = (
                        <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '2px' }}>
                            <div style={{ fontSize: '1.2em', lineHeight: 1, padding: '2px 4px', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1.5px solid transparent', borderRadius: '4px' }}><InlineMath math="e" /></div>
                            <div className="exponent-container" onClick={(e) => { e.stopPropagation(); setActiveIdSync(null); setFocusSlotSync({ parentId: bloque.id, slot: 'numerador' }); }} style={{ ...sStyle(isNum, 'center'), position: 'relative', top: '-1.5em', border: isNum ? '1.5px solid #3b82f6' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                <div style={{ transform: 'scale(0.75)', transformOrigin: 'left center', display: 'flex', alignItems: 'center', margin: '0 -12%', whiteSpace: 'nowrap' }}>
                                    {bloque.numerador.length === 0 ? <span style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic' }}>exp</span> : renderListaBloques(bloque.numerador, false, true, bloque.id, 'numerador')}
                                </div>
                                {isNum && <CursorMain height="16px" />}
                            </div>
                        </div>
                    );
                } else if (bloque.tipo === 'absoluto') {
                    blockJSX = (
                        <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'stretch', cursor: 'pointer', padding: '2px', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1px solid transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', color: '#334155' }}><InlineMath math="\vert" /></div>
                            <div onClick={(e) => { e.stopPropagation(); setActiveIdSync(null); setFocusSlotSync({ parentId: bloque.id, slot: 'numerador' }); }} style={{ ...sStyle(isNum, 'center'), border: isNum ? '1.5px solid #3b82f6' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                {bloque.numerador.length === 0 ? <span style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic' }}>{activeVariable}</span> : renderListaBloques(bloque.numerador, false, isNestedInExponent, bloque.id, 'numerador')}
                                {isNum && <CursorMain height="16px" />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', color: '#334155' }}><InlineMath math="\vert" /></div>
                        </div>
                    );
                }
            } else if (bloque.tipo === 'incognita_dinamica') {
                const varName = bloque.valor || 'k';
                blockJSX = <div key={bloque.id} onClick={clickBloque} style={{ fontSize: '1.2em', fontFamily: MATH_FONT, fontStyle: 'italic', padding: '2px 4px', cursor: 'pointer', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1px solid transparent', color: '#b45309' }}>{varName}</div>;
            }

            elementos.push(blockJSX);
            if (activeId === bloque.id && !focusSlot && !isTyping) {
                elementos.push(<CursorMain key={`c-${bloque.id}`} />);
            }
        });
        return elementos;
    };

    return (
        <div style={{ fontFamily: FONT, background: 'white', border: '1px solid var(--border-color)', borderRadius: RADIUS, padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <style>{`
                @keyframes blinkCursorMat251 { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .teclado-btn {
                    padding: 0;
                    min-height: 48px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    color: #1e293b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.05s ease;
                    user-select: none;
                }
                .teclado-btn:hover {
                    background-color: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .teclado-btn:active {
                    transform: scale(0.95);
                }
                .teclado-btn-danger {
                    background: #fee2e2;
                    border-color: #fca5a5;
                    color: #ef4444;
                }
                .teclado-btn-danger:hover {
                    background-color: #fecaca;
                }
                .teclado-btn-primary {
                    background: #e0f2fe;
                    border-color: #bae6fd;
                    color: #0284c7;
                }
                .teclado-btn-primary:hover {
                    background-color: #bae6fd;
                }
                .ghost-input {
                    transition: opacity 0.2s ease, border 0.2s ease;
                }
                .ghost-input:not(:focus):placeholder-shown {
                    opacity: 0 !important;
                    pointer-events: auto; /* Aún puede recibir clic aunque no se vea */
                }
                .ghost-slot {
                    transition: opacity 0.2s ease, border 0.2s ease;
                }
                .ghost-slot.empty-slot:not(.focused-slot) {
                    border-color: transparent !important;
                }
                .ghost-slot.empty-slot:not(.focused-slot) span.ghost-text {
                    opacity: 0 !important;
                }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ color: 'var(--primary-color)', margin: '0', fontSize: FS.md, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Funciones Continuas
                </h4>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => setModo('densidad')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: modo === 'densidad' ? '#fff' : 'transparent', color: modo === 'densidad' ? '#334155' : '#94a3b8', boxShadow: modo === 'densidad' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>Densidad f(x)</button>
                    <button onClick={() => setModo('acumulada')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: modo === 'acumulada' ? '#fff' : 'transparent', color: modo === 'acumulada' ? '#334155' : '#94a3b8', boxShadow: modo === 'acumulada' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>Acumulada F(x)</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div onClick={() => { setActiveIdSync(null); setFocusSlotSync(null); }} style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', background: '#f8fafc', padding: '20px 30px', borderRadius: '12px', color: '#0f172a', overflowX: 'auto', minHeight: '90px', border: '2px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1rem', marginRight: '10px', color: '#000', flexShrink: 0 }}><InlineMath math={modo === 'acumulada' ? 'F(x) =' : 'f(x) ='} /></div>
                    <div style={{ position: 'relative', display: 'inline-block', width: 'max-content', marginRight: '5px', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.2rem', color: '#334155', paddingRight: '5px', lineHeight: '1' }}><InlineMath math="\displaystyle \int" /></div>
                        <input type="text" name="limiteB" value={limiteB} onChange={(e) => handleLimiteChange(setLimiteB, e.target.value)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '-10px', left: '28px', width: getAnchoInput(limiteB || 'x', 1), background: 'transparent', border: '1px dashed #94a3b8', borderRadius: '3px', color: '#334155', fontSize: '0.8rem', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, padding: '0 2px' }} onFocus={handleFocus} onBlur={handleBlur} placeholder={modo === 'acumulada' ? 'x' : 'b'} onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') { e.preventDefault(); document.getElementsByName('limiteA')[0]?.focus(); }
                            else if (e.key === 'ArrowRight' && e.target.selectionEnd === e.target.value.length) { e.preventDefault(); e.target.blur(); setFocusSlotSync(null); setActiveIdSync('START'); }
                        }} />
                        <input type="text" name="limiteA" value={limiteA} onChange={(e) => handleLimiteChange(setLimiteA, e.target.value)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '-8px', left: '12px', width: getAnchoInput(limiteA, 1), background: 'transparent', border: '1px dashed #94a3b8', borderRadius: '3px', color: '#334155', fontSize: '0.8rem', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, padding: '0 2px' }} onFocus={handleFocus} onBlur={handleBlur} placeholder="a" onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') { e.preventDefault(); document.getElementsByName('limiteB')[0]?.focus(); }
                            else if (e.key === 'ArrowRight' && e.target.selectionEnd === e.target.value.length) { e.preventDefault(); document.getElementsByName('limiteB')[0]?.focus(); }
                        }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', flexShrink: 0 }}>
                        {renderListaBloques(bloques, true)}
                        {activeId === null && focusSlot === null && !isTyping && <CursorMain />}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginLeft: '6px', color: '#000', alignSelf: 'center', flexShrink: 0 }}><InlineMath math={modo === 'acumulada' ? 'dt' : 'dx'} /></div>
                </div>

                {focusSlot !== null && (
                    <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontStyle: 'italic', textAlign: 'center', marginTop: '-12px' }}>
                        ✏️ Editando {focusSlot.slot} — haz clic en el lienzo para salir
                    </div>
                )}

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: RADIUS, border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TECLADO MATEMÁTICO</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '+', '+')}><InlineMath math="+" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '-', '-')}><InlineMath math="-" /></button>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '∞', () => agregarBloque('constante', '∞'))} style={{ flex: 1 }}>
                                <InlineMath math="+\infty" />
                            </button>
                            <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '-∞', () => agregarBloque('constante', '-∞'))} style={{ flex: 1 }}>
                                <InlineMath math="-\infty" />
                            </button>
                        </div>

                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, 'π', 'pi')}><InlineMath math="\pi" /></button>

                        <button className="teclado-btn teclado-btn-danger" onMouseDown={(e) => handleBtnMouseDown(e, 'Limpiar', null)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button className="teclado-btn teclado-btn-danger" onMouseDown={(e) => handleBtnMouseDown(e, 'Backspace', borrarBloque)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                                <line x1="18" y1="9" x2="12" y2="15"></line>
                                <line x1="12" y1="9" x2="18" y2="15"></line>
                            </svg>
                        </button>

                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '(', 'paren_abre')}><InlineMath math="(" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, ')', 'paren_cierra')}><InlineMath math=")" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '(', 'corchete_abre')}><InlineMath math="[" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, ')', 'corchete_cierra')}><InlineMath math="]" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, 'abs(', 'absoluto')}><InlineMath math={`|${activeVariable}|`} /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '/', 'fraccion')}><InlineMath math="\frac{\square}{\square}" /></button>

                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, 'x', 'termino_lineal')}><InlineMath math={activeVariable} /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '^2', 'termino_cuadratico')}><InlineMath math={`${activeVariable}^2`} /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, '^', 'termino_potencia')}><InlineMath math={`${activeVariable}^n`} /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, 'exp(', 'euler')}><InlineMath math={`e^{${activeVariable}}`} /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, 'k', ['incognita_dinamica', 'k'])}><InlineMath math="k" /></button>
                        <button className="teclado-btn" onMouseDown={(e) => handleBtnMouseDown(e, null, 'constante')}><InlineMath math="\square" /></button>
                    </div>
                </div>

                {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '12px 15px', borderRadius: RADIUS, fontSize: FS.sm }}><strong>Error: </strong>{error}</div>}

                {mensajeInfo && <div style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe', padding: '12px 15px', borderRadius: RADIUS, fontSize: FS.sm }}><strong>Info: </strong>{mensajeInfo}</div>}

                {mensajeK && (
                    <div style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '12px 15px', borderRadius: RADIUS, fontSize: FS.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>Éxito: </strong>{mensajeK.texto}</span>
                        <button onClick={() => setMostrarModalK(true)} style={{ background: '#166534', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Ver Procedimiento
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button onClick={manejarValidacion} style={{ background: 'var(--primary-color)', color: 'white', borderRadius: RADIUS, border: 'none', padding: '14px 30px', fontSize: FS.sm, fontWeight: 800, cursor: 'pointer' }}>Calcular y Graficar Módulo</button>
                </div>
            </div>

            {mostrarModalK && mensajeK && (
                <ModalDespejeConstante
                    datos={mensajeK.datos}
                    onClose={() => setMostrarModalK(false)}
                />
            )}
        </div>
    );
}
