// Configuración de partículas
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#8B5CF6'
        },
        shape: {
            type: 'circle',
            stroke: {
                width: 0,
                color: '#000000'
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.5,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#8B5CF6',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 1
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

// Animaciones al scroll
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.scroll-reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
});

// Efecto de cursor personalizado
document.addEventListener('mousemove', (e) => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
    document.body.appendChild(cursor);
    
    setTimeout(() => {
        cursor.remove();
    }, 1000);
});

// Configuración básica
let userAddress = null;

// Configuración de la red Astar Shibuya Testnet
const ASTAR_NETWORK = {
    chainId: '0x51', // 81 en hexadecimal
    chainName: 'Astar Shibuya Testnet',
    nativeCurrency: {
        name: 'SBY',
        symbol: 'SBY',
        decimals: 18
    },
    rpcUrls: ['https://rpc.shibuya.astar.network:8545'],
    blockExplorerUrls: ['https://blockscout.com/shibuya']
};

// Función para verificar y cambiar a la red Astar Shibuya
async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Chain ID actual:', chainId);
        console.log('Chain ID esperado:', ASTAR_NETWORK.chainId);
        
        if (chainId !== ASTAR_NETWORK.chainId) {
            try {
                console.log('Intentando cambiar a la red Astar Shibuya...');
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ASTAR_NETWORK.chainId }]
                });
                console.log('Cambio de red exitoso');
            } catch (error) {
                console.error('Error al cambiar de red:', error);
                if (error.code === 4902) {
                    console.log('Red no encontrada, intentando agregar...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [ASTAR_NETWORK]
                        });
                        console.log('Red agregada exitosamente');
                    } catch (addError) {
                        console.error('Error al agregar la red:', addError);
                        throw new Error('No se pudo agregar la red Astar Shibuya. Por favor, agrégalo manualmente en MetaMask.');
                    }
                } else {
                    throw new Error('No se pudo cambiar a la red Astar Shibuya. Por favor, cámbiala manualmente en MetaMask.');
                }
            }
        }
    } catch (error) {
        console.error('Error en checkNetwork:', error);
        throw error;
    }
}

// Función para conectar con MetaMask
async function connectWallet() {
    if (window.ethereum) {
        try {
            console.log('Iniciando conexión...');
            
            // Primero verificar y cambiar a la red Astar
            await checkNetwork();
            
            // Luego conectar la wallet
            console.log('Solicitando cuentas...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            console.log('Wallet conectada:', userAddress);
            
            // Actualizar la interfaz
            document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            document.getElementById('connectWallet').classList.add('connected');
            document.getElementById('disconnectWallet').classList.remove('hidden');
            
            // Actualizar el saldo
            await updateBalance();
        } catch (error) {
            console.error('Error al conectar la wallet:', error);
            alert('Error: ' + error.message || 'Error al conectar la wallet. Por favor, asegúrate de estar en la red Astar.');
        }
    } else {
        alert('Por favor, instala MetaMask para usar esta aplicación');
    }
}

// Evento de clic en el botón de conexión
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// Verificar si ya está conectado al cargar la página
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAddress = accounts[0];
                const walletText = document.getElementById('walletText');
                walletText.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
                walletText.style.cursor = 'pointer';
                document.getElementById('connectWallet').classList.add('connected');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

async function updateBalance() {
    if (window.ethereum && window.ethereum.selectedAddress) {
        try {
            const web3 = new Web3(window.ethereum);
            const balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
            const balanceInASTR = web3.utils.fromWei(balance, 'ether');
            document.getElementById('balance').textContent = `${parseFloat(balanceInASTR).toFixed(4)} ASTR`;
            document.getElementById('balanceContainer').classList.remove('hidden');
            console.log('Saldo actualizado:', balanceInASTR, 'ASTR');
        } catch (error) {
            console.error('Error al obtener el saldo:', error);
            document.getElementById('balance').textContent = 'Error al obtener saldo';
        }
    }
}

// Actualizar el saldo cuando cambia la cuenta
window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length === 0) {
        document.getElementById('walletText').textContent = 'Conectar Wallet';
        document.getElementById('connectWallet').classList.remove('connected');
        document.getElementById('balanceContainer').classList.add('hidden');
    } else {
        document.getElementById('walletText').textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`;
        await updateBalance();
    }
});

// Evento de clic en el botón de desconectar
document.addEventListener('DOMContentLoaded', function() {
    const disconnectButton = document.getElementById('disconnectWallet');
    if (disconnectButton) {
        disconnectButton.addEventListener('click', function() {
            console.log('Botón de desconectar clickeado');
            disconnectWallet();
        });
    }
});

// Función para desconectar la wallet
function disconnectWallet() {
    try {
        console.log('Iniciando desconexión...');
        
        // Limpiar la dirección de la wallet
        userAddress = null;
        
        // Restaurar el texto del botón de conexión
        document.getElementById('walletText').textContent = 'Conectar Wallet';
        
        // Quitar la clase connected del botón
        document.getElementById('connectWallet').classList.remove('connected');
        
        // Ocultar el botón de desconectar
        document.getElementById('disconnectWallet').classList.add('hidden');
        
        // Ocultar el contenedor del saldo
        document.getElementById('balanceContainer').classList.add('hidden');
        
        // Limpiar el saldo
        document.getElementById('balance').textContent = '0 ASTR';
        
        console.log('Wallet desconectada exitosamente');
    } catch (error) {
        console.error('Error al desconectar la wallet:', error);
        // Aún así, limpiar la interfaz
        document.getElementById('walletText').textContent = 'Conectar Wallet';
        document.getElementById('connectWallet').classList.remove('connected');
        document.getElementById('disconnectWallet').classList.add('hidden');
        document.getElementById('balanceContainer').classList.add('hidden');
        document.getElementById('balance').textContent = '0 ASTR';
    }
} 