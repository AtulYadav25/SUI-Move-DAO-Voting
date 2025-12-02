#[test_only]
module dao_voting::dao_tests;

use dao_voting::dao::{Self, DAO, DAOCap, DAOList};
use std::string;
use sui::test_scenario;

#[test]
fun test_create_dao_list() {
    let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    test_scenario::next_tx(&mut scenario, owner);

    let ctx = test_scenario::ctx(&mut scenario);

    dao::create_dao_list(
        ctx,
    );

    test_scenario::end(scenario);
}

#[test]
fun test_create_dao() {
    let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    test_scenario::next_tx(&mut scenario, owner);

    let ctx01 = test_scenario::ctx(&mut scenario);

    dao::create_dao_list(
        ctx01,
    );

    test_scenario::next_tx(&mut scenario, owner);

    let mut daoList_object = test_scenario::take_shared<DAOList>(&scenario);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        &mut daoList_object,
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );

    test_scenario::return_shared(daoList_object);
    test_scenario::end(scenario);
}

#[test]
fun test_add_and_remove_member() {
    let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    test_scenario::next_tx(&mut scenario, owner);
    //Transaction 00
    let ctx01 = test_scenario::ctx(&mut scenario);

    dao::create_dao_list(
        ctx01,
    );

    test_scenario::next_tx(&mut scenario, owner);

    // --- Transaction 01: Create the DAO ---
    let mut daoList_object = test_scenario::take_shared<DAOList>(&scenario);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        &mut daoList_object,
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );

    test_scenario::return_shared(daoList_object);
    // --- Transaction 2: Load the DAO and mutate it ---
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
    test_scenario::next_tx(&mut scenario, owner);

    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let daoCap_object = test_scenario::take_from_address<DAOCap>(&scenario, owner);

    dao::remove_member(
        &mut dao_object,
        &daoCap_object,
        newAdmin,
    );

    // Return objects
    test_scenario::return_shared(dao_object);
    test_scenario::return_to_address(owner, daoCap_object);

    test_scenario::end(scenario);
}

#[test]

fun test_transfer_dao_ownership() {
    let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    test_scenario::next_tx(&mut scenario, owner);
    //Transaction 00
    let ctx01 = test_scenario::ctx(&mut scenario);

    dao::create_dao_list(
        ctx01,
    );

    test_scenario::next_tx(&mut scenario, owner);

    // --- Transaction 01: Create the DAO ---
    let mut daoList_object = test_scenario::take_shared<DAOList>(&scenario);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        &mut daoList_object,
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );
    
    test_scenario::return_shared(daoList_object);
    // --- Transaction 2: Getting Objects from inventory of global and account
    test_scenario::next_tx(&mut scenario, owner);

    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);
    let daoCap_object = test_scenario::take_from_address<DAOCap>(&scenario, owner);

    let newOwner = @0xB;
    dao::transfer_dao_ownership(
        &mut dao_object,
        daoCap_object,
        newOwner,
    );

    // Return objects
    test_scenario::return_shared(dao_object);

    test_scenario::end(scenario);
}

#[test]
fun test_add_member() {
    let owner = @0xA;

    let mut scenario = test_scenario::begin(owner);

    test_scenario::next_tx(&mut scenario, owner);
    //Transaction 00
    let ctx01 = test_scenario::ctx(&mut scenario);

    dao::create_dao_list(
        ctx01,
    );

    test_scenario::next_tx(&mut scenario, owner);

    // --- Transaction 01: Create the DAO ---
    let mut daoList_object = test_scenario::take_shared<DAOList>(&scenario);
    let ctx1 = test_scenario::ctx(&mut scenario);

    dao::create_dao(
        &mut daoList_object,
        string::utf8(b"My DAO"),
        string::utf8(b"This is a test"),
        ctx1,
    );
    
    test_scenario::return_shared(daoList_object);
    //New Transaction
    let new_member = @0xB;
    test_scenario::next_tx(&mut scenario, new_member);

    let mut dao_object = test_scenario::take_shared<DAO>(&scenario);

    dao::add_member(
        &mut dao_object,
        new_member
    );

    // Return objects
    test_scenario::return_shared(dao_object);

    test_scenario::end(scenario);
}
