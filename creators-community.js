// Sistema de Comunidad de Creativos, Préstamos y Finanzas Inclusivas

// Almacenamiento local para publicaciones (simulado hasta tener IPFS o backend)
let postsStorage = JSON.parse(localStorage.getItem('creators_posts') || '[]');

// ========== COMUNIDAD ==========

// Suscribirse a la comunidad
async function subscribeToCommunity() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        await checkAndSwitchNetwork();
        const web3i = getWeb3();
        const contract = getCommunityContract();
        
        // Obtener precio de suscripción
        const price = await contract.methods.get_subscription_price().call();
        const priceEth = web3i.utils.fromWei(price, 'ether');
        
        if (confirm(`¿Deseas unirte a la comunidad por ${priceEth} ${getNativeSymbol()}?`)) {
            const tx = await contract.methods.subscribe().send({
                from: userAddress,
                value: price,
                gas: 300000
            });
            
            alert('¡Bienvenido a la comunidad! 🎉');
            await checkMembershipStatus();
            await updateMemberCount();
        }
    } catch (error) {
        console.error('Error al suscribirse:', error);
        alert('Error al suscribirse: ' + error.message);
    }
}

// Verificar estado de membresía
async function checkMembershipStatus() {
    if (!window.ethereum || !userAddress) return;

    try {
        const contract = getCommunityContract();
        const isMember = await contract.methods.is_member(userAddress).call();
        
        const statusEl = document.getElementById('membershipStatus');
        if (statusEl) {
            if (isMember) {
                statusEl.textContent = 'Miembro';
                statusEl.classList.remove('text-red-400');
                statusEl.classList.add('text-green-400');
            } else {
                statusEl.textContent = 'No miembro';
                statusEl.classList.remove('text-green-400');
                statusEl.classList.add('text-red-400');
            }
        }
    } catch (error) {
        console.error('Error al verificar membresía:', error);
    }
}

// Actualizar contador de miembros
async function updateMemberCount() {
    try {
        const contract = getCommunityContract();
        const count = await contract.methods.get_member_count().call();
        
        const countEl = document.getElementById('memberCount');
        if (countEl) {
            countEl.textContent = count.toString();
        }
    } catch (error) {
        console.error('Error al obtener contador:', error);
    }
}

// Obtener contrato de comunidad
function getCommunityContract() {
    const web3i = getWeb3();
    const contractAddress = getContractAddress('community', getSelectedNetworkKey());
    const abi = [
        {
            "inputs": [],
            "name": "get_subscription_price",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
            "name": "is_member",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "get_member_count",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "subscribe",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ];
    
    return new web3i.eth.Contract(abi, contractAddress);
}

// ========== PRÉSTAMOS ==========

// Solicitar préstamo
async function requestLoan() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    const amount = document.getElementById('loanAmount').value;
    const interest = document.getElementById('loanInterest').value;
    const days = document.getElementById('loanDays').value;
    const description = document.getElementById('loanDescription').value;

    if (!amount || !interest || !days || !description) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        await checkAndSwitchNetwork();
        const web3i = getWeb3();
        const contract = getLoanContract();
        
        const amountWei = web3i.utils.toWei(amount, 'ether');
        const interestBps = web3i.utils.toBN(interest).mul(web3i.utils.toBN(100)); // Convertir % a puntos base
        
        const tx = await contract.methods.request_loan(
            amountWei,
            interestBps,
            web3i.utils.toBN(days),
            description
        ).send({
            from: userAddress,
            gas: 500000
        });
        
        alert('✅ Préstamo solicitado exitosamente!');
        
        // Limpiar formulario
        document.getElementById('loanAmount').value = '';
        document.getElementById('loanInterest').value = '';
        document.getElementById('loanDays').value = '';
        document.getElementById('loanDescription').value = '';
        
        await loadMyLoans();
    } catch (error) {
        console.error('Error al solicitar préstamo:', error);
        alert('Error al solicitar préstamo: ' + error.message);
    }
}

// Aprobar y financiar préstamo
async function approveAndFundLoan(loanId) {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        await checkAndSwitchNetwork();
        const web3i = getWeb3();
        const contract = getLoanContract();
        
        // Obtener información del préstamo
        const loan = await contract.methods.get_loan(loanId).call();
        const amount = loan.amount;
        
        if (confirm(`¿Deseas financiar este préstamo por ${web3i.utils.fromWei(amount, 'ether')} ETH?`)) {
            const tx = await contract.methods.approve_and_fund_loan(loanId).send({
                from: userAddress,
                value: amount,
                gas: 500000
            });
            
            alert('✅ Préstamo financiado exitosamente!');
            await loadPendingLoans();
        }
    } catch (error) {
        console.error('Error al financiar préstamo:', error);
        alert('Error al financiar préstamo: ' + error.message);
    }
}

// Pagar préstamo
async function repayLoan(loanId, amount) {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        await checkAndSwitchNetwork();
        const web3i = getWeb3();
        const contract = getLoanContract();
        
        const amountWei = web3i.utils.toWei(amount, 'ether');
        
        const tx = await contract.methods.repay_loan(loanId).send({
            from: userAddress,
            value: amountWei,
            gas: 500000
        });
        
        alert('✅ Pago realizado exitosamente!');
        await loadMyLoans();
        await checkCreditStats();
    } catch (error) {
        console.error('Error al pagar préstamo:', error);
        alert('Error al pagar préstamo: ' + error.message);
    }
}

// Cargar préstamos pendientes
async function loadPendingLoans() {
    try {
        const contract = getLoanContract();
        const count = await contract.methods.get_loan_count().call();
        
        const listEl = document.getElementById('pendingLoansList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        if (count == 0) {
            listEl.innerHTML = '<p class="text-gray-400 text-sm">No hay préstamos pendientes</p>';
            return;
        }
        
        const web3i = getWeb3();
        
        for (let i = 0; i < count; i++) {
            try {
                const loan = await contract.methods.get_loan(web3i.utils.toBN(i)).call();
                
                if (loan.status == 0) { // Pending
                    const loanCard = createLoanCard(loan, i, true);
                    listEl.appendChild(loanCard);
                }
            } catch (e) {
                console.error('Error al cargar préstamo:', e);
            }
        }
    } catch (error) {
        console.error('Error al cargar préstamos pendientes:', error);
    }
}

// Cargar mis préstamos
async function loadMyLoans() {
    if (!userAddress) return;
    
    try {
        const contract = getLoanContract();
        const count = await contract.methods.get_loan_count().call();
        
        const listEl = document.getElementById('myLoansList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        const web3i = getWeb3();
        let myLoansCount = 0;
        
        for (let i = 0; i < count; i++) {
            try {
                const loan = await contract.methods.get_loan(web3i.utils.toBN(i)).call();
                
                if (loan.creator.toLowerCase() === userAddress.toLowerCase() || 
                    loan.lender.toLowerCase() === userAddress.toLowerCase()) {
                    const loanCard = createLoanCard(loan, i, false);
                    listEl.appendChild(loanCard);
                    myLoansCount++;
                }
            } catch (e) {
                console.error('Error al cargar préstamo:', e);
            }
        }
        
        if (myLoansCount === 0) {
            listEl.innerHTML = '<p class="text-gray-400 text-sm">No tienes préstamos</p>';
        }
    } catch (error) {
        console.error('Error al cargar mis préstamos:', error);
    }
}

// Crear tarjeta de préstamo
function createLoanCard(loan, loanId, isPending) {
    const web3i = getWeb3();
    const amount = web3i.utils.fromWei(loan.amount, 'ether');
    const statusNames = ['Pendiente', 'Activo', 'Pagado', 'Incumplido'];
    const statusColors = ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-red-400'];
    
    const card = document.createElement('div');
    card.className = 'p-4 bg-gray-900/50 rounded-lg';
    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <div class="font-light">Préstamo #${loanId}</div>
                <div class="text-sm text-gray-400">${loan.description || 'Sin descripción'}</div>
            </div>
            <span class="text-sm ${statusColors[loan.status]}">${statusNames[loan.status]}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
            <div><span class="text-gray-400">Monto:</span> ${amount} ETH</div>
            <div><span class="text-gray-400">Interés:</span> ${web3i.utils.fromWei(loan.interest_rate, 'ether')}%</div>
        </div>
        ${isPending ? `
            <button onclick="approveAndFundLoan(${loanId})" class="btn-morpho btn-morpho-accent w-full text-sm">
                Financiar Préstamo
            </button>
        ` : loan.status == 1 ? `
            <button onclick="showRepayLoanModal(${loanId}, ${amount})" class="btn-morpho btn-morpho-primary w-full text-sm">
                Pagar Préstamo
            </button>
        ` : ''}
    `;
    
    return card;
}

// Obtener contrato de préstamos
function getLoanContract() {
    const web3i = getWeb3();
    const contractAddress = getContractAddress('loans', getSelectedNetworkKey());
    const abi = [
        {
            "inputs": [{"internalType": "address", "name": "community_address", "type": "address"}],
            "name": "init",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "amount", "type": "uint256"},
                {"internalType": "uint256", "name": "interest_rate", "type": "uint256"},
                {"internalType": "uint256", "name": "duration_days", "type": "uint256"},
                {"internalType": "string", "name": "description", "type": "string"}
            ],
            "name": "request_loan",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "loan_id", "type": "uint256"}],
            "name": "approve_and_fund_loan",
            "outputs": [],
            "stateMutability": "payable",
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
            "inputs": [{"internalType": "uint256", "name": "loan_id", "type": "uint256"}],
            "name": "get_loan",
            "outputs": [{"components": [
                {"internalType": "address", "name": "creator", "type": "address"},
                {"internalType": "address", "name": "lender", "type": "address"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"},
                {"internalType": "uint256", "name": "interest_rate", "type": "uint256"},
                {"internalType": "uint256", "name": "duration", "type": "uint256"},
                {"internalType": "uint256", "name": "created_at", "type": "uint256"},
                {"internalType": "uint256", "name": "due_date", "type": "uint256"},
                {"internalType": "uint256", "name": "paid_amount", "type": "uint256"},
                {"internalType": "uint8", "name": "status", "type": "uint8"},
                {"internalType": "string", "name": "description", "type": "string"}
            ], "internalType": "struct Loan", "name": "", "type": "tuple"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "get_loan_count",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    return new web3i.eth.Contract(abi, contractAddress);
}

// ========== BURÓ DE CRÉDITO ==========

// Verificar estadísticas de crédito
async function checkCreditStats() {
    if (!window.ethereum || !userAddress) return;

    try {
        const contract = getCreditBureauContract();
        const stats = await contract.methods.get_user_stats(userAddress).call();
        
        const web3i = getWeb3();
        const score = stats[0];
        const totalPaid = web3i.utils.fromWei(stats[1], 'ether');
        const cashback = web3i.utils.fromWei(stats[2], 'ether');
        
        const scoreEl = document.getElementById('creditScore');
        const totalEl = document.getElementById('totalPaid');
        const cashbackEl = document.getElementById('cashbackBalance');
        
        if (scoreEl) scoreEl.textContent = score.toString();
        if (totalEl) totalEl.textContent = `${parseFloat(totalPaid).toFixed(4)} ETH`;
        if (cashbackEl) cashbackEl.textContent = `${parseFloat(cashback).toFixed(4)} ETH`;
        
        // Actualizar historial
        await loadPaymentHistory();
    } catch (error) {
        console.error('Error al verificar estadísticas:', error);
    }
}

// Retirar cashback
async function withdrawCashback() {
    if (!window.ethereum || !userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    try {
        await checkAndSwitchNetwork();
        const contract = getCreditBureauContract();
        
        const tx = await contract.methods.withdraw_cashback().send({
            from: userAddress,
            gas: 300000
        });
        
        alert('✅ Cashback retirado exitosamente!');
        await checkCreditStats();
    } catch (error) {
        console.error('Error al retirar cashback:', error);
        alert('Error al retirar cashback: ' + error.message);
    }
}

// Cargar historial de pagos
async function loadPaymentHistory() {
    if (!userAddress) return;
    
    try {
        const contract = getCreditBureauContract();
        const history = await contract.methods.get_payment_history(userAddress).call();
        
        const listEl = document.getElementById('paymentHistoryList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        if (history.length === 0) {
            listEl.innerHTML = '<p class="text-gray-400 text-sm">No hay historial de pagos</p>';
            return;
        }
        
        const web3i = getWeb3();
        
        history.forEach((payment, index) => {
            const paymentEl = document.createElement('div');
            paymentEl.className = 'flex justify-between items-center p-2 bg-gray-900/50 rounded text-sm';
            
            const amount = web3i.utils.fromWei(payment.amount, 'ether');
            const date = new Date(Number(payment.timestamp) * 1000);
            const onTime = payment.on_time;
            
            paymentEl.innerHTML = `
                <div>
                    <div>Préstamo #${payment.loan_id.toString()}</div>
                    <div class="text-gray-400 text-xs">${date.toLocaleDateString()}</div>
                </div>
                <div class="text-right">
                    <div>${parseFloat(amount).toFixed(4)} ETH</div>
                    <div class="${onTime ? 'text-green-400' : 'text-red-400'} text-xs">
                        ${onTime ? '✓ A tiempo' : '✗ Tardío'}
                    </div>
                </div>
            `;
            
            listEl.appendChild(paymentEl);
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

// Obtener contrato de buró de crédito
function getCreditBureauContract() {
    const web3i = getWeb3();
    const contractAddress = getContractAddress('creditBureau', getSelectedNetworkKey());
    const abi = [
        {
            "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
            "name": "get_user_stats",
            "outputs": [
                {"internalType": "uint256", "name": "", "type": "uint256"},
                {"internalType": "uint256", "name": "", "type": "uint256"},
                {"internalType": "uint256", "name": "", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdraw_cashback",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
            "name": "get_payment_history",
            "outputs": [{"components": [
                {"internalType": "uint256", "name": "loan_id", "type": "uint256"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "bool", "name": "on_time", "type": "bool"}
            ], "internalType": "struct PaymentHistory[]", "name": "", "type": "tuple[]"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    return new web3i.eth.Contract(abi, contractAddress);
}

// ========== PUBLICACIONES ==========

// Crear publicación
async function createPost() {
    if (!userAddress) {
        alert('Por favor, conecta tu wallet primero');
        return;
    }

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageUrl = document.getElementById('postImageUrl').value;

    if (!title || !content) {
        alert('Por favor, completa título y contenido');
        return;
    }

    const post = {
        id: Date.now().toString(),
        creator: userAddress,
        title,
        content,
        imageUrl: imageUrl || '',
        timestamp: Date.now(),
        likes: 0
    };

    postsStorage.unshift(post);
    localStorage.setItem('creators_posts', JSON.stringify(postsStorage));

    // Limpiar formulario
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postImageUrl').value = '';

    alert('✅ Publicación creada exitosamente!');
    loadPosts();
}

// Cargar publicaciones
function loadPosts() {
    const listEl = document.getElementById('postsList');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (postsStorage.length === 0) {
        listEl.innerHTML = `
            <div class="post-item p-4 bg-gray-900/50 rounded-lg">
                <p class="text-gray-400 text-sm">No hay publicaciones aún. ¡Sé el primero en compartir!</p>
            </div>
        `;
        return;
    }

    postsStorage.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post-item p-4 bg-gray-900/50 rounded-lg';
        
        const date = new Date(post.timestamp);
        const shortAddress = `${post.creator.substring(0, 6)}...${post.creator.substring(38)}`;
        
        postEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h5 class="font-light text-lg">${escapeHtml(post.title)}</h5>
                    <div class="text-xs text-gray-400 mt-1">
                        Por ${shortAddress} • ${date.toLocaleDateString()}
                    </div>
                </div>
            </div>
            ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" class="w-full rounded mt-3 mb-3" onerror="this.style.display='none'">` : ''}
            <p class="text-gray-300 mb-3 whitespace-pre-wrap">${escapeHtml(post.content)}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
                <button onclick="likePost('${post.id}')" class="flex items-center gap-1 hover:text-purple-400">
                    <i class="fas fa-heart"></i> ${post.likes || 0}
                </button>
            </div>
        `;
        
        listEl.appendChild(postEl);
    });
}

// Like publicación
function likePost(postId) {
    const post = postsStorage.find(p => p.id === postId);
    if (post) {
        post.likes = (post.likes || 0) + 1;
        localStorage.setItem('creators_posts', JSON.stringify(postsStorage));
        loadPosts();
    }
}

// Escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== INICIALIZACIÓN ==========

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para comunidad
    const subscribeBtn = document.getElementById('subscribeCommunityBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', subscribeToCommunity);
    }

    const checkMembershipBtn = document.getElementById('checkMembershipBtn');
    if (checkMembershipBtn) {
        checkMembershipBtn.addEventListener('click', async () => {
            await checkMembershipStatus();
            await updateMemberCount();
        });
    }

    // Event listeners para préstamos
    const requestLoanBtn = document.getElementById('requestLoanBtn');
    if (requestLoanBtn) {
        requestLoanBtn.addEventListener('click', requestLoan);
    }

    // Event listeners para crédito
    const checkCreditBtn = document.getElementById('checkCreditBtn');
    if (checkCreditBtn) {
        checkCreditBtn.addEventListener('click', checkCreditStats);
    }

    const withdrawCashbackBtn = document.getElementById('withdrawCashbackBtn');
    if (withdrawCashbackBtn) {
        withdrawCashbackBtn.addEventListener('click', withdrawCashback);
    }

    // Event listeners para publicaciones
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', createPost);
    }

    // Cargar datos iniciales
    loadPosts();
    
    // Cargar estadísticas si hay wallet conectada
    if (userAddress) {
        checkMembershipStatus();
        updateMemberCount();
        checkCreditStats();
        loadPendingLoans();
        loadMyLoans();
    }
});

// Función helper para modal de pago de préstamo
window.showRepayLoanModal = function(loanId, amount) {
    const paymentAmount = prompt(`Ingresa el monto a pagar (máximo ${amount} ETH):`, amount);
    if (paymentAmount && paymentAmount > 0) {
        repayLoan(loanId, paymentAmount);
    }
};


