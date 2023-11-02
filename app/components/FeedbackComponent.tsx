import { Alert, AlertDescription } from '~/components/ui/alert.tsx';

export type ActionFeedback = {
	error: boolean;
	message: string;
};
export function AlertFeedback({
	feedback,
}: {
	feedback: ActionFeedback | undefined;
}) {
	if (!feedback?.message) return null;
	return (
		<Alert variant={feedback?.error ? 'destructive' : 'success'}>
			{/* {feedback.error ? (
				<ExclamationTriangleIcon
					className={`h-4 w-4 text-inherit fill-inherit `}
				/>
			) : (
				<CheckCircledIcon className={`h-4 w-4 text-inherit fill-inherit `} />
			)} */}
			{/* <AlertTitle>
				{feedback.error ? 'Une erreur est survenue' : 'Action réussie'}
			</AlertTitle> */}
			<AlertDescription>{feedback.message}</AlertDescription>
		</Alert>
	);
}
