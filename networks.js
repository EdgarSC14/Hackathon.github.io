// Configuración de redes soportadas - Arbitrum y Scroll
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
    },
    
    scrollSepolia: {
        chainIdDec: 534351,
        chainName: 'Scroll Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia-rpc.scroll.io'],
        blockExplorerUrls: ['https://sepolia.scrollscan.com']
    },
    
    scroll: {
        chainIdDec: 534352,
        chainName: 'Scroll',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.scroll.io'],
        blockExplorerUrls: ['https://scrollscan.com']
    }
};


