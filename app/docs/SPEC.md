# SPEC.md — Especificación Técnica y Funcional (SDD)
## Proyecto: *Le marché aux verbes* (MEP - GESPRO)

> **Ubicación SSoT:** [`app/docs/SPEC.md`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/docs/SPEC.md)  
> **Stack:** React 18 + JavaScript (ES6+) + Tailwind CSS + Vite (100% Client-Side, sin backend, datos vía `fetch`)  
> **Estado:** Implementado, probado (`27/27` tests en Vitest) y auditado al 100%

---

## 1. Propósito y Alcance
**Le marché aux verbes** es un recurso educativo lúdico del Ministerio de Educación Pública de Costa Rica (MEP — GESPRO / Asesoría Nacional de Francés) para practicar **82 verbos únicos en francés** emparejando tarjetas entre tres tiempos verbales (**Présent**, **Futur simple**, **Passé composé**) y su significado en **Espagnol**, con apoyo de locuciones nativas en francés.

---

## 2. Arquitectura y Estructura del Proyecto (`app/`)

```text
app/
├── AGENTS.md                        # Gobernanza y equipo de subagentes
├── docs/                            # Única Fuente de Verdad (SSoT)
│   ├── MEMORY.md                    # Memoria persistente de acuerdos y estado
│   └── SPEC.md                      # Especificación técnica y funcional (este archivo)
├── public/                          # Activos estáticos
│   ├── data/verbs.json              # Catálogo curado de 82 verbos con mapeo de audio
│   ├── audio/*.mp3                  # 252 locuciones en francés
│   ├── assets/*                     # Música (pacificSun.mp3, let_your_body.mp3) y SFX (try_again.mp3, alert1.wav, correct.mp3, hit1.wav)
│   └── img/*                        # Ilustraciones del mercado francés, medallas e íconos
└── src/
    ├── constants/gameConfig.js      # Modos (1, 2, 3), modalidades, temas Tailwind y cálculo de medallas
    ├── services/verbService.js      # fetchVerbs('./data/verbs.json'), Fisher-Yates y armado de niveles
    ├── hooks/
    │   ├── useAudioManager.js       # Reproducción sin solapamiento de verbos, SFX, música en loop y mute
    │   ├── useTimer.js              # Cronómetro de precisión para modo Compétition
    │   └── useGameEngine.js         # Máquina de estados, bloqueo lateral, puntajes y progresión de 7 niveles
    ├── components/
    │   ├── layout/                  # HeaderBar.jsx, FooterControls.jsx
    │   ├── game/                    # SplashScreen.jsx, GameBoard.jsx, VerbGrid.jsx, VerbCard.jsx, SujetDropZone.jsx, MatchedPairsTray.jsx
    │   └── modals/                  # MenuModal.jsx, HelpModal.jsx, AboutModal.jsx, EndGameModal.jsx
    └── __tests__/                   # Suites Vitest + RTL: verbService.test.js, useGameEngine.test.js, App.test.jsx
```

---

## 3. Contrato de Datos y Multimedia (`public/data/verbs.json`)

### 3.1 Esquema JSON
Cargado mediante `fetch('./data/verbs.json')`:
```json
{
  "id": 0,
  "esp": "mirar",
  "pre": "regarder",
  "pas": "J'ai regardé",
  "fut": "Je regarderai",
  "audio": {
    "pre": "regarder.mp3",
    "pas": "j-ai-regarde.mp3",
    "fut": "je-regarderai.mp3"
  }
}
```

### 3.2 Normalización y Curaduría Aplicada
1. **82 Verbos Únicos:** Se eliminó el verbo duplicado `id: 46` (`preparar / préparer`, duplicado del `id: 15`).
2. **Cero HTML Crudo:** Se eliminaron todas las etiquetas `<br>` de `pas` y `fut` (uniendo sin espacio tras apóstrofo como `"J'écouterai"` y con espacio simple en `"J'ai regardé"` / `"Je regarderai"`).
3. **Corrección de Erratas del Original:**
   - `id: 38` (`rester`): `"esp": "quedarse"` (sin espacio final).
   - `id: 53` (`avoir`): `"fut": "J'aurai"` (sin espacio inicial).
   - `id: 60` (`écrire`): `"pre": "écrire"` (con tilde en `é`).
   - `id: 63` (`remplir`): `"pas": "J'ai rempli"` (corregido `"zempli"` $\rightarrow$ `"rempli"`).
4. **Mapeo Explícito 1:1 de Audios (`246 / 246` verificados *case-sensitive*):**
   - Resuelve los 16 fallos que tenía `ModificarCaracteres` en el proyecto original (incluyendo mayúsculas en disco como `J--observerai.mp3` y `J--irai.mp3`, variaciones como `j-suis-entre.mp3`, `j-ai-gagner.mp3`, `j-ai-remplit.mp3`, `je-courrerai.mp3`, `je-mourai.mp3`, `naitre.mp3`, `je-naitrai.mp3`, `j-ai-su.mp3` y fallbacks seguros a `savoir.mp3` y `vivre.mp3` para los 2 futuros no grabados en el paquete original).

---

## 4. Reglas de Negocio y Motor del Juego

### 4.1 Máquina de Estados (`GAME_PHASES`)
`SPLASH` (2 s o clic para saltar) $\rightarrow$ `MENU_INITIAL` $\rightarrow$ `PLAYING` $\leftrightarrow$ `LEVEL_COMPLETE` (niveles 1 a 6) $\rightarrow$ `GAME_OVER` (al completar el nivel 7).

### 4.2 Modalidades (`MODALITY`)
Los 3 botones de tiempo verbal en el menú inician **bloqueados en gris** hasta que el jugador selecciona una modalidad:
- **Formation (`formation`):** Sin cronómetro, música de fondo `pacificSun.mp3`. Al finalizar los 7 niveles muestra felicitación con el puntaje total (`But`).
- **Compétition (`competition`):** Con cronómetro ascendente (`seconds`) y música `let_your_body.mp3`. Al completar los 7 niveles otorga medalla según el tiempo total:
  - **Oro (`./img/oro.jpg`):** $\le 185\text{ s}$
  - **Plata (`./img/plata.jpg`):** $186\text{ s} \text{ a } 199\text{ s}$
  - **Bronce (`./img/bronce.jpg`):** $\ge 200\text{ s}$

### 4.3 Modos Gramaticales (`GRAMMAR_MODES`)

| Modo | Nombre | Columna Izquierda | Columna Derecha | Audio Izq. | Audio Der. | Puntaje Acierto / Error | Tema Visual Tailwind |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | **Espagnol – Présent** | `esp` (*Espagnol*) | `pre` (*Présent*) | No | Sí | $+10\text{ / }-10$ | Azul (`#157A9E` / `#1B63E9`) |
| **2** | **Futur simple – Présent** | `pre` (*Présent*) | `fut` (*Futur simple*) | Sí | Sí | $+20\text{ / }-20$ | Verde (`#0E8345` / `#D4E157`) |
| **3** | **Passé composé – Présent** | `pre` (*Présent*) | `pas` (*Passé composé*) | Sí | Sí | $+30\text{ / }-30$ | Púrpura (`#5B2C6F` / `#8E44AD`) |

### 4.4 Niveles e Interacción Híbrida (Drag & Drop + Clic/Teclado)
- **Partida de 7 Niveles:** Se barajan los 82 verbos con **Fisher-Yates** inmutable y se toman 9 verbos por nivel ($7 \times 9 = 63$ verbos únicos por partida).
- **Tablero $3 \times 3$ + Zona Central `"Sujet"`:**
  - El rótulo central es **"Sujet"** en los 3 modos (corrigiendo el placeholder `"Texto"` del fondo original en Modo 3).
  - Las tarjetas pueden llevarse a `Sujet` tanto por **Drag & Drop** como por **Clic / Teclado**, reproduciendo su locución en francés al seleccionarlas o arrastrarlas.
  - **Bloqueo lateral:** Al colocar una tarjeta de una columna en `Sujet`, se bloquea el resto de esa misma columna hasta elegir la pareja de la columna opuesta (o hasta deseleccionar la tarjeta haciendo clic sobre ella en `Sujet`).
  - **Acierto (`leftCard.verbId === rightCard.verbId`):** Suma `pointsDelta`, marca ambas tarjetas como resueltas en su celda $3 \times 3$ (sin desplazar las demás) y acomoda el par en la siguiente columna libre de la bandeja inferior (`MatchedPairsTray`, 9 columnas $\times$ 2 filas = 18 casillas).
  - **Fallo (`leftCard.verbId !== rightCard.verbId`):** Suena `try_again.mp3`, resta `pointsDelta`, aplica animación `animate-shake` durante $600\text{ ms}$ y devuelve ambas tarjetas a sus grillas.

### 4.5 Fidelidad Visual 1:1 de todas las Vistas (`SplashScreen`, `MenuModal`, Tablero de Nivel y Modales)
1. **Ventana Inicial (`SplashScreen.jsx`) y Fondo en `MENU_INITIAL` (`App.jsx`):**
   - Muestra [`./img/fondo_splash.jpg`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/fondo_splash.jpg) ocupando el **100% del viewport (`w-screen h-screen`)** sin marcos, textos ni botones adicionales superpuestos.
   - Al concluir los 2 segundos (o al hacer clic), la aplicación pasa a `MENU_INITIAL` manteniendo [`./img/fondo_splash.jpg`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/fondo_splash.jpg) de fondo a pantalla completa debajo del backdrop semitransparente del modal.
2. **Ventana Modal Selector de las 3 Opciones (`MenuModal.jsx`):**
   - Contenedor centrado (`w-[90%] max-w-[90vw] mt-[1%]`) con imagen base relativa [`./img/fondo_menu.jpg`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/fondo_menu.jpg) (`rounded-[15px]`).
   - **Botón Cerrar (`./img/btn_cerrar.png`):** Posicionado en `left-[93%] top-[2%] w-[6%] h-[8%]`, oculto en `MENU_INITIAL` (`!canCloseMenu`) y visible cuando hay partida en curso (`canCloseMenu`).
   - **Las 3 Opciones de Tiempo Verbal (`#opt1`, `#opt2`, `#opt3`):** Posicionadas directamente sobre `fondo_menu.jpg` en `top-[40%] h-[30%] w-[20%]`, ubicadas en `left-[15%]` (Modo 1), `left-[40%]` (Modo 2) y `left-[65%]` (Modo 3), renderizando únicamente sus imágenes oficiales (`opt1..3_gris.png` cuando `!isModeSelectionUnlocked`, `opt1..3_inactivo.png` al desbloquearse y `opt1..3_activo.png` en hover/focus).
   - **Barra Inferior de 3 Botones (`.cont_modos`):** Posicionada en `top-[81%] left-[33%] w-[35%] h-[18%]`, conteniendo los 3 accesos horizontales (`top-[10%] h-[54%] w-[32%]`):
     - `left-[0%]`: Enlace externo a *Califícame* con [`./img/calificame_fullcolor2.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/calificame_fullcolor2.png).
     - `left-[33%]`: Botón *Formation* (`data-testid="btn-modality-formation"`) con [`./img/training_inactivo.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/training_inactivo.png) / [`./img/training_activo.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/training_activo.png).
     - `left-[66%]`: Botón *Compétition* (`data-testid="btn-modality-competition"`) con [`./img/comp_inactivo.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/comp_inactivo.png) / [`./img/comp_activo.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/comp_activo.png).
3. **Pantalla de Juego / Nivel (`#contenedor_principal` — `App.jsx`, `HeaderBar.jsx`, `GameBoard.jsx`, `VerbGrid.jsx`, `VerbCard.jsx`, `SujetDropZone.jsx`, `MatchedPairsTray.jsx`):**
   - **Fondo Ilustrado Full-Screen (`#contenedor_fondos`):** Ocupa `w-screen h-screen` (`position: absolute; inset: 0`) mostrando la ilustración completa del modo activo (`./img/fondo_pantalla_spanishpair.jpg`, `./img/fondo_pantalla_futuro.jpg`, `./img/fondo_pantalla_pasado.jpg`), la cual ya contiene el banner superior con banderines, la Torre Eiffel, el Arco del Triunfo, el puesto del mercado, los títulos de columna, las 18 ranuras de tarjetas, el recuadro amarillo central y los 18 rectángulos amarillos inferiores.
   - **Encabezado Superpuesto (`#encabezado` — `HeaderBar.jsx`):** Posicionado en `top: 0%; left: 2.5%; width: 96%; height: 20%`:
     - **Reloj (`#reloj`):** En `left: 46%; top: 55%; width: 6%; height: 42%`, borde blanco redondeado y texto blanco centrado (visible únicamente en modalidad `competition`).
     - **Accesos Superiores (`.accesos`):** En `top: 63%; left: 59%; width: 35%; height: 55%`, con los 3 botones de imagen oficiales (`btn_ayuda_inactivo.png`/`activo`, `btn_menu_inactivo.png`/`activo`, `btn_acerca_de_inactivo.png`/`btn_acerca de_activo.png`).
   - **Grillas Izquierda y Derecha (`#izquierdo` y `#derecho` — `VerbGrid.jsx` & `VerbCard.jsx`):**
     - `.laterales`: `top: 20%; height: 57%; width: 35%; padding-left: 2%; margin-left: 3%`, con `#izquierdo` en `left: 0%` y `#derecho` en `left: 60.5%`.
     - `.contenedor`: `top: 9.9%; left: 0.2%; width: 100%; height: 92.5%`.
     - **Tarjetas (`.cartas` — `VerbCard.jsx`):** Se posicionan con `position: absolute` usando coordenadas porcentuales exactas calibradas contra las 9 cajitas del fondo ilustrado (`top: ['3.26%', '36.45%', '69.64%'][row]`, `left: ['2.16%', '34.87%', '67.57%'][col]`, `width: 25.45%`, `height: 24.23%`, `border-radius: 16px`, `border: 1px solid #fff`), corrigiendo el bug del CSS original donde los márgenes verticales en `%` (calculados por CSS respecto al ancho) desplazaban las filas 2 y 3 fuera de sus cajitas azules. Usan fondo `url('./img/fondo_tarjetas.png')` al `100% 100%` en su color crema-amarillo original y texto en negro (`#000`), negrita, fuente `'Handlee'` en la parte superior (`padding-top: 7%` para 1 línea y `padding-top: 2%` para formas conjugadas). Implementan **arrastre físico real en el DOM por coordenadas (`Pointer Events` + `translate3d(dx, dy, 0)` al 100% de opacidad, sin fantasma nativo HTML5)** y detección de intersección (`getBoundingClientRect`) con `#principal` (*Sujet*), quedando posadas en la coordenada donde el jugador las suelta (o volviendo a su casilla si no hay acierto), y desapareciendo al emparejarse (`matched === true`) igual que `.fadeOut()` en el juego original.
   - **Zona Central (`#principal` — `SujetDropZone.jsx`):**
     - Posicionada en `top: 27%; left: 38%; width: 24%; height: 50%` directamente sobre el recuadro amarillo del fondo (en Modo 3 aplica un parche `#FFE885` en el encabezado superior del recuadro para mostrar `"Sujet"` en lugar del `"Texto"` impreso en `fondo_pantalla_pasado.jpg`).
     - Muestra las flechas guía (`img_flecha_izq.png` y `img_flecha_der.png`) o las tarjetas seleccionadas en el área central, y posiciona los números en color `orange` (`font-weight: bold`) en `#nivel` (`left: 35%; top: 83%`) y `#puntaje` (`left: 80%; top: 83%`).
     - Cuando `phase === 'LEVEL_COMPLETE'`, superpone `#contenedor_boton_next` (`top: 37%; left: 40%; width: 21%; height: 24%`) con [`./img/img_btn_next_level.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/img_btn_next_level.png).
   - **Bandeja Inferior de Pares (`#pie` — `MatchedPairsTray.jsx`):**
     - Posicionada en `top: 81%; left: 2.5%; width: 96%; height: 16%`, alineando 9 columnas (`width: 10.1%; margin-right: 0.9%`) de 2 filas superpuestas sobre los 18 rectángulos amarillos del fondo, mostrando `.` cuando están vacías y el par de verbos en texto negro negrita al resolverse.
   - **Control de Sonido Inferior Derecho (`#switch_audio`):**
     - Posicionado en `top: 96.8%; left: 90.5%; width: 4%; height: 3%` renderizando [`./img/icon_volumen1.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/icon_volumen1.png) (`Son On`) o [`./img/icon_volumen2.png`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/public/img/icon_volumen2.png) (`Son Off`).
4. **Modales de Menú, Ayuda, Acerca de y Fin de Juego (`MenuModal.jsx`, `HelpModal.jsx`, `AboutModal.jsx`, `EndGameModal.jsx`):**
   - **Jerarquía de Apilamiento (`z-index`):** Los 4 modales se renderizan con **`z-[2000]`** sobre un backdrop fijo `fixed inset-0 bg-black/50`, garantizando que cubran por completo todas las tarjetas `.cartas` (`z-[99]` en reposo, `z-[500]` posadas en *Sujet* y `z-[1000]` en arrastre) y todos los controles del tablero, replicando el comportamiento de Bootstrap `.modal` (`z-index: 1050` sobre `.modal-backdrop` `1040`).
   - **Animación de Despliegue Vertical de Arriba hacia Abajo (`.modal.fade` / `.modal-dialog`):** Replicando 1:1 la transición de Bootstrap 3.3.7 en el proyecto original, el backdrop aplica fundido `animate-modalBackdropFade` (`opacity: 0 -> 1` en `0.15s linear`) y la ventana `.modal-dialog` desciende de arriba hacia abajo con `animate-modalSlideDown` (`translate3d(0, -25%, 0) -> translate3d(0, 0, 0)` en `0.3s ease-out`).
   - **Estructura 1:1 (`#divModales` / `#divMenu`):** Usan `.modal-dialog` con `w-[90%] mx-auto mt-[1%] relative rounded-[15px]` mostrando las láminas oficiales a pantalla completa (`./img/fondo_menu.jpg`, `./img/fondo_ayuda_txt.png`, `./img/fondo_acerca_txt.jpg`, y `./img/oro.jpg` / `./img/plata.jpg` / `./img/bronce.jpg` o `./img/fondo_menu.jpg` con puntaje final) y el botón `./img/btn_cerrar.png` en `left-[93%] top-[2%] w-[6%] h-[8%]` (además de cierre por clic en el backdrop exterior o tecla `Escape`, y texto institucional en `sr-only` para lectores de pantalla y pruebas automatizadas).

---

## 5. Criterios de Calidad, Accesibilidad y Pruebas Automatizadas
- **Accesibilidad (WCAG 2.1 AA):** Atributos `role="dialog"`, `aria-modal="true"`, `aria-label` y `aria-pressed` en todos los modales, tarjetas y controles; operación completa sin depender exclusivamente de arrastrar con puntero.
- **Fidelidad Institucional MEP / GESPRO:** Conserva el enlace oficial a *Califícame* (`https://recursos.mep.go.cr/0_calificame/app/index.html?id_app=1`), las instrucciones en francés (*"Comment va-t-on jouer ?"*) y los créditos completos de DRTE / GESPRO / Asesoría Nacional de Francés DTCED.
- **Verificación Automatizada (`npm test` & `npm run build`):**
  - `src/__tests__/verbService.test.js` (15 tests): Integridad de `verbs.json`, 246 audios físicos y servicio de datos.
  - `src/__tests__/useGameEngine.test.js` (9 tests): Umbrales de medallas, bloqueo lateral, puntajes y progresión de 7 niveles.
  - `src/__tests__/App.test.jsx` (3 tests E2E): Flujo de usuario completo, Clic + Drag & Drop, modales y control de audio.
