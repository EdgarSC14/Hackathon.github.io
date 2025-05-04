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
let web3;
let isSubscribed = false;

// Variable global para controlar el estado de la transacción
let isUnsubscribing = false;

// Inicializar Web3
if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
} else {
    console.error('MetaMask no está instalado');
}

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

// Configuración de la API y el contrato
const API_URL = "https://soneium-minato.rpc.scs.startale.com";
const API_KEY = "ewGSqUq5V56m29jQ0O7H5mH4uZiTC2CC";
const contractAddress = "0xC758997AD1856Ff9031Dc3A9b2Bd890f75C880d8";

// Función para verificar y cambiar a la red correcta
async function checkAndSwitchNetwork() {
    if (!window.ethereum) {
        throw new Error('Por favor, instala MetaMask para usar esta aplicación');
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Chain ID actual:', chainId);
        console.log('Chain ID esperado:', ASTAR_NETWORK.chainId);
        
        if (chainId !== ASTAR_NETWORK.chainId) {
            console.log('Cambiando a la red Astar Shibuya...');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: ASTAR_NETWORK.chainId }],
                });
                console.log('Red cambiada exitosamente');
            } catch (switchError) {
                console.error('Error al cambiar de red:', switchError);
                if (switchError.code === 4902) {
                    console.log('Agregando red Astar Shibuya...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [ASTAR_NETWORK],
                        });
                        console.log('Red agregada exitosamente');
                    } catch (addError) {
                        console.error('Error al agregar la red:', addError);
                        throw new Error('No se pudo agregar la red Astar Shibuya. Por favor, agrega la red manualmente en MetaMask.');
                    }
                } else {
                    throw new Error('No se pudo cambiar a la red Astar Shibuya. Por favor, cambia manualmente en MetaMask.');
                }
            }
        } else {
            console.log('Ya estás en la red correcta');
        }
    } catch (error) {
        console.error('Error en checkAndSwitchNetwork:', error);
        throw error;
    }
}

// Función para obtener el código del contrato
async function getContractCode() {
    try {
        console.log('Obteniendo código del contrato...');
        console.log('Dirección del contrato:', contractAddress);
        
        // Verificar que estamos en la red correcta
        await checkAndSwitchNetwork();
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado');
        
        // Obtener el código del contrato
        const code = await web3.eth.getCode(contractAddress);
        console.log('Código del contrato:', code);
        
        if (!code || code === '0x') {
            console.error('No se encontró código en la dirección:', contractAddress);
            throw new Error('No se encontró código de contrato en la dirección especificada. Por favor, verifica que estás en la red correcta (Astar Shibuya Testnet).');
        }
        
        return code;
    } catch (error) {
        console.error('Error en getContractCode:', error);
        if (error.message.includes('red')) {
            throw new Error('Por favor, cambia a la red Astar Shibuya Testnet en MetaMask.');
        }
        throw error;
    }
}

// Configuración del contrato de membresía
const MEMBERSHIP_CONTRACT = {
    address: contractAddress,
    abi: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "checkSubscription",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "isSubscribed",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "PRICE",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "subscribe",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "unsubscribe",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ]
};

// Función para actualizar el precio del NFT
async function updateNFTPrice() {
    if (!window.ethereum || !userAddress) return;

    try {
        // Verificar si el elemento existe
        if (!elementExists('price')) {
            console.warn('Elemento de precio no encontrado - omitiendo actualización de precio');
            return;
        }

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, contractAddress);
        
        // Obtener el precio del contrato
        const price = await contract.methods.PRICE().call();
        const priceInSBY = web3.utils.fromWei(price, 'ether');
        
        document.getElementById('price').textContent = priceInSBY;
    } catch (error) {
        console.error('Error al obtener el precio:', error);
        if (elementExists('price')) {
            document.getElementById('price').textContent = 'Error';
        }
    }
}

// Función para verificar el contrato
async function verifyContract() {
    try {
        console.log('Iniciando verificación del contrato...');
        console.log('Dirección del contrato:', contractAddress);
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado');
        
        // Verificar la red
        const chainId = await web3.eth.getChainId();
        console.log('Chain ID actual:', chainId);
        console.log('Chain ID esperado:', parseInt(ASTAR_NETWORK.chainId, 16));
        
        if (chainId !== parseInt(ASTAR_NETWORK.chainId, 16)) {
            throw new Error(`Red incorrecta. Por favor, cambia a ${ASTAR_NETWORK.chainName}`);
        }
        
        // Verificar que el contrato existe
        const code = await web3.eth.getCode(contractAddress);
        console.log('Código del contrato:', code);
        
        if (!code || code === '0x') {
            throw new Error('No se encontró código de contrato en la dirección especificada');
        }
        
        // Crear instancia del contrato
        const contract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, contractAddress);
        console.log('Instancia del contrato creada');
        
        // Verificar que podemos llamar a una función simple
        try {
            const price = await contract.methods.PRICE().call();
            console.log('Precio de suscripción:', web3.utils.fromWei(price, 'ether'), 'SBY');
            return true;
        } catch (priceError) {
            console.error('Error al llamar a PRICE():', priceError);
            throw new Error('No se pudo interactuar con el contrato. Verifica el ABI.');
        }
    } catch (error) {
        console.error('Error detallado en verifyContract:', error);
        if (error.message.includes('red incorrecta')) {
            alert(error.message);
        } else {
            alert('Error al verificar el contrato: ' + error.message);
        }
        return false;
    }
}

// Función para verificar la suscripción
async function checkSubscription() {
    if (!window.ethereum || !userAddress) return;

    try {
        console.log('Iniciando verificación de suscripción...');
        await checkAndSwitchNetwork();
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado para verificación de suscripción');
        
        // Verificar el contrato primero
        console.log('Verificando contrato...');
        const isContractValid = await verifyContract();
        if (!isContractValid) {
            throw new Error('No se pudo verificar el contrato. Por favor, contacta al soporte.');
        }
        
        console.log('Creando instancia del contrato...');
        const contract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, contractAddress);

        // Intentar obtener el estado de suscripción
        console.log('Verificando estado de suscripción...');
        isSubscribed = await contract.methods.isSubscribed(userAddress).call();
        console.log('Estado de suscripción:', isSubscribed);
        
        // Actualizar la UI
        const notSubscribedInterface = document.getElementById('notSubscribedInterface');
        const subscribedInterface = document.getElementById('subscribedInterface');
        const subscribeButton = document.getElementById('subscribeButton');
        const unsubscribeButton = document.getElementById('unsubscribeButton');
        const dropdownSubscribeButton = document.getElementById('dropdownSubscribeButton');
        const dropdownUnsubscribeButton = document.getElementById('dropdownUnsubscribeButton');
        const nftImage = document.getElementById('nftImage');
        
        if (isSubscribed) {
            if (notSubscribedInterface) notSubscribedInterface.classList.add('hidden');
            if (subscribedInterface) subscribedInterface.classList.remove('hidden');
            if (subscribeButton) subscribeButton.classList.add('hidden');
            if (unsubscribeButton) unsubscribeButton.classList.remove('hidden');
            if (dropdownSubscribeButton) dropdownSubscribeButton.classList.add('hidden');
            if (dropdownUnsubscribeButton) dropdownUnsubscribeButton.classList.remove('hidden');
            if (nftImage) nftImage.classList.remove('hidden');
        } else {
            if (notSubscribedInterface) notSubscribedInterface.classList.remove('hidden');
            if (subscribedInterface) subscribedInterface.classList.add('hidden');
            if (subscribeButton) subscribeButton.classList.remove('hidden');
            if (unsubscribeButton) unsubscribeButton.classList.add('hidden');
            if (dropdownSubscribeButton) dropdownSubscribeButton.classList.remove('hidden');
            if (dropdownUnsubscribeButton) dropdownUnsubscribeButton.classList.add('hidden');
            if (nftImage) nftImage.classList.add('hidden');
        }
        
        // Actualizar el estado en el menú desplegable
        if (elementExists('dropdownSubscriptionStatus')) {
            const statusElement = document.getElementById('dropdownSubscriptionStatus');
            statusElement.textContent = isSubscribed ? 'Activa' : 'Inactiva';
            statusElement.classList.remove('text-green-500', 'text-red-500');
            statusElement.classList.add(isSubscribed ? 'text-green-500' : 'text-red-500');
        }
        
        return isSubscribed;
    } catch (error) {
        console.error('Error al verificar suscripción:', error);
        alert('Error al verificar suscripción: ' + error.message);
        return false;
    }
}

// Función para suscribirse
async function subscribe() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        console.log('Iniciando proceso de suscripción...');
        await checkAndSwitchNetwork();
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado para suscripción');
        
        // Verificar el contrato primero
        console.log('Verificando contrato...');
        const isContractValid = await verifyContract();
        if (!isContractValid) {
            throw new Error('No se pudo verificar el contrato. Por favor, contacta al soporte.');
        }
        
        console.log('Creando instancia del contrato...');
        const contract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, contractAddress);

        // Verificar si ya está suscrito
        console.log('Verificando estado de suscripción...');
        const isAlreadySubscribed = await contract.methods.isSubscribed(userAddress).call();
        if (isAlreadySubscribed) {
            alert('Ya estás suscrito.');
            return;
        }
        
        // Obtener el precio de suscripción
        console.log('Obteniendo precio de suscripción...');
        const price = await contract.methods.PRICE().call();
        const priceInSBY = web3.utils.fromWei(price, 'ether');
        console.log('Precio de suscripción:', priceInSBY, 'SBY');
        
        // Verificar el saldo
        console.log('Verificando saldo...');
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        console.log('Saldo actual:', balanceInSBY, 'SBY');
        
        if (BigInt(balance) < BigInt(price)) {
            alert(`Saldo insuficiente. Necesitas ${priceInSBY} SBY pero tienes ${balanceInSBY} SBY`);
            return;
        }
        
        if (confirm(`¿Deseas suscribirte por ${priceInSBY} SBY?`)) {
            console.log('Iniciando transacción de suscripción...');
            const tx = await contract.methods.subscribe().send({
                from: userAddress,
                value: price,
                gas: 300000
            });
            
            console.log('Transacción completada:', tx);
            alert('¡Suscripción exitosa!');
            
            // Actualizar la interfaz
            const subscribeButton = document.getElementById('subscribeButton');
            const unsubscribeButton = document.getElementById('unsubscribeButton');
            const nftImage = document.getElementById('nftImage');
            
            if (subscribeButton) subscribeButton.classList.add('hidden');
            if (unsubscribeButton) unsubscribeButton.classList.remove('hidden');
            if (nftImage) nftImage.classList.remove('hidden');
            
            await updateBalance();
            await checkSubscription();
        }
    } catch (error) {
        console.error('Error detallado al suscribirse:', error);
        alert('Error al suscribirse: ' + error.message);
    }
}

// Función para desuscribirse
async function unsubscribe() {
    // Prevenir múltiples llamadas simultáneas
    if (isUnsubscribing) {
        console.log('Ya hay una transacción de desuscripción en proceso');
        return;
    }

    console.log('Función unsubscribe llamada');
    
    if (!window.ethereum || !userAddress) {
        console.log('No hay wallet conectada');
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        isUnsubscribing = true;
        console.log('Iniciando proceso de desuscripción...');
        console.log('Dirección del usuario:', userAddress);
        
        await checkAndSwitchNetwork();
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado para desuscripción');
        
        // Verificar el contrato primero
        console.log('Verificando contrato...');
        const isContractValid = await verifyContract();
        if (!isContractValid) {
            throw new Error('No se pudo verificar el contrato. Por favor, contacta al soporte.');
        }
        
        console.log('Creando instancia del contrato...');
        const contract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, contractAddress);
        console.log('Instancia del contrato creada');

        // Verificar si está suscrito
        console.log('Verificando estado de suscripción...');
        const isSubscribed = await contract.methods.isSubscribed(userAddress).call();
        console.log('Estado de suscripción:', isSubscribed);
        
        if (!isSubscribed) {
            alert('No estás suscrito.');
            return;
        }

        // Verificar el balance del contrato
        const contractBalance = await web3.eth.getBalance(contractAddress);
        console.log('Balance del contrato:', web3.utils.fromWei(contractBalance, 'ether'), 'SBY');
        
        if (BigInt(contractBalance) < web3.utils.toWei('1', 'ether')) {
            throw new Error('El contrato no tiene suficiente balance para procesar el reembolso');
        }
        
        if (confirm('¿Estás seguro que deseas cancelar tu suscripción? Recibirás un reembolso de 1 SBY.')) {
            console.log('Usuario confirmó la desuscripción');
            
            try {
                console.log('Preparando transacción...');
                
                // Obtener el gas estimado
                const gasEstimate = await contract.methods.unsubscribe().estimateGas({ from: userAddress });
                console.log('Gas estimado:', gasEstimate);
                
                // Obtener el gas price actual
                const gasPrice = await web3.eth.getGasPrice();
                console.log('Gas price:', gasPrice);

                // Enviar la transacción directamente usando el contrato
                console.log('Enviando transacción...');
                const tx = await contract.methods.unsubscribe().send({
                    from: userAddress,
                    gas: Math.floor(gasEstimate * 1.2), // Aumentar el gas en un 20%
                    gasPrice: gasPrice
                });
                
                console.log('Transacción enviada:', tx);
                
                if (tx.status) {
                    console.log('Transacción exitosa');
                    alert('Suscripción cancelada. Has recibido tu reembolso de 1 SBY.');
                    
                    // Actualizar la interfaz
                    const subscribeButton = document.getElementById('subscribeButton');
                    const unsubscribeButton = document.getElementById('unsubscribeButton');
                    const nftImage = document.getElementById('nftImage');
                    
                    if (subscribeButton) subscribeButton.classList.remove('hidden');
                    if (unsubscribeButton) unsubscribeButton.classList.add('hidden');
                    if (nftImage) nftImage.classList.add('hidden');
                    
                    await updateBalance();
                    await checkSubscription();
                } else {
                    throw new Error('La transacción falló');
                }
            } catch (txError) {
                console.error('Error detallado en la transacción:', txError);
                
                // Manejar específicamente las reversiones del EVM
                if (txError.message.includes('reverted by the EVM')) {
                    console.error('Transacción revertida por el EVM:', txError);
                    // No mostrar alerta si la transacción ya fue exitosa
                    if (!txError.receipt || !txError.receipt.status) {
                        alert('La transacción fue revertida. Esto puede deberse a que:\n1. Ya no estás suscrito\n2. El contrato no tiene suficiente balance\n3. Hay un problema con el contrato\n\nPor favor, verifica tu estado de suscripción e intenta nuevamente.');
                    }
                } else if (txError.message.includes('user denied')) {
                    alert('Transacción cancelada por el usuario');
                } else if (txError.message.includes('insufficient funds')) {
                    alert('Saldo insuficiente para completar la transacción');
                } else {
                    console.error('Error completo:', txError);
                    alert('Error al desuscribirse: ' + txError.message);
                }
            }
        } else {
            console.log('Usuario canceló la desuscripción');
        }
    } catch (error) {
        console.error('Error al desuscribirse:', error);
        alert('Error al desuscribirse: ' + error.message);
    } finally {
        isUnsubscribing = false;
    }
}

// Agregar event listeners para los botones de desuscripción
document.addEventListener('DOMContentLoaded', function() {
    console.log('Agregando event listeners para botones de desuscripción');
    
    // Botón principal de desuscripción
    const unsubscribeButton = document.getElementById('unsubscribeButton');
    if (unsubscribeButton) {
        console.log('Botón principal de desuscripción encontrado');
        unsubscribeButton.addEventListener('click', function(e) {
            console.log('Botón de desuscripción clickeado');
            e.preventDefault();
            e.stopPropagation(); // Prevenir propagación del evento
            unsubscribe();
        });
    } else {
        console.log('Botón principal de desuscripción no encontrado');
    }
    
    // Botón de desuscripción en el dropdown
    const dropdownUnsubscribeButton = document.getElementById('dropdownUnsubscribeButton');
    if (dropdownUnsubscribeButton) {
        console.log('Botón de desuscripción del dropdown encontrado');
        dropdownUnsubscribeButton.addEventListener('click', function(e) {
            console.log('Botón de desuscripción del dropdown clickeado');
            e.preventDefault();
            e.stopPropagation(); // Prevenir propagación del evento
            unsubscribe();
        });
    } else {
        console.log('Botón de desuscripción del dropdown no encontrado');
    }
});

// Función para conectar con MetaMask
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('Por favor, instala MetaMask para usar esta aplicación');
            return;
        }

        await checkAndSwitchNetwork();

        console.log('Solicitando conexión...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
            throw new Error('No se seleccionó ninguna cuenta');
        }

        userAddress = accounts[0];
        console.log('Wallet conectada:', userAddress);

        // Verificar el contrato
        try {
            const code = await getContractCode();
            if (!code || code === '0x') {
                throw new Error('El contrato no está desplegado en la dirección especificada');
            }
        } catch (error) {
            console.error('Error al verificar el contrato:', error);
            alert('Error al verificar el contrato: ' + error.message);
            return;
        }

        // Verificar que los elementos del DOM existan
        const walletText = document.getElementById('walletText');
        const connectButton = document.getElementById('connectWallet');
        const disconnectButton = document.getElementById('disconnectWallet');
        const balanceContainer = document.getElementById('balanceContainer');
        const balance = document.getElementById('balance');

        if (!walletText || !connectButton || !disconnectButton || !balanceContainer || !balance) {
            throw new Error('Error: No se encontraron todos los elementos necesarios en la interfaz');
        }

        // Actualizar la interfaz
        walletText.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
        connectButton.classList.add('connected');
        disconnectButton.classList.remove('hidden');
        balanceContainer.classList.remove('hidden');

        // Actualizar el saldo
        await updateBalance();
        await checkSubscription();

        // Actualizar el menú desplegable
        updateWalletDropdown();

    } catch (error) {
        console.error('Error al conectar:', error);
        alert('Error al conectar: ' + error.message);
    }
}

// Evento de clic en el botón de conexión
document.addEventListener('DOMContentLoaded', function() {
    const connectButton = document.getElementById('connectWallet');
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
});

// Verificar si ya está conectado al cargar la página
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAddress = accounts[0];
                
                // Verificar que los elementos existan antes de actualizarlos
                if (elementExists('walletText')) {
                    document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                }
                
                if (elementExists('connectWallet')) {
                    document.getElementById('connectWallet').classList.add('connected');
                }
                
                if (elementExists('disconnectWallet')) {
                    document.getElementById('disconnectWallet').classList.remove('hidden');
                }
                
                if (elementExists('balanceContainer')) {
                    document.getElementById('balanceContainer').classList.remove('hidden');
                }
                
                await updateBalance();
                await updateNFTPrice();
                await checkSubscription();
            }
        } catch (error) {
            console.error('Error al verificar conexión:', error);
        }
    }
});

// Función para verificar si un elemento existe
function elementExists(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Elemento con ID '${elementId}' no encontrado`);
        return false;
    }
    return true;
}

// Función para actualizar el saldo
async function updateBalance() {
    if (!window.ethereum || !userAddress) return;

    try {
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        
        if (elementExists('balance')) {
            document.getElementById('balance').textContent = `${parseFloat(balanceInSBY).toFixed(4)} SBY`;
        }
        
        if (elementExists('balanceContainer')) {
            document.getElementById('balanceContainer').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener el saldo:', error);
        if (elementExists('balance')) {
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
        document.getElementById('subscriptionContainer').classList.add('hidden');
        document.getElementById('subscribeButton').classList.remove('hidden');
        document.getElementById('unsubscribeButton').classList.add('hidden');
    } else {
        userAddress = accounts[0];
        document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
        await updateBalance();
        await checkSubscription();
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
        
        // Verificar que los elementos existan antes de actualizarlos
        if (elementExists('walletText')) {
            document.getElementById('walletText').textContent = 'Conectar Wallet';
        }
        
        if (elementExists('connectWallet')) {
            document.getElementById('connectWallet').classList.remove('connected');
        }
        
        if (elementExists('disconnectWallet')) {
            document.getElementById('disconnectWallet').classList.add('hidden');
        }
        
        if (elementExists('balanceContainer')) {
            document.getElementById('balanceContainer').classList.add('hidden');
        }
        
        if (elementExists('balance')) {
            document.getElementById('balance').textContent = '0 SBY';
        }
        
        console.log('Wallet desconectada exitosamente');
    } catch (error) {
        console.error('Error al desconectar la wallet:', error);
        // Aún así, intentar limpiar la interfaz
        if (elementExists('walletText')) {
            document.getElementById('walletText').textContent = 'Conectar Wallet';
        }
        if (elementExists('connectWallet')) {
            document.getElementById('connectWallet').classList.remove('connected');
        }
        if (elementExists('disconnectWallet')) {
            document.getElementById('disconnectWallet').classList.add('hidden');
        }
        if (elementExists('balanceContainer')) {
            document.getElementById('balanceContainer').classList.add('hidden');
        }
        if (elementExists('balance')) {
            document.getElementById('balance').textContent = '0 SBY';
        }
    }
}

// Actualizar el precio del NFT cuando se conecta la wallet
window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
        await updateNFTPrice();
    }
});

// Actualizar el precio del NFT cuando cambia la red
window.ethereum.on('chainChanged', async () => {
    await updateNFTPrice();
});

// Evento de clic en el botón de wallet
document.addEventListener('DOMContentLoaded', function() {
    const connectWalletButton = document.getElementById('connectWallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', function(e) {
            if (userAddress) {
                e.stopPropagation();
                toggleWalletDropdown();
            } else {
                connectWallet();
            }
        });
    }

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('walletDropdown');
        const walletButton = document.getElementById('connectWallet');
        
        if (dropdown && walletButton && !dropdown.contains(e.target) && !walletButton.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
});

// Función para mostrar/ocultar el menú desplegable
function toggleWalletDropdown() {
    const dropdown = document.getElementById('walletDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Función para actualizar el menú desplegable
function updateWalletDropdown() {
    const dropdown = document.getElementById('walletDropdown');
    const walletAddress = document.getElementById('walletAddress');
    const dropdownSubscriptionStatus = document.getElementById('dropdownSubscriptionStatus');
    const dropdownBalance = document.getElementById('dropdownBalance');
    const dropdownSubscribeButton = document.getElementById('dropdownSubscribeButton');
    const dropdownUnsubscribeButton = document.getElementById('dropdownUnsubscribeButton');

    if (userAddress && dropdown && walletAddress && dropdownSubscriptionStatus && dropdownBalance && dropdownSubscribeButton && dropdownUnsubscribeButton) {
        walletAddress.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
        dropdownBalance.textContent = document.getElementById('balance').textContent;
        
        if (isSubscribed) {
            dropdownSubscriptionStatus.textContent = 'Activa';
            dropdownSubscriptionStatus.classList.add('text-green-500');
            dropdownSubscriptionStatus.classList.remove('text-red-500');
            dropdownSubscribeButton.classList.add('hidden');
            dropdownUnsubscribeButton.classList.remove('hidden');
        } else {
            dropdownSubscriptionStatus.textContent = 'Inactiva';
            dropdownSubscriptionStatus.classList.add('text-red-500');
            dropdownSubscriptionStatus.classList.remove('text-green-500');
            dropdownSubscribeButton.classList.remove('hidden');
            dropdownUnsubscribeButton.classList.add('hidden');
        }
    }
}

// Función para invertir
async function invest(amount) {
    if (!window.ethereum || !userAddress) {
        throw new Error('Por favor, conecta tu wallet primero');
    }

    try {
        console.log('Iniciando proceso de inversión...');
        await checkAndSwitchNetwork();
        
        const web3 = new Web3(window.ethereum);
        console.log('Web3 inicializado para inversión');
        
        // Verificar el contrato primero
        console.log('Verificando contrato...');
        const isContractValid = await verifyContract();
        if (!isContractValid) {
            throw new Error('No se pudo verificar el contrato. Por favor, contacta al soporte.');
        }
        
        // Verificar la suscripción
        const isSubscribed = await checkSubscription();
        if (!isSubscribed) {
            throw new Error('Necesitas estar suscrito para invertir.');
        }
        
        // Convertir el monto a wei (1 SBY = 10^18 wei)
        const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
        console.log('Monto a invertir:', amount, 'SBY');
        console.log('Monto en wei:', amountInWei);
        
        // Verificar el saldo
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        console.log('Saldo actual:', balanceInSBY, 'SBY');
        
        if (BigInt(balance) < BigInt(amountInWei)) {
            throw new Error(`Saldo insuficiente. Necesitas ${amount} SBY pero tienes ${balanceInSBY} SBY`);
        }
        
        // Crear la transacción
        const transactionParameters = {
            from: userAddress,
            to: contractAddress,
            value: web3.utils.toHex(amountInWei),
            gas: web3.utils.toHex(300000)
        };

        // Enviar la transacción
        console.log('Enviando transacción...');
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        
        console.log('Transacción enviada:', txHash);
        
        // Esperar a que la transacción sea minada
        console.log('Esperando confirmación de la transacción...');
        
        // Función para esperar la confirmación
        const waitForConfirmation = async (txHash, maxAttempts = 30) => {
            for (let i = 0; i < maxAttempts; i++) {
                try {
                    const receipt = await web3.eth.getTransactionReceipt(txHash);
                    if (receipt) {
                        return receipt;
                    }
                } catch (error) {
                    console.log(`Intento ${i + 1}: Error al obtener recibo, reintentando...`, error);
                }
                // Esperar 2 segundos antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            return null;
        };

        const receipt = await waitForConfirmation(txHash);
        
        if (!receipt) {
            throw new Error('La transacción no fue confirmada después de varios intentos. Por favor, verifica el estado de la transacción en el explorador de bloques.');
        }

        console.log('Recibo de transacción:', receipt);
        
        if (receipt.status) {
            alert('¡Inversión exitosa!');
            await updateBalance();
        } else {
            throw new Error('La transacción falló. Por favor, verifica que tienes suficiente saldo y que la red no está congestionada.');
        }
    } catch (error) {
        console.error('Error al invertir:', error);
        if (error.message.includes('user denied')) {
            throw new Error('Transacción cancelada por el usuario');
        } else if (error.message.includes('insufficient funds')) {
            throw new Error('Saldo insuficiente para completar la transacción');
        } else {
            throw error;
        }
    }
}

// Estilos para el logo PixelGrant
const style = document.createElement('style');
style.textContent = `
    .pixel-grant-logo {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(45deg, #8B5CF6, #EC4899);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-shadow: 2px 2px 4px rgba(139, 92, 246, 0.2);
        letter-spacing: 0.05em;
        position: relative;
        display: inline-block;
        transition: all 0.3s ease;
    }

    .pixel-grant-logo:hover {
        transform: scale(1.05);
        text-shadow: 3px 3px 6px rgba(139, 92, 246, 0.3);
    }

    .pixel-grant-logo::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }

    .pixel-grant-logo:hover::after {
        transform: scaleX(1);
    }
`;
document.head.appendChild(style);

// Actualizar el elemento del logo
document.addEventListener('DOMContentLoaded', function() {
    const logoElement = document.querySelector('.text-xl.font-bold');
    if (logoElement) {
        logoElement.classList.add('pixel-grant-logo');
    }
}); 