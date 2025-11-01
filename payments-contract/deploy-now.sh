#!/bin/bash
# Script de despliegue rápido - Ejecuta este para desplegar

echo "🚀 DESPLIEGUE DE CONTRATO STYLUS"
echo "================================"
echo ""

# Verificar que Rust está disponible
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Cargo no está instalado"
    echo "Ejecuta: source \$HOME/.cargo/env"
    exit 1
fi

# Verificar clave privada
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: La variable PRIVATE_KEY no está configurada"
    echo ""
    echo "Para configurarla, ejecuta:"
    echo "  export PRIVATE_KEY='tu_clave_privada_sin_0x'"
    echo ""
    echo "O ejecuta este script así:"
    echo "  PRIVATE_KEY='tu_clave' ./deploy-now.sh"
    echo ""
    exit 1
fi

# Cargar entorno de Rust
source "$HOME/.cargo/env" 2>/dev/null || true

# Verificar contrato primero
echo "📋 Paso 1/3: Verificando contrato..."
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: El contrato no pasó las verificaciones"
    echo "Revisa los errores arriba"
    exit 1
fi

echo ""
echo "✅ Verificación exitosa!"
echo ""

# Desplegar
echo "📦 Paso 2/3: Desplegando contrato..."
echo "📍 Red: Arbitrum Sepolia"
echo "⚠️  Esto enviará 2 transacciones y puede tomar unos minutos..."
echo ""

cargo stylus deploy \
  --private-key "$PRIVATE_KEY" \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc

DEPLOY_EXIT_CODE=$?

echo ""
echo "================================"

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo "✅ ¡DESPLIEGUE EXITOSO!"
    echo ""
    echo "📝 IMPORTANTE:"
    echo "1. Copia la dirección del contrato que aparece arriba"
    echo "2. Actualiza contracts-arbitrum.js con esa dirección"
    echo "3. Prueba el contrato usando test-stylus.html"
else
    echo "❌ Error en el despliegue"
    echo "Revisa los errores arriba"
    exit 1
fi



