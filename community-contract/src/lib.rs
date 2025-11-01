//!
//! Contrato de Comunidad Stylus
//! Sistema de membresía para la comunidad de creativos
//!
//! Funcionalidades:
//! - Suscripción con 0.00001 ETH (soporta múltiples redes: Arbitrum, Scroll, Base, ENS)
//! - Verificar membresía
//! - Listar miembros
//!
//! El programa es ABI-equivalente con Solidity

#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::{Address, U256}, prelude::*};

// Precio de suscripción: 0.00001 ETH (en wei)
// 0.00001 ETH = 10000000000000 wei (10^13)
const SUBSCRIPTION_PRICE: U256 = U256::from_limbs([10000000000000, 0, 0, 0]); // 0.00001 ETH

sol_storage! {
    #[entrypoint]
    pub struct CommunityContract {
        // Mapeo de direcciones a estado de membresía
        mapping(address => bool) members;
        // Lista de todos los miembros
        Vec<Address> member_list;
        // Contador de miembros
        uint256 member_count;
        // Historial de suscripciones (para auditoría)
        mapping(address => uint256) subscription_timestamp;
    }
}

#[public]
impl CommunityContract {
    /// Obtiene el precio de suscripción
    pub fn get_subscription_price(&self) -> Result<U256, Vec<u8>> {
        Ok(SUBSCRIPTION_PRICE)
    }

    /// Verifica si una dirección es miembro
    pub fn is_member(&self, user: Address) -> Result<bool, Vec<u8>> {
        Ok(self.members.get(user))
    }

    /// Obtiene el número total de miembros
    pub fn get_member_count(&self) -> Result<U256, Vec<u8>> {
        Ok(self.member_count.get())
    }

    /// Obtiene el timestamp de suscripción de un usuario
    pub fn get_subscription_timestamp(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.subscription_timestamp.get(user))
    }

    /// Suscribirse a la comunidad (payable)
    /// Acepta pago de 0.00001 ETH de cualquier red compatible
    #[payable]
    pub fn subscribe(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let value = self.vm().msg_value();
        
        // Verificar que el pago sea exactamente el precio de suscripción
        if value != SUBSCRIPTION_PRICE {
            return Err(b"El monto debe ser exactamente 0.00001 ETH".into());
        }
        
        // Verificar si ya es miembro
        if self.members.get(sender) {
            return Err(b"Ya eres miembro de la comunidad".into());
        }
        
        // Agregar como miembro
        self.members.setter(sender).set(true);
        
        // Agregar a la lista
        let count = self.member_count.get();
        self.member_list.setter().push(sender);
        self.member_count.setter().set(count + U256::from(1));
        
        // Guardar timestamp de suscripción
        let current_timestamp = U256::from(self.vm().block_timestamp());
        self.subscription_timestamp.setter(sender).set(current_timestamp);
        
        Ok(())
    }

    /// Obtiene un miembro por índice (útil para iterar)
    pub fn get_member_by_index(&self, index: U256) -> Result<Address, Vec<u8>> {
        let list = self.member_list.getter();
        let idx = index.to::<usize>();
        
        if idx >= list.len() {
            return Err(b"Índice fuera de rango".into());
        }
        
        Ok(list[idx])
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_community_subscription() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = CommunityContract::from(&vm);
        
        let alice = Address::from(U256::from(1));
        
        // Verificar precio de suscripción
        assert_eq!(SUBSCRIPTION_PRICE, contract.get_subscription_price().unwrap());
        
        // Verificar que no es miembro inicialmente
        assert_eq!(false, contract.is_member(alice).unwrap());
    }
}
