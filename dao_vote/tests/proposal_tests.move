#[test_only]
module dao_voting::proposal_tests;

use dao_voting::dao::{Self, DAO, DAOCap, ADMINCap};
use dao_voting::proposal::{Self, Proposal};
use std::string;
use sui::test_scenario;
use sui::clock;
use sui::clock::set_for_testing;


#[test]
fun test_create_proposal() {
     let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    // --- Transaction 1: Create the DAO ---
    test_scenario::next_tx(&mut scenario, owner);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );

    // --- Transaction 2: Add Admin (Myself)
    test_scenario::next_tx(&mut scenario, owner);

    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let daoCap_object = test_scenario::take_from_address<DAOCap>(&scenario, owner);

    let ctx2 = test_scenario::ctx(&mut scenario);

    let newAdmin = @0xB;

    dao::add_admin(
        &mut dao_object,
        &daoCap_object,
        newAdmin,
        ctx2,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(owner, daoCap_object);

    // --- Transaction 3: Load the DAO and mutate it ---
    test_scenario::next_tx(&mut scenario, newAdmin);
    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let adminCap_object = test_scenario::take_from_address<ADMINCap>(&scenario, newAdmin);
    let ctx3 = test_scenario::ctx(&mut scenario);

    proposal::create_proposal(
        &mut dao_object,
        string::utf8(b"My New Proposal"),
        string::utf8(b"This is a test proposal"),
        1000000,
        &adminCap_object,
        ctx3,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(newAdmin, adminCap_object);


    test_scenario::end(scenario);
}


#[test]
fun test_vote_proposal() {
     let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    // --- Transaction 1: Create the DAO ---
    test_scenario::next_tx(&mut scenario, owner);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );

    // --- Transaction 2: Add Admin (Myself)
    test_scenario::next_tx(&mut scenario, owner);

    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let daoCap_object = test_scenario::take_from_address<DAOCap>(&scenario, owner);

    let ctx2 = test_scenario::ctx(&mut scenario);

    let newAdmin = @0xB;

    dao::add_admin(
        &mut dao_object,
        &daoCap_object,
        newAdmin,
        ctx2,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(owner, daoCap_object);

    // --- Transaction 3: Load the DAO and mutate it ---
    test_scenario::next_tx(&mut scenario, newAdmin);
    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let adminCap_object = test_scenario::take_from_address<ADMINCap>(&scenario, newAdmin);
    let ctx3 = test_scenario::ctx(&mut scenario);

    proposal::create_proposal(
        &mut dao_object,
        string::utf8(b"My New Proposal"),
        string::utf8(b"This is a test proposal"),
        1000000,
        &adminCap_object,
        ctx3,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(newAdmin, adminCap_object);



    // --- Transaction 4:
    test_scenario::next_tx(&mut scenario, newAdmin);
    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let adminCap_object = test_scenario::take_from_address<ADMINCap>(&scenario, newAdmin);
    let ctx3 = test_scenario::ctx(&mut scenario);

    proposal::create_proposal(
        &mut dao_object,
        string::utf8(b"My New Proposal"),
        string::utf8(b"This is a test proposal"),
        100000000,
        &adminCap_object,
        ctx3,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(newAdmin, adminCap_object);

    //Transaction 5
    let newMember = @0xC;
    test_scenario::next_tx(&mut scenario, newMember);
    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let ctx5 = test_scenario::ctx(&mut scenario);

    dao::join_dao(
        &mut dao_object,
        ctx5,
    );

    test_scenario::return_shared(dao_object);

    //Transaction 6
    test_scenario::next_tx(&mut scenario, newMember);
    let dao_object = test_scenario::take_shared<DAO>(&scenario);
    let mut proposal_object = test_scenario::take_shared<Proposal>(&scenario);
    
    let ctx6 = test_scenario::ctx(&mut scenario);
    let mut clock = clock::create_for_testing(ctx6);

    clock::set_for_testing(&mut clock, 1000);

    proposal::vote(
        &dao_object,
        &mut proposal_object,
        true,
        &clock,
        ctx6
    );
    
    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_shared(proposal_object);
    clock::destroy_for_testing(clock);

    test_scenario::end(scenario);
}

