# MEMORY.md — Memoria Persistente del Proyecto (`Le marché aux verbes`)

> **Última actualización:** 2026-11-11  
> **Estado actual:** **MIGRACIÓN COMPLETADA, PROBADA (`27/27` tests) Y AUDITADA AL 100%**.

---

## 1. Contexto y Reglas Inmutables de Gobernanza
- **Proyecto:** Migración tecnológica del recurso educativo *Le marché aux verbes* (MEP — GESPRO / Asesoría Nacional de Francés).
- **Stack Oficial:** **React 18 + JavaScript (ES6+) + Tailwind CSS + Vite**, 100% Client-Side (sin backend), alimentado vía `fetch('./data/verbs.json')`.
- **Reglas de Directorios:**
  1. `c:\xampp\htdocs\le_marche_aux_verbes\documentacion\`: **Carpeta exclusiva del usuario (Intocable / Solo Lectura)**. Prohibido modificar o borrar archivos allí.
  2. `c:\xampp\htdocs\le_marche_aux_verbes\app\`: Raíz de la aplicación React migrada.
  3. `c:\xampp\htdocs\le_marche_aux_verbes\app\AGENTS.md`: Gobernanza y equipo de 5 subagentes (`data-media-specialist`, `ui-ux-designer`, `react-game-developer`, `qa-tester`, `code-auditor`).
  4. `c:\xampp\htdocs\le_marche_aux_verbes\app\docs\`: **Única Fuente de Verdad (SSoT)** mantenida siempre limpia, compacta y depurada, compuesta únicamente por [`SPEC.md`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/docs/SPEC.md) y [`MEMORY.md`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/docs/MEMORY.md).

---

## 2. Acuerdos de Producto y Decisiones Técnicas Implementadas
1. **Curaduría de Datos y Audios (`public/data/verbs.json`):**
   - Se eliminó el verbo duplicado `id: 46` (`preparar / préparer`), consolidando **82 verbos únicos**.
   - Se eliminaron todas las etiquetas `<br>` crudas y se corrigieron las 4 erratas del original (`id: 38` `"quedarse"`, `id: 53` `"J'aurai"`, `id: 60` `"écrire"`, `id: 63` `"J'ai rempli"`).
   - Se mapeó explícitamente `audio: { pre, pas, fut }` en cada verbo contra los archivos reales en `public/audio/` (**246 / 246 enlaces `.mp3` verificados**), resolviendo los 16 audios que fallaban en el juego original, y se descomprimieron los 6 sonidos de `assets (1).zip` en `public/assets/`.
2. **Interfaz UI/UX con Fidelidad Visual 1:1 (`src/components/`):**
   - **Splash Inicial y Modal de Menú (`SplashScreen.jsx`, `MenuModal.jsx`, `App.jsx`):**
     - `SplashScreen.jsx` despliega `./img/fondo_splash.jpg` al 100% de la ventana (`w-screen h-screen`) sin marcos ni textos superpuestos, y `App.jsx` conserva ese mismo `fondo_splash.jpg` de fondo detrás del modal en `MENU_INITIAL`.
     - `MenuModal.jsx` reproduce exactamente la ventana `#divMenu` sobre `./img/fondo_menu.jpg` (`w-[90%] rounded-[15px]`), posicionando las 3 opciones (`opt1..3_gris/inactivo/activo.png`) en `top-[40%] left-[15%/40%/65%] w-[20%] h-[30%]`, la barra inferior `.cont_modos` en `top-[81%] left-[33%] w-[35%] h-[18%]` (*Califícame*, *Formation*, *Compétition*) y el botón `btn_cerrar.png` en `left-[93%] top-[2%] w-[6%] h-[8%]`.
   - **Pantalla de Juego / Nivel y Modales Secundarios (`HeaderBar.jsx`, `GameBoard.jsx`, `VerbGrid.jsx`, `VerbCard.jsx`, `SujetDropZone.jsx`, `MatchedPairsTray.jsx`, `HelpModal.jsx`, `AboutModal.jsx`, `EndGameModal.jsx`):**
     - Reproduce 1:1 la maquetación porcentual de `index.html` y `css/master4.css` sobre el fondo ilustrado a pantalla completa (`./img/fondo_pantalla_spanishpair.jpg`, `./img/fondo_pantalla_futuro.jpg`, `./img/fondo_pantalla_pasado.jpg`), dejando visibles los banderines, la Torre Eiffel, el Arco del Triunfo, el puesto del mercado, las 18 ranuras de tarjetas, el recuadro amarillo central y los 18 rectángulos amarillos inferiores.
     - Posiciona en `#encabezado` el reloj `#reloj` (`left-[46%] top-[55%]`) y los 3 botones oficiales `.accesos` (`btn_ayuda_*`, `btn_menu_*`, `btn_acerca_de_*`), las grillas laterales `#izquierdo` (`left-[0%]`) y `#derecho` (`left-[60.5%]`) con tarjetas `.cartas` sobre `./img/fondo_tarjetas.png` (crema-amarillo con Torre Eiffel y Arco del Triunfo blancos, texto negro en fuente `'Handlee'`, y **arrastre físico real por coordenadas `Pointer Events` + `translate3d` al 100% de opacidad con detección de intersección sobre `#principal` idéntico a jQuery UI `.draggable()`/`.droppable()`**), la zona `#principal` (*Sujet*, con parche `#FFE885` en Modo 3 para corregir `"Texto"` $\rightarrow$ `"Sujet"` y marcadores `#nivel` y `#puntaje` en naranja), la bandeja `#pie` de 9 columnas $\times$ 2 filas sobre los 18 rectángulos amarillos, el control `#switch_audio` (`icon_volumen1/2.png` en `top-[96.8%] left-[90.5%]`) y las láminas oficiales en los 4 modales (`MenuModal`, `HelpModal`, `AboutModal`, `EndGameModal`) renderizadas en capa **`z-[2000]`** (`w-[90%] mx-auto mt-[1%]`) siempre por encima de todas las tarjetas `.cartas` (`z-index: 99 / 500 / 1000`) con **animación de cortina de arriba hacia abajo (`animate-modalSlideDown`: `translate3d(0, -25%, 0) -> translate3d(0, 0, 0)` en `0.3s ease-out` y fundido `animate-modalBackdropFade` en `0.15s linear`, fiel a `.modal.fade` de Bootstrap 3.3.7)**.
3. **Mecánica de Interacción Híbrida y Niveles (`src/hooks/useGameEngine.js`):**
   - Soporta tanto **Drag & Drop** (mouse/touch) como **Clic/Teclado** para llevar tarjetas a *Sujet* y para deseleccionarlas.
   - Mantiene **7 niveles por partida** (9 verbos por nivel = 63 verbos aleatorios sin repetición), puntajes de $\pm 10$, $\pm 20$ y $\pm 30\text{ pts}$ según el modo, y medallas en modalidad *Compétition* (**Oro** $\le 185\text{ s}$, **Plata** $186\text{–}199\text{ s}$, **Bronce** $\ge 200\text{ s}$).

---

## 3. Estado de Verificación, QA y Build
- **Pruebas Automatizadas (`npm test`):** **3 suites aprobadas (`27 / 27` tests en verde con Vitest + React Testing Library)** en `src/__tests__/verbService.test.js`, `src/__tests__/useGameEngine.test.js` y `src/__tests__/App.test.jsx`.
- **Build de Producción (`npm run build`):** Compilación limpia en `app/dist/` con `base: './'` lista para despliegue estático.
- **Auditoría (`code-auditor`):** 100% de conformidad SDD, accesibilidad WCAG 2.1 AA verificada y carpeta `documentacion/` intacta.
