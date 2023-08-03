import { NextPage } from "next";
import ChatPreview from "@components/molecule/chat-preview";
import Layout from "@components/template/layout";
import useSWR from "swr";
import SkChatPreview from "@components/skeleton/skeleton-chat-preview";
import Empty from "@components/organism/empty";

interface ChatsResponse {
  success: boolean;
  chatRooms: {
    id: number;
    chatMessages: {
      id: number;
      message: string;
      createdAt: string;
      user: {
        id: number;
        avatar: string;
        name: string;
      };
    }[];
  }[];
}

const Chat: NextPage = () => {
  const { isLoading, data } = useSWR<ChatsResponse>(`/api/chats`);
  return (
    <Layout title="채팅">
      {!isLoading
        ? null
        : Array.from({ length: 4 }, (_, i) => i).map((i) => (
            <SkChatPreview key={i} />
          ))}
      {data?.chatRooms.length === 0 ? (
        <Empty text="새로운 중고 매물을 찾아서 대화를 시작해봐요" />
      ) : (
        <section className="divide-y">
          {data?.chatRooms.map((chatRoom) => (
            <ChatPreview
              id={chatRoom.id}
              key={chatRoom.id}
              name={chatRoom?.chatMessages[0]?.user?.name}
              message={chatRoom?.chatMessages[0]?.message}
              avatar={chatRoom?.chatMessages[0]?.user?.avatar}
            />
          ))}
        </section>
      )}
    </Layout>
  );
};

export default Chat;
