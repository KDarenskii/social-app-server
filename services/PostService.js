import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
    limit,
    startAfter,
} from "firebase/firestore";
import FileService from "./FileService.js";
import UserService from "./UserService.js";
import db from "../db.js";

class PostService {
    async get(page, limitNumber, userId) {
        let response;
        const user = await UserService.getUserById(userId);
        if (page === 0) {
            const q = query(
                collection(db, "posts"),
                orderBy("date", "desc"),
                where("userId", "in", [...user.friends, user.id]),
                limit(limitNumber)
            );
            response = await getDocs(q);
        } else {
            const q = query(
                collection(db, "posts"),
                orderBy("date", "desc"),
                where("userId", "in", [...user.friends, user.id]),
                limit(page * limitNumber)
            );
            const firstResponse = await getDocs(q);
            if (firstResponse.empty) {
                return [];
            }
            const lastVisible = firstResponse.docs.at(-1);
            const nextQuery = query(
                collection(db, "posts"),
                orderBy("date", "desc"),
                startAfter(lastVisible),
                limit(limitNumber)
            );
            response = await getDocs(nextQuery);
        }
        if (response.empty) {
            return [];
        }
        const postsData = response.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return postsData;
    }

    async getById(id) {
        const docRef = doc(db, "posts", id);
        const response = await getDoc(docRef);
        if (!response.exists()) {
            throw new Error({ message: "Not Found", status: 404 });
        }
        const postData = response.data();
        return { ...postData, id: response.id };
    }

    async getByUserId(userId) {
        const q = query(collection(db, "posts"), where("userId", "==", userId), orderBy("date", "desc"));
        const response = await getDocs(q);
        if (!response.empty) {
            const postsData = response.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            return postsData;
        }
        return [];
    }

    async add(data, photo) {
        let fileName = null;
        if (photo) {
            fileName = FileService.save(photo, "/posts");
        }
        const response = await addDoc(collection(db, "posts"), {
            ...data,
            photoSrc: fileName,
            likes: [],
            date: new Date().toISOString(),
        });
        const postData = await this.getById(response.id);
        return postData;
    }

    async update(post) {
        const postRef = doc(db, "posts", post.id);
        const postData = { ...post };
        delete postData.id;
        await updateDoc(postRef, { ...postData });
    }

    async delete(id) {
        await deleteDoc(doc(db, "posts", id));
    }
}

export default new PostService();
