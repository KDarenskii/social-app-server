import { where, query, getDocs, collection, addDoc, getDoc, doc, deleteDoc } from "firebase/firestore";
import db from "../db.js";

class NotificationService {
    async getById(id) {
        const docRef = doc(db, "notifications", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error({ message: "Not Found", status: 404 });
        }
        const data = docSnap.data();
        return { ...data, id: docSnap.id };
    }

    async getByUserId(userId) {
        const q = query(collection(db, "notifications"), where("userId", "==", userId));
        const response = await getDocs(q);
        if (!response.empty) {
            const notificationsData = response.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            return notificationsData;
        }
        return [];
    }

    async add(body) {
        const docRef = await addDoc(collection(db, "notifications"), {
            ...body,
            date: new Date().toISOString(),
        });
        const notificationData = await this.getById(docRef.id);
        return notificationData;
    }

    async remove(id) {
        const docRef = doc(db, "notifications", id);
        await deleteDoc(docRef);
    }

    async removeAll(userId) {
        const q = query(collection(db, "notifications"), where("userId", "==", userId));
        const response = await getDocs(q);
        if (!response.empty) {
            const promises = response.docs.map((noticeDoc) => this.remove(noticeDoc.id));
            await Promise.all([...promises]);
        }
    }
}

export default new NotificationService();
