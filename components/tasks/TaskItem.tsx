"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Clock, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { tr } from "date-fns/locale";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at?: string;
};

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

const priorityColors = {
  high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const priorityLabels = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

interface TaskContentProps {
  task: Task;
  onDelete: (id: string) => void;
  smartDate: { text: string; color: string } | null;
}

const TaskContent = ({ task, onDelete, smartDate }: TaskContentProps) => (
  <>
    <div className="flex justify-between items-start gap-2">
      <h4 className={`font-medium text-sm text-zinc-900 dark:text-white line-clamp-2 ${task.status === 'done' ? 'line-through text-zinc-500' : ''}`}>
        {task.title}
      </h4>
      
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>
      
      {smartDate && (
        <div className={`flex items-center gap-1 text-xs ${smartDate.color}`}>
          <Clock className="w-3 h-3" />
          <span>{smartDate.text}</span>
        </div>
      )}
    </div>
  </>
);

export default function TaskItem({ task, onDelete, isOverlay }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id, 
    data: { task },
    disabled: isOverlay 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Date formatting
  const getSmartDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isToday(date)) return { text: 'Bugün', color: 'text-emerald-500' };
    if (isTomorrow(date)) return { text: 'Yarın', color: 'text-blue-500' };
    if (isPast(date)) return { text: format(date, 'd MMM', { locale: tr }), color: 'text-rose-500' };
    return { text: format(date, 'd MMM', { locale: tr }), color: 'text-zinc-400' };
  };

  const smartDate = getSmartDate(task.due_date);

  if (isOverlay) {
    return (
      <div className="group relative bg-white dark:bg-zinc-900 border border-emerald-500 shadow-2xl rounded-2xl p-4 cursor-grabbing rotate-2 scale-105">
        <TaskContent task={task} onDelete={onDelete} smartDate={smartDate} />
      </div>
    );
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-2xl h-[100px] w-full"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing touch-none"
    >
      <TaskContent task={task} onDelete={onDelete} smartDate={smartDate} />
    </div>
  );
}
