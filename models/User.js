export default class User {
    constructor(
        firstName,
        lastName,
        email,
        password,
        roles,
        friends,
        requests,
        followings,
        status,
        city,
        birthdate,
        studiedAt,
        photo,
        id
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.friends = friends;
        this.requests = requests;
        this.followings = followings;
        this.status = status;
        this.city = city;
        this.birthdate = birthdate;
        this.studiedAt = studiedAt;
        this.photo = photo;
        this.id = id;
    }
}
