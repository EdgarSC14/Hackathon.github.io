#!/bin/bash
# Script para desplegar el contrato de pagos en Arbitrum Sepolia
# USO: ./deploy-sepolia.sh

# Verificar que la clave privada esté configurada
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: La variable PRIVATE_KEY no está configurada"
    echo ""
    echo "Para configurarla, ejecuta:"
    echo "export PRIVATE_KEY='tu_clave_privada_sin_0x'"
    echo ""
    echo "Para obtener tu clave privada desde MetaMask:"
    echo "1. Abre MetaMask"
    echo "2. Ve a Configuración > Seguridad y Privacidad"
    echo "3. Exporta la clave privada de tu cuenta de testnet"
    echo ""
    exit 1
fi

# Verificar que tienes Rust y cargo-stylus instalado
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Cargo no está instalado"
    exit 1
fi

if ! cargo stylus --version &> /dev/null; then
    echo "❌ Error: cargo-stylus no está instalado"
    exit 1
fi

echo "🚀 Desplegando contrato de pagos en Arbitrum Sepolia..."
echo "📍 Endpoint: https://sepolia-rollup.arbitrum.io/rpc"
echo ""

# Desplegar
source "$HOME/.cargo/env"
cargo stylus deploy \
  --private-key "$PRIVATE_KEY" \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📝 IMPORTANTE: Copia la dirección del contrato desplegado y actualízala en:"
echo "   ../contracts-arbitrum.js"
