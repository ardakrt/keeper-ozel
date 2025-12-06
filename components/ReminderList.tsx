import ReminderItem from "@/components/ReminderItem";

type Reminder = {
  id?: string | number;
  title?: string | null;
  content?: string | null;
  due_at?: string | null;
  due_date?: string | null; // Backward compatibility
  category?: string | null;
  channel?: string | null;
};

export default function ReminderList({ reminders, onRefresh }: { reminders: Reminder[] | null; onRefresh?: () => void }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white/20 dark:text-white/20 light:text-zinc-300 mb-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-white dark:text-white light:text-zinc-900 font-semibold text-lg">Henüz hatırlatma yok</h3>
          <p className="text-white/60 dark:text-white/60 light:text-zinc-600 text-sm mt-2">Hatırlatmalarınızı oluşturun, bildirimleri takip edin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reminders.map((rem, idx) => (
        <ReminderItem key={(rem.id ?? idx).toString()} reminder={rem} onRefresh={onRefresh} />
      ))}
    </div>
  );
}