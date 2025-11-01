# Guía de Despliegue de Contratos Stylus (Rust)

Esta guía explica cómo compilar, desplegar e interactuar con contratos inteligentes escritos en Rust para Arbitrum Stylus.

## Requisitos Previos

1. **Rust** (última versión estable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Arbitrum Stylus SDK**
   ```bash
   cargo install cargo-stylus
   ```
   
   **Nota:** El paquete correcto es `cargo-stylus`, no `stylus-sdk-cli`.

3. **MetaMask** configurado con Arbitrum Sepolia o Arbitrum One

## Estructura del Proyecto

```
Hackathon.github.io/
├── stylus-example.rs          # Contrato de ejemplo en Rust
├── stylus-contracts.js        # Funciones JavaScript para interactuar
├── contracts-arbitrum.js      # Direcciones de contratos desplegados
└── STYLUS-DEPLOY.md          # Esta guía
```

## Compilar el Contrato

1. **Crear un nuevo proyecto Stylus:**
   ```bash
   cargo stylus new payments-contract
   cd payments-contract
   ```

2. **Copiar el código del contrato:**
   Copia el contenido de `stylus-example.rs` en `src/lib.rs` del proyecto Stylus.

3. **Compilar:**
   ```bash
   cargo stylus build --release
   ```

   Esto generará un archivo `.wasm` en `target/wasm32-unknown-unknown/release/`

## Desplegar en Arbitrum Sepolia

1. **Obtener testnet ETH:**
   - Arbitrum Sepolia Faucet: https://faucet.quicknode.com/arbitrum/sepolia

2. **Desplegar usando Stylus CLI:**
   ```bash
   cargo stylus deploy \
     --private-key $PRIVATE_KEY \
     --wasm-file target/wasm32-unknown-unknown/release/payments_contract.wasm \
     --network sepolia \
     --gas-price 0.1gwei
   ```

3. **O usar Remix o Hardhat:**
   - Sube el `.wasm` a Remix
   - Configura la red como Arbitrum Sepolia
   - Despliega usando el plugin de Stylus

## Actualizar Direcciones en el Proyecto

Una vez desplegado, actualiza `contracts-arbitrum.js` con la dirección real:

```javascript
const CONTRACTS_ARBITRUM = {
    arbitrumSepolia: {
        payments: '0xTU_DIRECCION_DESPLEGADA_AQUI', // Reemplazar
        // ...
    }
};
```

## Interactuar desde el Frontend

El archivo `stylus-contracts.js` ya contiene las funciones necesarias:

```javascript
// Depositar en el contrato
await depositToPaymentsContract('1.0'); // 1 ETH

// Enviar pago usando Stylus
await sendPaymentStylus('0x...', '0.5'); // 0.5 ETH

// Obtener balance
const balance = await getStylusBalance(userAddress);
```

## Beneficios de Stylus

✅ **Mejor rendimiento**: Hasta 10x más rápido que Solidity  
✅ **Mayor seguridad**: Rust previene muchos errores comunes  
✅ **Costos reducidos**: Optimizaciones de WASM reducen gas  
✅ **Multi-lenguaje**: Puedes usar Rust, C, C++ además de Solidity

## Notas Importantes

- Los contratos Stylus son compatibles con la EVM desde el frontend
- El ABI se genera automáticamente al compilar
- Los costos de despliegue son similares a Solidity
- Los contratos Stylus pueden interactuar con contratos Solidity sin problemas

## Recursos

- [Documentación Arbitrum Stylus](https://docs.arbitrum.io/stylus/)
- [Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs)
- [Ejemplos de Stylus](https://github.com/OffchainLabs/stylus-examples)

## Solución de Problemas

**Error: "No se encontró código de contrato"**
- Verifica que la dirección esté correcta en `contracts-arbitrum.js`
- Asegúrate de estar en la red correcta (Arbitrum Sepolia/One)

**Error: "Gas estimation failed"**
- Verifica que tengas suficiente ETH para gas
- Aumenta el límite de gas en la transacción

**Error: "Function not found"**
- Verifica que el ABI en `stylus-contracts.js` coincida con el contrato desplegado
- Asegúrate de que el contrato esté correctamente compilado
