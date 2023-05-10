import { where, query, getDocs, collection, addDoc, getDoc, doc, orderBy } from "firebase/firestore";
import db from "../db.js";
import ConversationService from "./ConversationService.js";
import UserService from "./UserService.js";

class MessageService {
    async getByConversationId(conversationId) {
        const q = query(collection(db, "messages"), where("conversationId", "==", conversationId), orderBy("time"));
        const response = await getDocs(q);
        const messagesData = response.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return messagesData;
    }

    async getById(id) {
        const docRef = doc(db, "messages", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error({ message: "Not Found", status: 404 });
        }
        const data = docSnap.data();
        return { ...data, id: docSnap.id };
    }

    async add(message) {
        const sender = await UserService.getUserById(message.senderId);
        const date = new Date().toISOString();
        const docRef = await addDoc(collection(db, "messages"), {
            ...message,
            firstName: sender.firstName,
            lastName: sender.lastName,
            time: date,
        });
        await ConversationService.update(message.conversationId, {
            lastMessage: { text: message.text, photo: message.photo },
            lastUpdateTime: date,
        });
        const messageData = await this.getById(docRef.id);
        return messageData;
    }
}

export default new MessageService();
