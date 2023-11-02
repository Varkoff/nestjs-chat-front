import { Form, Link } from '@remix-run/react';
import { useOptionalUser } from '~/root.tsx';
import type { getConversations } from '~/server/chat.server.ts';
import type { getUsers } from '~/server/user.server.ts';
import { Button } from './ui/button.tsx';

export const Conversations = ({
	conversations,
	users,
}: {
	conversations: Awaited<ReturnType<typeof getConversations>>;
	users: Awaited<ReturnType<typeof getUsers>>;
}) => {
	const connectedUser = useOptionalUser();
	if (!connectedUser) return null;
	const hasConversations = conversations.length > 0;
	const usersExceptMe = users.filter((u) => u.id !== connectedUser.id);
	const usersWithoutConversation = usersExceptMe.filter(
		(u) => !conversations.find((c) => c.users.find((u2) => u2.id === u.id))
	);
	return (
		<div className='flex flex-col gap-y-2 mt-4 w-full mx-auto max-w-md'>
			<span className='text-sm text-black font-bold'>Utilisateurs actifs</span>
			<div className='flex flex-col gap-2'>
				{usersWithoutConversation.map((user) => (
					<Form method='POST' action='/conversations' key={user.id}>
						<input type='hidden' name='recipientId' value={user.id} />
						<Button type='submit'>Envoyer un message à {user.firstName}</Button>
					</Form>
				))}
			</div>

			<span className='mt-4 text-lg text-black font-bold'>
				Historique de conversations
			</span>
			{hasConversations ? (
				<>
					{conversations.map((conversation) => (
						<ConversationItem
							conversation={conversation}
							key={conversation.id}
						/>
					))}
				</>
			) : (
				<div className='text-xs w-fit rounded-[4px] px-2 py-0.5 '>
					Aucune conversation n'a été créée.
				</div>
			)}
		</div>
	);
};

const ConversationItem = ({
	conversation,
}: {
	conversation: Awaited<ReturnType<typeof getConversations>>[0];
}) => {
	const hasMessage = conversation.messages.length > 0;
	const connectedUser = useOptionalUser();
	if (!connectedUser) return null;
	if (!hasMessage) {
		return (
			<div
				key={conversation.id}
				className='bg-white shadow-xl px-4 py-3 shadow-primary/20 flex flex-col w-full max-w-md gap-y-4'
			>
				<Link
					to={`/conversations/${conversation.id}`}
					className={`text-xs w-fit rounded-[4px] px-2 py-0.5 `}
				>
					Aucun message n'a été envoyé dans cette conversation. Soyez le
					premier!
				</Link>
			</div>
		);
	}
	return (
		<div key={conversation.id} className='w-full flex flex-col'>
			<span className='ml-auto text-xs bg-white px-2 py-0.5'>
				Parlez avec{' '}
				{
					conversation.users.find((user) => user.id !== connectedUser?.id)
						?.firstName
				}
			</span>
			<Link
				to={`/conversations/${conversation.id}`}
				className={`w-full bg-white max-w-md shadow-xl gap-y-4 px-4 py-3 shadow-primary/20 flex flex-col  text-xs rounded-[4px] ${
					conversation.messages[0].sender.id === connectedUser?.id
						? 'bg-sky-50 text- black ml-auto rounded-r-none'
						: 'bg-slate-200 rounded-l-none'
				}`}
			>
				{conversation.messages[0].content}
			</Link>
		</div>
	);
};
