import Pusher from "pusher-js";

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  if (!key) {
    return {
      subscribe: () => ({ bind: () => {}, unbind_all: () => {} }),
      unsubscribe: () => {},
      disconnect: () => {},
    } as any;
  }
  return new Pusher(key, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1", forceTLS: true });
}