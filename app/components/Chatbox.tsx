import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { Form, useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { useUser } from '~/root.tsx';
import type { MessagesType } from '~/routes/conversations_.$conversationId.tsx';
import type { getConversation } from '~/server/chat.server.ts';
import type { ActionFeedback } from './FeedbackComponent.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';

export const Chatbox = ({
	conversation,
	messages,
	setMessages,
}: {
	conversation: Awaited<ReturnType<typeof getConversation>>;
	messages: MessagesType;
	setMessages: React.Dispatch<React.SetStateAction<MessagesType>>;
}) => {
	const { id: conversationId, users } = conversation;
	const user = useUser();
	const messageFetcher = useFetcher<ActionFeedback>();
	const recipientUser = users.find((u) => u.id !== user.id);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (messageFetcher.state === 'idle') return;
		if (messageFetcher.state === 'loading') return;
		if (messageFetcher.state === 'submitting') {
			const message = messageFetcher.formData?.get('content') as string;
			if (!message) return;

			setMessages((oldMessages) => [
				...oldMessages,
				{
					content: message,
					id: '-1',
					sender: {
						firstName: user.firstName,
						id: user.id,
					},
				},
			]);

			if (inputRef.current) {
				inputRef.current.value = '';
			}
		}
	}, [messageFetcher, setMessages, user.firstName, user.id]);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className='flex flex-col gap-y-2 mt-4 w-full max-w-md mx-auto'>
			{recipientUser ? (
				<div className='flex items-center gap-2'>
					<div className='flex flex-col px-3 py-2 bg-white border-2 border-slate-100'>
						<div className='text-xs'> {recipientUser.firstName}</div>
						{recipientUser.avatarUrl ? (
							<img
								src={recipientUser.avatarUrl}
								className='w-10 h-auto flex-shrink-0'
								alt=''
							/>
						) : null}
					</div>
					<Form method='POST' action={`/donate/${recipientUser.id}`}>
						<Button variant={'outline'}>Faire un don</Button>
					</Form>
					<ul className='text-xs flex flex-col gap-1'>
						<span>Dons envoyés</span>
						{recipientUser.givenDonations.map((gd) => (
							<li key={gd.id}>
								{(gd?.amount ? gd.amount / 100 : 0).toFixed(2)}€{' '}
								{new Date(gd.createdAt).toLocaleDateString()}
							</li>
						))}
					</ul>

					<ul className='text-xs flex flex-col gap-1'>
						<span>Dons reçus</span>
						{recipientUser.receivedDonations.map((gd) => (
							<li key={gd.id}>
								{(gd?.amount ? gd.amount / 100 : 0).toFixed(2)}€{' '}
								{new Date(gd.createdAt).toLocaleDateString()}
							</li>
						))}
					</ul>
				</div>
			) : null}
			<div
				ref={containerRef}
				className='bg-white max-h-[400px] overflow-y-auto shadow-xl px-4 py-3 shadow-primary/20 flex flex-col w-full max-w-md gap-y-4'
			>
				{messages.length === 0 ? (
					<div className={`text-xs w-fit rounded-[4px] px-2 py-0.5 `}>
						Aucun message n'a été envoyé dans cette conversation. Soyez le
						premier!
					</div>
				) : (
					<>
						{messages.map((message, index) => (
							<MessageItem
								message={message}
								isSender={message.sender.id === user.id}
								key={message.id}
							/>
						))}
					</>
				)}
			</div>

			<messageFetcher.Form
				action={`/conversations/${conversationId}`}
				className='grid gap-1 relative'
				method='POST'
			>
				<Input
					id='content'
					name='content'
					ref={inputRef}
					placeholder='Envoyer un message'
					type='text'
					className='placeholder:text-xs bg-white'
					autoCorrect='on'
					required
					autoFocus
				/>
				<Button
					type='submit'
					size={'icon'}
					className='absolute right-0 bottom-0'
				>
					<PaperPlaneIcon />
				</Button>
			</messageFetcher.Form>
		</div>
	);
};

const MessageItem = ({
	message,
	isSender,
}: {
	isSender: boolean;
	message: Awaited<ReturnType<typeof getConversation>>['messages'][0];
}) => {
	return (
		<div
			className={`text-xs w-fit rounded-[4px] px-2 py-0.5  ${
				isSender
					? 'bg-sky-50 text- black ml-auto rounded-r-none'
					: 'bg-slate-200 rounded-l-none'
			}`}
			key={message.id}
		>
			{message.content}
		</div>
	);
};
