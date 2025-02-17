const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            browserWSEndpoint: (await browser.wsEndpoint()), // Conecta ao navegador Puppeteer
        },
    });

    // Exibe o QR Code no terminal
    client.on('qr', (qr) => {
        console.log('Escaneie o QR Code para conectar no WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    // Confirmação de conexão
    client.on('ready', () => {
        console.log('WhatsApp Web conectado!');
    });

    // Inicia o cliente
    client.initialize();
})();
