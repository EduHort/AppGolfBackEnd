# Usa uma imagem do Node com suporte ao Puppeteer
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Expor a porta do servidor (se precisar)
EXPOSE 3000

# Comando para iniciar o back-end
CMD ["node", "index.js"]
