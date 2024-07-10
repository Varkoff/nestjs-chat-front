import { z } from 'zod';
import { fetcher } from './server/utils.server.ts';
import { getUserToken, logout } from './session.server.ts';

const getAuthenticatedUserSchema = z.object({
	email: z.string(),
	id: z.string(),
	firstName: z.string(),
	avatarUrl: z.string().optional().nullable(),
	canReceiveMoney: z.boolean(),
});

export const getOptionalUser = async ({ request }: { request: Request }) => {
	const userToken = await getUserToken({ request });

	if (userToken === undefined) {
		return null;
	}
	try {
		// 2. On appelle notre API Nest avec les données du formulaire
		const response = await fetch(`${process.env.BACKEND_URL}/auth`, {
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

const stripeConnectSchema = z.object({
	accountLink: z.string(),
});
export const startStripeOnboarding = async ({
	request,
}: {
	request: Request;
}) => {
	const response = await fetcher({
		request,
		url: '/stripe/connect',
		method: 'POST',
		data: {},
	});
	return stripeConnectSchema.parse(response);
};

const stripeDonateUrlSchema = z.object({
	error: z.boolean(),
	message: z.string(),
	sessionUrl: z.string().nullable(),
});

export const createDonation = async ({
	request,
	receivingUserId,
}: {
	request: Request;
	receivingUserId: string;
}) => {
	const response = await fetcher({
		request,
		url: `/stripe/donate/${receivingUserId}`,
		method: 'POST',
		data: {},
	});
	return stripeDonateUrlSchema.parse(response);
};
