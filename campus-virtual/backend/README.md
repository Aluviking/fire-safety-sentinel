# Campus Virtual — Backend

Carpeta reservada para el backend real de Campus Virtual (PHP + MySQL, mismo
patrón que `api/` de Portal Empresarial: auth con roles, base de datos propia,
endpoints protegidos).

Todavía no se ha construido — el frontend hoy funciona con datos de sesión en
`localStorage` (login de demostración) y con datos de referencia académica
reales pero estáticos en `frontend/src/data/`. Antes de exponer este módulo en
producción, `frontend/src/data/personasSeed.ts` (información real de personas)
debe migrar a una tabla de esta base de datos con autenticación real — no debe
quedar servida como código de frontend.

## `backup-fuente/`

Backup real del Campus anterior (datos de personas, matrículas, etc.) que sirve
de material fuente para diseñar y poblar la base de datos de este backend.
Está en `.gitignore` — igual que `frontend/src/data/private/`, nunca se sube a
git, vive solo en este computador.

