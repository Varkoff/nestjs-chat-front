import type { ActionFunctionArgs } from '@remix-run/node';
import { logout } from '~/session.server.ts';

export const action = async ({ request }: ActionFunctionArgs) => {
	return await logout({ request });
};
