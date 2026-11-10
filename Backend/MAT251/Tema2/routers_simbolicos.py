from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sympy as sp
import logging

router = APIRouter(prefix="/mat251", tags=["MAT251_Simbolico"])

class ContinuaRequest(BaseModel):
    funcion: str
    a: float
    b: float

class KRequest(BaseModel):
    funcion: str
    a: float
    b: float
    incognita_var: str = 'k'

def procesar_mathjs_a_sympy(func_str: str) -> str:
    # Mathjs usa ln(x) o log(x, e). Sympy usa log(x).
    # Mathjs usa e^x o exp(x). Sympy usa exp(x).
    # Esta limpieza previene errores básicos.
    return func_str

def generar_pasos_antiderivada(integrand, F, x, a_sym, b_sym):
    limites = f"_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}}"
    primitiva = rf"\left[ {sp.latex(F)} \right]{limites}"
    salto = r" \\[1em]" + "\n     &= "
    variable = sp.latex(x)
    terminos = sp.expand_mul(integrand).as_ordered_terms()
    integrales = []
    potencias = []
    for termino in terminos:
        coeficiente, potencia = termino.as_independent(x, as_Add=False)
        base, exponente = potencia.as_base_exp()
        if potencia == 1:
            exponente = sp.S.Zero
        elif base != x or not exponente.is_number or exponente == -1:
            return salto + primitiva

        signo = "-" if coeficiente.could_extract_minus_sign() else "+"
        magnitud = -coeficiente if signo == "-" else coeficiente
        factor = "" if magnitud == 1 else rf"\left({sp.latex(magnitud)}\right)\,"
        integrales.append(rf"{signo} {factor}\int{limites} {sp.latex(potencia)}\,d{variable}")
        if exponente == 0:
            potencias.append(f"{signo} {factor}{variable}")
        else:
            n = sp.latex(exponente)
            potencias.append(rf"{signo} {factor}\frac{{{variable}^{{{n}+1}}}}{{{n}+1}}")

    filas = []
    if len(terminos) > 1 or terminos[0].as_independent(x, as_Add=False)[0] != 1:
        filas.append(" ".join(integrales).removeprefix("+ "))
    potencias_tex = " ".join(potencias).removeprefix("+ ")
    filas.append(rf"\left[ {potencias_tex} \right]{limites}")
    return " = " + " = ".join(filas) + salto + primitiva

def evaluar_expr(expr, var, val):
    if val.has(sp.oo, -sp.oo):
        return sp.limit(expr, var, val)
    return expr.subs(var, val)


def generar_pasos_evaluacion(F, x, a_sym, b_sym):
    # Paso 1: Sustitución literal
    terminos = F.as_ordered_terms()

    def sustitucion_ordenada(valor):
        partes = []
        for termino in terminos:
            negativo = termino.could_extract_minus_sign()
            magnitud = -termino if negativo else termino
            signo = "-" if negativo else "+"
            evaluado = magnitud.subs(x, valor)
            latex = sp.latex(evaluado)
            if evaluado.is_Add or evaluado.could_extract_minus_sign():
                latex = rf"\left({latex}\right)"
            partes.append(f"{signo} {latex}")
        return " ".join(partes).removeprefix("+ ")

    sub_b_lit = sustitucion_ordenada(sp.UnevaluatedExpr(b_sym))
    sub_a_lit = sustitucion_ordenada(sp.UnevaluatedExpr(a_sym))
    paso1 = f"\\left( {sub_b_lit} \\right) - \\left( {sub_a_lit} \\right)"
    desarrollo_terminos = ""
    if len(terminos) > 1 and a_sym.is_finite and b_sym.is_finite:
        sub_b = sustitucion_ordenada(b_sym)
        sub_a = sustitucion_ordenada(a_sym)
        if (sub_b, sub_a) != (sub_b_lit, sub_a_lit):
            desarrollo_terminos = rf" = \left( {sub_b} \right) - \left( {sub_a} \right)"
    
    # helper para evaluar
    Fb = evaluar_expr(F, x, b_sym)
    Fa = evaluar_expr(F, x, a_sym)
    
    # Paso 2: Fracción original sin simplificar (evitar para límites infinitos)
    num_F, den_F = sp.fraction(F)
    
    def armar_fraccion(n, d):
        if d == 1:
            return sp.latex(n)
        return f"\\frac{{{sp.latex(n)}}}{{{sp.latex(d)}}}"
        
    if b_sym.has(sp.oo, -sp.oo):
        Fb_unsimp = sp.latex(Fb)
    else:
        Fb_num = num_F.subs(x, b_sym)
        Fb_den = den_F.subs(x, b_sym)
        Fb_unsimp = armar_fraccion(Fb_num, Fb_den)
        if Fb_num == 0: Fb_unsimp = "0"
        
    if a_sym.has(sp.oo, -sp.oo):
        Fa_unsimp = sp.latex(Fa)
    else:
        Fa_num = num_F.subs(x, a_sym)
        Fa_den = den_F.subs(x, a_sym)
        Fa_unsimp = armar_fraccion(Fa_num, Fa_den)
        if Fa_num == 0: Fa_unsimp = "0"
    
    str_Fb = f"\\left( {Fb_unsimp} \\right)" if Fb_unsimp != "0" else "0"
    str_Fa = f"\\left( {Fa_unsimp} \\right)" if Fa_unsimp != "0" else "0"
    
    if str_Fa == "0":
        paso2 = f"{str_Fb} - 0"
    elif str_Fb == "0":
        paso2 = f"0 - {str_Fa}"
    else:
        paso2 = f"{str_Fb} - {str_Fa}"
        
    # Paso 3 y 4: Fracción final y Decimal
    res_simp = sp.simplify(Fb - Fa)
    paso3 = sp.latex(res_simp)
    paso4 = f"\\mathbf{{{float(res_simp.evalf()):.4f}}}"

    if res_simp.is_Add:
        terminos = res_simp.as_ordered_terms()
        if all(termino.is_real and termino.is_finite for termino in terminos):
            decimales = []
            for termino in terminos:
                valor = float(termino.evalf())
                signo = "-" if valor < 0 else "+"
                decimales.append(f"{signo} {abs(valor):.4f}")
            paso_decimal = " ".join(decimales).removeprefix("+ ")
            return rf"= {paso1}{desarrollo_terminos} = {paso2} = {paso3} \approx {paso_decimal} \approx {paso4}"

    return f"= {paso1}{desarrollo_terminos} = {paso2} = {paso3} = {paso4}"

def generar_desarrollo_absoluto(nombre_latex, integrand, integrand_display, x, a_sym, b_sym):
    if not integrand.has(sp.Abs):
        return None
        
    try:
        a_val_float = float(a_sym.evalf())
        b_val_float = float(b_sym.evalf())
    except Exception:
        return None
        
    if not (a_val_float < 0 and b_val_float > 0):
        return None
        
    integrand_neg = integrand.subs(sp.Abs(x), -x)
    integrand_pos = integrand.subs(sp.Abs(x), x)
    
    F_neg = sp.integrate(integrand_neg, x)
    F_pos = sp.integrate(integrand_pos, x)
    
    Fa = F_neg.subs(x, a_sym)
    F0_neg = F_neg.subs(x, 0)
    
    F0_pos = F_pos.subs(x, 0)
    Fb = F_pos.subs(x, b_sym)
    
    val_neg = F0_neg - Fa
    val_pos = Fb - F0_pos
    
    total_val = val_neg + val_pos
    if total_val in [sp.oo, -sp.oo, sp.zoo] or total_val.has(sp.oo, -sp.oo, sp.zoo):
        if nombre_latex == "\\text{Área}":
            raise ValueError("AREA_INFINITA")
        else:
            raise ValueError(f"{nombre_latex}_INFINITO")
    total_val_float = float(total_val.evalf())
    
    latex_integrand_neg = sp.latex(sp.simplify(integrand_neg))
    latex_integrand_pos = sp.latex(sp.simplify(integrand_pos))
    
    latex_F_neg = sp.latex(F_neg)
    latex_F_pos = sp.latex(F_pos)
    
    step_integ = f"&= \\int_{{{sp.latex(a_sym)}}}^{{0}} \\left({latex_integrand_neg}\\right) \\, dx + \\int_{{0}}^{{{sp.latex(b_sym)}}} \\left({latex_integrand_pos}\\right) \\, dx \\\\[1em]\n"
    step_integ += f"&= \\left[ {latex_F_neg} \\right]_{{{sp.latex(a_sym)}}}^{{0}} + \\left[ {latex_F_pos} \\right]_{{0}}^{{{sp.latex(b_sym)}}} \\\\[1em]"
    
    def safe_frac(val):
        return sp.latex(sp.simplify(val))
        
    eval_neg = f"\\left( {safe_frac(F0_neg)} - \\left({safe_frac(Fa)}\\right) \\right)"
    eval_pos = f"\\left( \\left({safe_frac(Fb)}\\right) - {safe_frac(F0_pos)} \\right)"
    
    step_eval = f"&= {eval_neg} + {eval_pos} \\\\[1em]"
    step_res = f"&= {safe_frac(val_neg)} + {safe_frac(val_pos)} = \\mathbf{{{total_val_float:.4f}}}"
    
    block = f"{nombre_latex} &= \\int_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}} {integrand_display} \\, dx \\\\[1em]\n{step_integ}\n{step_eval}\n{step_res}"
    
    return block, total_val_float

def resolver_area(func_str: str, a_val: float, b_val: float) -> tuple[str, float]:
    x = sp.Symbol('x')
    f = sp.nsimplify(sp.sympify(func_str))
    
    a_sym = sp.nsimplify(a_val)
    b_sym = sp.nsimplify(b_val)
    
    integrand = f
    F = sp.integrate(integrand, x)
    
    Fa = evaluar_expr(F, x, a_sym)
    Fb = evaluar_expr(F, x, b_sym)
    
    area_resultado = Fb - Fa
    if area_resultado.has(sp.oo, -sp.oo, sp.zoo, sp.nan):
        raise ValueError("AREA_INFINITA")
        
    latex_f = sp.latex(f)
    latex_a = sp.latex(a_sym)
    latex_b = sp.latex(b_sym)
    
    desarrollo_abs = generar_desarrollo_absoluto("\\text{Área}", integrand, f"\\left( {latex_f} \\right)", x, a_sym, b_sym)
    if desarrollo_abs:
        block_body, val_float = desarrollo_abs
        block = f"\\begin{{aligned}}\n{block_body}\n\\end{{aligned}}"
        return block, val_float
        
    pasos_antiderivada = generar_pasos_antiderivada(integrand, F, x, a_sym, b_sym)
    pasos_evaluacion = generar_pasos_evaluacion(F, x, a_sym, b_sym)
    val_float = float((Fb - Fa).evalf())
    
    block = f"""\\begin{{aligned}}
\\text{{Área}} &= \\int_{{{latex_a}}}^{{{latex_b}}} \\left( {latex_f} \\right) \\, dx{pasos_antiderivada} {pasos_evaluacion}
\\end{{aligned}}"""
    
    return block, val_float

def resolver_esperanza(func_str: str, a_val: float, b_val: float) -> tuple[str, float]:
    x = sp.Symbol('x')
    f = sp.nsimplify(sp.sympify(func_str))
    
    a_sym = sp.nsimplify(a_val)
    b_sym = sp.nsimplify(b_val)
    
    integrand = x * f
    F = sp.integrate(integrand, x)
    
    Fa = evaluar_expr(F, x, a_sym)
    Fb = evaluar_expr(F, x, b_sym)
    
    latex_f = sp.latex(f)
    latex_int = sp.latex(sp.expand_mul(integrand))
    latex_a = sp.latex(a_sym)
    latex_b = sp.latex(b_sym)
    
    desarrollo_abs = generar_desarrollo_absoluto("E(X)", integrand, f"x \\left( {latex_f} \\right)", x, a_sym, b_sym)
    if desarrollo_abs:
        block_body, val_float = desarrollo_abs
        block = f"\\begin{{aligned}}\n{block_body}\n\\end{{aligned}}"
        return block, val_float
    
    pasos_antiderivada = generar_pasos_antiderivada(integrand, F, x, a_sym, b_sym)
    pasos_evaluacion = generar_pasos_evaluacion(F, x, a_sym, b_sym)
    val_float = float((Fb - Fa).evalf())
    
    block = f"""\\begin{{aligned}}
E(X) &= \\int_{{{latex_a}}}^{{{latex_b}}} x \\left( {latex_f} \\right) dx = \\int_{{{latex_a}}}^{{{latex_b}}} \\left( {latex_int} \\right) \\, dx{pasos_antiderivada} {pasos_evaluacion}
\\end{{aligned}}"""
    
    return block, val_float

def resolver_varianza(func_str: str, a_val: float, b_val: float, eX_val: float) -> tuple[str, float]:
    x = sp.Symbol('x')
    f = sp.nsimplify(sp.sympify(func_str))
    
    a_sym = sp.nsimplify(a_val)
    b_sym = sp.nsimplify(b_val)
    
    integrand = (x**2) * f
    F = sp.integrate(integrand, x)
    
    Fa = evaluar_expr(F, x, a_sym)
    Fb = evaluar_expr(F, x, b_sym)
    res_eX2 = Fb - Fa
    
    latex_f = sp.latex(f)
    latex_int = sp.latex(sp.expand_mul(integrand))
    latex_a = sp.latex(a_sym)
    latex_b = sp.latex(b_sym)
    
    desarrollo_abs = generar_desarrollo_absoluto("E(X^2)", integrand, f"x^2 \\left( {latex_f} \\right)", x, a_sym, b_sym)
    if desarrollo_abs:
        block_body, eX2_float = desarrollo_abs
        var_float = eX2_float - (eX_val**2)
        block = f"\\begin{{aligned}}\n{block_body} \\\\[1em]\nV(X) &= E(X^2) - (E(X))^2 = {eX2_float:.4f} - ({eX_val:.4f})^2 = \\mathbf{{{var_float:.4f}}}\n\\end{{aligned}}"
        return block, var_float
        
    pasos_antiderivada = generar_pasos_antiderivada(integrand, F, x, a_sym, b_sym)
    pasos_evaluacion = generar_pasos_evaluacion(F, x, a_sym, b_sym)
    eX2_float = float((Fb - Fa).evalf())
    var_float = eX2_float - (eX_val**2)
    
    # Bloque combinado E[X^2] y V[X]
    block = f"""\\begin{{aligned}}
E(X^2) &= \\int_{{{latex_a}}}^{{{latex_b}}} x^2 \\left( {latex_f} \\right) dx = \\int_{{{latex_a}}}^{{{latex_b}}} \\left( {latex_int} \\right) \\, dx{pasos_antiderivada} {pasos_evaluacion} \\\\[1em]
V(X) &= E(X^2) - (E(X))^2 \\approx {eX2_float:.4f} - ({eX_val:.4f})^2 \\approx {eX2_float:.4f} - {(eX_val**2):.4f} \\approx \\mathbf{{{var_float:.4f}}}
\\end{{aligned}}"""

    return block, var_float

def resolver_k(func_str: str, a_val: float, b_val: float, var_k: str = 'k') -> tuple[str, float, str]:
    x = sp.Symbol('x')
    f = sp.nsimplify(sp.sympify(func_str))
    
    a_sym = sp.nsimplify(a_val)
    b_sym = sp.nsimplify(b_val)
    
    integrand = f
    F = sp.integrate(integrand, x)
    
    Fa = evaluar_expr(F, x, a_sym)
    Fb = evaluar_expr(F, x, b_sym)
    
    area_val = Fb - Fa
    
    if area_val in [sp.oo, -sp.oo, sp.zoo] or area_val.has(sp.oo, -sp.oo, sp.zoo):
        raise ValueError("AREA_INFINITA")
        
    # Manejo estricto de Valor Absoluto para k
    try:
        a_f = float(a_sym.evalf())
        b_f = float(b_sym.evalf())
        if integrand.has(sp.Abs) and a_f < 0 and b_f > 0:
            integrand_neg = integrand.subs(sp.Abs(x), -x)
            integrand_pos = integrand.subs(sp.Abs(x), x)
            
            F_neg = sp.integrate(integrand_neg, x)
            F_pos = sp.integrate(integrand_pos, x)
            
            Fa_abs = F_neg.subs(x, a_sym)
            F0_neg = F_neg.subs(x, 0)
            F0_pos = F_pos.subs(x, 0)
            Fb_abs = F_pos.subs(x, b_sym)
            
            val_neg = F0_neg - Fa_abs
            val_pos = Fb_abs - F0_pos
            
            area_val = val_neg + val_pos
            k_val = 1 / area_val
            k_float = float(k_val.evalf())
            
            latex_integrand_neg = sp.latex(sp.simplify(integrand_neg))
            latex_integrand_pos = sp.latex(sp.simplify(integrand_pos))
            latex_F_neg = sp.latex(F_neg)
            latex_F_pos = sp.latex(F_pos)
            
            planteamiento = f"\\int_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}} {var_k} \\left( {sp.latex(sp.simplify(integrand))} \\right) \\, dx = 1"
            div = f"{var_k} \\left( \\int_{{{sp.latex(a_sym)}}}^{{0}} \\left({latex_integrand_neg}\\right) \\, dx + \\int_{{0}}^{{{sp.latex(b_sym)}}} \\left({latex_integrand_pos}\\right) \\, dx \\right)"
            integ = f"{var_k} \\left( \\left[ {latex_F_neg} \\right]_{{{sp.latex(a_sym)}}}^{{0}} + \\left[ {latex_F_pos} \\right]_{{0}}^{{{sp.latex(b_sym)}}} \\right)"
            
            def safe_frac(val):
                return sp.latex(sp.simplify(val))
                
            eval_neg = f"\\left( {safe_frac(F0_neg)} - \\left({safe_frac(Fa_abs)}\\right) \\right)"
            eval_pos = f"\\left( \\left({safe_frac(Fb_abs)}\\right) - {safe_frac(F0_pos)} \\right)"
            
            eval_str = f"{var_k} \\left( {eval_neg} + {eval_pos} \\right)"
            res_str = f"{var_k} \\left( {safe_frac(area_val)} \\right) = 1"
            
            k_latex = sp.latex(sp.simplify(k_val))
            despeje = f"\\implies {var_k} = {k_latex} = \\mathbf{{{k_float:.4f}}}"
            
            cadena_abs = f"{div} = {integ} = {eval_str} = {res_str} {despeje}"
            block = f"\\begin{{aligned}}\n& {planteamiento} \\\\[1em]\n& = {cadena_abs}\n\\end{{aligned}}"
            
            return block, k_float, str(sp.simplify(k_val))
    except Exception:
        pass
        
    k_val = 1 / area_val
    k_float = float(k_val.evalf())
    
    # 1. Planteamiento
    latex_f = sp.latex(sp.simplify(integrand))
    if integrand == 1:
        planteamiento = f"\\int_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}} {var_k} \\, dx = 1"
    else:
        planteamiento = f"\\int_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}} {var_k} \\left( {latex_f} \\right) \\, dx = 1"
        
    # 2. Integración
    F_latex = sp.latex(F)
    integracion = f"{var_k} \\left[ {F_latex} \\right]_{{{sp.latex(a_sym)}}}^{{{sp.latex(b_sym)}}}"
    
    # 3. Evaluación
    sub_b_lit = sp.latex(F.subs(x, sp.UnevaluatedExpr(b_sym)))
    sub_a_lit = sp.latex(F.subs(x, sp.UnevaluatedExpr(a_sym)))
    
    eval_line_1 = f"{var_k} \\left( {sub_b_lit} - {sub_a_lit} \\right)"
    eval_line_2 = f"{var_k} \\left( {sp.latex(Fb)} - {sp.latex(Fa)} \\right)"
    
    area_simp = sp.simplify(Fb - Fa)
    eval_line_3 = f"{var_k} \\left( {sp.latex(area_simp)} \\right)"
    
    steps = [integracion]
    if eval_line_1.replace(" ", "") != integracion.replace(" ", ""):
        steps.append(eval_line_1)
    if eval_line_2.replace(" ", "") != eval_line_1.replace(" ", ""):
        steps.append(eval_line_2)
    if eval_line_3.replace(" ", "") != eval_line_2.replace(" ", "") and eval_line_3.replace(" ", "") != eval_line_1.replace(" ", ""):
        steps.append(eval_line_3)
        
    cadena_desarrollo = " = ".join(steps) + " = 1"
    
    # 4. Despeje final
    k_latex = sp.latex(sp.simplify(k_val))
    despeje_final = f"\\implies {var_k} = {k_latex} = \\mathbf{{{k_float:.4f}}}"
    
    block = f"\\begin{{aligned}}\n& {planteamiento} \\\\[1em]\n& = {cadena_desarrollo} {despeje_final}\n\\end{{aligned}}"
    
    return block, k_float, str(sp.simplify(k_val))

@router.post("/resolucion_continua")
async def resolucion_continua(req: ContinuaRequest):
    try:
        f_clean = procesar_mathjs_a_sympy(req.funcion)
        
        latex_area, val_area = resolver_area(f_clean, req.a, req.b)
        latex_eX, val_eX = resolver_esperanza(f_clean, req.a, req.b)
        latex_vX, val_vX = resolver_varianza(f_clean, req.a, req.b, val_eX)
        
        return {
            "success": True,
            "latex_area": latex_area,
            "area": val_area,
            "latex_esperanza": latex_eX,
            "latex_varianza": latex_vX,
            "esperanza": val_eX,
            "varianza": val_vX,
            "std_dev": val_vX**0.5 if val_vX >= 0 else 0
        }
    except ValueError as e:
        if str(e) == "AREA_INFINITA":
            return {
                "success": False,
                "mensaje_error": "La integral diverge. No se obtiene un área finita con la función y los límites ingresados."
            }
        logging.error(f"Error en resolución simbólica: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logging.error(f"Error en resolución simbólica: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/resolucion_k")
async def endpoint_resolucion_k(req: KRequest):
    try:
        f_clean = procesar_mathjs_a_sympy(req.funcion)
        latex_block, k_val, k_str = resolver_k(f_clean, req.a, req.b, req.incognita_var)
        
        return {
            "success": True,
            "latex_block": latex_block,
            "k_val": k_val,
            "k_str": k_str
        }
    except ValueError as e:
        if str(e) == "AREA_INFINITA":
            return {
                "success": False,
                "error": "El área bajo la curva es infinita. La función diverge y no puede normalizarse con una constante k."
            }
        logging.error(f"Error en resolución de K: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logging.error(f"Error en resolución de K: {e}")
        return {
            "success": False,
            "error": str(e)
        }
