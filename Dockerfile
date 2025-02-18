FROM node:20-slim  
# Use uma imagem base do Node.js (versão 18 ou superior recomendada)

# Atualiza os pacotes e instala as dependências necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libglib2.0-0 \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgbm1 \
    fonts-liberation \
    xdg-utils \
    wget \
    --fix-missing && \
    rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install  # Ou yarn install

# Copia o restante do código do seu aplicativo
COPY . .

# Expõe a porta que o seu aplicativo usa
EXPOSE 5000

# Define o comando para iniciar o aplicativo
CMD [ "node", "index.js" ]