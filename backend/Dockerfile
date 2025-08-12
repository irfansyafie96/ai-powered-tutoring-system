FROM node:20-alpine

# Install LibreOffice and ensure soffice binary is available
RUN apk update && \
    apk add --no-cache \
        libreoffice \
        libreoffice-writer \
        libreoffice-impress \
        libreoffice-calc \
        && \
    # Create symlink to ensure soffice is in PATH
    ln -sf /usr/bin/libreoffice /usr/bin/soffice && \
    # Verify installation
    which soffice && \
    soffice --version && \
    # Clean up
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
