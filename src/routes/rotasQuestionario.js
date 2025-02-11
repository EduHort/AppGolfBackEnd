const express = require("express");
const router = express.Router();

// Simulação de um banco de dados temporário
const questionarios = [];

router.post("/questionario", (req, res) => {
  const dados = req.body;

  if (!dados) {
    return res.status(400).json({ error: "Nenhum dado enviado" });
  }

  questionarios.push(dados); // Simulando o armazenamento
  return res.status(201).json({ message: "Dados recebidos com sucesso!", dados });
});

module.exports = router;
