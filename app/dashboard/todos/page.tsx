import TaskBoard from "@/components/tasks/TaskBoard";

export default function TodosPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-[98%] h-[88vh] rounded-[2.5rem] backdrop-blur-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-white/40 dark:bg-black/40 light:bg-white/60 shadow-2xl overflow-hidden">
        <TaskBoard />
      </div>
    </div>
  );
}
