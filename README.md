# Sistema HelpDesk Local Automatizado con n8n

## Descripción del proyecto

Este proyecto consiste en un sistema local de mesa de ayuda desarrollado con **n8n**, **PostgreSQL**, **Docker** y un **dashboard web local**. Su objetivo es automatizar el registro, seguimiento, consulta, reporte y manejo de errores de tickets de soporte técnico.

El sistema permite registrar tickets mediante un formulario, clasificar automáticamente la prioridad, asignar un técnico, guardar la información en PostgreSQL, registrar auditoría, enviar notificaciones por correo y consultar el estado de los tickets. Además, incluye generación de reportes automáticos, manejo de errores y un dashboard web para visualizar la información almacenada.

---

## Tecnologías utilizadas

* n8n
* PostgreSQL
* Docker
* Docker Compose
* Adminer
* Node.js
* Express
* HTML
* CSS
* JavaScript
* Gmail SMTP
* PowerShell

---

## Arquitectura general

El sistema funciona de manera local mediante Docker Compose. Los servicios principales son:

* **n8n:** motor de automatización de workflows.
* **PostgreSQL:** base de datos local del sistema HelpDesk.
* **Adminer:** herramienta web para administrar PostgreSQL.
* **Dashboard web:** interfaz local para visualizar tickets, auditoría y errores.
* **Gmail SMTP:** servicio utilizado para el envío de notificaciones automáticas.

---

## Servicios locales

Al levantar el proyecto, se habilitan los siguientes servicios:

| Servicio           | URL                   |
| ------------------ | --------------------- |
| n8n                | http://localhost:5678 |
| Adminer            | http://localhost:8080 |
| Dashboard HelpDesk | http://localhost:3000 |

---

## Credenciales de prueba

### Adminer / PostgreSQL

| Campo         | Valor         |
| ------------- | ------------- |
| Sistema       | PostgreSQL    |
| Servidor      | postgres      |
| Usuario       | helpdesk_user |
| Contraseña    | helpdesk123   |
| Base de datos | helpdesk_db   |

### n8n

El acceso a n8n se configura al iniciar el sistema por primera vez.
El proyecto utiliza variables de entorno para manejar la configuración local.

---

## Estructura del proyecto

```txt
helpdesk-n8n-local/
│
├── dashboard/
│   ├── package.json
│   ├── server.js
│   └── public/
│       ├── index.html
│       ├── styles.css
│       └── app.js
│
├── database/
├── docs/
├── logs/
├── reports/
├── workflows/
│   ├── 01_ingesta_tickets_helpdesk.json
│   ├── 02_reporte_tickets_helpdesk.json
│   ├── 03_manejo_errores_helpdesk.json
│   └── 04_consulta_estado_ticket.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Base de datos

El sistema utiliza PostgreSQL como base de datos local.

Tablas principales:

| Tabla      | Descripción                                                      |
| ---------- | ---------------------------------------------------------------- |
| tickets    | Almacena los tickets creados por los usuarios                    |
| tecnicos   | Contiene los técnicos disponibles para asignación                |
| audit_logs | Guarda la bitácora de acciones realizadas                        |
| errores    | Registra errores capturados por el workflow de manejo de errores |

---

## Workflows implementados

### 01 - Ingesta de Tickets HelpDesk

Este workflow permite registrar tickets mediante un formulario de n8n. El sistema recibe los datos del usuario, genera un código único, clasifica la prioridad, asigna un técnico, guarda el ticket en PostgreSQL, registra auditoría y envía correos de confirmación al usuario y al técnico o administrador.

Nodos principales:

* Form Trigger
* Code
* PostgreSQL
* Send Email
* Form Ending

---

### 02 - Reporte de Tickets HelpDesk

Este workflow genera un reporte automático de los tickets registrados. Consulta la información en PostgreSQL, calcula estadísticas, genera un reporte HTML, lo convierte en archivo y lo envía por correo al administrador. También registra la acción en la bitácora.

Nodos principales:

* Schedule Trigger
* PostgreSQL
* Code
* Convert to File
* Send Email
* PostgreSQL para auditoría

---

### 03 - Manejo de Errores HelpDesk

Este workflow captura errores generados en otros workflows. Cuando ocurre un fallo, prepara el detalle del error, lo guarda en la tabla `errores` y envía una notificación por correo al administrador.

Nodos principales:

* Error Trigger
* Code
* PostgreSQL
* Send Email

---

### 04 - Consulta de Estado de Ticket

Este workflow permite consultar el estado de un ticket mediante su código. El usuario ingresa el código en un formulario, el sistema busca el ticket en PostgreSQL y muestra si existe junto con su estado, prioridad y técnico asignado. Si no existe, muestra un mensaje de ticket no encontrado.

Nodos principales:

* Form Trigger
* Code
* PostgreSQL
* IF
* Form Ending

---

## Dashboard web local

El proyecto incluye un dashboard local desarrollado con Node.js, Express, HTML, CSS y JavaScript.

URL:

```txt
http://localhost:3000
```

El dashboard muestra:

* Total de tickets
* Tickets nuevos
* Tickets de prioridad alta
* Tickets críticos
* Tabla de tickets registrados
* Bitácora de acciones
* Errores capturados

---

## Instalación y ejecución

### 1. Ubicarse en la carpeta del proyecto

```powershell
cd C:\Users\omarc\onedrive\escritorio\helpdesk-n8n-local
```

### 2. Levantar los servicios

```powershell
docker compose up -d
```

### 3. Verificar contenedores

```powershell
docker ps
```

Deben aparecer los siguientes contenedores:

```txt
helpdesk_n8n
helpdesk_postgres
helpdesk_adminer
helpdesk_dashboard
```

### 4. Abrir servicios

```powershell
start http://localhost:5678
start http://localhost:8080
start http://localhost:3000
```

---

## Apagar el proyecto

Para detener los servicios:

```powershell
docker compose down
```

---

## Casos de prueba

### Caso 1: Crear ticket válido

Entrada desde formulario:

```txt
Nombre: Omar
Correo: usuario@gmail.com
Departamento: Ventas
Categoría: Internet
Urgencia: Alta
Descripción: No hay conexión a internet
```

Resultado esperado:

* Ticket creado en PostgreSQL
* Código de ticket generado
* Prioridad asignada
* Técnico asignado
* Correo enviado al usuario
* Correo enviado al técnico o administrador
* Registro en `audit_logs`
* Visualización en dashboard

---

### Caso 2: Generar reporte automático

Resultado esperado:

* Se consulta la base de datos
* Se genera reporte HTML
* Se envía reporte por Gmail
* Se registra auditoría con acción `REPORTE_GENERADO`

---

### Caso 3: Captura de error

Resultado esperado:

* El Error Trigger captura el fallo
* Se guarda registro en tabla `errores`
* Se envía correo de alerta al administrador

---

### Caso 4: Consultar estado de ticket

Entrada:

```txt
HD-XXXXXXXXXXXX
```

Resultado esperado:

* Si existe, muestra estado, prioridad y técnico asignado
* Si no existe, muestra mensaje de ticket no encontrado

---

## Evidencias recomendadas

Para la entrega se incluyen capturas de:

* Docker corriendo con los contenedores activos
* n8n con los workflows
* Adminer mostrando las tablas
* Dashboard web local
* Formulario de creación de tickets
* Correos enviados por Gmail
* Reporte automático
* Tabla `audit_logs`
* Tabla `errores`
* Consulta de estado de ticket

---

## Seguridad y variables de entorno

El proyecto utiliza un archivo `.env` para centralizar credenciales y configuraciones sensibles.
Para compartir el proyecto se incluye un archivo `.env.example` y no se debe publicar el archivo `.env` real.

Ejemplo de variables:

```env
POSTGRES_USER=helpdesk_user
POSTGRES_PASSWORD=coloca_tu_password
POSTGRES_DB=helpdesk_db

N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=coloca_tu_password

N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://localhost:5678/

N8N_ENCRYPTION_KEY=coloca_una_clave_segura
```

---

## Autor

**Osvin Omar Caal Aju**
Proyecto Final n8n - Sistema HelpDesk Local Automatizado
