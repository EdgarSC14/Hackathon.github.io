# Contrato de Pagos - Despliegue

Este contrato de pagos está escrito en Rust y compilado para Arbitrum Stylus.

## Estado del Proyecto

✅ **Compilado exitosamente**
- Contrato: 7.6 KiB
- WASM: 25.8 KiB
- ABI exportado

## Comandos Útiles

### Verificar el contrato
```bash
cargo stylus check
```

### Exportar ABI
```bash
cargo stylus export-abi
```

### Desplegar en Arbitrum Sepolia
```bash
# Desde el directorio payments-contract
cargo stylus deploy \
  --private-key <TU_PRIVATE_KEY_HEX> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

### Desplegar en Arbitrum One (Mainnet)
```bash
cargo stylus deploy \
  --private-key <TU_PRIVATE_KEY_HEX> \
  --endpoint https://arb1.arbitrum.io/rpc
```

**⚠️ IMPORTANTE:**
- Nunca compartas tu clave privada
- Para testnet, exporta tu clave desde MetaMask o usa una cuenta de prueba
- Para mainnet, usa un wallet seguro y nunca compartas la clave

## Funciones Disponibles

1. **getBalance(address user)** - Obtiene el balance de un usuario
2. **deposit()** - Deposita ETH en el contrato (payable)
3. **withdraw(uint256 amount)** - Retira fondos del contrato
4. **sendPayment(address to, uint256 amount)** - Envía un pago a otra dirección

## Próximos Pasos

1. Obtener ETH de testnet para Arbitrum Sepolia
2. Configurar la clave privada de despliegue
3. Desplegar el contrato
4. Actualizar `contracts-arbitrum.js` con la dirección del contrato desplegado

## Notas

- El contrato requiere que los usuarios depositen fondos primero usando `deposit()`
- Los pagos se realizan desde el balance depositado, no directamente desde la wallet
- Esto permite implementar lógica adicional (comisiones, límites, etc.) en el futuro
