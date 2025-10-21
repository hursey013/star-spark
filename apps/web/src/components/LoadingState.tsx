interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading Star Spark...' }: LoadingStateProps) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="animate-pulse text-3xl">✨</span>
      <p className="max-w-sm text-sm text-slate-400">{message}</p>
    </div>
  </div>
);
