import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { PORT, CLIENT_URL } from "./config.js";
import userRouter from "./router/userRouter.js";
import messageRouter from "./router/messageRouter.js";
import conversationRouter from "./router/conversationRouter.js";
import notificationRouter from "./router/notificationRouter.js";
import postRouter from "./router/postRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import fileUpload from "express-fileupload";

const app = express();

app.use(express.json());
app.use(express.static("static"));
app.use(fileUpload());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: CLIENT_URL,
    })
);
app.use("/api", userRouter);
app.use("/api", messageRouter);
app.use("/api", conversationRouter);
app.use("/api", notificationRouter);
app.use("/api", postRouter);
app.use(errorMiddleware);

const startApp = async () => {
    try {
        app.listen(PORT, () => console.log("SERVER STARTED ON PORT: " + PORT));
    } catch (error) {
        console.log(error);
    }
};

startApp();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

const addUser = ({ userId, socketId }) => {
    const user = users.find((user) => user.id === userId);
    if (!user) {
        users.push({ id: userId, socketId });
    }
};

const getUser = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user;
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
    io.emit("getOnlineUsers", users);

    socket.on("addUser", (userId) => {
        console.log("After connection: ");
        addUser({ userId, socketId: socket.id });
        console.log(users);
        io.emit("getOnlineUsers", users);
    });

    socket.on("sendOnlineUsers", () => {
        io.emit("getOnlineUsers", users);
    });

    socket.on("sendFriend", (sender, friend) => {
        const senderSocket = getUser(sender.id);
        const friendSocket = getUser(friend.id);
        if (senderSocket && friendSocket) {
            io.to(senderSocket.socketId).emit("addFriend", friend);
            io.to(friendSocket.socketId).emit("addFriend", sender);
        }
    });

    socket.on("removeFriend", (sender, friendId) => {
        const friendSocket = getUser(friendId);
        if (friendSocket) {
            io.to(friendSocket.socketId).emit("removeFriend", sender);
        }
    });

    socket.on("sendRequest", (senderId, receiverId) => {
        const receiverSocket = getUser(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket.socketId).emit("addRequest", senderId);
        }
    });

    socket.on("removeRequest", (senderId, receiverId) => {
        const receiver = getUser(receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("removeRequest", senderId);
        }
    });

    socket.on("sendMessage", (message) => {
        const receiver = getUser(message.receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit("getMessage", message);
        }
    });

    socket.on("sendNotification", (notification) => {
        const receiver = getUser(notification.userId);
        if (receiver) {
            io.to(receiver.socketId).emit("getNotification", notification);
        }
    });

    socket.on("sendLike", (senderId, post) => {
        socket.broadcast.emit("getLike", senderId, post);
    });

    socket.on("disconnect", () => {
        removeUser(socket.id);
        console.log("After disconnection: ");
        console.log(users);
        io.emit("getOnlineUsers", users);
    });
});

httpServer.listen(9000);
