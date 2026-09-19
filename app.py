# -*- coding: utf-8 -*-
"""
app.py
Servidor Flask ligero para la pagina romantica interactiva
"Feliz Dia de Amor y Amistad, Mi Amor"

Ejecutar con:
    pip install Flask
    python app.py

Luego abrir en el navegador: http://127.0.0.1:5000
"""

from flask import Flask, render_template
import os

# Configuracion base de la app Flask
app = Flask(
    __name__,
    static_folder="static",
    template_folder="templates"
)

# Datos configurables de la pagina (puedes editarlos a tu gusto)
DATOS_PAGINA = {
    "titulo_principal": "Feliz Dia de Amor y Amistad, Mi Amor",
    "subtitulo": "Cada dia contigo es una nueva razon para sonreir. "
                 "Hoy quiero celebrar todo lo que hemos construido juntos.",
    "boton_hero": "Descubrir nuestra historia",
    # Fecha de inicio de la relacion en formato AAAA-MM-DD HH:MM:SS
    "fecha_inicio_relacion": "2025-12-02 00:00:00",
    "fotos": [
        {"src": "foto1.jpeg", "caption": "Nuestra primera aventura juntos"},
        {"src": "foto2.jpeg", "caption": "La foto en la que mas hermosa te ves"},
        {"src": "foto3.jpeg", "caption": "Risas que no tienen precio"},
        {"src": "foto4.jpeg", "caption": "Ese viaje que no olvidamos"},
        {"src": "foto5.jpeg", "caption": "Momentos simples, felicidad inmensa"},
        {"src": "foto6.jpeg", "caption": "Hoy, celebrando lo nuestro"},
    ],
    "carta_titulo": "Para ti, mi persona favorita",
    "carta_parrafos": [
        "Hoy quiero detener el tiempo un segundo para decirte, con toda la "
        "sinceridad de mi corazon, lo agradecido/a que estoy de tenerte en mi vida. "
        "No fue casualidad: fue la mejor decision que la vida pudo tomar por nosotros.",

        "Gracias por cada risa compartida que convirtio los dias comunes en "
        "recuerdos inolvidables, por tu complicidad que hace que entre nosotros "
        "sobren las palabras y basten las miradas, y por ese apoyo incondicional "
        "que sentí en cada meta, en cada tropiezo y en cada nuevo comienzo.",

        "Contigo he aprendido que el amor de verdad no es perfecto, es real: "
        "es reirse en los momentos dificiles, sostenerse en silencio cuando "
        "hace falta, y celebrar juntos hasta la victoria mas pequena como si "
        "fuera la mas grande del mundo.",

        "Hoy, en el Dia del Amor y la Amistad, no solo celebro lo que sentimos, "
        "celebro el equipo que somos. Gracias por elegirme cada dia, por "
        "caminar a mi lado sin soltarme la mano y por hacer de lo nuestro "
        "el lugar mas seguro y bonito al que siempre quiero volver.",

        "Te amo hoy, te amare manana, y pienso seguir eligiendote cada dia "
        "que la vida nos regale.",
    ],
    "carta_firma": "Con todo mi corazon, tuyo/a siempre.",
    "boton_sorpresa_texto": "¿Cuanto te amo?",
    "mensaje_sorpresa": "Infinito multiplicado por las estrellas del cielo ✨",
}


@app.route("/")
def index():
    """Renderiza la pagina principal con todos los datos dinamicos."""
    return render_template("index.html", datos=DATOS_PAGINA)


@app.errorhandler(404)
def pagina_no_encontrada(_error):
    """Manejo simple de error 404 redirigiendo informacion util."""
    return (
        "<h1>404</h1><p>Pagina no encontrada. "
        "<a href='/'>Volver al inicio</a></p>",
        404,
    )


if __name__ == "__main__":
    # Aviso util si el usuario aun no coloco sus fotos
    carpeta_imagenes = os.path.join("static", "images")
    fotos_esperadas = [f["src"] for f in DATOS_PAGINA["fotos"]]
    faltantes = [
        f for f in fotos_esperadas
        if not os.path.isfile(os.path.join(carpeta_imagenes, f))
    ]
    if faltantes:
        print("=" * 60)
        print("AVISO: No se encontraron estas imagenes en static/images/:")
        for f in faltantes:
            print(f"   - {f}")
        print("La pagina funcionara, pero mostrara un marcador de imagen roto.")
        print("=" * 60)

    app.run(debug=True, host="127.0.0.1", port=5000)
