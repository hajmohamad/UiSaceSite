FROM golang:alpine AS builder

WORKDIR /app

# Install git and certificates
RUN apk add --no-cache git ca-certificates

# Copy dependency files
COPY go.mod go.sum ./

# حل مشکل تحریم پکیج‌های Go
ENV GOPROXY=https://goproxy.io,https://goproxy.cn,direct

RUN go mod download

# Copy source code
COPY . .

# Build static binary without CGO
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Stage 2: Minimal runtime image
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/server .

# Setup data and uploads volumes
RUN mkdir -p /app/data /app/uploads/receipts /app/uploads/general

EXPOSE 8080

ENV PORT=8080
ENV DB_PATH=/app/data/uisace.db
ENV UPLOAD_DIR=/app/uploads

ENTRYPOINT ["./server"]
