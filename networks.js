// Configuración de redes soportadas - Solo Arbitrum
const NETWORKS = {
    arbitrumSepolia: {
        chainIdDec: 421614,
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://sepolia.arbiscan.io']
    },
    
    arbitrumOne: {
        chainIdDec: 42161,
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io']
    }
};


