import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useEnv } from '~/root.tsx';

const context = createContext<{ socket: Socket | null }>({ socket: null });

export const useSocket = () => {
	return useContext(context);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	const [socket, setSocket] = useState<Socket | null>();
	const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
	const env = useEnv();
	useEffect(() => {
		const createdSocket = io(env.WEBSOCKET_URL);
		setSocket(createdSocket);
		if (!createdSocket) return;

		createdSocket.emit('connection');

		const handleConfirmation = () => {
			setIsSocketConnected(true);
		};

		const handleDisconnect = () => {
			setIsSocketConnected(false);
		};
		createdSocket.on('confirmation', handleConfirmation);

		createdSocket.on('disconnect', handleDisconnect);

		return () => {
			createdSocket.off('confirmation', handleConfirmation);
			createdSocket.off('disconnect', handleDisconnect);
		};
	}, []);
	return (
		<context.Provider
			value={{
				// Désactiver l'avertissement typescript
				socket: socket ?? null,
			}}
		>
			<span className='fixed top-0 right-0'>
				{isSocketConnected ? '🟢' : '🔴'}
			</span>
			{children}
		</context.Provider>
	);
};
