# 💧 Cómo Obtener ETH de Testnet para Arbitrum Sepolia

## Tu Dirección de Wallet:
```
0xCAc52a9CCb14C5E5BBCC30deB0b0Ccc0EeE4FC55
```

## Opciones para Obtener ETH:

### Opción 1: QuickNode Faucet (Recomendado)
1. Ve a: https://faucet.quicknode.com/arbitrum/sepolia
2. Conecta tu wallet MetaMask
3. Asegúrate de estar en la red **Arbitrum Sepolia**
4. Pega tu dirección: `0xCAc52a9CCb14C5E5BBCC30deB0b0Ccc0EeE4FC55`
5. Solicita ETH (generalmente 0.1 ETH)

### Opción 2: Chainlink Faucet
1. Ve a: https://faucets.chain.link/
2. Selecciona **Arbitrum Sepolia**
3. Conecta tu wallet
4. Solicita ETH

### Opción 3: Alchemy Faucet
1. Ve a: https://sepoliafaucet.com/
2. Primero obtén ETH de Sepolia (Ethereum)
3. Luego usa un bridge para moverlo a Arbitrum Sepolia

### Opción 4: Arbitrum Bridge (si ya tienes Sepolia ETH)
1. Ve a: https://bridge.arbitrum.io/
2. Conecta tu wallet
3. Selecciona Sepolia → Arbitrum Sepolia
4. Transfiere ETH

## Verificar Balance:

Una vez que recibas ETH, verifica en:
- https://sepolia.arbiscan.io/address/0xCAc52a9CCb14C5E5BBCC30deB0b0Ccc0EeE4FC55

## Cantidad Necesaria:

Para desplegar el contrato necesitas aproximadamente:
- **0.001 - 0.01 ETH** (depende del gas)
- El data fee es de aproximadamente **0.000078 ETH**
- Más gas para las 2 transacciones (deploy + activate)

## Después de Obtener ETH:

Una vez que tengas ETH en tu cuenta:

```bash
cd /home/vicpaz/Escritorio/HackMonterrey/Hackathon.github.io/payments-contract
export PRIVATE_KEY='12cbe312fce4ec4f6429948bf1a37e61fa2278855b9f3fa75276da9e1f7ec294'
cargo stylus deploy --private-key "$PRIVATE_KEY" --endpoint https://sepolia-rollup.arbitrum.io/rpc --no-verify
```

## Nota sobre el Balance:

Si el faucet dice que ya obtuviste fondos pero el balance sigue en 0:
- Espera 1-2 minutos para que se confirme la transacción
- Verifica en Arbiscan que la transacción fue exitosa
- Asegúrate de estar viendo Arbitrum Sepolia, no Ethereum Sepolia
