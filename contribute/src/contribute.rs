#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

use multiversx_sc::types::heap::String;

#[derive(ManagedVecItem, TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, Clone)]
pub struct Bounty<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub amount: BigUint<M>,
}

impl<M: ManagedTypeApi> Bounty<M> {
    pub fn new(
        address: ManagedAddress<M>,
        amount: BigUint<M>,
    ) -> Self {
        Bounty {
            address,
            amount,
        }
    }
}

#[multiversx_sc::contract]
pub trait Contribute {
    // Mapping git_ids to wallets
    #[view(getWallets)]
    #[storage_mapper("wallets")]
    fn wallets(&self, github_id: String) -> SingleValueMapper<ManagedAddress>;

    #[view(getIssueBounties)]
    #[storage_mapper("issue_bounties")]
    fn issue_bounties(&self, github_issue_id: String) -> SingleValueMapper<ManagedVec<Bounty<Self::Api>>>;

    #[init]
    fn init(&self) {}

    #[endpoint]
    fn register_user(&self, github_id: String) {
        let caller = self.blockchain().get_caller();
        self.wallets(github_id).set(caller);
    }


    #[endpoint]
    #[payable("EGLD")]
    fn add_bounty(&self, github_issue_id: String) {
        let payment_amount = self.call_value().egld_value();

        require!(
            payment_amount > 0,
            "Bounty payment has to be greater than 0!"
        );

        let bounty = Bounty::new(
            self.blockchain().get_caller(),
            BigUint::from(payment_amount)
        );

        let bounties_mapper = self.issue_bounties(github_issue_id);
        let mut bounties = if bounties_mapper.is_empty() {
            ManagedVec::new()
        } else {
            bounties_mapper.get()
        };

        bounties.push(bounty);
        bounties_mapper.set(&bounties);
    }

    #[endpoint]
    fn withdraw_bounty(&self, github_issue_id: String) {
        let caller = self.blockchain().get_caller();
        let bounties_mapper = self.issue_bounties(github_issue_id);

        require!(
            !bounties_mapper.is_empty(),
            "No bounties for this issue!"
        );

        let mut updated_bounties = ManagedVec::new();
        let mut sum = BigUint::zero();

        for bounty in bounties_mapper.get().iter() {
            if bounty.address != caller {
                updated_bounties.push(bounty);
            } else {
                sum = sum + bounty.amount;
            }
        }

        bounties_mapper.set(&updated_bounties);
        if sum > 0 {
            self.send().direct_egld(&caller, &sum);
        }
    }

    #[endpoint]
    fn grant_bounty(&self, github_id: String, github_issue_id: String) {
        let hunter_wallet = self.wallets(github_id).get();


        let bounties = self.issue_bounties(github_issue_id).get();
        let mut sum = BigUint::zero();

        for bounty in bounties.iter() {
            sum = sum + bounty.amount;
        }

        self.send().direct_egld(&hunter_wallet, &sum);
    }
}
