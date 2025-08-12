FROM mcr.microsoft.com/appsvc/node:20-lts

# Install LibreOffice during image build (not startup)
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/site/wwwroot
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
