import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireUser, startStripeOnboarding } from '~/auth.server.ts';

// export const action = async ({ request }: ActionFunctionArgs) => {
// 	await requireUser({ request });
// 	const { accountLink } = await startStripeOnboarding({ request });

// 	return redirect(accountLink);
// };

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUser({ request });
	const { accountLink } = await startStripeOnboarding({ request });

	return redirect(accountLink);
};
