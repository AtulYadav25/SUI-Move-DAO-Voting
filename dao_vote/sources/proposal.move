module dao_voting::proposal;

use dao_voting::dao::{Self, DAO, ADMINCap};
use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::table::{Self, Table};

//ERROR CODES
const E_PROPOSAL_CLOSED: u64 = 0;
const E_ALREADY_VOTED: u64 = 1;

//Proposal Struct
public struct Proposal has key {
    id: UID,
    creator: address,
    title: String,
    description: String,
    yes_votes: u64,
    no_votes: u64,
    deadline: u64,
    is_closed: bool,
    voters: Table<address, bool>, // To prevent double voting
}

/// Event emitted when a vote is cast
public struct VoteEvent has copy, drop {
    proposal: ID,
    voter: address,
    vote_type: bool,
}

/// Event emitted when a proposal is created
public struct ProposalCreated has copy, drop {
    proposal: ID,
    creator: address,
}

//Anyone Can Create Proposal
public fun create_proposal(
    dao: &mut DAO,
    title: String,
    description: String,
    deadline: u64,
    admin_cap: &ADMINCap,
    ctx: &mut TxContext,
) {
    let admin = tx_context::sender(ctx);
    dao::assert_admin(dao, admin_cap, admin);

    //Creating the voters table
    let vote_table = table::new<address, bool>(ctx);

    //Creating Proposal
    let proposal = Proposal {
        id: object::new(ctx),
        creator: admin,
        title,
        description,
        yes_votes: 0,
        no_votes: 0,
        deadline,
        is_closed: false,
        voters: vote_table,
    };

    //Add Proposal in DAO
    dao::add_proposal(dao, object::uid_to_inner(&proposal.id));

    //Borrowing UID because after transfer the event fails to get id of the proposal
    let proposal_id = object::uid_to_inner(&proposal.id);

    transfer::share_object(proposal);

    event::emit(ProposalCreated {
        proposal: proposal_id,
        creator: admin,
    });
}

//Vote Yes or No on the shared proposal
public fun vote(dao: &DAO, proposal: &mut Proposal, vote_type: bool, clock: &Clock, ctx: &mut TxContext) {
    // 1. Ensure proposal is not closed
    assert!(!proposal.is_closed, E_PROPOSAL_CLOSED);

    // 2. Check deadline
    let now = clock.timestamp_ms();
    assert!(now < proposal.deadline, E_PROPOSAL_CLOSED);

    //Check if voter is a member
    let voter = tx_context::sender(ctx);
    dao::assert_member(dao, voter);

    //Checking if already voted
    let has_voted = table::contains(&proposal.voters, voter);

    assert!(!has_voted, E_ALREADY_VOTED);

    //Mark as voted
    table::add(&mut proposal.voters, voter, vote_type);

    if (vote_type == true) {
        proposal.yes_votes = proposal.yes_votes + 1;
    } else {
        proposal.no_votes = proposal.no_votes + 1;
    };

    event::emit(VoteEvent {
        proposal: object::uid_to_inner(&proposal.id),
        voter,
        vote_type,
    });
}

/// Close proposal after deadline
public fun close_proposal(proposal: &mut Proposal, clock: &Clock) {
    let now = clock.timestamp_ms();
    assert!(now >= proposal.deadline, 3);
    proposal.is_closed = true;
}
