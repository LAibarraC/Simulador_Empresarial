import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ModalAlerta from '../../../ui/ModalAlerta';

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

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export default function ControlDistribucionContinua({ onCalcular, configuracion, setConfiguracion, calculando = false, errorCalculo = '' }) {
    const { bloques, limiteA, limiteB, constante } = configuracion;
    const bloquesRef = useRef(bloques);
    const setBloquesSync = (nuevos, preserveK = false) => {
        bloquesRef.current = nuevos;
        setConfiguracion(prev => ({ ...prev, bloques: nuevos, ...(preserveK ? {} : { constante: null }) }));
    };
    const modo = 'densidad';
    const setLimiteA = valor => setConfiguracion(prev => ({ ...prev, limiteA: valor, constante: null }));
    const setLimiteB = valor => setConfiguracion(prev => ({ ...prev, limiteB: valor, constante: null }));
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Error en la función', tipo: 'error' });
    const setError = (mensaje) => {
        if (!mensaje) {
            setModalAlerta(actual => ({ ...actual, isOpen: false }));
            return;
        }
        setModalAlerta({ isOpen: true, mensaje, titulo: 'Error en la función', tipo: 'error' });
    };
    const mensajeK = constante ? {
        texto: "¡Constante encontrada! " + constante.incognitaVar + ' = ' + constante.valorExacto, datos: constante,
    } : null;
    useEffect(() => {
        setError(errorCalculo);
    }, [errorCalculo]);

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
    const [editorActivo, setEditorActivo] = useState(false);
    const editorActivoRef = useRef(false);
    const lienzoRef = useRef(null);
    const panelRef = useRef(null);

    const activarEditor = (activo) => {
        editorActivoRef.current = activo;
        setEditorActivo(activo);
    };

    useEffect(() => {
        const detectarInteraccion = ({ target }) => {
            activarEditor(Boolean(lienzoRef.current?.contains(target) || panelRef.current?.contains(target)));
        };
        const ocultarCursor = () => activarEditor(false);
        document.addEventListener('pointerdown', detectarInteraccion, true);
        document.addEventListener('focusin', detectarInteraccion);
        window.addEventListener('blur', ocultarCursor);
        return () => {
            document.removeEventListener('pointerdown', detectarInteraccion, true);
            document.removeEventListener('focusin', detectarInteraccion);
            window.removeEventListener('blur', ocultarCursor);
        };
    }, []);
    useEffect(() => {
        bloquesRef.current = bloques;
        const objetivo = focusSlotRef.current?.parentId || activeIdRef.current;
        const existe = lista => lista.some(bloque => bloque.id === objetivo
            || existe(bloque.numerador || []) || existe(bloque.denominador || []));
        if (objetivo && objetivo !== 'START' && objetivo !== 'START_SLOT' && !existe(bloques)) {
            setActiveIdSync(null);
            setFocusSlotSync(null);
        }
    }, [bloques]);

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
            if (!editorActivoRef.current || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
            const campoPotencia = e.target.dataset?.campoPotencia;
            const haciaIzquierda = e.key === 'ArrowLeft';
            const flechaHorizontal = haciaIzquierda || e.key === 'ArrowRight';
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const borde = haciaIzquierda ? 0 : e.target.value.length;
                if (campoPotencia !== 'exponente' || !flechaHorizontal || e.shiftKey
                    || e.target.selectionStart !== borde || e.target.selectionEnd !== borde) return;
            }

            if (flechaHorizontal) {
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
                        if (b.tipo === 'termino_potencia') {
                            positions.push({ activeId: b.id, focusSlot: currentParentSlot, campo: 'base' });
                            if (String(b.exp ?? '').startsWith('-')) {
                                positions.push({ activeId: b.id, focusSlot: currentParentSlot, campo: 'signo' });
                            }
                            positions.push({ activeId: b.id, focusSlot: currentParentSlot, campo: 'exponente' });
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
                    if (p.campo !== campoPotencia) return false;
                    if (p.activeId !== null && p.activeId !== 'START' && p.activeId !== 'START_SLOT') return true;

                    if (!p.focusSlot && !focusSlotRef.current) return true;
                    if (p.focusSlot && focusSlotRef.current) {
                        return p.focusSlot.parentId === focusSlotRef.current.parentId && p.focusSlot.slot === focusSlotRef.current.slot;
                    }
                    return false;
                });

                if (currentIndex === -1 && activeIdRef.current === null && focusSlotRef.current) {
                    const { parentId, slot } = focusSlotRef.current;
                    currentIndex = positions.findLastIndex(p => p.focusSlot?.parentId === parentId && p.focusSlot?.slot === slot);
                }

                if (currentIndex !== -1 || e.key === 'ArrowLeft') {
                    let newIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
                    if (newIndex >= 0 && newIndex < positions.length) {
                        const newPos = positions[newIndex];
                        if (newPos.campo) {
                            const campo = lienzoRef.current?.querySelector(
                                `[data-potencia-id="${newPos.activeId}"][data-campo-potencia="${newPos.campo}"]`
                            );
                            campo?.focus();
                            if (newPos.campo === 'exponente' && campo) {
                                const cursor = haciaIzquierda ? campo.value.length : 0;
                                campo.setSelectionRange(cursor, cursor);
                            }
                        } else if (campoPotencia) {
                            e.target.blur();
                        }
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
                    // Al escribir delante de un número, conservarlo como un solo bloque.
                    const inicioRaiz = activeIdRef.current === 'START' && list === newBloques && i === 0;
                    const inicioCasilla = activeIdRef.current === 'START_SLOT' && focusSlotRef.current?.parentId === b.id;
                    const siguiente = inicioRaiz ? b : inicioCasilla ? b[focusSlotRef.current.slot][0] : null;
                    if (siguiente?.tipo === 'constante' && /^\d*\.?\d*$/.test(siguiente.coef)) {
                        if (e.key !== '.' || !siguiente.coef.includes('.')) {
                            siguiente.coef = e.key + siguiente.coef;
                        }
                        setActiveIdSync(siguiente.id);
                        appended = true;
                        return true;
                    }
                    if (activeIdRef.current === null && focusSlotRef.current?.parentId === b.id) {
                        const targetArr = b[focusSlotRef.current.slot];
                        if (targetArr.length > 0) {
                            const lastBlock = targetArr[targetArr.length - 1];
                            if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(lastBlock.tipo)) {
                                if (e.key === '.' && String(lastBlock.coef).includes('.')) { appended = true; return true; }
                                targetArr[targetArr.length - 1].coef += e.key;
                                appended = true;
                                return true;
                            }
                        }
                    }
                    if (activeIdRef.current === b.id && ['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(b.tipo)) {
                        if (e.key === '.' && String(b.coef).includes('.')) { appended = true; return true; }
                        b.coef += e.key;
                        appended = true;
                        return true;
                    }
                    return false;
                });

                e.preventDefault();
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
                e.preventDefault();
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
    const casillaFraccionVacia = (lista) => lista.length === 0
        || lista.every(bloque => bloque.tipo === 'constante' && String(bloque.coef ?? '').trim() === '');

    const agregarBloque = (tipo, valor = '') => {
        if (tipo === 'fraccion') {
            const objetivo = focusSlotRef.current?.parentId ?? activeIdRef.current;
            let pendiente = null;
            buscarYEjecutar(deepClone(bloquesRef.current), (lista, indice, padre) => {
                const bloque = lista[indice];
                if (bloque.id !== objetivo) return false;
                const fraccion = bloque.tipo === 'fraccion' ? bloque : padre;
                if (fraccion?.tipo !== 'fraccion') return true;
                if (casillaFraccionVacia(fraccion.numerador)) {
                    pendiente = { parentId: fraccion.id, slot: 'numerador' };
                } else if (casillaFraccionVacia(fraccion.denominador)) {
                    pendiente = { parentId: fraccion.id, slot: 'denominador' };
                }
                return true;
            });
            if (pendiente) {
                setActiveIdSync(null);
                setFocusSlotSync(pendiente);
                return;
            }
        }
        // Un número seguido de x, x² o xⁿ pasa a ser su coeficiente.
        if (['termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(tipo)) {
            const nuevos = deepClone(bloquesRef.current);
            let convertido = false;
            buscarYEjecutar(nuevos, (lista, indice) => {
                const actual = lista[indice];
                const alFinal = activeIdRef.current === null && !focusSlotRef.current
                    && lista === nuevos && indice === lista.length - 1;
                if ((actual.id === activeIdRef.current || alFinal) && actual.tipo === 'constante'
                    && actual.coef.trim() !== '' && Number.isFinite(Number(actual.coef))) {
                    actual.tipo = tipo;
                    setActiveIdSync(actual.id);
                    convertido = true;
                    return true;
                }
                return false;
            });
            if (convertido) {
                setBloquesSync(nuevos);
                return;
            }
        }
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
            setActiveIdSync(null);
            setFocusSlotSync({ parentId: b.id, slot: tipo === 'fraccion' ? 'denominador' : 'numerador' });
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
        if (activeIdRef.current === 'START' || activeIdRef.current === 'START_SLOT') return;
        const currentBloques = deepClone(bloquesRef.current);
        let deleted = false;

        buscarYEjecutar(currentBloques, (list, i, parentBlock, slotName) => {
            const b = list[i];
            if (activeIdRef.current === b.id) {
                if (['constante', 'termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(b.tipo) && b.coef) {
                    b.coef = String(b.coef).slice(0, -1);
                    if (b.coef || b.tipo !== 'constante') {
                        deleted = true;
                        return true;
                    }
                }
                list.splice(i, 1);
                if (i > 0) {
                    setActiveIdSync(list[i - 1].id);
                    setFocusSlotSync(parentBlock ? { parentId: parentBlock.id, slot: slotName } : null);
                } else {
                    if (parentBlock) {
                        setActiveIdSync(list.length ? 'START_SLOT' : null);
                        setFocusSlotSync({ parentId: parentBlock.id, slot: slotName });
                    } else {
                        setActiveIdSync('START');
                        setFocusSlotSync(null);
                    }
                }
                deleted = true;
                return true;
            }

            if (activeIdRef.current === null && focusSlotRef.current?.parentId === b.id) {
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

        if (!deleted && !focusSlotRef.current && activeIdRef.current === null && currentBloques.length > 0) {
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
    const manejarValidacion = async () => {
        let errorFraccion = '';
        buscarYEjecutar(deepClone(bloquesRef.current), (lista, indice) => {
            const bloque = lista[indice];
            if (bloque.tipo !== 'fraccion') return false;
            if (casillaFraccionVacia(bloque.numerador) || casillaFraccionVacia(bloque.denominador)) {
                errorFraccion = 'Completa el numerador y el denominador de cada fracción antes de calcular.';
            } else {
                const [valor] = bloque.denominador;
                if (bloque.denominador.length === 1 && valor.tipo === 'constante' && Number(valor.coef) === 0) {
                    errorFraccion = 'El denominador de una fracción no puede ser cero.';
                }
            }
            return Boolean(errorFraccion);
        });
        if (errorFraccion) {
            setError(errorFraccion);
            return;
        }
        const calculo = await onCalcular();
        if (!calculo?.cancelado) setError(calculo?.error || '');
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

    const convertirConstanteEnTermino = (input, tipo = 'termino_lineal') => {
        const coeficiente = input.value.trim();
        if (coeficiente && !Number.isFinite(Number(coeficiente))) return;

        const id = activeIdRef.current;
        const nuevos = deepClone(bloquesRef.current);
        const convertido = buscarYEjecutar(nuevos, (lista, indice) => {
            const bloque = lista[indice];
            if (bloque.id !== id || bloque.tipo !== 'constante') return false;
            bloque.tipo = tipo;
            return true;
        });
        if (!convertido) return;

        setBloquesSync(nuevos);
        input.blur();
    };

    const handleBtnMouseDown = (e, charToAppend, blockAction) => {
        e.preventDefault(); // Evita que el botón quite el foco del input
        activarEditor(true);
        const a = document.activeElement;

        if (charToAppend === 'Limpiar') {
            limpiarTodo();
            return;
        }
        if (charToAppend === 'Backspace' && a?.dataset.campoPotencia === 'signo') {
            a.click();
            return;
        }

        // Si el usuario está tecleando en ALGÚN input (límites, coeficientes, exponentes)
        if (a && a.tagName === 'INPUT' && lienzoRef.current?.contains(a)) {
            if (a.hasAttribute('data-exponente') && charToAppend === 'Backspace'
                && a.selectionStart === 0 && a.selectionEnd === 0) {
                updateBlockById(activeIdRef.current, 'exp', a.value);
                return;
            }
            if (a.hasAttribute('data-exponente') && (charToAppend === '-' || charToAppend === '+')) {
                updateBlockById(activeIdRef.current, 'exp', (charToAppend === '-' ? '-' : '') + a.value);
                return;
            }
            if (['termino_lineal', 'termino_cuadratico', 'termino_potencia'].includes(blockAction) && a.hasAttribute('data-constante-numerica')) {
                convertirConstanteEnTermino(a, blockAction);
                return;
            }
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

    const escribirDesdePanel = (e, tecla) => {
        handleBtnMouseDown(e, tecla, () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: tecla }));
        });
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
            if (e.shiftKey || e.target.selectionStart !== e.target.selectionEnd) return;
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

    const CursorMain = ({ height = '24px' }) => editorActivo && (
        <div className="cursor-formula" style={{
            width: '2px', height, background: '#3b82f6',
            margin: '0 2px', borderRadius: '1px',
            animation: 'blinkCursorMat251 1s step-end infinite'
        }} title="Inserción" />
    );

    const propsCasilla = (parentId, slot, etiqueta) => {
        const seleccionar = () => {
            setActiveIdSync(null);
            setFocusSlotSync({ parentId, slot });
        };
        return {
            role: 'group',
            tabIndex: 0,
            'aria-label': etiqueta,
            onFocus: (e) => {
                if (e.target === e.currentTarget) seleccionar();
            },
            onClick: (e) => {
                e.stopPropagation();
                e.currentTarget.focus();
                seleccionar();
            },
        };
    };

    const baseInputStyle = { background: 'var(--bg-input)', border: '1px dashed #ccc', borderRadius: '4px', color: 'var(--text-main)', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, transition: 'all 0.2s', lineHeight: 1 };

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
                if (e.type === 'click' && document.activeElement?.tagName === 'INPUT') document.activeElement.blur();
                setActiveIdSync(bloque.id);
                setFocusSlotSync(null);
            };

            let blockJSX = null;

            if (bloque.tipo === 'signo') {
                blockJSX = (
                    <span key={bloque.id} tabIndex={0} onClick={clickBloque} onFocus={clickBloque}
                        style={{ display: 'inline-flex', justifyContent: 'center', minWidth: '2.5ch', cursor: 'pointer', fontFamily: MATH_FONT }}>
                        {bloque.valor}
                    </span>
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
                        <input type="text" inputMode="decimal" step="any" className="ghost-input" data-constante-numerica aria-label="Constante numérica" placeholder="□" value={bloque.coef} onChange={(e) => updateBlockById(bloque.id, 'coef', e.target.value)} onClick={(e) => e.stopPropagation()} onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }} onBlur={(e) => {
                            e.target.style.border = '1px solid transparent';
                            setIsTyping(false);
                            if (e.target.value !== '') return;

                            const nuevos = deepClone(bloquesRef.current);
                            let eliminado = false;
                            buscarYEjecutar(nuevos, (lista, indice, parentBlock, slotName) => {
                                const actual = lista[indice];
                                if (actual.id !== bloque.id || actual.tipo !== 'constante' || actual.coef !== '') return false;
                                lista.splice(indice, 1);
                                if (activeIdRef.current === actual.id) {
                                    setActiveIdSync(indice > 0 ? lista[indice - 1].id : parentBlock ? (lista.length ? 'START_SLOT' : null) : 'START');
                                    setFocusSlotSync(parentBlock ? { parentId: parentBlock.id, slot: slotName } : null);
                                }
                                eliminado = true;
                                return true;
                            });
                            if (eliminado) setBloquesSync(nuevos);
                        }} onKeyDown={(e) => {
                            if (e.key.toLowerCase() === activeVariable && !e.ctrlKey && !e.metaKey && !e.altKey) {
                                e.preventDefault();
                                convertirConstanteEnTermino(e.currentTarget);
                                return;
                            }
                            handleInputKeyDown(e, bloque.id);
                        }} style={{ ...baseInputStyle, width: getAnchoInput(bloque.coef, 2), fontSize: '0.8em', padding: '0', border: '1px solid transparent', background: 'transparent' }} />
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
                const varStr = modo === 'acumulada' ? 't' : 'x';
                const exponente = String(bloque.exp ?? '');
                const negativo = exponente.startsWith('-');
                const magnitud = exponente.replace(/^[+-]/, '');

                blockJSX = (
                    <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer', padding: '1px' }}>
                        {
                            <input type="text" inputMode="decimal" step="any" className="ghost-input coeficiente-input" aria-label="Coeficiente del término" placeholder="1" value={bloque.coef} onChange={(e) => updateBlockById(bloque.id, 'coef', e.target.value)} onClick={(e) => e.stopPropagation()} onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }} onBlur={handleBlur} onKeyDown={(e) => handleInputKeyDown(e, bloque.id)} style={{ ...baseInputStyle, width: getAnchoInput(bloque.coef, 1), fontSize: '0.8em', padding: '0', border: bloque.coef === '' ? '1.5px dashed #3b82f6' : '1px solid transparent', background: 'transparent' }} />
                        }
                        <div
                            tabIndex={bloque.tipo === 'termino_potencia' ? -1 : undefined}
                            data-potencia-id={bloque.tipo === 'termino_potencia' ? bloque.id : undefined}
                            data-campo-potencia={bloque.tipo === 'termino_potencia' ? 'base' : undefined}
                            onFocus={bloque.tipo === 'termino_potencia' ? clickBloque : undefined}
                            onClick={bloque.tipo === 'termino_potencia' ? (e) => {
                                e.stopPropagation();
                                e.currentTarget.focus();
                            } : undefined}
                            style={{ fontSize: '0.8em', margin: '0 2px' }}
                        >
                            {bloque.tipo === 'termino_lineal' && <InlineMath math={varStr} />}
                            {bloque.tipo === 'termino_cuadratico' && <InlineMath math={`${varStr}^2`} />}
                            {bloque.tipo === 'termino_potencia' && <InlineMath math={varStr} />}
                        </div>
                        {bloque.tipo === 'termino_potencia' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', top: '-0.85em', marginLeft: '1px' }}>
                            {negativo && (
                                <button type="button" aria-label="Quitar el signo menos del exponente"
                                    data-potencia-id={bloque.id}
                                    data-campo-potencia="signo"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onFocus={clickBloque}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const campo = e.currentTarget.nextElementSibling;
                                        campo.focus();
                                        campo.setSelectionRange(0, 0);
                                        updateBlockById(bloque.id, 'exp', magnitud);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' || e.key === 'Delete') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.currentTarget.click();
                                        }
                                    }}
                                    style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: '0 2px', fontFamily: MATH_FONT }}>
                                    −
                                </button>
                            )}
                            <input
                                type="text"
                                inputMode="decimal"
                                step="any"
                                className="exponente-input"
                                data-exponente
                                data-potencia-id={bloque.id}
                                data-campo-potencia="exponente"
                                aria-label="Exponente de la potencia"
                                value={magnitud}
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    if (/^[+-]?(?:\d*\.?\d*)$/.test(valor)) {
                                        const signo = valor.startsWith('-') || (negativo && !valor.startsWith('+')) ? '-' : '';
                                        updateBlockById(bloque.id, 'exp', signo + valor.replace(/^[+-]/, ''));
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => { handleFocus(e); setActiveIdSync(bloque.id); setFocusSlotSync(null); }}
                                onBlur={handleBlur}
                                onKeyDown={(e) => {
                                    if (negativo && e.key === 'Backspace'
                                        && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
                                        e.preventDefault();
                                        updateBlockById(bloque.id, 'exp', magnitud);
                                    } else if (e.key === '-' || e.key === '+') {
                                        e.preventDefault();
                                        updateBlockById(bloque.id, 'exp', (e.key === '-' ? '-' : '') + magnitud);
                                    } else if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                        handleInputKeyDown(e, bloque.id);
                                    }
                                }}
                                placeholder="n"
                                style={{
                                    ...baseInputStyle,
                                    width: getAnchoInput(magnitud || 'n', 1),
                                    minWidth: '1.6ch',
                                    fontSize: '0.72em',
                                    padding: '0 2px',
                                    background: 'var(--bg-input)',
                                    border: '1px dashed #ccc',
                                    borderRadius: '3px',
                                    color: 'var(--text-main)',
                                }}
                            />
                            </span>
                        )}
                    </div>
                );
            } else if (bloque.tipo === 'fraccion' || bloque.tipo === 'euler' || bloque.tipo === 'absoluto') {
                const isNum = focusSlot?.parentId === bloque.id && focusSlot?.slot === 'numerador' && activeId !== 'START_SLOT';
                const isDen = focusSlot?.parentId === bloque.id && focusSlot?.slot === 'denominador' && activeId !== 'START_SLOT';
                const sStyle = (focused, slotType = 'center') => ({ minWidth: '20px', minHeight: '20px', display: 'flex', alignItems: slotType === 'numerador' ? 'flex-end' : (slotType === 'denominador' ? 'flex-start' : 'center'), justifyContent: 'center', padding: '0 2px', border: focused ? '2px solid #2563eb' : '1px dashed transparent', borderRadius: '3px', background: focused ? 'rgba(59, 130, 246, 0.12)' : 'transparent', boxShadow: focused ? '0 0 0 2px rgba(59, 130, 246, 0.16)' : 'none', transition: 'all 0.15s' });

                if (bloque.tipo === 'fraccion') {
                    blockJSX = (
                        <div key={bloque.id} className="fraction-block" onClick={clickBloque} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px', cursor: 'pointer', border: '1px solid transparent' }}>
                            <div className={`ghost-slot ${bloque.numerador.length === 0 ? 'empty-slot' : ''} ${isNum ? 'focused-slot' : ''}`} {...propsCasilla(bloque.id, 'numerador', 'Escribir en el numerador')} style={{ ...sStyle(isNum, 'numerador'), border: isNum ? '1px dashed currentColor' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent'), flexShrink: 0 }}>
                                {bloque.numerador.length === 0 ? <span aria-hidden="true">&nbsp;</span> : renderListaBloques(bloque.numerador, false, isNestedInExponent, bloque.id, 'numerador')}
                                {isNum && (activeId === null || activeId === bloque.id) && <CursorMain height="16px" />}
                            </div>
                            <div style={{ width: '100%', height: '1.5px', background: 'currentColor', margin: '2px 0', flexShrink: 0 }} />
                            <div className={`ghost-slot ${bloque.denominador.length === 0 ? 'empty-slot' : ''} ${isDen ? 'focused-slot' : ''}`} {...propsCasilla(bloque.id, 'denominador', 'Escribir en el denominador')} style={{ ...sStyle(isDen, 'denominador'), border: isDen ? '1px dashed currentColor' : (bloque.denominador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent'), flexShrink: 0 }}>
                                {bloque.denominador.length === 0 ? <span aria-hidden="true">&nbsp;</span> : renderListaBloques(bloque.denominador, false, isNestedInExponent, bloque.id, 'denominador')}
                                {isDen && (activeId === null || activeId === bloque.id) && <CursorMain height="16px" />}
                            </div>
                        </div>
                    );
                } else if (bloque.tipo === 'euler') {
                    blockJSX = (
                        <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '2px' }}>
                            <div style={{ fontSize: '1.2em', lineHeight: 1, padding: '2px 4px', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1.5px solid transparent', borderRadius: '4px' }}><InlineMath math="e" /></div>
                            <div className="exponent-container ghost-slot" {...propsCasilla(bloque.id, 'numerador', 'Editar el exponente de e')} style={{ ...sStyle(isNum, 'center'), position: 'relative', top: '-1.5em', border: isNum ? '1.5px solid #3b82f6' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                <div style={{ transform: 'scale(0.75)', transformOrigin: 'left center', display: 'flex', alignItems: 'center', margin: '0 -12%', whiteSpace: 'nowrap' }}>
                                    {bloque.numerador.length === 0 ? <span style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic' }}>exp</span> : renderListaBloques(bloque.numerador, false, true, bloque.id, 'numerador')}
                                </div>
                                {isNum && (activeId === null || activeId === bloque.id) && <CursorMain height="16px" />}
                            </div>
                        </div>
                    );
                } else if (bloque.tipo === 'absoluto') {
                    blockJSX = (
                        <div key={bloque.id} onClick={clickBloque} style={{ display: 'flex', alignItems: 'stretch', cursor: 'pointer', padding: '2px', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1px solid transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', color: 'var(--text-main)' }}><InlineMath math="\vert" /></div>
                            <div className="ghost-slot" {...propsCasilla(bloque.id, 'numerador', 'Editar el valor absoluto')} style={{ ...sStyle(isNum, 'center'), border: isNum ? '1.5px solid #3b82f6' : (bloque.numerador.length === 0 ? '1px dashed #94a3b8' : '1px solid transparent') }}>
                                {bloque.numerador.length === 0 ? <span style={{ color: '#cbd5e1', fontSize: '0.68rem', fontStyle: 'italic' }}>{activeVariable}</span> : renderListaBloques(bloque.numerador, false, isNestedInExponent, bloque.id, 'numerador')}
                                {isNum && (activeId === null || activeId === bloque.id) && <CursorMain height="16px" />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', color: 'var(--text-main)' }}><InlineMath math="\vert" /></div>
                        </div>
                    );
                }
            } else if (bloque.tipo === 'incognita_dinamica') {
                const varName = bloque.valor || 'k';
                blockJSX = <div key={bloque.id} onClick={clickBloque} style={{ fontSize: '1.2em', fontFamily: MATH_FONT, fontStyle: 'italic', padding: '2px 4px', cursor: 'pointer', border: activeId === bloque.id && !focusSlot ? '1.5px solid #3b82f6' : '1px solid transparent' }}>{varName}</div>;
            }

            elementos.push(blockJSX);
            if (activeId === bloque.id && focusSlot?.parentId !== bloque.id && !isTyping) {
                elementos.push(<CursorMain key={`c-${bloque.id}`} height={isNestedInExponent ? '12px' : '24px'} />);
            }
        });
        return elementos;
    };

    const obtenerEstadoEntrada = () => {
        if (!editorActivo) return 'Selecciona una casilla para escribir. Usa ← → para moverte y ↑ ↓ entre numerador y denominador.';
        if (isTyping) return 'Editando el valor seleccionado. Escribe directamente o usa las teclas del panel.';
        if (focusSlot) {
            return 'Casilla activa. Escribe con el teclado o el panel. Usa Tab para pasar al siguiente campo.';
        }
        if (activeId === 'START') return 'Punto de entrada: inicio de la función. Usa ←/→ para moverte por la expresión.';
        if (activeId && activeId !== 'START' && activeId !== 'START_SLOT') {
            return 'Punto de entrada junto al elemento seleccionado. Haz clic en un valor para editarlo y usa ←/→ para moverte.';
        }
        return 'Punto de entrada: final de la función. Haz clic en una casilla punteada para elegir dónde escribir; usa ←/→ para moverte.';
    };

    return (
        <div style={{ fontFamily: FONT, background: 'transparent', padding: '0', marginTop: '10px' }}>
            <style>{`
                @keyframes blinkCursorMat251 { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .teclado-btn {
                    padding: 0;
                    min-height: 48px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 5px;
                    font-size: 1.1rem;
                    color: #1e293b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.05s ease;
                    user-select: none;
                }
                html.dark .teclado-btn {
                    background: var(--bg-input, #2a2a2a);
                    border-color: var(--border-color, #444);
                    color: var(--text-main, #fff);
                }
                .formula-container {
                    background: #f8fafc;
                    color: #0f172a;
                    border: 2px solid #e2e8f0;
                }
                html.dark .formula-container {
                    background: var(--bg-input);
                    color: var(--text-main);
                    border-color: var(--border-color);
                }
                #tour-continua-lienzo-formula {
                    background: var(--bg-card, #fff);
                    border: 1px solid var(--border-color, #dbe4ef);
                    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
                }
                #tour-continua-lienzo-formula :is(.limite-input, .exponente-input, .ghost-slot):hover {
                    background-color: rgba(59, 130, 246, 0.08);
                }
                #tour-continua-lienzo-formula :is(.limite-input, .exponente-input, .ghost-slot, .ghost-input, [data-campo-potencia]):focus-visible {
                    outline: 2px solid #60a5fa !important;
                    outline-offset: 1px;
                }
                #tour-continua-lienzo-formula:has([data-campo-potencia]:focus) .cursor-formula {
                    display: none;
                }
                #tour-continua-lienzo-formula .fraction-block > .ghost-slot {
                    background: transparent !important;
                    box-shadow: none !important;
                }
                #tour-continua-lienzo-formula .fraction-block > .ghost-slot {
                    border: 1px dashed transparent !important;
                }
                #tour-continua-lienzo-formula .fraction-block > .ghost-slot:is(.empty-slot, .focused-slot),
                #tour-continua-lienzo-formula .fraction-block > .ghost-slot:has(> div:not(.fraction-block) > input:focus) {
                    border-color: currentColor !important;
                }
                #tour-continua-lienzo-formula .fraction-block > .ghost-slot:focus-visible {
                    outline: none !important;
                }
                #tour-continua-lienzo-formula .fraction-block .ghost-slot input,
                #tour-continua-lienzo-formula .fraction-block .ghost-slot input:focus-visible {
                    outline: none !important;
                    box-shadow: none !important;
                    border-color: transparent !important;
                    border-radius: 0;
                    background: transparent !important;
                }
                #tour-continua-lienzo-formula .fraction-block .cursor-formula {
                    background: currentColor !important;
                }
                :is(html.dark, [data-theme='dark']) #tour-continua-barra-estado {
                    color: #fff !important;
                }
                .teclado-container {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }
                html.dark .teclado-container {
                    background: var(--bg-card);
                    border-color: var(--border-color);
                }
                .limite-input {
                    background: transparent;
                    border: 1px dashed #94a3b8;
                    color: var(--text-main);
                    border-radius: 3px;
                }
                :is(html.dark, [data-theme='dark']) #tour-continua-lienzo-formula input {
                    color-scheme: dark;
                    background: var(--bg-input, #252525) !important;
                    color: #fff !important;
                    -webkit-text-fill-color: #fff !important;
                    caret-color: #fff;
                }
                :is(html.dark, [data-theme='dark']) #tour-continua-lienzo-formula input::placeholder {
                    color: #94a3b8;
                    -webkit-text-fill-color: #94a3b8;
                    opacity: 1;
                }
                :is(html.dark, [data-theme='dark']) #tour-continua-lienzo-formula input:autofill {
                    box-shadow: 0 0 0 1000px var(--bg-input, #252525) inset !important;
                    -webkit-text-fill-color: #fff !important;
                }
                :is(html.dark, [data-theme='dark']) #tour-continua-lienzo-formula .limite-input {
                    border-color: #64748b;
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
                #tour-continua-lienzo-formula .coeficiente-input:placeholder-shown:not(:focus) {
                    width: 0.5ch !important;
                    border-color: transparent !important;
                    background: transparent !important;
                }
                #tour-continua-lienzo-formula .coeficiente-input:not(:focus)::placeholder {
                    color: transparent !important;
                    -webkit-text-fill-color: transparent !important;
                }
                .ghost-input {
                    transition: opacity 0.2s ease, border 0.2s ease;
                }
                .ghost-input:not(:focus):placeholder-shown {
                    opacity: 1 !important;
                    border: 1px dashed #94a3b8 !important;
                }
                .ghost-slot {
                    transition: opacity 0.2s ease, border 0.2s ease;
                }
                .ghost-slot.empty-slot:not(.focused-slot) span.ghost-text {
                    opacity: 1 !important;
                }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px',flexWrap: 'wrap', gap: '10px'}}>
                <h4 style={{ color: 'var(--text-pure)', margin: '0', fontSize: FS.md, fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Funciones Continuas
                </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div ref={lienzoRef} id="tour-continua-lienzo-formula" role="group" aria-label="Editor de la función" onClick={() => { setActiveIdSync(null); setFocusSlotSync(null); }} className="formula-container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', padding: '15px 15px', borderRadius: '5px', overflowX: 'auto', minHeight: '80px' }}>
                    <div style={{ fontSize: '1rem', marginRight: '10px', color: 'inherit', flexShrink: 0 }}><InlineMath math={'f(x) ='} /></div>
                    <div id="tour-continua-limites" style={{ position: 'relative', display: 'inline-block', width: 'max-content', marginRight: '25px', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.2rem', paddingRight: '5px', lineHeight: '1' }}><InlineMath math="\displaystyle \int" /></div>
                        <input type="text" name="limiteB" aria-label="Límite superior" className="limite-input" value={limiteB} onChange={(e) => handleLimiteChange(setLimiteB, e.target.value)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '-10px', left: '28px', width: getAnchoInput(limiteB || 'x', 1), fontSize: '0.8rem', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, padding: '0 2px' }} onFocus={handleFocus} onBlur={handleBlur} placeholder={modo === 'acumulada' ? 'x' : 'b'} onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') { e.preventDefault(); document.getElementsByName('limiteA')[0]?.focus(); }
                            else if (e.key === 'ArrowRight' && e.target.selectionEnd === e.target.value.length) { e.preventDefault(); e.target.blur(); setFocusSlotSync(null); setActiveIdSync('START'); }
                        }} />
                        <input type="text" name="limiteA" aria-label="Límite inferior" className="limite-input" value={limiteA} onChange={(e) => handleLimiteChange(setLimiteA, e.target.value)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '-8px', left: '12px', width: getAnchoInput(limiteA, 1), fontSize: '0.8rem', textAlign: 'center', outline: 'none', fontFamily: MATH_FONT, padding: '0 2px' }} onFocus={handleFocus} onBlur={handleBlur} placeholder="a" onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') { e.preventDefault(); document.getElementsByName('limiteB')[0]?.focus(); }
                            else if (e.key === 'ArrowRight' && e.target.selectionEnd === e.target.value.length) { e.preventDefault(); document.getElementsByName('limiteB')[0]?.focus(); }
                        }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', flexShrink: 0 }}>
                        {renderListaBloques(bloques, true)}
                        {activeId === null && focusSlot === null && !isTyping && <CursorMain />}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginLeft: '6px', color: 'inherit', alignSelf: 'center', flexShrink: 0 }}><InlineMath math={modo === 'acumulada' ? 'dt' : 'dx'} /></div>
                </div>



                <div id="tour-continua-barra-estado" role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px', padding: '0 4px', color: 'var(--text-main, #334155)', fontSize: FS.xs }}>
                    <span aria-hidden="true" style={{ display: 'inline-flex', width: '18px', height: '18px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-input, #e2e8f0)', color: 'inherit', fontWeight: 700 }}>i</span>
                    <span>{obtenerEstadoEntrada()}</span>
                </div>

                <div ref={panelRef} id="tour-continua-teclado" className="teclado-container" style={{ padding: '10px', borderRadius: RADIUS, marginTop: 0 }}>
                    <div className="teclado-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {/* Fila 1 */}
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '(', 'paren_abre'); }}><InlineMath math="(" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, ')', 'paren_cierra'); }}><InlineMath math=")" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'abs(', 'absoluto'); }}><InlineMath math={`|${activeVariable}|`} /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '/', 'fraccion'); }}><InlineMath math="\frac{\square}{\square}" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '∞', () => agregarBloque('constante', '∞')); }}><InlineMath math="\infty" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'Limpiar', null); }} style={{ gridColumn: 'span 2', border: '1px solid #ef4444', color: '#ef4444' }}><span style={{fontWeight: 600}}>AC</span></button>

                        {/* Fila 2 */}
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '7')}>7</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '8')}>8</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '9')}>9</button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '+', '+'); }}><InlineMath math="+" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'x', 'termino_lineal'); }}><InlineMath math={activeVariable} /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '^2', 'termino_cuadratico'); }}><InlineMath math={`${activeVariable}^2`} /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'Backspace', borrarBloque); }} style={{ border: '1px solid #f59e0b', color: '#f59e0b' }}><span style={{fontWeight: 600}}>DEL</span></button>

                        {/* Fila 3 */}
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '4')}>4</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '5')}>5</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '6')}>6</button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '-', '-'); }}><InlineMath math="-" /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, '^', 'termino_potencia'); }}><InlineMath math={`${activeVariable}^n`} /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'exp(', 'euler'); }}><InlineMath math={`e^{${activeVariable}}`} /></button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, 'k', ['incognita_dinamica', 'k']); }}><InlineMath math="k" /></button>

                        {/* Fila 4 */}
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '1')}>1</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '2')}>2</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '3')}>3</button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => escribirDesdePanel(e, '.')}>.</button>
                        <button className="teclado-btn-dark num" onMouseDown={(e) => escribirDesdePanel(e, '0')} style={{ gridColumn: 'span 2' }}>0</button>
                        <button className="teclado-btn-dark" onMouseDown={(e) => { e.preventDefault(); handleBtnMouseDown(e, null, 'constante'); }}><InlineMath math="\square" /></button>
                    </div>
                </div>

                <style>{`
                    .teclado-btn-dark {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #f8fafc;
                        color: #1e293b;
                        border: 1px solid #e2e8f0;
                        border-radius: 5px;
                        padding: 8px 0;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        min-height: 45px;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        font-size: 1.1rem;
                    }
                    html.dark .teclado-btn-dark {
                        background: var(--bg-input);
                        color: var(--text-main);
                        border-color: var(--border-color);
                    }
                    .teclado-btn-dark.num {
                        background: #ffffff;
                        color: var(--text-main);
                        border: 1px solid #e2e8f0;
                        font-weight: 600;
                    }
                    html.dark .teclado-btn-dark.num {
                        background: #1e1e1e;
                        color: var(--text-main);
                        border-color: var(--border-color);
                    }
                    .teclado-btn-dark:hover {
                        background: #e2e8f0;
                        transform: translateY(-1px);
                    }
                    html.dark .teclado-btn-dark:hover {
                        background: #333333;
                    }
                    .teclado-btn-dark:active {
                        transform: translateY(2px);
                        box-shadow: none;
                    }
                    @media (max-width: 640px) {
                        .teclado-grid {
                            gap: 4px !important;
                        }
                        .teclado-btn-dark {
                            min-height: 38px;
                            font-size: 0.95rem;
                            padding: 4px 0;
                        }
                    }
                    @media (max-width: 420px) {
                        .teclado-grid {
                            gap: 3px !important;
                        }
                        .teclado-btn-dark {
                            min-height: 34px;
                            font-size: 0.85rem;
                        }
                    }
                `}</style>

                {calculando && <p role="status" aria-live="polite" style={{ fontSize: FS.sm, color: 'var(--text-muted)' }}>Calculando la función...</p>}

                {mensajeK && (
                    <div id="tour-continua-procedimiento-k" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0px' }}>
                        {mensajeK.datos && mensajeK.datos.latex_block ? (
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                    Procedimiento: Cálculo de constante {mensajeK.datos.incognitaVar}
                                </h4>
                                <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto', marginBottom: '8px' }}>
                                    <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>
                                        <InlineMath math={mensajeK.datos.latex_block} />
                                    </div>
                                </div>
                                <div className="alerta-valida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500 }}>
                                    <span><strong>Éxito: </strong>{mensajeK.texto}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="alerta-valida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500 }}>
                                <span><strong>Éxito: </strong>{mensajeK.texto}</span>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
                    <button
                        id="tour-continua-btn-calcular"
                        type="button"
                        className="button_calcular"
                        disabled={calculando}
                        onClick={manejarValidacion}
                        style={{
                            width: 'fit-content',
                            padding: '5px 20px',
                            borderRadius: RADIUS,
                            fontSize: FS.md,
                            fontWeight: 600,
                            fontFamily: FONT,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        CALCULAR
                    </button>
                </div>
            </div>
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={() => setModalAlerta(actual => ({ ...actual, isOpen: false }))}
            />
        </div>
    );
}
