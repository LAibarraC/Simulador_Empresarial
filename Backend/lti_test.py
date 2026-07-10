# api_admin/main.py (Añadir esto)
from fastapi import FastAPI, Form
from fastapi.responses import RedirectResponse

@app.post("/lti/launch")
async def lti_launch(
    user_id: str = Form(...), 
    full_name: str = Form(...), 
    role: str = Form(...)
):
    # En una app real, aquí validaríamos una firma digital.
    # Para la prueba de factibilidad, simplemente "confiamos" y redirigimos.
    
    # Redirigimos al frontend pasando los datos por la URL
    target_url = f"http://localhost:5173/lti-tester?name={full_name}&role={role}&id={user_id}"
    return RedirectResponse(url=target_url, status_code=303)