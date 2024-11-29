export class User {
    id: Number;
    name: String;
    email: String;
    email_verified_at?: String;

    constructor(id: Number, name: String, email: String, email_verified_at?: String) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.email_verified_at = email_verified_at;
    }
}