import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/auth.server.ts';
import type { ActionFeedback } from '~/components/FeedbackComponent.tsx';
import { createConversation } from '~/server/chat.server.ts';

export const action = async ({ request, params }: LoaderFunctionArgs) => {
	await requireUser({ request });

	const formData = await request.formData();
	const recipientId = formData.get('recipientId') ?? null;
	if (!recipientId) {
		return json<ActionFeedback>({
			error: true,
			message: 'Une conversation possède deux utilisateurs.',
		});
	}

	return await createConversation({
		request,
		recipientId: recipientId as string,
	});
};
