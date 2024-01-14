import { Label } from '@radix-ui/react-label';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { z } from 'zod';
import { getOptionalUser } from '~/auth.server.ts';
import type { ActionFeedback } from '~/components/FeedbackComponent.tsx';
import { AlertFeedback } from '~/components/FeedbackComponent.tsx';
import { Icons } from '~/components/icons.tsx';
import { Button, buttonVariants } from '~/components/ui/button.tsx';
import { Input } from '~/components/ui/input.tsx';

const actionSchema = z.object({
	action: z.enum(['request-password-reset', 'reset-password']),
});
const forgotPasswordSchema = z.object({
	email: z
		.string({
			required_error: 'Votre adresse email est requise.',
			invalid_type_error: 'Vous devez fournir une adresse email valide',
		})
		.email({
			message: 'Vous devez fournir une adresse email valide',
		}),
});

const resetPasswordSchema = z.object({
	password: z
		.string({
			required_error: 'Votre mot de passe est requis.',
		})
		.min(6, {
			message: 'Le mot de passe doit faire plus de 6 caractères',
		}),

	passwordConfirmation: z
		.string({
			required_error: 'Votre mot de passe est requis.',
		})
		.min(6, {
			message: 'Le mot de passe doit faire plus de 6 caractères',
		}),
});

export const feedbackSchema = z.object({
	message: z.string(),
	error: z.boolean(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getOptionalUser({ request });

	if (user) {
		// L'utilisateur est connecté
		return redirect('/');
	}

	try {
		const urlParams = new URL(request.url).searchParams;
		const token = urlParams.get('token');

		const response = await fetch(
			`http://localhost:8000/auth/verify-reset-password-token?token=${token}`,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		// 3. En cas de succès, on récupère le token pour authentifier l'utilisateur connecté.
		const { error, message } = feedbackSchema.parse(await response.json());
		return json({
			error,
			message,
			token,
		});
	} catch (error) {
		let err = error as Error;
		return json({
			error: true,
			message: err.message,
			token: '',
		});
	}
};

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		// 1. On récupère les informations du formulaire.
		const formData = await request.formData();
		const jsonData = Object.fromEntries(formData);
		const { action } = actionSchema.parse(jsonData);

		switch (action) {
			case 'request-password-reset': {
				const parsedJson = forgotPasswordSchema.safeParse(jsonData);

				if (parsedJson.success === false) {
					const { error } = parsedJson;

					return json<ActionFeedback>({
						error: true,
						message: error.errors.map((err) => err.message).join(', '),
					});
				}

				// 2. On appelle notre API Nest avec les données du formulaire
				const response = await fetch(
					'http://localhost:8000/auth/request-reset-password',
					{
						method: 'POST',
						body: JSON.stringify(parsedJson.data),
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				// 3. En cas de succès, on récupère le token pour authentifier l'utilisateur connecté.
				const { error, message } = feedbackSchema.parse(await response.json());
				return json<ActionFeedback>({
					error,
					message,
				});
			}
			case 'reset-password': {
				const parsedJson = resetPasswordSchema.safeParse(jsonData);

				if (parsedJson.success === false) {
					const { error } = parsedJson;

					return json<ActionFeedback>({
						error: true,
						message: error.errors.map((err) => err.message).join(', '),
					});
				}

				const { password, passwordConfirmation } = parsedJson.data;

				if (password !== passwordConfirmation) {
					throw new Error('Les mots de passe ne correspondent pas.');
				}

				const urlParams = new URL(request.url).searchParams;
				const token = urlParams.get('token');

				// 2. On appelle notre API Nest avec les données du formulaire
				const response = await fetch(
					'http://localhost:8000/auth/reset-password',
					{
						method: 'POST',
						body: JSON.stringify({ password, token }),
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				// 3. En cas de succès, on récupère le token pour authentifier l'utilisateur connecté.
				const { error, message } = feedbackSchema.parse(await response.json());
				return json<ActionFeedback>({
					error,
					message,
				});
			}
		}
	} catch (error) {
		let err = error as Error;
		return json<ActionFeedback>({
			error: true,
			message: err.message,
		});
	}
};

const ForgotPasswordForm = () => {
	const { error, message, token } = useLoaderData<typeof loader>();
	const formFeedback = useActionData<ActionFeedback>();
	const isLoading = useNavigation().state !== 'idle';

	if (!token) {
		return (
			<>
				<div className='container relative flex-col items-center justify-center lg:max-w-none lg:px-0'>
					<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
						<div className='flex flex-col space-y-2 text-center'>
							<h1 className='text-2xl font-semibold tracking-tight'>
								Récupération du mot de passe
							</h1>
							<p className='text-sm text-muted-foreground'>
								Récupérez votre mot de passe
							</p>
						</div>

						{/* FOrm */}
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
									<input
										type='hidden'
										name='action'
										value='request-password-reset'
									/>

									<AlertFeedback feedback={formFeedback} />
									<Button>
										{isLoading ? (
											<Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										Récupérer mon mot de passe
									</Button>
								</div>
							</Form>
						</div>
					</div>
				</div>
			</>
		);
	}
	if (token && error === true) {
		return (
			<>
				<AlertFeedback
					feedback={{
						error,
						message,
					}}
				/>
				<Link
					className={buttonVariants({
						variant: 'ghost',
					})}
					to='/'
				>
					Retourner à l'accueil
				</Link>
			</>
		);
	}
	if (token && error === false) {
		return (
			<>
				<div className='container relative flex-col items-center justify-center lg:max-w-none lg:px-0'>
					<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
						<div className='flex flex-col space-y-2 text-center'>
							<h1 className='text-2xl font-semibold tracking-tight'>
								Choisissez votre nouveau mot de passe
							</h1>
						</div>

						{/* FOrm */}
						<div className={'grid gap-6'}>
							<Form method='POST'>
								<div className='grid gap-2'>
									<div className='grid gap-1'>
										<Label className='sr-only' htmlFor='password'>
											Mot de passe
										</Label>
										<Input
											id='password'
											name='password'
											placeholder='Nouveau mot de passe'
											type='password'
											required
											disabled={isLoading}
										/>
									</div>
									<div className='grid gap-1'>
										<Label className='sr-only' htmlFor='passwordConfirmarion'>
											Confirmation de mot de passe
										</Label>
										<Input
											id='passwordConfirmation'
											name='passwordConfirmation'
											placeholder='Confirmation du mot de passe'
											type='password'
											required
											disabled={isLoading}
										/>
									</div>
									<input type='hidden' name='action' value='reset-password' />

									<AlertFeedback feedback={formFeedback} />
									<Button>
										{isLoading ? (
											<Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										Réinitialiser mon mot de passe
									</Button>
								</div>
							</Form>
						</div>
					</div>
				</div>
			</>
		);
	}
};

export default ForgotPasswordForm;
