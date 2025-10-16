import { ChatContainerWithPersistence } from "@/features/chat/components";

interface ChatPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { threadId } = await params;
  return <ChatContainerWithPersistence initialThreadId={threadId} />;
}

