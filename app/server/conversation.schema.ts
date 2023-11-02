import { z } from 'zod';

export const messagesSchema = z.array(
	z.object({
		id: z.string(),
		content: z.string(),
		sender: z.object({
			id: z.string(),
			firstName: z.string(),
		}),
	})
);

export const getConversationsSchema = z.array(
	z.object({
		id: z.string(),
		updatedAt: z.string(),
		users: z.array(
			z.object({
				id: z.string(),
				firstName: z.string(),
			})
		),
		messages: z.array(
			z.object({
				id: z.string(),
				content: z.string(),
				sender: z.object({
					id: z.string(),
					firstName: z.string(),
				}),
			})
		),
	})
);

export const getConversationSchema = z.object({
	id: z.string(),
	updatedAt: z.string(),
	messages: messagesSchema,
	users: z.array(
		z.object({
			id: z.string(),
			firstName: z.string(),
		})
	),
});
