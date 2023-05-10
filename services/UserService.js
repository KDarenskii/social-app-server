import {
    where,
    query,
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import bcrypt from "bcrypt";
import db from "../db.js";
import User from "../models/User.js";
import TokenService from "./TokenService.js";
import UserDto from "../dtos/userDto.js";
import ApiError from "../exceptions/ApiError.js";
import { ROLES } from "../constants/roles.js";
import FileService from "./FileService.js";

class UserService {
    async registration(firstName, lastName, email, password) {
        const candidate = await this.getFullUserByEmail(email);
        if (candidate) {
            throw ApiError.BadRequest(`User with email: ${email} is already existing`);
        }

        const hashedPassword = await bcrypt.hash(password, 3);

        const userResponse = await addDoc(collection(db, "users"), {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: [ROLES.USER],
            friends: [],
            requests: [],
            followings: [],
            status: null,
            city: null,
            birthdate: null,
            studiedAt: null,
            photo: null,
        });

        const userDto = new UserDto({
            firstName,
            lastName,
            id: userResponse.id,
            email,
            roles: [ROLES.USER],
            friends: [],
            requests: [],
            followings: [],
            status: "",
            city: "",
            birthdate: "",
            studiedAt: "",
            photo: "",
        });

        const tokens = await this.generateAndSaveTokens({ ...userDto });

        return { ...tokens, user: userDto };
    }

    async login(email, password) {
        const user = await this.getFullUserByEmail(email);
        if (!user) {
            throw ApiError.BadRequest(`Not found user with email: ${email}`);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw ApiError.BadRequest("Incorrect password");
        }

        const userDto = new UserDto(user);

        const tokens = await this.generateAndSaveTokens({ ...userDto });

        return { ...tokens, user: userDto };
    }

    async logout(refreshToken) {
        await TokenService.deleteToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthenticatedError();
        }

        const tokenResponse = await TokenService.getByRefreshToken(refreshToken);
        const isRefreshTokenValid = TokenService.validateRefreshToken(refreshToken);

        if (!tokenResponse || !isRefreshTokenValid) {
            throw ApiError.UnauthenticatedError();
        }

        const user = await this.getFullUserById(tokenResponse.data.userId);
        const userDto = new UserDto({ ...user });

        const tokens = await this.generateAndSaveTokens({ ...userDto });

        return { ...tokens, user: userDto };
    }

    async getFullUserByEmail(email) {
        const q = query(collection(db, "users"), where("email", "==", email));
        const userResponse = await getDocs(q);
        if (!userResponse.empty) {
            return { ...userResponse.docs[0].data(), id: userResponse.docs[0].id };
        }
        return null;
    }

    async getFullUserById(userId) {
        const docRef = doc(db, "users", userId);
        const userResponse = await getDoc(docRef);

        if (userResponse.exists()) {
            return { ...userResponse.data(), id: userResponse.id };
        }

        return null;
    }

    async getUserById(userId) {
        const docRef = doc(db, "users", userId);
        const userResponse = await getDoc(docRef);

        if (userResponse.exists()) {
            const {
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
            } = userResponse.data();
            const user = new User(
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
                userResponse.id
            );
            const userDto = new UserDto({ ...user });
            return userDto;
        }

        return null;
    }

    async generateAndSaveTokens(payload) {
        const tokens = TokenService.generateTokens(payload);
        await TokenService.saveRefreshToken(payload.id, tokens.refreshToken);
        return tokens;
    }

    async getUsers(search) {
        const response = await getDocs(collection(db, "users"));
        let usersDocs = response.docs;
        if (search) {
            usersDocs = response.docs.filter(
                (doc) =>
                    doc.data().firstName.toLowerCase().includes(search.toLowerCase()) ||
                    doc.data().lastName.toLowerCase().includes(search.toLowerCase())
            );
        }
        const usersData = usersDocs.map((doc) => {
            const userDto = new UserDto({ ...doc.data(), id: doc.id });
            return userDto;
        });
        return usersData;
    }

    async getFriends(userId, limit) {
        const user = await this.getUserById(userId);
        let promises = [];
        if (limit) {
            promises = user.friends.slice(0, parseInt(limit)).map((friend) => this.getUserById(friend));
        } else {
            promises = user.friends.map((friend) => this.getUserById(friend));
        }
        const friends = await Promise.all([...promises]);
        return friends;
    }

    async addFriend(userId, friendId) {
        const userRef = doc(db, "users", userId);
        const friendRef = doc(db, "users", friendId);
        const userPromise = updateDoc(userRef, { friends: arrayUnion(friendId), requests: arrayRemove(friendId) });
        const friendPromise = updateDoc(friendRef, { friends: arrayUnion(userId), followings: arrayRemove(userId) });
        await Promise.all([userPromise, friendPromise]);
    }

    async removeFriend(userId, friendId) {
        const userRef = doc(db, "users", userId);
        const friendRef = doc(db, "users", friendId);
        const userPromise = updateDoc(userRef, { friends: arrayRemove(friendId) });
        const friendPromise = updateDoc(friendRef, { friends: arrayRemove(userId) });
        await Promise.all([userPromise, friendPromise]);
    }

    async update(userId, userChanges, photo) {
        let fileName = null;
        if (photo) {
            fileName = FileService.save(photo, "/users");
        }
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { ...userChanges, photo: fileName });
        const userData = await this.getUserById(userId);
        return userData;
    }

    async follow(userId, followId) {
        const userRef = doc(db, "users", userId);
        const followRef = doc(db, "users", followId);
        const userPromise = updateDoc(userRef, { followings: arrayUnion(followId) });
        const followPromise = updateDoc(followRef, { requests: arrayUnion(userId) });
        await Promise.all([userPromise, followPromise]);
    }

    async unfollow(userId, unfollowId) {
        const userRef = doc(db, "users", userId);
        const followRef = doc(db, "users", unfollowId);
        const userPromise = updateDoc(userRef, { followings: arrayRemove(unfollowId) });
        const followPromise = updateDoc(followRef, { requests: arrayRemove(userId) });
        await Promise.all([userPromise, followPromise]);
    }

    async getFollowings(userId) {
        const user = await this.getUserById(userId);
        const promises = user.followings.map((following) => this.getUserById(following));
        const followings = await Promise.all([...promises]);
        return followings;
    }

    async getRequests(userId) {
        const user = await this.getUserById(userId);
        const promises = user.requests.map((request) => this.getUserById(request));
        const requests = await Promise.all([...promises]);
        return requests;
    }

    async removeRequest(userId, requestId) {
        const userRef = doc(db, "users", userId);
        const requestUserRef = doc(db, "users", requestId);
        const requestPromise = updateDoc(requestUserRef, { followings: arrayRemove(userId) });
        const userPromise = updateDoc(userRef, { requests: arrayRemove(requestId) });
        await Promise.all([requestPromise, userPromise]);
    }
}

export default new UserService();
