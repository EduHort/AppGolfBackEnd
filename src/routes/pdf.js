const express = require("express");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const path = require("path");
const slugify = require("slugify");
const client = require("../controllers/whatsapp");
const { MessageMedia } = require('whatsapp-web.js');
const saveData = require("../controllers/saveDB");
const sendEmail = require("../controllers/email");

const router = express.Router();

async function generateChartImage(data) {
    const width = 1000;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
    const configuration = {
        type: "bar",
        data: {
            labels: ["Bateria 1", "Bateria 2", "Bateria 3", "Bateria 4", "Bateria 5", "Bateria 6", "Bateria 7", "Bateria 8"],
            datasets: [
                {
                    data: data,
                    backgroundColor: "rgba(0, 0, 255, 0.6)",
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: {
                    top: 20 // Evita que labels fiquem fora do gráfico
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { weight: "bold" },
                        color: "black"
                    }
                },
                y: {
                    ticks: {
                        font: { weight: "bold" },
                        color: "black"
                    },
                    title: {
                        display: true,
                        text: "Tensão (V)",
                        font: {
                            weight: "bold",
                            size: 16
                        },
                        color: "black"
                    }
                }
            }
        },
        plugins: [{
            id: 'customLabels',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                chart.data.datasets[0].data.forEach((value, index) => {
                    if (value === 0) return; // Pula valores zero
                    
                    const meta = chart.getDatasetMeta(0);
                    const x = meta.data[index].x;
                    const y = meta.data[index].y - 15; // Posiciona um pouco acima da barra
                    
                    ctx.fillStyle = 'black';
                    ctx.fillText(`${value}V`, x, y);
                });
                ctx.restore();
            }
        }]
    };
  
    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

router.post("/gerar-pdf", async (req, res) => {
    try {
        const { batteryData, voltageData, cartData, clientData, batteryCheckData, employeeName } = req.body;
    
        if (!batteryData || !voltageData || !cartData || !clientData || !batteryCheckData || !employeeName) {
            return res.status(400).json({ error: "Dados incompletos" });
        }
    
        // Caminhos do PDF base e do PDF final
        const inputPath = path.resolve(__dirname, "../assets/Relatorio.pdf");

        const safeClientName = slugify(clientData.name, {
            lower: true,
            strict: true,
            replacement: "_", 
        });
        const outputPath = path.resolve(__dirname, `../assets/relatorio_${safeClientName}.pdf`);
    
        // Carrega o PDF base
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();
    
        // Preenche os campos do PDF
        form.getTextField("nome").setText(clientData.name);
        form.getTextField("email").setText(clientData.email);
        form.getTextField("fone").setText(formatPhoneNumberPDF(clientData.phone));
        form.getTextField("clube").setText(clientData.club + "    " + clientData.city + " - " + clientData.state);
        form.getTextField("marca").setText(cartData.brand);
        form.getTextField("modelo").setText(cartData.model);
        form.getTextField("numero").setText(cartData.number);
        form.getTextField("marcaBat").setText(batteryData.brand);
        form.getTextField("quantidade").setText(batteryData.quantity);
        form.getTextField("tipo").setText(batteryData.type);
        form.getTextField("tensao").setText(batteryData.voltage);
        form.getTextField("caixa").setText(batteryCheckData.batteryBox);
        form.getTextField("parafusos").setText(batteryCheckData.screws);
        form.getTextField("terminais").setText(batteryCheckData.terminalsCables);
        form.getTextField("polos").setText(batteryCheckData.poles);
        form.getTextField("nivel").setText(batteryCheckData.batteryLevel);

        // Gerar gráfico com base nos valores das tensões
        const chartImage = await generateChartImage(voltageData);

        // Adiciona a imagem do gráfico ao PDF
        const image = await pdfDoc.embedPng(chartImage);
        const page = pdfDoc.getPages()[0];
        page.drawImage(image, {
            x: 25,
            y: 150,
            width: 600,
            height: 170
        });

        // Achata os campos do formulário para impedir edição
        form.flatten();

        // Salva o PDF preenchido
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, modifiedPdfBytes);

        // Enviar o PDF pelo WhatsApp
        const phoneNumber = formatPhoneNumberWapp(clientData.phone);
        const media = MessageMedia.fromFilePath(outputPath);
        let successMessage = "PDF gerado";

        try {
            await client.sendMessage(phoneNumber, media, { caption: `Olá ${clientData.name}, segue seu relatório do PitStop do carrinho de golf.` });
            successMessage += " e enviado pelo WhatsApp";
        } catch (error) {
            console.error("Erro ao enviar WhatsApp:", error);
            logError(`Erro ao enviar WhatsApp para ${clientData.phone}: ${error.message}`);
            successMessage += ", mas não foi possível enviar por WhatsApp";
        }
    
        try {
            await sendEmail(clientData.email, clientData.name, safeClientName, outputPath);
            successMessage += " e Email.";
        } catch (error) {
            console.error("Erro ao enviar Email:", error);
            logError(`Erro ao enviar Email para ${clientData.email}: ${error.message}`);
            successMessage += ", mas não foi possível enviar por Email";
        }
    
        try {
            await saveData(req.body);
            //successMessage += " e salvo no banco de dados.";
        } catch (error) {
            console.error("Erro ao salvar no banco de dados:", error);
            logError(`Erro ao salvar dados no banco para ${clientData.email}: ${error.message}`);
            successMessage += ", mas não foi possível salvar no banco de dados.";
        }
    
        res.json({ message: successMessage, path: outputPath });
    } catch (error) {
        console.error("Erro ao gerar ou enviar o PDF:", error);
        res.status(500).json({ error: "Erro ao gerar ou enviar o PDF \n " + error.message || "Erro desconhecido" });
    }
});

function formatPhoneNumberWapp(phone) {
    let rawPhone = phone.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (!rawPhone.startsWith("55")) {
      rawPhone = "55" + rawPhone;
    }
    if (rawPhone.length === 13 && rawPhone[4] === "9") {
      rawPhone = rawPhone.slice(0, 4) + rawPhone.slice(5);
    }
    return `${rawPhone}@c.us`;
};

function formatPhoneNumberPDF(phone) {
  let rawPhone = phone.replace(/\D/g, ""); // Remove tudo que não for número

  if (rawPhone.length === 11 && rawPhone.startsWith("55")) {
      rawPhone = rawPhone.slice(2); // Remove o código do país se já estiver presente
  }

  if (rawPhone.length === 10) {
      return `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 6)}-${rawPhone.slice(6)}`;
  } else if (rawPhone.length === 11) {
      return `(${rawPhone.slice(0, 2)}) 9 ${rawPhone.slice(3, 7)}-${rawPhone.slice(7)}`;
  }

  return phone; // Retorna o original se não bater com os formatos esperados
};

function logError(message) {
    const logPath = path.resolve(__dirname, "../logs/logs.txt"); // Caminho do arquivo
    const timestamp = new Date().toISOString(); // Data e hora no formato ISO
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logPath, logMessage, "utf8"); // Adiciona ao arquivo sem sobrescrever
};

module.exports = router;
