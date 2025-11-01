# 🚀 Guía de Despliegue - Contrato de Pagos

## Requisitos Previos

1. ✅ **ETH en Arbitrum Sepolia** (para pagar gas)
   - Obtén ETH de testnet en: https://faucet.quicknode.com/arbitrum/sepolia
   - O usa otro faucet de Arbitrum Sepolia

2. ✅ **Clave Privada de tu Wallet**
   - Exporta desde MetaMask (Configuración > Seguridad > Exportar clave privada)
   - **Solo para cuentas de testnet**, nunca uses tu clave principal

## Opción 1: Usar el Script Automático

```bash
# 1. Ve al directorio del contrato
cd payments-contract

# 2. Configura tu clave privada (sin el 0x inicial)
export PRIVATE_KEY='tu_clave_privada_aqui'

# 3. Ejecuta el script
./deploy-sepolia.sh
```

## Opción 2: Comando Manual

```bash
# 1. Ve al directorio del contrato
cd payments-contract

# 2. Configura tu clave privada
export PRIVATE_KEY='tu_clave_privada_aqui'

# 3. Despliega
source "$HOME/.cargo/env"
cargo stylus deploy \
  --private-key "$PRIVATE_KEY" \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

## Después del Despliegue

1. **Copia la dirección del contrato** que aparece en la salida
2. **Actualiza `contracts-arbitrum.js`**:
   ```javascript
   arbitrumSepolia: {
       payments: '0xDIRECCION_DESPLEGADA_AQUI', // Reemplaza esto
       // ...
   }
   ```
3. **Recarga la página** y prueba los pagos

## Solución de Problemas

### Error: "insufficient funds"
- Asegúrate de tener ETH en Arbitrum Sepolia
- Verifica que estés usando la cuenta correcta

### Error: "invalid private key"
- Verifica que la clave no tenga el prefijo `0x`
- Asegúrate de que no haya espacios

### Error: "connection refused"
- Verifica tu conexión a internet
- El endpoint puede estar temporalmente inactivo, intenta más tarde

## Seguridad ⚠️

- **Nunca** compartas tu clave privada
- **Nunca** subas archivos con claves privadas a Git
- Solo usa cuentas de testnet para desarrollo
- Para producción, usa un wallet hardware o servicio seguro

## Próximos Pasos

Una vez desplegado:
1. Prueba `deposit()` desde MetaMask
2. Prueba `sendPayment()` entre direcciones
3. Verifica balances con `getBalance()`
