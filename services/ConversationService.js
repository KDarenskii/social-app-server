import { where, query, getDocs, collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import UserService from "./UserService.js";
import db from "../db.js";

class ConversationService {
    async getByUserId(userId) {
        const q = query(collection(db, "conversations"), where("members", "array-contains", userId));
        const conversationsResponse = await getDocs(q);
        const conversationsData = conversationsResponse.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return conversationsData;
    }

    async getById(id) {
        const docRef = doc(db, "conversations", id);
        const response = await getDoc(docRef);
        if (!response.exists()) {
            throw new Error({ message: "Not Found", status: 404 });
        }
        const data = response.data();
        return { ...data, id: response.id };
    }

    async getByMembers({ userId, friendId }) {
        const q = query(collection(db, "conversations"), where("members", "array-contains", userId));
        const response = await getDocs(q);
        if (!response.empty) {
            const conversationDoc = response.docs.find((doc) => doc.data().members.includes(friendId));
            return conversationDoc ? { ...conversationDoc.data(), id: conversationDoc.id } : null;
        }
        return null;
    }

    async update(id, data) {
        const conversationRef = doc(db, "conversations", id);
        await updateDoc(conversationRef, { ...data });
        const conversationData = await this.getById(id);
        return conversationData;
    }

    async create({ userId, friendId }) {
        const docRef = await addDoc(collection(db, "conversations"), {
            members: [userId, friendId],
            lastMessage: null,
            lastUpdateTime: null,
        });
        const conversationData = await this.getById(docRef.id);
        return conversationData;
    }
}

export default new ConversationService();
