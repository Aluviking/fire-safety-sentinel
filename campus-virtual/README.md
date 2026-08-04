# Campus Virtual (GFO Academy)

Proyecto separado del sitio principal y de Portal Empresarial — vive en su
propio subproyecto dentro de este repo, con su propio `frontend/` y
`backend/`, para que un cambio o problema en uno no afecte a los otros.

- `frontend/` — React + Vite + TypeScript, proyecto independiente (su propio
  `package.json`, build y `node_modules`). Se sirve bajo `siso.com.co/campus-virtual/`
  (mismo dominio, ruta propia — no subdominio).
- `backend/` — reservado para el backend PHP + MySQL (aún no construido).

## Datos privados (NO van a git)

`frontend/src/data/private/` contiene información real de personas (nombres +
cédulas de estudiantes, docentes y administrativos de GFO Academy). Esa
carpeta está en `.gitignore` — existe solo en este computador, nunca se
commitea ni se sube al repo remoto. Si clonas este repo en otra máquina, esa
carpeta no estará ahí y las vistas que la usan (`InformacionBasicaView`)
quedarán vacías hasta que copies el archivo manualmente o (mejor, a futuro)
migres esos datos a la base de datos del backend.

## Desarrollo local

```
cd campus-virtual/frontend
npm install
npm run dev
```
