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

// Configuración de Web3
let web3;
let userAddress = null;

// Función para conectar con MetaMask
async function connectWallet() {
    try {
        // Verificar si MetaMask está instalado
        if (typeof window.ethereum === 'undefined') {
            alert('Por favor, instala MetaMask para usar esta aplicación');
            return;
        }

        // Solicitar conexión a MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        
        // Actualizar la interfaz
        document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        document.getElementById('connectWallet').classList.add('connected');
        
        // Inicializar Web3
        web3 = new Web3(window.ethereum);
        
        // Escuchar cambios de cuenta
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // Usuario desconectado
                userAddress = null;
                document.getElementById('walletText').textContent = 'Conectar Wallet';
                document.getElementById('connectWallet').classList.remove('connected');
            } else {
                // Cuenta cambiada
                userAddress = accounts[0];
                document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            }
        });

        // Escuchar cambios de red
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });

    } catch (error) {
        console.error('Error al conectar con MetaMask:', error);
        alert('Error al conectar con MetaMask. Por favor, intenta nuevamente.');
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
                document.getElementById('walletText').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
                document.getElementById('connectWallet').classList.add('connected');
                web3 = new Web3(window.ethereum);
            }
        } catch (error) {
            console.error('Error al verificar la conexión:', error);
        }
    }
}); 