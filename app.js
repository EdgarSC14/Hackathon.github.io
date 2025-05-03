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

// Configuración del contrato de membresía
const MEMBERSHIP_CONTRACT = {
    address: '0xC758997AD1856Ff9031Dc3A9b2Bd890f75C880d8', // Dirección del contrato desplegado en Shibuya
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

// Función para conectar con MetaMask
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('Por favor, instala MetaMask para usar esta aplicación');
            return;
        }

        console.log('Solicitando conexión...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
            throw new Error('No se seleccionó ninguna cuenta');
        }

        userAddress = accounts[0];
        console.log('Wallet conectada:', userAddress);

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
                const walletText = document.getElementById('walletText');
                walletText.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                document.getElementById('connectWallet').classList.add('connected');
                document.getElementById('disconnectWallet').classList.remove('hidden');
                document.getElementById('balanceContainer').classList.remove('hidden');
                await updateBalance();
                await updateNFTPrice();
                await checkSubscription();
            }
        } catch (error) {
            console.error('Error al verificar conexión:', error);
        }
    }
});

// Función para actualizar el saldo
async function updateBalance() {
    if (!window.ethereum || !userAddress) return;

    try {
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        
        const balanceElement = document.getElementById('balance');
        const balanceContainer = document.getElementById('balanceContainer');
        
        if (balanceElement && balanceContainer) {
            balanceElement.textContent = `${parseFloat(balanceInSBY).toFixed(4)} SBY`;
            balanceContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener el saldo:', error);
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = 'Error al obtener saldo';
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
        
        // Restaurar el texto del botón de conexión
        document.getElementById('walletText').textContent = 'Conectar Wallet';
        
        // Quitar la clase connected del botón
        document.getElementById('connectWallet').classList.remove('connected');
        
        // Ocultar el botón de desconectar
        document.getElementById('disconnectWallet').classList.add('hidden');
        
        // Ocultar el contenedor del saldo
        document.getElementById('balanceContainer').classList.add('hidden');
        
        // Limpiar el saldo
        document.getElementById('balance').textContent = '0 SBY';
        
        console.log('Wallet desconectada exitosamente');
    } catch (error) {
        console.error('Error al desconectar la wallet:', error);
        // Aún así, limpiar la interfaz
        document.getElementById('walletText').textContent = 'Conectar Wallet';
        document.getElementById('connectWallet').classList.remove('connected');
        document.getElementById('disconnectWallet').classList.add('hidden');
        document.getElementById('balanceContainer').classList.add('hidden');
        document.getElementById('balance').textContent = '0 SBY';
    }
}

// Función para mostrar el precio del NFT
async function updateNFTPrice() {
    if (!window.ethereum || !userAddress) return;

    try {
        const nftContract = new web3.eth.Contract(NFT_CONTRACT.abi, NFT_CONTRACT.address);
        
        // Usar el precio fijo de 1 SBY
        const priceInSBY = '1.0000';
        document.getElementById('price').textContent = priceInSBY;
    } catch (error) {
        console.error('Error al obtener el precio del NFT:', error);
        document.getElementById('price').textContent = '1.0000'; // Mostrar 1 SBY como precio predeterminado
    }
}

// Función para verificar el estado de la suscripción
async function checkSubscription() {
    if (!window.ethereum || !userAddress) return;

    try {
        const membershipContract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, MEMBERSHIP_CONTRACT.address);
        isSubscribed = await membershipContract.methods.isSubscribed(userAddress).call();
        
        // Obtener referencias a las interfaces
        const notSubscribedInterface = document.getElementById('notSubscribedInterface');
        const subscribedInterface = document.getElementById('subscribedInterface');
        
        // Obtener todos los botones de cursos y votaciones
        const courseButtons = document.querySelectorAll('.course-button');
        const voteButtons = document.querySelectorAll('.vote-button');
        
        if (isSubscribed) {
            // Mostrar interfaz de suscrito y ocultar la de no suscrito
            notSubscribedInterface.classList.add('hidden');
            subscribedInterface.classList.remove('hidden');
            
            // Actualizar el estado en el menú desplegable
            document.getElementById('dropdownSubscriptionStatus').textContent = 'Activa';
            document.getElementById('dropdownSubscriptionStatus').classList.add('text-green-500');
            document.getElementById('dropdownSubscriptionStatus').classList.remove('text-red-500');
            
            // Ocultar botones de suscripción en el menú desplegable
            document.getElementById('dropdownSubscribeButton').classList.add('hidden');
            document.getElementById('dropdownUnsubscribeButton').classList.remove('hidden');
            
            // Habilitar funcionalidad de cursos y votaciones
            courseButtons.forEach(button => {
                button.onclick = function() {
                    // Aquí iría la lógica para iniciar el curso
                    alert('Iniciando curso...');
                };
            });
            
            voteButtons.forEach(button => {
                button.onclick = function() {
                    // Aquí iría la lógica para votar
                    alert('Votando...');
                };
            });
        } else {
            // Mostrar interfaz de no suscrito y ocultar la de suscrito
            notSubscribedInterface.classList.remove('hidden');
            subscribedInterface.classList.add('hidden');
            
            // Actualizar el estado en el menú desplegable
            document.getElementById('dropdownSubscriptionStatus').textContent = 'Inactiva';
            document.getElementById('dropdownSubscriptionStatus').classList.add('text-red-500');
            document.getElementById('dropdownSubscriptionStatus').classList.remove('text-green-500');
            
            // Mostrar botón de suscripción en el menú desplegable
            document.getElementById('dropdownSubscribeButton').classList.remove('hidden');
            document.getElementById('dropdownUnsubscribeButton').classList.add('hidden');
            
            // Mostrar modal de membresía al intentar acceder a cursos o votaciones
            courseButtons.forEach(button => {
                button.onclick = showMembershipModal;
            });
            
            voteButtons.forEach(button => {
                button.onclick = showMembershipModal;
            });
        }
        
        // Actualizar el saldo en el menú desplegable
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        document.getElementById('dropdownBalance').textContent = `${parseFloat(balanceInSBY).toFixed(4)} SBY`;
        
    } catch (error) {
        console.error('Error al verificar suscripción:', error);
    }
}

// Función para suscribirse
async function subscribe() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        const membershipContract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, MEMBERSHIP_CONTRACT.address);
        
        // Verificar si ya está suscrito
        const isAlreadySubscribed = await membershipContract.methods.isSubscribed(userAddress).call();
        if (isAlreadySubscribed) {
            alert('Ya estás suscrito.');
            return;
        }
        
        // Obtener el precio de suscripción
        const price = await membershipContract.methods.PRICE().call();
        const priceInSBY = web3.utils.fromWei(price, 'ether');
        console.log('Precio de suscripción:', priceInSBY, 'SBY');
        
        // Verificar el saldo de SBY
        const balance = await web3.eth.getBalance(userAddress);
        const balanceInSBY = web3.utils.fromWei(balance, 'ether');
        console.log('Tu saldo de SBY:', balanceInSBY, 'SBY');
        
        if (BigInt(balance) < BigInt(price)) {
            alert(`Saldo insuficiente. Necesitas ${priceInSBY} SBY pero tienes ${balanceInSBY} SBY`);
            return;
        }
        
        if (confirm(`¿Deseas suscribirte por ${priceInSBY} SBY?\n\nBeneficios:\n- Acceso a juegos en fase beta\n- Derecho a voto en la DAO\n- Oportunidades de inversión exclusivas\n- Recompensas por participación`)) {
            console.log('Iniciando suscripción...');
            try {
                const tx = await membershipContract.methods.subscribe().send({
                    from: userAddress,
                    value: price,
                    gas: 300000
                });
                
                alert('¡Suscripción exitosa! Ahora eres miembro de GameLaunch DAO.');
                console.log('Transacción de suscripción:', tx);
                
                // Actualizar el saldo y estado de suscripción
                await updateBalance();
                await checkSubscription();
            } catch (subscribeError) {
                console.error('Error en la suscripción:', subscribeError);
                if (subscribeError.message.includes('revert')) {
                    alert('Error: La transacción fue revertida. Verifica que:\n1. Tienes suficientes SBY\n2. No estás ya suscrito\n\nDetalles del error: ' + subscribeError.message);
                } else {
                    alert('Error al suscribirse: ' + subscribeError.message);
                }
            }
        }
    } catch (error) {
        console.error('Error general:', error);
        alert('Error: ' + error.message);
    }
}

// Función para desuscribirse
async function unsubscribe() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        const membershipContract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, MEMBERSHIP_CONTRACT.address);
        
        // Verificar si está suscrito
        const isSubscribed = await membershipContract.methods.isSubscribed(userAddress).call();
        if (!isSubscribed) {
            alert('No estás suscrito.');
            return;
        }
        
        if (confirm('¿Estás seguro que deseas cancelar tu suscripción?\nSe te reembolsará 1 SBY.')) {
            const tx = await membershipContract.methods.unsubscribe().send({
                from: userAddress
            });
            
            alert('Suscripción cancelada. Se te ha reembolsado 1 SBY.');
            console.log('Transacción:', tx);
            
            // Actualizar el saldo y estado de suscripción
            await updateBalance();
            await checkSubscription();
        }
    } catch (error) {
        console.error('Error al desuscribirse:', error);
        alert('Error al desuscribirse: ' + error.message);
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

// Actualizar el menú cuando cambia el estado de la suscripción
async function checkSubscription() {
    if (!window.ethereum || !userAddress) return;

    try {
        const membershipContract = new web3.eth.Contract(MEMBERSHIP_CONTRACT.abi, MEMBERSHIP_CONTRACT.address);
        isSubscribed = await membershipContract.methods.isSubscribed(userAddress).call();
        
        // Actualizar la UI
        updateWalletDropdown();
    } catch (error) {
        console.error('Error al verificar suscripción:', error);
    }
} 