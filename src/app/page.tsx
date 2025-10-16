import { ChatContainerWithPersistence } from "@/features/chat/components";

export default function Home() {
  return <ChatContainerWithPersistence initialThreadId={null} />;
}
