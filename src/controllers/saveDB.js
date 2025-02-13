const pool = require("../config/db");

async function saveData(data) {
  const { batteryData, voltageData, cartData, clientData, batteryCheckData, employeeName } = data;

  try {
    // Inserção dos dados na tabela "questionarios"
    await pool.query(
      `INSERT INTO questionarios 
        (nome, email, telefone, clube, cidade, estado, 
         marca_carrinho, modelo_carrinho, numero_carrinho,
         marca_bateria, quantidade_bateria, tipo_bateria, tensao_bateria,
         caixa_bateria, parafusos, terminais, polos, nivel_bateria,
         tensoes, funcionario) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
              $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        clientData.name,
        clientData.email,
        clientData.phone,
        clientData.club,
        clientData.city,
        clientData.state,
        cartData.brand,
        cartData.model,
        cartData.number,
        batteryData.brand,
        batteryData.quantity,
        batteryData.type,
        batteryData.voltage,
        batteryCheckData.batteryBox,
        batteryCheckData.screws,
        batteryCheckData.terminalsCables,
        batteryCheckData.poles,
        batteryCheckData.batteryLevel,
        JSON.stringify(voltageData), // Armazena como JSON no banco
        employeeName
      ]
    );
    console.log("Dados salvos com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar os dados:", error);
    throw new Error("Erro ao salvar os dados"); // Lançando um erro caso ocorra algo errado
  }
}

module.exports = saveData;
