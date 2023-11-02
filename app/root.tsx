import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from '@remix-run/react';
import { z } from 'zod';
import tailwindCss from '~/global.css';
import { getOptionalUser } from './auth.server.ts';
import { Navigation } from './components/Navigation.tsx';
import { SocketProvider } from './hooks/useSocket.tsx';
const envSchema = z.object({
	// BACKEND_URL: z.string(),
	WEBSOCKET_URL: z.string(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getOptionalUser({ request });
	const env = envSchema.parse({
		// BACKEND_URL: process.env.BACKEND_URL,
		WEBSOCKET_URL: process.env.WEBSOCKET_URL ?? 'ws://localhost:8001',
	});
	return json({ user, env });
};

export const useOptionalUser = () => {
	const data = useRouteLoaderData<typeof loader>('root');
	if (data?.user) {
		return data.user;
	}
	return null;
};

export const useEnv = () => {
	const data = useRouteLoaderData<typeof loader>('root');
	if (data?.env) {
		return data.env;
	}
	throw new Error("L'objet ENV n'existe pas");
};

export const useUser = () => {
	const data = useRouteLoaderData<typeof loader>('root');
	if (!data?.user) {
		throw new Error("L'utilisateur n'est pas identifié.");
	}
	return data.user;
};

export const links: LinksFunction = () => [
	{ rel: 'preconnect', as: 'style', href: tailwindCss },
	{ rel: 'stylesheet', href: tailwindCss },
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export default function App() {
	return (
		<html lang='fr' className={`h-full overflow-x-hidden`}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>

			<SocketProvider>
				<body className='bg-slate-50 h-full min-h-full'>
					<Navigation />
					<main className='h-full px-4 py-3 lg:px-12 lg:py-10'>
						<Outlet />
					</main>
					<ScrollRestoration />
					<Scripts />
					<LiveReload />
				</body>
			</SocketProvider>
		</html>
	);
}
