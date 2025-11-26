import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-black">
      <LoadingSpinner className="w-10 h-10" />
    </div>
  );
}
