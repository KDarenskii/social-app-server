import { collection, addDoc, doc, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import jwt from "jsonwebtoken";
import db from "../db.js";
import ApiError from "../exceptions/ApiError.js";

class TokenService {
    generateTokens(data) {
        const accessToken = jwt.sign(data, process.env.SECRET_KEY_ACCESS_TOKEN, { expiresIn: "30m" });
        const refreshToken = jwt.sign(data, process.env.SECRET_KEY_REFRESH_TOKEN, { expiresIn: "60m" });
        return { accessToken, refreshToken };
    }

    async saveRefreshToken(userId, refreshToken) {
        const tokenResponse = await this.getByUserId(userId);

        if (tokenResponse) {
            const docRef = doc(db, "tokens", tokenResponse.id);
            return await updateDoc(docRef, { refreshToken });
        }

        await addDoc(collection(db, "tokens"), { userId, refreshToken });
    }

    async deleteToken(refreshToken) {
        const tokenResponse = await this.getByRefreshToken(refreshToken);
        const docRef = doc(db, "tokens", tokenResponse.id);
        await deleteDoc(docRef);
    }

    async getByRefreshToken(refreshToken) {
        const q = query(collection(db, "tokens"), where("refreshToken", "==", refreshToken));
        const tokensResponse = await getDocs(q);
        if (!tokensResponse.empty) {
            return { data: tokensResponse.docs[0].data(), id: tokensResponse.docs[0].id };
        }

        return null;
    }

    async getByUserId(userId) {
        const q = query(collection(db, "tokens"), where("userId", "==", userId));
        const tokensResponse = await getDocs(q);

        if (!tokensResponse.empty) {
            return { data: tokensResponse.docs[0].data(), id: tokensResponse.docs[0].id };
        }

        return null;
    }

    validateRefreshToken(refreshToken) {
        try {
            const userData = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
            return userData;
        } catch (error) {
            throw ApiError.UnauthenticatedError();
        }
    }

    validateAccessToken(accessToken) {
        try {
            const userData = jwt.verify(accessToken, process.env.SECRET_KEY_ACCESS_TOKEN);
            return userData;
        } catch (error) {
            throw ApiError.UnauthenticatedError();
        }
    }
}

export default new TokenService();
