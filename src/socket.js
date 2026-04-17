import { io } from "socket.io-client";

const socket = io("http://localhost:4000")

export const joinRoom=(roomId)=>{
    socket.emit("join-room", roomId)
}

export const emitLocationUpdate=(location)=>{
    socket.emit("location-update", location)
}

export const listenForLocationUpdates=(callback)=>{
    socket.on("user-offline", callback)
}

export default socket;
