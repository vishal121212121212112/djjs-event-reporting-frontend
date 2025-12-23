export interface userListModel {
    id?: number;
    name: string;
    email: string;
    contact_number?: string;
    role_id: number;
    role?: {
        id: number;
        name: string;
        description?: string;
    };
    password?: string;
    token?: string;
    expired_on?: string;
    last_login_on?: string;
    first_login_on?: string;
    is_deleted?: boolean;
    created_on?: string;
    updated_on?: string;
    created_by?: string;
    updated_by?: string;
}