const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "helpdesk_db",
  user: process.env.POSTGRES_USER || "helpdesk_user",
  password: process.env.POSTGRES_PASSWORD || "helpdesk123"
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      message: "Dashboard conectado correctamente a PostgreSQL"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error conectando con PostgreSQL",
      error: error.message
    });
  }
});

app.get("/api/resumen", async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*)::int AS total_tickets,
        COUNT(*) FILTER (WHERE estado = 'Nuevo')::int AS tickets_nuevos,
        COUNT(*) FILTER (WHERE estado = 'En proceso')::int AS tickets_en_proceso,
        COUNT(*) FILTER (WHERE estado = 'Cerrado')::int AS tickets_cerrados,
        COUNT(*) FILTER (WHERE prioridad = 'Crítica')::int AS tickets_criticos,
        COUNT(*) FILTER (WHERE prioridad = 'Alta')::int AS tickets_altos,
        COUNT(*) FILTER (WHERE prioridad = 'Media')::int AS tickets_medios,
        COUNT(*) FILTER (WHERE prioridad = 'Baja')::int AS tickets_bajos
      FROM tickets;
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo resumen",
      detalle: error.message
    });
  }
});

app.get("/api/tickets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        codigo_ticket,
        nombre,
        correo,
        departamento,
        categoria,
        descripcion,
        urgencia,
        prioridad,
        estado,
        tecnico_asignado,
        fecha_creacion,
        fecha_actualizacion
      FROM tickets
      ORDER BY fecha_creacion DESC
      LIMIT 50;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo tickets",
      detalle: error.message
    });
  }
});

app.get("/api/audit", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        accion,
        detalle,
        workflow,
        codigo_ticket,
        fecha
      FROM audit_logs
      ORDER BY fecha DESC
      LIMIT 50;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo auditoría",
      detalle: error.message
    });
  }
});

app.get("/api/errores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        workflow,
        nodo,
        mensaje_error,
        fecha
      FROM errores
      ORDER BY fecha DESC
      LIMIT 50;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo errores",
      detalle: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Dashboard HelpDesk corriendo en http://localhost:${PORT}`);
});