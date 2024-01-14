import { z } from 'zod';
import { getUserToken, logout } from './session.server.ts';

const getAuthenticatedUserSchema = z.object({
	email: z.string(),
	id: z.string(),
	firstName: z.string(),
	avatarUrl: z.string().optional().nullable(),
});

export const getOptionalUser = async ({ request }: { request: Request }) => {
	const userToken = await getUserToken({ request });

	if (userToken === undefined) {
		return null;
	}
	try {
		// 2. On appelle notre API Nest avec les données du formulaire
		const response = await fetch('http://localhost:8000/auth', {
			// method: 'POST',
			// body: JSON.stringify(parsedJson),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${userToken}`,
			},
		});
		const data = await response.json();
		return getAuthenticatedUserSchema.parse(data);
	} catch (error) {
		console.error(error);
		throw await logout({
			request,
		});
		// Écrire la logique de code en cas d'échec
	}
};

export const requireUser = async ({ request }: { request: Request }) => {
	const user = await getOptionalUser({ request });
	if (user) {
		return user;
	}
	throw await logout({ request });
};
