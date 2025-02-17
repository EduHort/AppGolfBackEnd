const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: require('puppeteer').executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });
  

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code para conectar no WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Web conectado!');
});

client.initialize();

module.exports = client;
