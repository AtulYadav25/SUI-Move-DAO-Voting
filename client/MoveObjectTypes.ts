// types/sui.ts
export type MoveObjectFields = Record<string, any>;


// Generic type guard for Move objects
export function isMoveObject<T>(
    data: any
): data is SuiMoveObject<T> {
    return data?.dataType === "moveObject" && typeof data?.fields === "object";
}



// types/sui.ts
export interface SuiMoveObject<T extends Record<string, any> = Record<string, any>> {
    dataType: "moveObject";
    type: string;
    fields: T;
    hasPublicTransfer: boolean;
    owner: {
        AddressOwner: string;
    } | {
        ObjectOwner: string;
    } | {
        Shared: {
            initial_shared_version: number;
        };
    } | {
        Immutable: true;
    };
}


//FOR DAO_LIST MOVE OBJECT

export interface TableFields {
    id: {
        id: string;
    };
    size: string;  // Move returns size as string
}

export interface MoveTable {
    type: string; // full table type, example: `0x2::table::Table<address, bool>`
    fields: TableFields;
}


// ------------- DAO FIELDS -------------

export interface DAOFields {
    id: {            // The object field is NOT a string
        id: string;
    };
    name: string;
    description: string;

    admins: MoveTable;      // Table<address, bool>
    members: MoveTable;     // Table<address, bool>
    proposals: MoveTable;   // Table<ID, bool>
}


// ------------- DAO OBJECT -------------

export type DAO_Object = SuiMoveObject<DAOFields>;


// ------------- DAO LIST -------------

export interface DAOListFields {
    dao_list: string[];
}

export type DAOListObject = SuiMoveObject<DAOListFields>;
