# Sistema de Comunidad de Creativos

Este proyecto implementa un sistema completo de comunidad, préstamos y finanzas inclusivas para creativos usando Arbitrum Stylus (Rust).

## 🎯 Características Principales

### 1. Sistema de Comunidad
- **Suscripción con 0.00001 ETH**: Los usuarios pueden unirse a la comunidad pagando solo 0.00001 ETH de cualquier red compatible (Arbitrum, Scroll, Base, ENS)
- **Verificación de membresía**: Sistema para verificar si una dirección es miembro de la comunidad
- **Tracking de miembros**: Contador de miembros totales y lista de miembros

### 2. Sistema de Préstamos
- **Solicitar préstamos**: Los creativos pueden solicitar préstamos para sus proyectos
- **Financiar préstamos**: Los miembros de la comunidad pueden financiar préstamos de otros creativos
- **Pagar préstamos**: Sistema de pagos con tasa de interés configurable
- **Estados de préstamos**: Pendiente, Activo, Pagado, Incumplido

### 3. Buró de Crédito y Finanzas Inclusivas
- **Score de crédito**: Sistema de puntuación (0-1000) basado en historial de pagos
- **Historial de pagos**: Registro completo de todos los pagos realizados
- **Sistema de cashback**: Recompensas por pagos a tiempo (configurable)
- **Retiro de cashback**: Los usuarios pueden retirar su cashback acumulado

### 4. Sistema de Publicaciones
- **Publicar contenido**: Los creativos pueden compartir proyectos, ideas y trabajos
- **Visualización**: Lista de publicaciones recientes de la comunidad
- **Interacción**: Sistema de likes y engagement

## 📁 Estructura de Contratos

### Contrato de Comunidad (`community-contract`)
- Maneja suscripciones con 0.00001 ETH
- Verificación de membresía
- Listado de miembros

**Ubicación**: `community-contract/src/lib.rs`

### Contrato de Préstamos (`loans-contract`)
- Gestión de préstamos entre creativos
- Aprobación y financiación
- Sistema de pagos

**Ubicación**: `loans-contract/src/lib.rs`

### Contrato de Buró de Crédito (`credit-bureau-contract`)
- Tracking de historial de pagos
- Cálculo de score de crédito
- Sistema de cashback

**Ubicación**: `credit-bureau-contract/src/lib.rs`

## 🚀 Despliegue

### Requisitos Previos
1. Rust instalado
2. Cargo Stylus CLI instalado
3. Wallet con ETH para gas (Arbitrum Sepolia o Arbitrum One)
4. Clave privada configurada

### Pasos para Desplegar

1. **Compilar el contrato de Comunidad**:
```bash
cd community-contract
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc
cargo stylus export-abi
```

2. **Desplegar el contrato de Comunidad**:
```bash
cargo stylus deploy \
  --private-key <TU_PRIVATE_KEY_HEX> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

3. **Compilar y desplegar el contrato de Préstamos**:
```bash
cd ../loans-contract
cargo stylus deploy \
  --private-key <TU_PRIVATE_KEY_HEX> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

4. **Inicializar el contrato de Préstamos**:
   - Después del despliegue, llama a la función `init()` con la dirección del contrato de Comunidad

5. **Compilar y desplegar el contrato de Buró de Crédito**:
```bash
cd ../credit-bureau-contract
cargo stylus deploy \
  --private-key <TU_PRIVATE_KEY_HEX> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

6. **Inicializar el contrato de Buró de Crédito**:
   - Después del despliegue, llama a la función `init()` con:
     - Dirección del contrato de Préstamos
     - Tasa de cashback en puntos base (ej: 100 = 1%)

7. **Actualizar `contracts-arbitrum.js`**:
   - Actualiza las direcciones de los contratos desplegados en el archivo `contracts-arbitrum.js`

## 📝 Uso

### Para Usuarios

1. **Conectar Wallet**: Conecta tu wallet MetaMask a Arbitrum Sepolia o Arbitrum One
2. **Unirse a la Comunidad**: Haz clic en "Unirse a la Comunidad" y paga 1 token
3. **Solicitar Préstamo**: Completa el formulario de préstamo con monto, interés y descripción
4. **Financiar Préstamos**: Ve préstamos pendientes y financia los que te interesen
5. **Ver Estadísticas**: Revisa tu score de crédito, historial y cashback disponible
6. **Publicar Contenido**: Comparte tus proyectos con la comunidad

### Para Desarrolladores

El sistema está completamente integrado en el frontend. Todas las funciones están disponibles en `creators-community.js`.

## 🔧 Configuración

### Precio de Suscripción
El precio está fijado en 0.00001 ETH en el contrato de Comunidad para facilitar el acceso a más miembros.

### Tasa de Cashback
Configurada al inicializar el contrato de Buró de Crédito. Por defecto sugerido: 1% (100 puntos base).

### Interés de Préstamos
Los creativos pueden definir su propia tasa de interés al solicitar préstamos.

## 📊 Funcionalidades del Frontend

### Sección de Creadores
- **Comunidad**: Estado de membresía, contador de miembros, suscripción
- **Préstamos**: Solicitar, ver pendientes, gestionar mis préstamos
- **Finanzas Inclusivas**: Score de crédito, historial, cashback
- **Publicaciones**: Crear y ver publicaciones de la comunidad

## 🔐 Seguridad

- Todos los contratos están escritos en Rust para Stylus
- Verificaciones de membresía antes de operaciones sensibles
- Validación de montos y estados en todas las transacciones
- El buró de crédito solo puede ser actualizado por el contrato de préstamos

## 📚 Notas Importantes

1. Los contratos necesitan ser desplegados en orden (Comunidad → Préstamos → Buró de Crédito)
2. El contrato de Préstamos debe inicializarse con la dirección del contrato de Comunidad
3. El contrato de Buró de Crédito debe inicializarse con la dirección del contrato de Préstamos
4. Las publicaciones se almacenan localmente (localStorage) - considera usar IPFS para producción

## 🎨 Personalización

Puedes ajustar:
- Precio de suscripción en `community-contract/src/lib.rs`
- Tasa de cashback al inicializar `credit-bureau-contract`
- Límites de préstamos y tasas de interés

## 📞 Soporte

Para problemas o preguntas, revisa la documentación de Arbitrum Stylus o consulta los archivos de ejemplo en el proyecto.


