const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        ignoreDefaultArgs: ['--disable-extensions'],
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

