"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (notificationsEnabled && Notification.permission === "default") Notification.requestPermission();
  }, [notificationsEnabled]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={notificationsEnabled} onChange={e=>setNotificationsEnabled(e.target.checked)} />
        Enable browser notifications
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={soundEnabled} onChange={e=>setSoundEnabled(e.target.checked)} />
        Enable notification sounds
      </label>
    </div>
  );
}