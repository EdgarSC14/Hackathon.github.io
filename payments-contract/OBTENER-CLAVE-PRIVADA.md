# 🔑 Cómo Obtener tu Clave Privada de MetaMask

## ⚠️ IMPORTANTE: SEGURIDAD
- **NUNCA** compartas tu clave privada
- Solo usa cuentas de **TESTNET** para esto
- **NUNCA** uses tu cuenta principal de mainnet

## Pasos para Obtener la Clave Privada:

### 1. Abre MetaMask
- Haz clic en el icono de MetaMask en tu navegador
- Asegúrate de estar en la cuenta de **testnet** que quieres usar

### 2. Accede a la Configuración de Seguridad
- Haz clic en el icono de **cuenta** (arriba a la derecha)
- Ve a **Configuración**
- Luego a **Seguridad y Privacidad**

### 3. Exportar Clave Privada
- Haz clic en **"Exportar clave privada"**
- Ingresa tu **contraseña de MetaMask**
- Se mostrará tu clave privada (64 caracteres hexadecimales)

### 4. Formato Correcto

**✅ CORRECTO:**
```
64 caracteres hexadecimales (sin 0x)
Ejemplo: abc123def4567890123456789012345678901234567890123456789012345678
```

**❌ INCORRECTO:**
```
40 caracteres = dirección de wallet (NO es la clave privada)
Ejemplo: cac52a9ccb14c5e5bbcc30deb0b0ccc0eee4fc55
```

### 5. Verificación

Tu clave privada debe tener:
- **64 caracteres** hexadecimales (0-9, a-f)
- **NO** debe tener el prefijo `0x` al copiarla
- Ejemplo de formato correcto: `abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`

## Si No Puedes Exportar la Clave Privada:

### Alternativa: Crear una Cuenta de Prueba

1. En MetaMask, crea una **nueva cuenta** (solo para pruebas)
2. Exporta la clave privada de esa cuenta nueva
3. Obtén ETH de testnet en esa cuenta
4. Usa esa cuenta para desplegar

## Verificar que Tienes la Clave Correcta:

Una clave privada válida:
- Tiene exactamente 64 caracteres
- Solo contiene números (0-9) y letras minúsculas (a-f)
- NO incluye "0x" al principio cuando la copias

## Ejemplo de Uso:

```bash
# ✅ CORRECTO - 64 caracteres
export PRIVATE_KEY='abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'

# ❌ INCORRECTO - 40 caracteres (es una dirección, no clave privada)
export PRIVATE_KEY='cac52a9ccb14c5e5bbcc30deb0b0ccc0eee4fc55'
```
