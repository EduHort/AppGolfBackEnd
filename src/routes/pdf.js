const express = require("express");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const ChartDataLabels = require("chartjs-plugin-datalabels");
const path = require("path");
const slugify = require("slugify");

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
            label: "Tensão (V)",
            data: data,
            backgroundColor: "rgba(0, 0, 255, 0.6)",
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            font: { weight: "bold", size: 14 },
            color: "black",
            formatter: (value) => (value === 0 ? null : `${value}V`),
          },
        },
        scales: {
          x: { ticks: { font: { weight: "bold" } } },
          y: { ticks: { font: { weight: "bold" } } },
        },
      },
      plugins: [ChartDataLabels],
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
        const inputPath = path.resolve(__dirname, "../assets/relatorio.pdf");

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
        form.getTextField("fone").setText(clientData.phone);
        form.getTextField("clube").setText(clientData.club + "    " + clientData.city + " - " + clientData.state);
        form.getTextField("marca").setText(cartData.brand);
        form.getTextField("modelo").setText(cartData.model);
        form.getTextField("numero").setText(cartData.number);
        form.getTextField("quantidade").setText(batteryData.quantity);
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
            x: 30,
            y: 150,
            width: 600,
            height: 170
        });

        // Achata os campos do formulário para impedir edição
        form.flatten();

        // Salva o PDF preenchido
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, modifiedPdfBytes);

        console.log('PDF preenchido e gráfico inserido com sucesso!');

        res.json({ message: "PDF gerado", path: outputPath });
    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        res.status(500).json({ error: "Erro ao gerar o PDF" });
    }
});

module.exports = router;
