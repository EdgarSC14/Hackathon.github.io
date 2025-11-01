// Ejemplo de contrato Rust para Arbitrum Stylus
// Este contrato demuestra pagos y remesas usando Stylus

#![no_std]

use stylus_sdk::{alloy_primitives::U256, evm, prelude::*};

// Estado del contrato
sol_storage! {
    #[entrypoint]
    pub struct PaymentsContract {
        mapping(address => uint256) balances;
        mapping(address => Payment[]) payments_history;
    }

    pub struct Payment {
        address to;
        uint256 amount;
        uint256 timestamp;
    }
}

// Implementación del contrato
#[external]
impl PaymentsContract {
    // Realizar un pago
    pub fn send_payment(&mut self, to: Address, amount: U256) -> Result<(), Vec<u8>> {
        let sender = evm::msg_sender();
        
        // Verificar saldo
        let balance = self.balances.get(sender);
        if balance < amount {
            return Err(b"Saldo insuficiente".to_vec());
        }
        
        // Transferir
        self.balances.setter(sender).sub(amount);
        let to_balance = self.balances.get(to);
        self.balances.setter(to).set(to_balance + amount);
        
        // Registrar en historial
        let payment = Payment {
            to,
            amount,
            timestamp: evm::block_timestamp(),
        };
        // self.payments_history.setter(sender).push(payment);
        
        Ok(())
    }
    
    // Depositar fondos
    pub fn deposit(&mut self) -> Result<(), Vec<u8>> {
        let sender = evm::msg_sender();
        let value = evm::msg_value();
        let balance = self.balances.get(sender);
        self.balances.setter(sender).set(balance + value);
        Ok(())
    }
    
    // Retirar fondos
    pub fn withdraw(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        let sender = evm::msg_sender();
        let balance = self.balances.get(sender);
        
        if balance < amount {
            return Err(b"Saldo insuficiente".to_vec());
        }
        
        self.balances.setter(sender).set(balance - amount);
        evm::transfer(sender, amount)?;
        Ok(())
    }
    
    // Obtener balance
    pub fn get_balance(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.balances.get(user))
    }
}

