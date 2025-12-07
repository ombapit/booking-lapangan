FROM node:20-alpine

# Install git/tools lain jika diperlukan (opsional)
RUN apk add --no-cache git

WORKDIR /app

# Port tetap dibuka
EXPOSE 3000

# Tidak ada CMD di sini, kita set di docker-compose
# Atau bisa kasih default command agar container tidak langsung mati:
CMD ["tail", "-f", "/dev/null"]
