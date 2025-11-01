// Configuración de contratos para Arbitrum
// Este archivo contiene todas las direcciones de contratos desplegados en las redes de Arbitrum

const CONTRACTS_ARBITRUM = {
    arbitrumSepolia: {
        // Contratos Stylus (Rust) en Arbitrum Sepolia Testnet
        // NOTA: Estas son direcciones de ejemplo. Reemplazar con contratos reales desplegados
        membership: '0x0000000000000000000000000000000000000000', // No usado - sistema de membresía removido
        payments: '0x1234567890123456789012345678901234567890', // Contrato Stylus de pagos (ejemplo)
        microcredit: '0x2345678901234567890123456789012345678901', // Contrato Stylus de microcréditos (ejemplo)
        savings: '0x3456789012345678901234567890123456789012', // Contrato Stylus de ahorros (ejemplo)
        creators: '0x4567890123456789012345678901234567890123', // Contrato Stylus de creadores (ejemplo)
        royalties: '0x5678901234567890123456789012345678901234' // Contrato Stylus de regalías (ejemplo)
    },
    arbitrumOne: {
        // Contratos Stylus (Rust) en Arbitrum One Mainnet
        // NOTA: Estas son direcciones de ejemplo. Reemplazar con contratos reales desplegados
        membership: '0x0000000000000000000000000000000000000000', // No usado - sistema de membresía removido
        payments: '0x6789012345678901234567890123456789012345', // Contrato Stylus de pagos (ejemplo)
        microcredit: '0x7890123456789012345678901234567890123456', // Contrato Stylus de microcréditos (ejemplo)
        savings: '0x8901234567890123456789012345678901234567', // Contrato Stylus de ahorros (ejemplo)
        creators: '0x9012345678901234567890123456789012345678', // Contrato Stylus de creadores (ejemplo)
        royalties: '0xA012345678901234567890123456789012345678' // Contrato Stylus de regalías (ejemplo)
    }
};

// Función helper para obtener el contrato según la red
function getContractAddress(contractName, networkKey) {
    const contracts = CONTRACTS_ARBITRUM[networkKey] || CONTRACTS_ARBITRUM['arbitrumSepolia'];
    return contracts[contractName] || '0x0000000000000000000000000000000000000000';
}

