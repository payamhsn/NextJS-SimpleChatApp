import Pusher from "pusher";

const hasKeys = !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET);

export const pusherServer = hasKeys
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || "mt1",
      useTLS: true,
    })
  : ({ trigger: async () => {} } as any);