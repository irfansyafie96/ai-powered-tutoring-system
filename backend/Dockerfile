FROM node:20-alpine

# Install LibreOffice and essential shell utilities
RUN apk update && \
    apk add --no-cache \
        libreoffice \
        libreoffice-writer \
        libreoffice-impress \
        libreoffice-calc \
        bash \
        busybox \
        coreutils \
        util-linux \
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

# Use exec form and specify the shell explicitly to avoid entrypoint issues
CMD ["node", "index.js"]