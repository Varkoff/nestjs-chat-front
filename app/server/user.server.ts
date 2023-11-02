import { z } from 'zod';
import { fetcher } from './utils.server.ts';

const getUsersSchema = z.array(
	z.object({
		id: z.string(),
		email: z.string(),
		firstName: z.string(),
	})
);

export const getUsers = async ({ request }: { request: Request }) => {
	const response = await fetcher({
		request,
		url: '/users',
	});

	return getUsersSchema.parse(response);
};
