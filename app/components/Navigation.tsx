import { Form, NavLink, useLocation } from '@remix-run/react';
import { useOptionalUser } from '~/root.tsx';
import { Button } from './ui/button.tsx';

type RouteItemType = { url: string; name: string };
export const loggedOutRoutes: RouteItemType[] = [
	{ url: '/', name: 'Connexion' },
	{ url: '/register', name: 'Inscription' },

	// { url: '/', name: 'Dashboard' },
];

export const loggedInRoutes: RouteItemType[] = [
	{ url: '/', name: 'Dashboard' },
	// { url: '/', name: 'Dashboard' },
];

export const Navigation = () => {
	const user = useOptionalUser();
	return (
		<nav className='w-full flex items-center bg-primary text-white'>
			<div className='flex items-baseline gap-x-4 mx-auto max-w-lg py-2 '>
				{user ? (
					<>
						{loggedInRoutes.map((route) => (
							<RouteItem route={route} key={route.name} />
						))}

						<Form method='POST' action='logout'>
							<Button
								size={'sm'}
								type='submit'
								className='text-sm px-0 py-0 leading-0 h-auto'
								variant={'ghost'}
							>
								Se déconnecter
							</Button>
						</Form>
					</>
				) : null}

				{!user ? (
					<>
						{loggedOutRoutes.map((route) => (
							<RouteItem route={route} key={route.name} />
						))}
					</>
				) : null}
			</div>
		</nav>
	);
};

const RouteItem = ({ route }: { route: RouteItemType }) => {
	const location = useLocation();
	return (
		<NavLink
			key={route.name}
			to={route.url}
			className={(isActive) =>
				`text-sm ${
					isActive && location.pathname === route.url
						? 'font-bold underline'
						: 'font-normal'
				}`
			}
		>
			{route.name}
		</NavLink>
	);
};
