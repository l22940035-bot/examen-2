require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado exitosamente a MongoDB Atlas"))
    .catch(err => console.error("❌ Error de conexión:", err));

const EntrenamientoSchema = new mongoose.Schema({
    texto: String,
    kilometros: Number,
    minutos: Number,
    fecha: { type: Date, default: Date.now }
});

const Entrenamiento = mongoose.model('Entrenamiento', EntrenamientoSchema);

// Ping
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Guardar entrenamiento
app.post('/api/entrenamientos', async (req, res) => {
    try {
        const nuevoEntrenamiento = new Entrenamiento(req.body);
        await nuevoEntrenamiento.save();
        res.status(201).json({ mensaje: "Entrenamiento guardado", id: nuevoEntrenamiento._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener entrenamientos
app.get('/api/entrenamientos', async (req, res) => {
    try {
        const datos = await Entrenamiento.find().sort({ fecha: -1 }).limit(7);
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resumen
app.get('/api/resumen', async (req, res) => {
    try {
        const datos = await Entrenamiento.find();
        const totalEntrenamientos = datos.length;
        const kmTotal = datos.reduce((acc, e) => acc + (e.kilometros || 0), 0);
        const minTotal = datos.reduce((acc, e) => acc + (e.minutos || 0), 0);
        const pacePromedio = kmTotal > 0 ? minTotal / kmTotal : 0;

        res.json({ totalEntrenamientos, kmTotal, minTotal, pacePromedio });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Racha
app.get('/api/racha', async (req, res) => {
    try {
        const datos = await Entrenamiento.find().sort({ fecha: -1 });
        let racha = 0;
        let fechaAnterior = new Date();
        fechaAnterior.setHours(0, 0, 0, 0);

        for (const e of datos) {
            const fechaEnt = new Date(e.fecha);
            fechaEnt.setHours(0, 0, 0, 0);
            const diff = (fechaAnterior - fechaEnt) / (1000 * 60 * 60 * 24);
            if (diff <= 1) {
                racha++;
                fechaAnterior = fechaEnt;
            } else {
                break;
            }
        }

        res.json({ racha });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en http://0.0.0.0:${PORT}`);
});