import { z } from 'zod';
import { feedbackSchema } from '~/routes/forgot-password.tsx';
import { fetcher, fileFetcher } from './utils.server.ts';

const getUsersSchema = z.array(
	z.object({
		id: z.string(),
		email: z.string(),
		firstName: z.string(),
		avatarUrl: z.string().optional().nullable(),
	})
);

export const getUsers = async ({ request }: { request: Request }) => {
	const response = await fetcher({
		request,
		url: '/users',
	});

	return getUsersSchema.parse(response);
};

export const updateUserAvatar = async ({
	request,
	formData,
}: {
	request: Request;
	formData: FormData;
}) => {
	const response = await fileFetcher({
		request,
		method: 'POST',
		data: formData,
		url: '/users',
	});

	return feedbackSchema.parse(response);
};
