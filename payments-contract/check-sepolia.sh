#!/bin/bash
# Script para verificar el contrato Stylus antes de desplegar
# USO: ./check-sepolia.sh

echo "📋 Verificando contrato Stylus..."
echo "📍 Endpoint: https://sepolia-rollup.arbitrum.io/rpc"
echo ""

source "$HOME/.cargo/env"
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Verificación exitosa! El contrato está listo para desplegar."
    echo ""
    echo "Próximos pasos:"
    echo "1. Exporta tu clave privada: export PRIVATE_KEY='tu_clave'"
    echo "2. Ejecuta: ./deploy-sepolia.sh"
else
    echo ""
    echo "❌ Error en la verificación. Revisa los errores arriba."
    exit 1
fi
