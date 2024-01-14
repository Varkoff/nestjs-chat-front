import { getUserToken } from '~/session.server.ts';

export const fetcher = async ({
	url,
	method = 'GET',
	request,
	data = null,
}: {
	url: string;
	data?: object | null;
	method?: 'POST' | 'GET' | 'PUT';
	request: Request;
}) => {
	const userToken = await getUserToken({ request });
	// 2. On appelle notre API Nest avec les données du formulaire
	const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
		method,
		body: method === 'GET' ? null : JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${userToken}`,
		},
	});

	if (response.status !== 200 && response.status !== 201) {
		throw new Error(response.statusText);
	}
	return await response.json();
};

export const fileFetcher = async ({
	url,
	method = 'GET',
	request,
	data,
}: {
	url: string;
	data: FormData;
	method?: 'POST' | 'GET' | 'PUT';
	request: Request;
}) => {
	const userToken = await getUserToken({ request });
	// 2. On appelle notre API Nest avec les données du formulaire
	const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
		method,
		body: method === 'GET' ? null : data,
		headers: {
			Authorization: `Bearer ${userToken}`,
		},
	});

	if (response.status !== 200 && response.status !== 201) {
		throw new Error(response.statusText);
	}
	return await response.json();
};
