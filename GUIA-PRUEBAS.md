# 🧪 Guía de Pruebas de Contratos Stylus

Esta guía explica cómo probar el funcionamiento de los contratos Stylus desplegados en Arbitrum.

## Opción 1: Página de Pruebas Interactiva

### Pasos:

1. **Abrir la página de pruebas:**
   - Ve a `test-stylus.html` en tu navegador
   - O desde la página principal: "Desplegar Stylus" → "Abrir Página de Pruebas"

2. **Conectar tu wallet:**
   - Haz clic en "Conectar Wallet"
   - Acepta la conexión en MetaMask
   - Asegúrate de estar en Arbitrum Sepolia o Arbitrum One

3. **Cargar el contrato:**
   - Ingresa la dirección del contrato desplegado
   - O usa la dirección por defecto (si ya está configurada)
   - Haz clic en "Cargar Contrato"

4. **Probar funciones:**

   **a) Consultar Balance (`getBalance`):**
   - Ingresa una dirección (o usa la tuya)
   - Haz clic en "Consultar Balance"
   - Verás el balance depositado en el contrato

   **b) Depositar (`deposit`):**
   - Ingresa un monto (ej: 0.001 ETH)
   - Haz clic en "Depositar"
   - Confirma la transacción en MetaMask
   - Espera la confirmación
   - El balance se actualizará automáticamente

   **c) Enviar Pago (`sendPayment`):**
   - Ingresa una dirección destino
   - Ingresa un monto
   - Haz clic en "Enviar Pago"
   - Confirma la transacción
   - Verifica que el balance del destinatario aumentó

   **d) Retirar (`withdraw`):**
   - Ingresa el monto a retirar
   - Haz clic en "Retirar"
   - Confirma la transacción
   - Los fondos volverán a tu wallet

5. **Revisar el log:**
   - Todas las transacciones aparecen en el log
   - Puedes hacer clic en los hashes para verlas en Arbiscan

## Opción 2: Desde la Página Principal (Impulso Web3)

### En la sección "Finanzas Inclusivas":

1. **Conectar wallet** (si no está conectada)
2. **Depositar fondos:**
   - Ingresa un monto en "Depositar en Contrato Stylus"
   - Haz clic en "Depositar"
   - Confirma en MetaMask

3. **Enviar pagos:**
   - Usa el formulario "Enviar Remesa"
   - Marca "Usar Contrato Stylus" (por defecto está marcado)
   - Ingresa dirección destino y monto
   - Haz clic en "Enviar"

4. **Ver balance:**
   - El balance se muestra en "Balance en Contrato Stylus"
   - Se actualiza automáticamente después de cada transacción

## Opción 3: Pruebas Programáticas

### Ejemplo de código JavaScript:

```javascript
// Cargar dependencias
const web3 = new Web3(window.ethereum);
const contractABI = [/* ABI del contrato */];
const contractAddress = '0x...'; // Tu dirección desplegada
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 1. Consultar balance
const balance = await contract.methods.getBalance(userAddress).call();
console.log('Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

// 2. Depositar
await contract.methods.deposit().send({
    from: userAddress,
    value: web3.utils.toWei('0.001', 'ether'),
    gas: 200000
});

// 3. Enviar pago
await contract.methods.sendPayment(
    '0xDestino...',
    web3.utils.toWei('0.001', 'ether')
).send({
    from: userAddress,
    gas: 300000
});

// 4. Retirar
await contract.methods.withdraw(
    web3.utils.toWei('0.001', 'ether')
).send({
    from: userAddress,
    gas: 300000
});
```

## Verificación en Arbiscan

Para cada transacción exitosa:

1. Copia el hash de la transacción
2. Ve a:
   - Arbitrum Sepolia: https://sepolia.arbiscan.io/tx/HASH
   - Arbitrum One: https://arbiscan.io/tx/HASH
3. Verifica:
   - Estado: Success ✓
   - Gas usado
   - Eventos emitidos
   - From/To addresses

## Solución de Problemas

### Error: "Contract not deployed"
- Verifica que la dirección del contrato sea correcta
- Asegúrate de estar en la red correcta (Arbitrum Sepolia/One)
- Verifica que el contrato esté activado (no solo desplegado)

### Error: "Insufficient funds"
- Deposita primero usando `deposit()`
- Verifica que tengas ETH suficiente para gas

### Error: "Gas estimation failed"
- El contrato puede no estar activado
- Verifica que la dirección sea correcta
- Asegúrate de tener suficiente ETH para gas

### Balance no se actualiza
- Espera unos segundos para la confirmación
- Haz clic en "Actualizar" manualmente
- Verifica en Arbiscan que la transacción fue exitosa

## Pruebas Recomendadas

1. ✅ **Depositar** una cantidad pequeña (0.001 ETH)
2. ✅ **Consultar balance** - debe mostrar el monto depositado
3. ✅ **Enviar pago** a otra dirección
4. ✅ **Consultar balance del destinatario** - debe aumentar
5. ✅ **Consultar tu balance** - debe disminuir
6. ✅ **Retirar** parte del balance
7. ✅ **Verificar** que el balance se actualiza correctamente
8. ✅ **Intentar retirar más** de lo depositado - debe fallar con "Saldo insuficiente"

## Notas Importantes

- ⚠️ Usa solo redes de testnet (Arbitrum Sepolia) para pruebas
- ⚠️ Nunca uses claves privadas de mainnet en páginas web
- ⚠️ Verifica siempre las direcciones antes de enviar fondos
- ⚠️ Los contratos Stylus requieren activación después del despliegue
- ✅ Las transacciones en Arbitrum son rápidas y baratas
- ✅ Puedes hacer múltiples pruebas con poco ETH

## Próximos Pasos

Una vez que confirmes que el contrato funciona correctamente:

1. Actualiza `contracts-arbitrum.js` con la dirección real
2. Prueba desde la aplicación principal (Impulso Web3)
3. Integra con otros módulos (microcréditos, ahorros, etc.)
4. Considera desplegar en Arbitrum One para producción



