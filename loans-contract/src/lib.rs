//!
//! Contrato de Préstamos Stylus
//! Sistema de préstamos para creativos
//!
//! Funcionalidades:
//! - Solicitar préstamos
//! - Aprobar préstamos (miembros de la comunidad)
//! - Pagar préstamos
//! - Ver historial de préstamos
//!

#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::{Address, U256}, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct LoanContract {
        // Mapeo de ID de préstamo a información del préstamo
        mapping(uint256 => Loan) loans;
        // Contador de préstamos
        uint256 loan_count;
        // Préstamos por creativo
        mapping(address => Vec<uint256>) creator_loans;
        // Dirección del contrato de comunidad (para verificar membresía)
        address community_contract;
    }

    pub struct Loan {
        address creator;           // Creador que solicita el préstamo
        address lender;            // Prestamista (puede ser address(0) si no está aprobado)
        uint256 amount;            // Monto del préstamo
        uint256 interest_rate;     // Tasa de interés (en puntos base, ej: 500 = 5%)
        uint256 duration;          // Duración en segundos
        uint256 created_at;         // Timestamp de creación
        uint256 due_date;          // Fecha de vencimiento
        uint256 paid_amount;       // Monto pagado hasta ahora
        uint256 status;            // Estado del préstamo (0=Pending, 1=Active, 2=Paid, 3=Defaulted)
        string description;       // Descripción del préstamo
    }
}

#[public]
impl LoanContract {
    /// Inicializa el contrato con la dirección del contrato de comunidad
    pub fn init(&mut self, community_address: Address) -> Result<(), Vec<u8>> {
        // Solo puede inicializarse una vez
        if self.community_contract.get() != Address::ZERO {
            return Err(b"Ya inicializado".into());
        }
        self.community_contract.setter().set(community_address);
        Ok(())
    }

    /// Crea una solicitud de préstamo
    pub fn request_loan(
        &mut self,
        amount: U256,
        interest_rate: U256,
        duration_days: U256,
        description: String
    ) -> Result<U256, Vec<u8>> {
        let creator = self.vm().msg_sender();
        
        // Validaciones
        if amount == U256::ZERO {
            return Err(b"El monto debe ser mayor a cero".into());
        }
        
        if interest_rate > U256::from(10000) { // Máximo 100%
            return Err(b"Tasa de interés inválida".into());
        }
        
        let loan_id = self.loan_count.get();
        let current_time = U256::from(self.vm().block_timestamp());
        let duration_seconds = duration_days * U256::from(86400); // Días a segundos
        let due_date = current_time + duration_seconds;
        
        // Crear el préstamo
        let loan = Loan {
            creator,
            lender: Address::ZERO,
            amount,
            interest_rate,
            duration: duration_seconds,
            created_at: current_time,
            due_date,
            paid_amount: U256::ZERO,
            status: U256::ZERO, // Pending
            description,
        };
        
        self.loans.setter(loan_id).set(loan);
        self.loan_count.setter().set(loan_id + U256::from(1));
        
        // Agregar a la lista de préstamos del creativo
        let mut creator_loan_list = self.creator_loans.getter(creator);
        creator_loan_list.push(loan_id);
        self.creator_loans.setter(creator).set(creator_loan_list);
        
        Ok(loan_id)
    }

    /// Aprueba y desembolsa un préstamo (solo miembros pueden prestar)
    #[payable]
    pub fn approve_and_fund_loan(&mut self, loan_id: U256) -> Result<(), Vec<u8>> {
        let lender = self.vm().msg_sender();
        let value = self.vm().msg_value();
        
        // Verificar que el préstamo existe
        let mut loan = self.loans.get(loan_id);
        if loan.creator == Address::ZERO {
            return Err(b"Préstamo no encontrado".into());
        }
        
        // Verificar que el préstamo esté pendiente (0 = Pending)
        if loan.status != U256::ZERO {
            return Err(b"El préstamo no está pendiente".into());
        }
        
        // Verificar que el monto sea correcto
        if value != loan.amount {
            return Err(b"Monto incorrecto".into());
        }
        
        // TODO: Verificar que el lender sea miembro de la comunidad
        // Esto requeriría llamar al contrato de comunidad
        
        // Actualizar el préstamo
        loan.lender = lender;
        loan.status = U256::from(1); // Active
        self.loans.setter(loan_id).set(loan);
        
        // Transferir fondos al creativo
        self.vm().transfer_eth(loan.creator, loan.amount)?;
        
        Ok(())
    }

    /// Paga un préstamo (creativo paga)
    #[payable]
    pub fn repay_loan(&mut self, loan_id: U256) -> Result<(), Vec<u8>> {
        let payer = self.vm().msg_sender();
        let payment = self.vm().msg_value();
        
        let mut loan = self.loans.get(loan_id);
        
        // Verificar que el préstamo existe
        if loan.creator == Address::ZERO {
            return Err(b"Préstamo no encontrado".into());
        }
        
        // Verificar que sea el creativo quien paga
        if payer != loan.creator {
            return Err(b"Solo el creativo puede pagar".into());
        }
        
        // Verificar que el préstamo esté activo (1 = Active)
        if loan.status != U256::from(1) {
            return Err(b"El préstamo no está activo".into());
        }
        
        // Calcular el monto total a pagar (capital + interés)
        let interest_amount = (loan.amount * loan.interest_rate) / U256::from(10000);
        let total_amount = loan.amount + interest_amount;
        
        // Actualizar el monto pagado
        let new_paid = loan.paid_amount + payment;
        loan.paid_amount = new_paid;
        
        // Verificar si está completamente pagado
        if new_paid >= total_amount {
            loan.status = U256::from(2); // Paid
            
            // Reembolsar el exceso si hay
            if new_paid > total_amount {
                let excess = new_paid - total_amount;
                self.vm().transfer_eth(payer, excess)?;
                loan.paid_amount = total_amount;
            }
            
            // Transferir al prestamista
            self.vm().transfer_eth(loan.lender, total_amount)?;
        } else {
            // Si no está completamente pagado, guardar el pago parcial
            // El prestamista recibirá el pago cuando esté completo
            loan.paid_amount = new_paid;
        }
        
        self.loans.setter(loan_id).set(loan);
        Ok(())
    }

    /// Obtiene información de un préstamo
    pub fn get_loan(&self, loan_id: U256) -> Result<Loan, Vec<u8>> {
        let loan = self.loans.get(loan_id);
        if loan.creator == Address::ZERO {
            return Err(b"Préstamo no encontrado".into());
        }
        Ok(loan)
    }

    /// Obtiene el número total de préstamos
    pub fn get_loan_count(&self) -> Result<U256, Vec<u8>> {
        Ok(self.loan_count.get())
    }

    /// Verifica si un préstamo está vencido
    pub fn check_loan_default(&mut self, loan_id: U256) -> Result<bool, Vec<u8>> {
        let mut loan = self.loans.get(loan_id);
        if loan.creator == Address::ZERO {
            return Err(b"Préstamo no encontrado".into());
        }
        
        if loan.status == U256::from(1) { // Active
            let current_time = U256::from(self.vm().block_timestamp());
            if current_time > loan.due_date {
                loan.status = U256::from(3); // Defaulted
                self.loans.setter(loan_id).set(loan);
                return Ok(true);
            }
        }
        
        Ok(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_loan_creation() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = LoanContract::from(&vm);
        
        let community = Address::from(U256::from(1));
        contract.init(community).unwrap();
        
        // Test creación de préstamo
        let loan_id = contract.request_loan(
            U256::from(1000000000000000000u64), // 1 ETH
            U256::from(500), // 5%
            U256::from(30), // 30 días
            "Préstamo para proyecto creativo".to_string()
        ).unwrap();
        
        assert_eq!(loan_id, U256::ZERO);
    }
}
