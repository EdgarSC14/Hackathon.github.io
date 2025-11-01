// Utilidades para interactuar con contratos Arbitrum Stylus (Rust/WASM)
// Los contratos Stylus se comportan igual que los de Solidity desde el frontend

// ABIs para contratos Stylus
// ABI exportado desde el contrato Rust compilado con cargo stylus export-abi
const STYLUS_CONTRACTS_ABI = {
    payments: [
        {
            "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
            "name": "getBalance",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "address", "name": "to", "type": "address"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"}
            ],
            "name": "sendPayment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    microcredit: [
        {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "request_loan",
            "outputs": [{"internalType": "uint256", "name": "loan_id", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "loan_id", "type": "uint256"}],
            "name": "repay_loan",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "lender", "type": "address"}],
            "name": "provide_liquidity",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ],
    savings: [
        {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "get_apy",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    creators: [
        {
            "inputs": [
                {"internalType": "address", "name": "subscriber", "type": "address"},
                {"internalType": "uint256", "name": "monthly_price", "type": "uint256"}
            ],
            "name": "create_subscription",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
            "name": "subscribe",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "address[]", "name": "recipients", "type": "address[]"},
                {"internalType": "uint256[]", "name": "percentages", "type": "uint256[]"}
            ],
            "name": "split_royalties",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ]
};

// Función helper para obtener instancia de contrato Stylus
function getStylusContract(contractName, networkKey) {
    const web3i = getWeb3();
    const contractAddress = getContractAddress(contractName, networkKey);
    const abi = STYLUS_CONTRACTS_ABI[contractName];
    
    if (!abi) {
        console.error(`ABI no encontrado para contrato: ${contractName}`);
        return null;
    }
    
    return new web3i.eth.Contract(abi, contractAddress);
}

// Función para realizar pago usando contrato Stylus
async function sendPaymentStylus(toAddress, amount) {
    if (!window.ethereum || !userAddress) {
        throw new Error('Conecta tu wallet primero');
    }
    
    await checkAndSwitchNetwork();
    const web3i = getWeb3();
    const contractAddress = getContractAddress('payments', getSelectedNetworkKey());
    
    // Verificar que el contrato esté desplegado (no sea un placeholder)
    if (contractAddress === '0x0000000000000000000000000000000000000000' || 
        contractAddress.startsWith('0x1234567890')) {
        throw new Error('Contrato Stylus no desplegado aún. Usando método nativo.');
    }
    
    const contract = getStylusContract('payments', getSelectedNetworkKey());
    
    if (!contract) {
        throw new Error('Contrato de pagos no disponible');
    }
    
    const amountWei = web3i.utils.toWei(amount.toString(), 'ether');
    
    try {
        const tx = await contract.methods.sendPayment(toAddress, amountWei).send({
            from: userAddress,
            gas: 300000
        });
        
        return tx;
    } catch (error) {
        console.error('Error en pago Stylus:', error);
        // Si el contrato no está desplegado o hay error, propagar para usar método nativo
        throw error;
    }
}

// Función para depositar en contrato de pagos Stylus
async function depositToPaymentsContract(amount) {
    if (!window.ethereum || !userAddress) {
        throw new Error('Conecta tu wallet primero');
    }
    
    await checkAndSwitchNetwork();
    const web3i = getWeb3();
    const contract = getStylusContract('payments', getSelectedNetworkKey());
    
    if (!contract) {
        throw new Error('Contrato de pagos no disponible');
    }
    
    const amountWei = web3i.utils.toWei(amount.toString(), 'ether');
    
    try {
        const tx = await contract.methods.deposit().send({
            from: userAddress,
            value: amountWei,
            gas: 200000
        });
        
        return tx;
    } catch (error) {
        console.error('Error al depositar:', error);
        throw error;
    }
}

// Función para obtener balance en contrato Stylus
async function getStylusBalance(userAddress) {
    if (!window.ethereum) return '0';
    
    const web3i = getWeb3();
    const contract = getStylusContract('payments', getSelectedNetworkKey());
    
    if (!contract) return '0';
    
    try {
        const balance = await contract.methods.getBalance(userAddress).call();
        return web3i.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error('Error al obtener balance Stylus:', error);
        return '0';
    }
}

