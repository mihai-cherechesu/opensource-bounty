#![no_std]

elrond_wasm::imports!();
use elrond_wasm::types::heap::String;

#[derive(ManagedVecItem, NestedEncode, NestedDecode, TypeAbi)]
pub struct Bounty<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub amount: BigUint,
}

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

    // #[endpoint]
    // #[payable("EGLD")]
    // fn fund_issue(&self, git_id: String) {
        
    // }

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
    fn withdraw_bounty(&self, issue_id: String, git_id: String, amount: BigUint) {
        // Check if caller is also issuer of issue (in github actions)
        let wallet = self.blockchain().get_caller();
        let bounty = self.issue_bounties().get(&issue_id);
        
        require!(
            wallet.is_some() && bounty.is_some(),
            "Missing wallet for cancellation or bounty from issue"
        );

        let wallet = wallet.unwrap();
        let bounty = bounty.unwrap();

        // Check caller is a funder for this issue
        let issue_funders = self.issue_funders().get(&issue_id);

        require!(
            issue_funders.is_some(),
            "No funders for this issue"
        );

        let issue_funders = issue_funders.unwrap();
        let funder_bounty = issue_funders.get(&git_id);

        require!(
            funder_bounty.is_some(),
            "The caller is not a funder"
        );

        require!(
            funder_bounty >= amount,
            "The withdraw amount is bigger than the available bounty fund"
        );
        
        // Remove amount from the issue bounty
        issue_funders.insert(&git_id, funder_bounty - &amount);

        // Remove amount from the total bounty (sum of all bounties from all funders)
        self.issue_bounties().insert(&issue_id, bounty - &amount);

        // Add bounty back to the issuer funds
        let available_fund = self.issuer_funds().get(&git_id);
        require!(available_fund.is_some(), "Caller is not a funder!");
        self.issuer_funds().insert(git_id, available_fund.unwrap() + &amount);
    }
    
    #[endpoint]
    fn withdraw_fund(&self, git_id: String, amount: BigUint) {
        let wallet = self.blockchain().get_caller();
        let available_fund = self.issuer_funds().get(&git_id);

        require!(
            wallet.is_some() && available_fund.is_some(),
            "Caller is not an issue funder!"
        );

        require!(
            available_fund.unwrap() >= amount,
            "Available fund not sufficient for withdraw!"
        );

        // Remove amount from issuer funds
        self.issuer_funds().insert(git_id, available_fund.unwrap() - &amount);

        // Send the amount back to the issuer wallet
        self.send().direct_egld(&wallet, &amount);
    }

    #[view(getIssueBounties)]
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

    // issue_id -> {funder_id_1: amount_1, funder_id_2: amount_2, ...}
    #[view(getIssueFunders)]
    #[storage_mapper("issue_funders")]
    fn issue_funders(&self) -> MapMapper<String, MapMapper<String, BigUint>>;

    #[view(getDistributionRules)]
    #[storage_mapper("distributionRules")]
    fn distribution_rules(&self, issue_id: u64) -> SingleValueMapper<ManagedVec<Bounty<Self::Api>>>;

    #[event("update")]
    fn update_event(    
        &self,
        #[indexed] from: &ManagedAddress,
        updated: (BigUint, BigUint),
    );
}