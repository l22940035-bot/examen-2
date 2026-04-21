const EntrenamientoSchema = new mongoose.Schema({
    texto: String,
    kilometros: Number,
    minutos: Number,
    fecha: { type: Date, default: Date.now }
});