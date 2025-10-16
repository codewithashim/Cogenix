import ChatContainerWithPersistence from "@/features/chat/components/ChatContainerWithPersistence";

interface ChatPageProps {
  params: {
    threadId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return <ChatContainerWithPersistence initialThreadId={params.threadId} />;
}

