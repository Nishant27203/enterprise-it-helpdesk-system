const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

const LoadingSpinner = ({ size = 'md' }) => (
  <div
    className={`${sizes[size]} animate-spin rounded-full border-primary-200 border-t-primary-600`}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
