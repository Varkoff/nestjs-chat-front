import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { createDonation, requireUser } from '~/auth.server.ts';

export const action = async ({ params, request }: ActionFunctionArgs) => {
	const userId = params.userId;
	if (!userId) {
		throw new Error('Missing userId');
	}
	await requireUser({ request });
	const { error, message, sessionUrl } = await createDonation({
		request,
		receivingUserId: userId,
	});

	if (error || !sessionUrl) {
		throw new Error(message);
	}

	return redirect(sessionUrl);
};
