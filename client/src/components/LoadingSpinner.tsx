import loadingVideo from "@assets/illuminated_R_extended_1765979257075.mp4";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  message?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-40 h-40",
  xl: "w-64 h-64",
};

export function LoadingSpinner({ 
  size = "lg", 
  className = "",
  message 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`${sizeClasses[size]} object-contain`}
      >
        <source src={loadingVideo} type="video/mp4" />
      </video>
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <LoadingSpinner size="xl" message={message} />
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="xl" message={message} />
    </div>
  );
}
