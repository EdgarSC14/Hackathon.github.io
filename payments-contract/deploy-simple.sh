#!/bin/bash
# Script simplificado de despliegue - evita locks

echo "🚀 Desplegando contrato Stylus..."
echo ""

# Cargar entorno
source "$HOME/.cargo/env" 2>/dev/null || true

# Verificar clave
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: export PRIVATE_KEY='tu_clave' primero"
    exit 1
fi

# Limpiar locks previos
cd /home/vicpaz/Escritorio/HackMonterrey/Hackathon.github.io/payments-contract
pkill -f "cargo.*stylus" 2>/dev/null
pkill -f "cargo build" 2>/dev/null
sleep 1

# Desplegar directamente (sin verificación previa para evitar locks)
echo "📦 Desplegando en Arbitrum Sepolia..."
cargo stylus deploy \
  --private-key "$PRIVATE_KEY" \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --no-verify

echo ""
echo "✅ Despliegue completado!"
echo "📝 Copia la dirección del contrato y actualiza contracts-arbitrum.js"
