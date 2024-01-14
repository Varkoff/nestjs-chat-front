import { redirect } from '@remix-run/node';
import { z } from 'zod';
import { feedbackSchema } from '~/routes/forgot-password.tsx';
import {
	getConversationSchema,
	getConversationsSchema,
} from './conversation.schema.ts';
import { fetcher } from './utils.server.ts';

export const getConversations = async ({ request }: { request: Request }) => {
	const response = await fetcher({
		request,
		url: '/chat',
	});

	return getConversationsSchema.parse(response);
};

export const getConversation = async ({
	request,
	conversationId,
}: {
	request: Request;
	conversationId: string;
}) => {
	try {
		const response = await fetcher({
			request,
			url: `/chat/${conversationId}`,
		});

		return getConversationSchema.parse(response);
	} catch (error) {
		console.log(error);
		throw redirect('/');
	}
};

export const sendMessage = async ({
	request,
	conversationId,
	content,
}: {
	request: Request;
	content: string;
	conversationId: string;
}) => {
	const response = await fetcher({
		method: 'POST',
		request,
		url: `/chat/${conversationId}`,
		data: {
			content,
		},
	});

	console.log(response);

	return feedbackSchema.parse(response);
};

export const conversationFeedbackSchema = feedbackSchema.extend({
	conversationId: z.string().optional().nullable(),
});
export const createConversation = async ({
	request,
	recipientId,
}: {
	request: Request;
	recipientId: string;
}) => {
	const response = await fetcher({
		method: 'POST',
		request,
		url: `/chat`,
		data: {
			recipientId,
		},
	});

	const feedback = conversationFeedbackSchema.parse(response);

	if (feedback.error) {
		throw new Error(feedback.message);
	}
	return redirect(`/conversations/${feedback.conversationId}`);
};
