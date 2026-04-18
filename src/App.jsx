
import React, { useEffect, useState } from 'react';
import LottieDefault from "lottie-react";
const Lottie = LottieDefault?.default || LottieDefault;
import deliveryAnimation from "./assets/delivery.json";
import socket, { emitLocationUpdate, joinRoom, listenForLocationUpdates } from "./socket";
import SideBar from './component/SideBar';
import Map from './component/Map';
import axios from 'axios';


const getRoomIdFromURL = () => {
    const match = window.location.pathname.match(/\/room\/(\w+)/);
    return match ? match[1] : null;
};

function App() {
    const [users, setUsers] = useState([]);
    const [roomId, setRoomId] = React.useState(getRoomIdFromURL());
    const [roomInput, setRoomInput] = React.useState("");
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 768); // Open by default on desktop
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
    const [copied, setCopied] = React.useState(false);
    const [loadingRoute, setLoadingRoute] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [routes, setRoutes] = React.useState(null);


    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (roomInput.trim()) {
            window.location.pathname = `/room/${encodeURIComponent(roomInput.trim())}`;
        }
    };

    useEffect(() => {
        const currentRoomId = getRoomIdFromURL();
        if (!currentRoomId) return;
        setRoomId(currentRoomId);
        joinRoom(currentRoomId);

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        const handleLocation = (position) => {
            const { latitude, longitude } = position.coords;
            emitLocationUpdate({ lat: latitude, lng: longitude });
        };

        const handleError = (error) => {
            alert("Location permission denied. Please allow location access to use this app.");
        };

        navigator.geolocation.getCurrentPosition(handleLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })

        listenForLocationUpdates(setUsers);
        return () => {
            socket.off("user-offline");
        };

    }, [window.location.pathname]);

    useEffect(() => {
        const fetchRoutes = async () => {
            if (!selectedUser) {
                setRoutes(null);
                setLoadingRoute(false);
                return;
            }
            const me = users.find(user => user.userId === socket.id);
            if (!me) return;
            setLoadingRoute(true);
            try {

                const res = await axios.post('http://localhost:4000/api/locations/route', {
                    start: { lat: me.lat, lng: me.lng },
                    end: { lat: selectedUser.lat, lng: selectedUser.lng }
                })
                setRoutes(res.data);
                setLoadingRoute(false);

            } catch (error) {
                setLoadingRoute(false);
                console.error("Error fetching route:", error);
            }
            setLoadingRoute(false);

        }

        fetchRoutes();
    }, [selectedUser, users]);

    const mySocketId = socket.id;
    const userWithMe = users.map(user => ({
        ...user,
        userId: user.userId || user.userid,
        isMe: (user.userId || user.userid) === mySocketId,
    }))


    if (!roomId) {
        return (
            <div className='min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-100 text-gray-800'>
                {/* ✅ FIXED: to-blur-100 → to-blue-100 */}

                {/* Header */}
                <header className='w-full bg-white shadow-md p-4 px-6 flex justify-between items-center'>
                    <h1 className='text-2xl font-bold text-gray-800'>Where-to-deliver</h1>
                </header>

                {/* Main Content */}
                <main className='flex-grow flex flex-col-reverse lg:flex-row items-center justify-between px-6 py-6 max-w-7xl mx-auto gap-12'>
                    {/* ✅ FIXED: added missing "flex" */}

                    <div className='w-full lg:w-1/2 space-y-8'>
                        <h2 className='text-4xl sm:text-5xl font-extrabold leading-tight'>
                            Real-time Location Sharing<br />
                            Map <span className='text-blue-600'>Easy & Fast</span>
                            {/* ✅ FIXED typo: deliever → deliver */}
                        </h2>

                        <p className='text-lg text-gray-600'>
                            where-to-deliver is a real-time location sharing app built with React and Socket.IO.
                            It allows users to share their location with friends and family in real-time.
                        </p>

                        <form onSubmit={handleCreateRoom} className='flex flex-col sm:flex-row gap-4'>
                            <input
                                type='text'
                                placeholder='Enter Room ID'
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value)}
                                className='flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                required
                            />

                            <button
                                type='submit'
                                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300'
                            >
                                Create/Join Room
                            </button>
                        </form>
                    </div>

                    <div className='w-full lg:w-1/2'>
                        <Lottie animationData={deliveryAnimation} loop />
                        {/* ✅ FIXED Lottie issue */}
                    </div>
                </main>

                {/* YouTube CTA Section */}
                <section id="tutorial" className="bg-white py-12 px-6 text-center shadow-inner">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-3xl font-bold mb-4">Want to Learn How It Works?</h3>
                        <p className="text-gray-600 mb-6">
                            Watch our full YouTube tutorial on building this feature in food delivery apps.
                        </p>
                        <a
                            href="https://www.youtube.com/@slr_tech"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                        >
                            📺YouTube
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full bg-gray-900 text-white py-8 px-6 mt-12">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm">
                            &copy; {new Date().getFullYear()} Where-To-Deliver | Built by Naashritha 🚀~
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0 text-sm">
                            <a href="#" className="hover:underline">Privacy Policy</a>
                            <a href="#" className="hover:underline">Terms</a>
                            <a href="#" className="hover:underline">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        );

    };

    const roomUrl = `${window.location.origin}/room/${encodeURIComponent(roomId)}`;
    return (
        <div className='relative flex flex-col h-screen overflow-hidden'>
            {/*Top bar*/}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-yellow-600 p-2 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between ">
                    <div className="flex items-center w-full md:w-auto">
                        {windowWidth < 768 && !isSidebarOpen && (
                            <button
                                className="md:hidden mr-3 bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/20 transition"
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label="Open sidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <h1 className="text-2xl font-bold">
                            Room:
                            <span className="ml-2 px-2 py-1 bg-white text-purple-700 rounded-md font-mono text-sm">
                                {roomId}
                            </span>
                            <span className="ml-3 text-sm font-normal">
                                👥 {users.length} users online
                            </span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-center self-center sm:flex-row items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        <div className="flex items-center w-full sm:w-auto max-w-md">
                            <input
                                type="text"
                                value={roomUrl}
                                readOnly
                                className="flex-1 border-none px-3 py-2 rounded-l-md text-sm text-gray-700 bg-white focus:outline-none"
                                onFocus={e => e.target.select()}
                            />
                            <button onClick={() => {
                                navigator.clipboard.writeText(roomUrl);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                            }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-md text-sm font-medium transition"
                                id="copyBtn"
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/*Main content*/}
            <div className="relative flex-1 flex overflow-hidden">
                {isSidebarOpen && (
                    <SideBar
                        users={userWithMe}
                        onSelectUser={setSelectedUser}
                        selectedUserId={selectedUser?.userId}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        windowWidth={windowWidth}
                    />
                )}
                <div className="flex-1 relative z-0 bg-gradient-to-br from-blue-50 to-purple-100">
                    {loadingRoute && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                        </div>
                    )}
                    <Map
                        users={userWithMe}
                        mySocketId={socket.id}
                        route={routes}
                        selectedUser={selectedUser}
                        selectedUserId={selectedUser?.userId}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;