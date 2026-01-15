# Focaccia Plus & Coffee - Web Pública

Sitio web de pedidos para clientes de Focaccia Plus & Coffee.

## 🚀 Despliegue en Vercel

### Prerequisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com)
- Proyecto Supabase configurado

### Paso 1: Subir a GitHub

```bash
cd "C:\Users\Agustin Lugo\Desktop\proyectos2026\focaccia-web"

# Inicializar Git (si no está inicializado)
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit - Focaccia Web v1.0"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/focaccia-web.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio `focaccia-web`
3. **Configura Variables de Entorno**:
   - `VITE_SUPABASE_URL` = URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = Anon Key de Supabase
4. Haz clic en **"Deploy"**

### Paso 3: Configurar Dominio (Opcional)

1. En Vercel → Settings → Domains
2. Agrega tu dominio personalizado (ej: `pedidos.focacciaplus.com`)
3. Configura los DNS según las instrucciones

---

## 📁 Estructura del Proyecto

```
focaccia-web/
├── src/                # Código fuente
│   ├── supabase.js    # Cliente Supabase
│   ├── main.js        # Lógica principal
│   └── style.css      # Estilos
├── public/            # Archivos estáticos
├── index.html         # Página principal
├── main.js            # Entry point (raíz)
├── style.css          # Estilos globales
├── package.json       # Dependencias
├── vercel.json        # Configuración Vercel
└── .gitignore         # Archivos ignorados
```

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

---

## 📦 Archivos que SÍ se suben a GitHub

✅ **Código fuente**:
- `src/` - Todo el código JavaScript y CSS
- `public/` - Imágenes y archivos estáticos
- `index.html`, `main.js`, `style.css`
- `package.json`, `package-lock.json`

✅ **Configuración**:
- `.gitignore`
- `vercel.json`
- `README.md`

---

## 📦 Archivos que NO se suben (excluidos por .gitignore)

❌ `node_modules/` - Dependencias (se reinstalan)
❌ `dist/` - Build de producción (se genera en Vercel)
❌ `.env*` - Variables de entorno sensibles
❌ Archivos temporales y logs

---

## 🔒 Seguridad

- **NO** subas archivos `.env` a GitHub
- **NO** expongas API keys en el código
- Usa variables de entorno en Vercel
- El repositorio puede ser **público** (no contiene secretos)

---

## 🌐 URLs

- **Desarrollo**: `http://localhost:5173`
- **Producción**: `https://focaccia-web.vercel.app` (o tu dominio personalizado)

---

## 🆘 Troubleshooting

### Error: "Cannot connect to Supabase"
**Solución**: Verifica que las variables de entorno estén configuradas en Vercel.

### Error: "Stock validation failed"
**Solución**: Verifica que el RPC `registrar_pedido_web_v3` esté creado en Supabase.

### Productos no aparecen
**Solución**: Verifica que haya productos activos en la tabla `sales_prices` con `esta_activo = true`.

---

## 📝 Actualizaciones

Para actualizar el sitio:

```bash
# Hacer cambios en el código
# ...

# Commit y push
git add .
git commit -m "Descripción de cambios"
git push
```

Vercel desplegará automáticamente la nueva versión.

---

## 📄 Licencia

Propietario: Focaccia Plus & Coffee  
Todos los derechos reservados.
