FROM mcr.microsoft.com/appsvc/node:20-lts

# Install LibreOffice and ensure soffice binary is available
RUN apt-get update && \
    apt-get install -y \
        libreoffice \
        libreoffice-writer \
        libreoffice-impress \
        libreoffice-calc \
        fonts-liberation \
        && \
    # Create symlink to ensure soffice is in PATH
    ln -sf /usr/bin/libreoffice /usr/bin/soffice && \
    # Verify installation
    which soffice && \
    soffice --version && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/site/wwwroot
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
