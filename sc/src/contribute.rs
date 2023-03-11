#![no_std]

elrond_wasm::imports!();
use elrond_wasm::types::heap::String;

#[elrond_wasm::derive::contract]
pub trait Contribute {
    #[init]
    fn init(&self) {}

    #[endpoint]
    #[payable("EGLD")]
    fn fund_issuer(&self, git_id: String) {
        // Save issuer wallet
        let caller = self.blockchain().get_caller();
        self.issuer_wallets().insert(git_id.clone(), caller);

        let mut payment_amount = self.call_value().egld_value();
        require!(
            payment_amount > 0,
            "Registration fee is incorrect; please check and try again"
        );

        // Check if issuer already exists
        let available_fund = self.issuer_funds().get(&git_id);
        if available_fund.is_some() {
            payment_amount += available_fund.unwrap();
        }
        
        self.issuer_funds().insert(git_id, BigUint::from(payment_amount));
    }

    #[endpoint]
    fn register_issue(&self, issue_id: String, git_id: String, bounty: BigUint) {
        let available_fund = self.issuer_funds().get(&git_id);
        require!(
            available_fund.is_some(),
            "Missing available fund"
        );
        let available_fund = available_fund.unwrap();

        require!(available_fund >= bounty, "Not enough funds!");
        self.issuer_funds().insert(git_id, available_fund - &bounty);

        self.issue_bounties().insert(issue_id, bounty);
    }

    #[endpoint]
    fn register_hunter(&self, git_id: String) {
        let caller = self.blockchain().get_caller();
        self.hunter_wallets().insert(git_id, caller);
    }

    #[endpoint]
    fn claim_bounty(&self, issue_id: String, hunter_git_id: String) {
        let hunter = self.hunter_wallets().get(&hunter_git_id);
        let bounty = self.issue_bounties().get(&issue_id);

        require!(
            hunter.is_some() && bounty.is_some(),
            "Missing claiming wallet or bounty"
        );
        
        let hunter = hunter.unwrap();
        let bounty = bounty.unwrap();

        self.send().direct_egld(&hunter, &bounty);
    }

    #[endpoint]
    fn claim_fund(&self, git_id: String) {
        let wallet = self.issuer_wallets().get(&git_id);
        require!(
            wallet.is_some(),
            "Missing claiming wallet"
        );
        let wallet = wallet.unwrap();

        let available_fund = self.issuer_funds().get(&git_id);
        require!(
            available_fund.is_some(),
            "Missing available fund"
        );
        let available_fund = available_fund.unwrap();

        self.send().direct_egld(&wallet, &available_fund);
    }

    #[view(getIssuebounties)]
    #[storage_mapper("issue_bounties")]
    fn issue_bounties(&self) -> MapMapper<String, BigUint>;

    #[view(getIssuerFunds)]
    #[storage_mapper("issuer_funds")]
    fn issuer_funds(&self) -> MapMapper<String, BigUint>;

    #[view(getIssuerWallets)]
    #[storage_mapper("issuer_wallets")]
    fn issuer_wallets(&self) -> MapMapper<String, ManagedAddress>;

    #[view(getHunterWallets)]
    #[storage_mapper("hunter_wallets")]
    fn hunter_wallets(&self) -> MapMapper<String, ManagedAddress>;

    #[event("update")]
    fn update_event(
        &self,
        #[indexed] from: &ManagedAddress,
        updated: (BigUint, BigUint),
    );
}