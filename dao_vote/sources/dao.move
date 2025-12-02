module dao_voting::dao;

use std::string::String;
use sui::event;
use sui::table::{Self, Table};

//ERROR CODES

const E_NOT_OWNER: u64 = 100;
const E_ALREADY_JOINED_DAO: u64 = 200;
const E_ALREADY_MEMBER: u64 = 300;
const E_NOT_ADMIN: u64 = 400;
const E_NOT_MEMBER: u64 = 500;

//Structs
public struct DAOList has key {
    id: UID,
    dao_list: vector<ID>,
}

public struct DAO has key {
    id: UID,
    name: String,
    description: String,
    admins: Table<address, bool>,
    members: Table<address, bool>,
    proposals: Table<ID, bool>,
}

public struct DAOCap has key {
    id: UID,
    dao_id: ID,
}

public struct ADMINCap has key {
    id: UID,
    dao_id: ID,
}

//Events
public struct MemberJoinedEvent has copy, drop {
    member: address,
    dao_id: ID,
}

public struct AdminAddedEvent has copy, drop {
    admin: address,
    dao_id: ID,
}

public struct MemberRemovedEvent has copy, drop {
    member: address,
    dao_id: ID,
}

public struct DaoNewOwnerEvent has copy, drop {
    new_owner: address,
    dao_id: ID,
}

public fun create_dao(
    dao_list: &mut DAOList,
    name: String,
    description: String,
    ctx: &mut TxContext,
): ID {
    let owner = tx_context::sender(ctx);

    //Listing Admins
    let admins = table::new<address, bool>(ctx);

    //Listing Members
    let members = table::new<address, bool>(ctx);

    let proposals = table::new<ID, bool>(ctx);

    let dao = DAO {
        id: object::new(ctx),
        name,
        description,
        admins,
        members,
        proposals,
    };

    let dao_id = object::uid_to_inner(&dao.id);

    vector::push_back(&mut dao_list.dao_list, dao_id);

    // Create the DAO capability for creator
    let cap = DAOCap {
        id: object::new(ctx),
        dao_id,
    };

    // Share DAO
    transfer::share_object(dao);

    // Give DAO capability to creator
    transfer::transfer(cap, owner);

    dao_id
}

//Access Helpers Function

//Only Admin Validation
public fun assert_owner(dao: &DAO, dao_cap: &DAOCap) {
    assert!(&object::uid_to_inner(&dao.id) == &dao_cap.dao_id, E_NOT_OWNER);
}

public fun assert_admin(dao: &DAO, admin_cap: &ADMINCap, admin: address) {
    assert!(&object::uid_to_inner(&dao.id) == admin_cap.dao_id, E_NOT_OWNER);

    let is_admin = table::contains(&dao.admins, admin);
    assert!(is_admin, E_NOT_ADMIN);
}

public fun assert_member(dao: &DAO, member: address) {
    let is_member = table::contains(&dao.members, member);
    assert!(is_member, E_NOT_MEMBER);
}

//Member Functions
public fun add_member(dao: &mut DAO, member: address) {
    let new_member = member;

    //Check if already joined
    let has_joined = table::contains(&dao.members, new_member);
    assert!(!has_joined, E_ALREADY_JOINED_DAO);

    table::add(&mut dao.members, new_member, true);

    event::emit(MemberJoinedEvent {
        member: new_member,
        dao_id: object::uid_to_inner(&dao.id),
    });
}

//Admin Management Functions (Only Owner Can Call)
public fun add_admin(dao: &mut DAO, dao_cap: &DAOCap, admin: address, ctx: &mut TxContext) {
    //Check owner
    assert_owner(dao, dao_cap);

    //Check if member already exists
    let has_joined = table::contains(&dao.admins, admin);
    assert!(!has_joined, E_ALREADY_MEMBER);

    table::add(&mut dao.admins, admin, true);

    let has_joined_as_member = table::contains(&dao.members, admin);
    if (!has_joined_as_member) {
        table::add(&mut dao.members, admin, true);
    };
    let admin_cap = ADMINCap {
        id: object::new(ctx),
        dao_id: object::uid_to_inner(&dao.id),
    };

    transfer::transfer(admin_cap, admin);

    event::emit(AdminAddedEvent {
        admin: admin,
        dao_id: object::uid_to_inner(&dao.id),
    })
}

public fun remove_member(dao: &mut DAO, dao_cap: &DAOCap, member: address) {
    //Check owner
    assert_owner(dao, dao_cap);

    if (table::contains(&dao.admins, member)) {
        table::remove(&mut dao.admins, member);
    };
    table::remove(&mut dao.members, member);

    event::emit(MemberRemovedEvent {
        member,
        dao_id: object::uid_to_inner(&dao.id),
    })
}

public fun transfer_dao_ownership(dao: &mut DAO, dao_cap: DAOCap, new_owner: address) {
    assert_owner(dao, &dao_cap);

    transfer::transfer(dao_cap, new_owner);

    event::emit(DaoNewOwnerEvent {
        new_owner,
        dao_id: object::uid_to_inner(&dao.id),
    });
}

//Proposal Registery
public(package) fun add_proposal(dao: &mut DAO, proposal_id: ID) {
    //Add Proposal To DAO Proposals
    table::add(&mut dao.proposals, proposal_id, true);
}

//One Time Call Function
public fun create_dao_list(ctx: &mut TxContext) {
    let dao_list = DAOList {
        id: object::new(ctx),
        dao_list: vector::empty<ID>(),
    };

    transfer::share_object(dao_list);
}
