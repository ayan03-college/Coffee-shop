export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-10 w-10 border-4', lg: 'h-16 w-16 border-4' };
  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-coffee-latte border-t-coffee-mocha`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {spinner}
      </div>
    );
  }
  return spinner;
}
