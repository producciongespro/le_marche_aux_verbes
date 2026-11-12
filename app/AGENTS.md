# AGENTS.md — Gobernanza y Equipo de Agentes (`Le marché aux verbes`)

> **Proyecto:** *Le marché aux verbes* (MEP - GESPRO)  
> **Aplicación:** `c:\xampp\htdocs\le_marche_aux_verbes\app`  
> **Única Fuente de Verdad (SSoT):** `c:\xampp\htdocs\le_marche_aux_verbes\app\docs` (`SPEC.md` y `MEMORY.md`)  
> **Metodología:** Spec-Driven Development (SDD) + Estándares Internacionales (SOLID / DRY / KISS / WCAG 2.1 AA)

---

## 1. Reglas de Oro del Repositorio (Inmutables)

1. **Intocabilidad de `documentacion/`:**
   - `c:\xampp\htdocs\le_marche_aux_verbes\documentacion` es de **uso exclusivo del usuario** (contiene `proy_original/` y documentos del sponsor).
   - **Prohibido** crear, modificar, mover o eliminar archivos en `documentacion/`. Solo se permite su lectura para consulta.
2. **Única Fuente de Verdad Depurada (`app/docs/`):**
   - `app/docs/` debe mantenerse siempre **limpia, compacta y fácil de leer**, conteniendo únicamente dos documentos vivos:
     - [`app/docs/SPEC.md`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/docs/SPEC.md): Especificación técnica, funcional, de datos y criterios de calidad (SDD).
     - [`app/docs/MEMORY.md`](file:///c:/xampp/htdocs/le_marche_aux_verbes/app/docs/MEMORY.md): Memoria persistente de acuerdos, decisiones y estado actual del proyecto.
   - **Prohibido** dejar archivos temporales de fases o reportes sueltos en `app/docs/`; todo hallazgo relevante se consolida directamente en `SPEC.md` o `MEMORY.md`.
3. **Stack Tecnológico Oficial:**
   - **Frontend:** React 18 + JavaScript (ES6+) + Vite + Tailwind CSS.
   - **Datos:** 100% Client-Side (sin backend), consumiendo `public/data/verbs.json` mediante `fetch()`.

---

## 2. Equipo de Subagentes Especializados

| Identificador (`TypeName`) | Rol | Permisos | Responsabilidad Principal |
| :--- | :--- | :---: | :--- |
| **Coordinador Principal** | Arquitecto & Tech Lead | Lectura / Escritura | Orquestación SDD, comunicación con el usuario y mantenimiento depurado de `AGENTS.md`, `SPEC.md` y `MEMORY.md`. |
| `data-media-specialist` | Datos JSON & Multimedia | Lectura / Escritura | Curaduría de `public/data/verbs.json` (82 verbos únicos) y mapeo 1:1 verificado contra `public/audio/` (`246/246` `.mp3`), `public/assets/` y `public/img/`. |
| `ui-ux-designer` | Diseñador UI/UX & Tailwind | Lectura / Escritura | Componentes React + Tailwind CSS responsivos, accesibles y fieles a la identidad del mercado francés del MEP (3 temas cromáticos y modales). |
| `react-game-developer` | Desarrollador React & Motor | Lectura / Escritura | Configuración Vite, servicio `verbService.js` y hooks (`useGameEngine`, `useAudioManager`, `useTimer`) con interacción híbrida (Drag & Drop + Clic/Teclado). |
| `qa-tester` | Ingeniero QA & Testing | Lectura / Escritura | Suite de pruebas automatizadas con Vitest + React Testing Library (`src/__tests__/`) validando datos, motor de juego e interfaz. |
| `code-auditor` | Auditor de Calidad y Fidelidad | Solo Lectura | Auditoría de código, prevención de fugas de memoria, accesibilidad WCAG 2.1 AA, rendimiento y fidelidad institucional MEP/GESPRO. |
