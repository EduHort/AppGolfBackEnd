const pool = require("../config/db");

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questionarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255),
        telefone VARCHAR(20),
        clube VARCHAR(255),
        cidade VARCHAR(255),
        estado VARCHAR(50),
        marca_carrinho VARCHAR(255),
        modelo_carrinho VARCHAR(255),
        numero_carrinho VARCHAR(50),
        marca_bateria VARCHAR(255),
        quantidade_bateria VARCHAR(50),
        tipo_bateria VARCHAR(50),
        tensao_bateria VARCHAR(50),
        caixa_bateria VARCHAR(50),
        parafusos VARCHAR(50),
        terminais VARCHAR(50),
        polos VARCHAR(50),
        nivel_bateria VARCHAR(50),
        tensoes JSONB,
        funcionario VARCHAR(255),
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabelas criadas com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
  } finally {
    pool.end();
  }
};

createTables();
