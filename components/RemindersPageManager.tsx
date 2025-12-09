"use client";

import { useRemindersData } from "@/hooks/useRemindersData";
import RemindersMobileView from "@/components/reminders/RemindersMobileView";
import RemindersDesktopView from "@/components/reminders/RemindersDesktopView";

export default function RemindersPageManager() {
  const data = useRemindersData();

  return (
    <div className="w-full h-full">
      <div className="md:hidden h-full">
        <RemindersMobileView data={data} />
      </div>
      <div className="hidden md:block h-full">
        <RemindersDesktopView data={data} />
      </div>
    </div>
  );
}