# idk Mail - Web

Interfaz de usuario para el servicio de correo y chat privado idk Mail, construida con React + Vite.

## Tecnologías

- **React 18**: Librería de UI
- **Vite**: Build tool y dev server
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP
- **Socket.io Client**: Comunicación en tiempo real
- **CSS**: Estilos con glassmorphism design

## Requisitos previos

1. **Node.js** (versión 18 o superior)
2. Backend de idk Mail corriendo

## Instalación

```bash
cd frontend
npm install
```

## Configuración

La URL del backend está configurada en `src/App.jsx`:

```javascript
const API_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053/api';
const BASE_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053';
```

Cámbialas según tu entorno de desarrollo/producción.

## Ejecución

### Modo desarrollo
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Build para producción
```bash
npm run build
```

El build optimizado se genera en la carpeta `dist/`

### Previsualizar build
```bash
npm run preview
```

## Estructura del proyecto

```
frontend/
├── dist/                # Build de producción (generado)
├── src/
│   ├── components/      # Componentes React
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Mail.jsx
│   │   ├── Friends.jsx
│   │   ├── PublicChat.jsx
│   │   ├── PrivateChat.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminPanel.jsx
│   │   └── ErrorPage.jsx
│   ├── contexts/        # Contextos React
│   │   └── ThemeContext.jsx
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html
├── vite.config.js
└── package.json
```

## Características de la UI

- **Temas**: Claro, oscuro y océano
- **Glassmorphism**: Diseño moderno con efectos de vidrio
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Animaciones suaves**: Transiciones y efectos visuales
- **Notificaciones en tiempo real**

## Funcionalidades principales

### Para Usuarios
- 🔐 Registro y login seguro
- 📧 Enviar y recibir correos internos
- 📎 Archivos adjuntos
- 💬 Chat público y privado
- 👥 Sistema de amigos (solicitudes, eliminar, bloquear)
- 🎨 Personalización de perfil y avatar
- 📊 Ver uso de almacenamiento

### Para Administradores
- 👥 Gestión completa de usuarios
- 📈 Estadísticas globales
- ⚙️ Control de límites de almacenamiento
- 📋 Informes detallados de usuarios

## Scripts disponibles

| Script        | Descripción                          |
|---------------|--------------------------------------|
| `npm run dev` | Iniciar servidor de desarrollo       |
| `npm run build` | Generar build de producción        |
| `npm run preview` | Previsualizar build de producción  |
