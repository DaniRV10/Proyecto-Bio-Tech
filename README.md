# 🌿 EcoRutas Coquimbo — Guía de Configuración

## ¿Qué es esto?
Una PWA (app web progresiva) que permite a ciudadanos de Coquimbo registrar puntos de donación de basura orgánica en un mapa, ganar EcoCredits según los kilos aportados, y (próximamente) canjearlos en comercios locales. El equipo recolector ve la ruta óptima calculada con algoritmo TSP.

---

## Stack tecnológico
- **Frontend**: React + Vite (PWA instalable en celular)
- **Base de datos + Auth**: Supabase (gratuito)
- **Mapa**: Leaflet + OpenStreetMap (gratuito, sin tarjeta)
- **Ruta óptima**: Algoritmo Nearest Neighbor + 2-opt (TSP)
- **Deploy**: Vercel o Netlify (gratuito)

---

## 🔑 Sistema de login: usuario + contraseña (sin email)

Supabase Auth internamente requiere un "email", así que la app genera uno
automáticamente: `tuusuario@ecorutas.local` (en minúsculas). Esto es
invisible para el usuario — solo ve campos de "usuario" y "contraseña".

- El **nombre de usuario** se guarda EXACTAMENTE como lo escribe el usuario
  (con mayúsculas/minúsculas) para mostrarlo en la app, pero el login
  funciona sin distinguir mayúsculas en el usuario (para que no se frustren
  si olvidan cómo lo escribieron).
- La **contraseña** SÍ distingue mayúsculas/minúsculas (comportamiento
  estándar y seguro de Supabase Auth).
- Username debe tener 3-20 caracteres: letras, números, `_` o `.`

---

## Paso 1 — Crear cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Haz clic en **"New project"**
3. Nombre: `ecorutas-coquimbo` | Región: `South America (São Paulo)`
4. Guarda la contraseña de la base de datos
5. Espera ~2 minutos a que se cree el proyecto

---

## Paso 2 — Configurar la base de datos

1. En tu proyecto Supabase, ve a **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega el contenido completo de `supabase_schema.sql`
4. Haz clic en **"Run"** (▶)
5. Verás las tablas creadas en **Table Editor**

⚠️ **Importante**: en Supabase, ve a **Authentication > Providers > Email**
y **desactiva** "Confirm email" (para que el registro sea inmediato, ya que
no usamos emails reales).

---

## Paso 3 — Obtener credenciales

1. En Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL** → `https://xxxxxxxx.supabase.co`
   - **anon public key** → llave larga que empieza con `eyJ...`

---

## Paso 4 — Configurar el proyecto local

```bash
cd ecorutas-coquimbo

# Copia el archivo de variables de entorno
cp .env.example .env

# Edita .env con tus credenciales de Supabase

# Instala dependencias
npm install

# Ejecuta en modo desarrollo
npm run dev
```


---

