//!
//! Contrato de Buró de Crédito Stylus
//! Sistema de seguimiento de historial de pagos y cashback
//!
//! Funcionalidades:
//! - Registrar pagos de préstamos
//! - Calcular score de crédito
//! - Sistema de cashback por buen historial
//! - Ver historial de pagos
//!

#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::{Address, U256}, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct CreditBureauContract {
        // Score de crédito por usuario (0-1000)
        mapping(address => uint256) credit_score;
        // Historial de pagos
        mapping(address => PaymentHistory[]) payment_history;
        // Total pagado por usuario (para cashback)
        mapping(address => uint256) total_paid;
        // Cashback acumulado por usuario
        mapping(address => uint256) cashback_balance;
        // Dirección del contrato de préstamos
        address loan_contract;
        // Configuración de cashback (porcentaje en puntos base)
        uint256 cashback_rate; // ej: 100 = 1%
    }

    pub struct PaymentHistory {
        uint256 loan_id;
        uint256 amount;
        uint256 timestamp;
        bool on_time; // Si el pago fue a tiempo
    }
}

#[public]
impl CreditBureauContract {
    /// Inicializa el contrato
    pub fn init(&mut self, loan_contract_address: Address, cashback_rate_points: U256) -> Result<(), Vec<u8>> {
        if self.loan_contract.get() != Address::ZERO {
            return Err(b"Ya inicializado".into());
        }
        self.loan_contract.setter().set(loan_contract_address);
        self.cashback_rate.setter().set(cashback_rate_points);
        Ok(())
    }

    /// Registra un pago (debe ser llamado desde el contrato de préstamos)
    pub fn record_payment(
        &mut self,
        user: Address,
        loan_id: U256,
        amount: U256,
        was_on_time: bool
    ) -> Result<(), Vec<u8>> {
        // Solo el contrato de préstamos puede registrar pagos
        if self.vm().msg_sender() != self.loan_contract.get() {
            return Err(b"No autorizado".into());
        }
        
        let current_time = U256::from(self.vm().block_timestamp());
        
        // Agregar al historial
        let mut history = self.payment_history.getter(user);
        let payment = PaymentHistory {
            loan_id,
            amount,
            timestamp: current_time,
            on_time: was_on_time,
        };
        history.push(payment);
        self.payment_history.setter(user).set(history);
        
        // Actualizar total pagado
        let current_total = self.total_paid.get(user);
        self.total_paid.setter(user).set(current_total + amount);
        
        // Actualizar score de crédito
        self.update_credit_score(user);
        
        // Calcular cashback si el pago fue a tiempo
        if was_on_time {
            self.calculate_cashback(user, amount);
        }
        
        Ok(())
    }

    /// Actualiza el score de crédito de un usuario
    fn update_credit_score(&mut self, user: Address) {
        let history = self.payment_history.getter(user);
        
        if history.len() == 0 {
            self.credit_score.setter(user).set(U256::from(500)); // Score inicial
            return;
        }
        
        // Calcular score basado en historial
        let mut score = U256::from(500); // Base
        
        let mut on_time_count = U256::ZERO;
        let total_payments = U256::from(history.len());
        
        for payment in history.iter() {
            if payment.on_time {
                on_time_count = on_time_count + U256::from(1);
            }
        }
        
        // Bonificación por pagos a tiempo (hasta +300 puntos)
        if total_payments > U256::ZERO {
            let on_time_percentage = (on_time_count * U256::from(100)) / total_payments;
            let bonus = (on_time_percentage * U256::from(3)); // 3 puntos por % a tiempo
            score = score + bonus;
        }
        
        // Bonificación por cantidad de pagos (hasta +200 puntos)
        let payment_bonus = if total_payments > U256::from(20) {
            U256::from(200)
        } else {
            (total_payments * U256::from(10)) // 10 puntos por pago
        };
        score = score + payment_bonus;
        
        // Limitar a máximo 1000
        if score > U256::from(1000) {
            score = U256::from(1000);
        }
        
        self.credit_score.setter(user).set(score);
    }

    /// Calcula y otorga cashback por pago a tiempo
    fn calculate_cashback(&mut self, user: Address, payment_amount: U256) {
        let cashback_amount = (payment_amount * self.cashback_rate.get()) / U256::from(10000);
        
        if cashback_amount > U256::ZERO {
            let current_cashback = self.cashback_balance.get(user);
            self.cashback_balance.setter(user).set(current_cashback + cashback_amount);
        }
    }

    /// Obtiene el score de crédito de un usuario
    pub fn get_credit_score(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.credit_score.get(user))
    }

    /// Obtiene el historial de pagos de un usuario
    pub fn get_payment_history(&self, user: Address) -> Result<Vec<PaymentHistory>, Vec<u8>> {
        Ok(self.payment_history.getter(user))
    }

    /// Obtiene el balance de cashback de un usuario
    pub fn get_cashback_balance(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.cashback_balance.get(user))
    }

    /// Retira el cashback acumulado
    pub fn withdraw_cashback(&mut self) -> Result<(), Vec<u8>> {
        let user = self.vm().msg_sender();
        let cashback = self.cashback_balance.get(user);
        
        if cashback == U256::ZERO {
            return Err(b"No hay cashback disponible".into());
        }
        
        // Resetear balance
        self.cashback_balance.setter(user).set(U256::ZERO);
        
        // Transferir cashback
        self.vm().transfer_eth(user, cashback)?;
        
        Ok(())
    }

    /// Obtiene el total pagado por un usuario
    pub fn get_total_paid(&self, user: Address) -> Result<U256, Vec<u8>> {
        Ok(self.total_paid.get(user))
    }

    /// Obtiene estadísticas de un usuario
    pub fn get_user_stats(&self, user: Address) -> Result<(U256, U256, U256), Vec<u8>> {
        let score = self.credit_score.get(user);
        let total = self.total_paid.get(user);
        let cashback = self.cashback_balance.get(user);
        Ok((score, total, cashback))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_credit_bureau() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = CreditBureauContract::from(&vm);
        
        let loan_contract = Address::from(U256::from(1));
        contract.init(loan_contract, U256::from(100)).unwrap(); // 1% cashback
        
        let user = Address::from(U256::from(2));
        
        // Verificar score inicial
        assert_eq!(U256::from(500), contract.get_credit_score(user).unwrap());
    }
}
