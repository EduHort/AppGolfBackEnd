const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Permite receber JSON no body das requisições

const pdfRoutes = require("./routes/pdf");

// Rotas
app.use("/api", pdfRoutes);

// Define a porta do servidor
const PORT = process.env.PORT || 5000;

// Inicia o servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
