//!
//! Contrato de Pagos Stylus
//! Sistema de pagos, depósitos y retiros para Impulso Web3
//!
//! Funcionalidades:
//! - Depositar fondos en el contrato
//! - Enviar pagos entre usuarios
//! - Retirar fondos
//! - Consultar balance de usuarios
//!
//! El programa es ABI-equivalente con Solidity, lo que significa que puedes llamarlo desde Solidity y Rust.
//! Para generar el ABI, ejecuta `cargo stylus export-abi`.
//!
//! Nota: este código es solo un ejemplo y no ha sido auditado.

// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::{Address, U256}, prelude::*};

// Define el almacenamiento persistente usando la ABI de Solidity.
// `PaymentsContract` será el punto de entrada.
sol_storage! {
    #[entrypoint]
    pub struct PaymentsContract {
        mapping(address => uint256) balances;
    }
}

/// Declare que `PaymentsContract` es un contrato con los siguientes métodos externos.
#[public]
impl PaymentsContract {
    /// Obtiene el balance de una dirección
    pub fn get_balance(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.balances.get(user))
    }

    /// Deposita fondos en el contrato (función payable)
    /// El ETH enviado con la transacción se añade al balance del remitente
    #[payable]
    pub fn deposit(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let value = self.vm().msg_value();
        let current_balance = self.balances.get(sender);
        self.balances.setter(sender).set(current_balance + value);
        Ok(())
    }

    /// Retira fondos del contrato
    pub fn withdraw(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let balance = self.balances.get(sender);
        
        if balance < amount {
            return Err(b"Saldo insuficiente".into());
        }
        
        self.balances.setter(sender).set(balance - amount);
        
        // Transferir ETH de vuelta al usuario
        self.vm().transfer_eth(sender, amount)?;
        
        Ok(())
    }

    /// Envía un pago desde el balance depositado a otra dirección
    pub fn send_payment(&mut self, to: Address, amount: U256) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        
        // Verificar que el remitente tenga suficiente balance
        let sender_balance = self.balances.get(sender);
        if sender_balance < amount {
            return Err(b"Saldo insuficiente".into());
        }
        
        // Transferir del remitente al destinatario
        self.balances.setter(sender).set(sender_balance - amount);
        let to_balance = self.balances.get(to);
        self.balances.setter(to).set(to_balance + amount);
        
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_payments() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = PaymentsContract::from(&vm);
        
        // Obtener direcciones de prueba
        let alice = Address::ZERO;
        let bob = Address::from(U256::from(1));
        
        // Inicialmente, los balances deben ser cero
        assert_eq!(U256::ZERO, contract.get_balance(alice).unwrap());
        assert_eq!(U256::ZERO, contract.get_balance(bob).unwrap());
        
        // Simular depósito de Alice (no se puede hacer directamente en tests sin configurar msg_value)
        // En un test real, usarías vm.set_value() antes de llamar a deposit()
        
        // Para este ejemplo, establecemos el balance directamente en el test
        // Nota: En producción, esto solo puede hacerse a través de deposit() con msg_value
    }
}