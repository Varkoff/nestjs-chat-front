import { Label } from '@radix-ui/react-label';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { z } from 'zod';
import { getOptionalUser } from '~/auth.server.ts';
import { Conversations } from '~/components/Conversations.tsx';
import type { ActionFeedback } from '~/components/FeedbackComponent.tsx';
import { AlertFeedback } from '~/components/FeedbackComponent.tsx';
import { Icons } from '~/components/icons.tsx';
import { Button, buttonVariants } from '~/components/ui/button.tsx';
import { Input } from '~/components/ui/input.tsx';
import { useOptionalUser } from '~/root.tsx';
import { getConversations } from '~/server/chat.server.ts';
import { getUsers } from '~/server/user.server.ts';
import { authenticateUser } from '~/session.server.ts';
import { tokenSchema } from './register.tsx';

const loginSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getOptionalUser({ request });
	if (user) {
		const users = await getUsers({ request });
		const conversations = await getConversations({ request });
		return json({ conversations, users });
	}

	return json({ conversations: [], users: [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		// 1. On récupère les informations du formulaire.
		const formData = await request.formData();
		const jsonData = Object.fromEntries(formData);
		const parsedJson = loginSchema.parse(jsonData);

		// 2. On appelle notre API Nest avec les données du formulaire
		const response = await fetch('http://localhost:8000/auth/login', {
			method: 'POST',
			body: JSON.stringify(parsedJson),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// 3. En cas de succès, on récupère le token pour authentifier l'utilisateur connecté.
		const { error, message, access_token } = tokenSchema.parse(
			await response.json()
		);

		if (error && message) {
			return json<ActionFeedback>({ error, message });
		} else if (access_token) {
			return await authenticateUser({
				request,
				userToken: access_token,
			});
		}
		throw new Error('Une erreur inattendue est survenue');
	} catch (error) {
		let err = error as Error;
		return json<ActionFeedback>({
			error: true,
			message: err.message,
		});
	}
};

export default function Index() {
	const user = useOptionalUser();
	const isConnected = user !== null;
	const { conversations, users } = useLoaderData<typeof loader>();
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
			{isConnected ? (
				<div className='flex flex-col gap-y-3'>
					<h1 className='text-2xl'>
						Bienvenue,{' '}
						<span className='font-bold text-primary'>{user.firstName}</span>
					</h1>
					<Conversations users={users} conversations={conversations} />
				</div>
			) : (
				<LoginForm />
			)}
		</div>
	);
}
const LoginForm = () => {
	const isLoading = useNavigation().state !== 'idle';
	const formFeedback = useActionData<ActionFeedback>();
	return (
		<>
			<div className='container relative  flex-col items-center justify-center lg:max-w-none lg:px-0'>
				<div className='lg:p-8'>
					<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
						<div className='flex flex-col space-y-2 text-center'>
							<h1 className='text-2xl font-semibold tracking-tight'>
								Connexion
							</h1>
							<p className='text-sm text-muted-foreground'>
								Connectez-vous par email
							</p>
						</div>

						<div className={'grid gap-6'}>
							<Form method='POST'>
								<div className='grid gap-2'>
									<div className='grid gap-1'>
										<Label className='sr-only' htmlFor='email'>
											Email
										</Label>
										<Input
											id='email'
											name='email'
											placeholder='Adresse email'
											type='email'
											autoCapitalize='none'
											autoComplete='email'
											autoCorrect='off'
											required
											disabled={isLoading}
										/>
									</div>
									<div className='grid gap-1'>
										<Label className='sr-only' htmlFor='email'>
											Mot de passe
										</Label>
										<Input
											id='password'
											name='password'
											placeholder='Mot de passe'
											type='password'
											autoCapitalize='none'
											autoComplete='password'
											autoCorrect='off'
											required
										/>
									</div>

									<AlertFeedback feedback={formFeedback} />
									<Button>
										{isLoading ? (
											<Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										Se connecter
									</Button>
									<Link
										to={'/forgot-password'}
										className={buttonVariants({ variant: 'outline' })}
									>
										Mot de passe oublié ?
									</Link>
								</div>
							</Form>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<span className='w-full border-t' />
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='px-2 text-muted-foreground'>
										Pas encore de compte ?
									</span>
								</div>
							</div>
							<Link
								to={'/register'}
								className={buttonVariants({ variant: 'outline' })}
							>
								Créer un compte
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
