export interface User {
    ID: string;
    Username: string;
    Email: string;
    Password: string;
    Contact_Number: string;
    Created_On: string;
    Updated_On: string;
    Created_By: string;
    Updated_By: string;
}

export class UserLogin {
    branch_email: string;
    password: string;
}

