# 🔧 Solución para "Blocking waiting for file lock"

Si ves el error "Blocking waiting for file lock on build directory":

## Solución Rápida:

1. **Mata todos los procesos de cargo:**
```bash
pkill -9 -f cargo
```

2. **Espera 2 segundos:**
```bash
sleep 2
```

3. **Despliega directamente (sin verificación previa):**
```bash
cd /home/vicpaz/Escritorio/HackMonterrey/Hackathon.github.io/payments-contract
export PRIVATE_KEY='tu_clave_privada'
cargo stylus deploy \
  --private-key "$PRIVATE_KEY" \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --no-verify
```

## Script Simplificado:

Ya creé `deploy-simple.sh` que hace todo esto automáticamente:

```bash
cd /home/vicpaz/Escritorio/HackMonterrey/Hackathon.github.io/payments-contract
export PRIVATE_KEY='tu_clave_privada'
./deploy-simple.sh
```

## Si Aún Hay Problemas:

1. **Reinicia la terminal** o abre una nueva
2. **Mata procesos manualmente:**
```bash
ps aux | grep cargo
kill -9 <PID>  # Para cada proceso de cargo
```

3. **Limpia el directorio de build:**
```bash
cd payments-contract
rm -rf target
cargo stylus deploy ...  # El target se recreará
```
