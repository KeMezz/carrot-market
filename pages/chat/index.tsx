import { NextPage } from "next";
import ChatPreview from "@components/molecule/chat-preview";
import Layout from "@components/template/layout";
import useSWR from "swr";

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
  const { data } = useSWR<ChatsResponse>(`/api/chats`);
  return (
    <Layout title="채팅">
      <section className="divide-y">
        {data?.chatRooms.map((chatRoom) => (
          <ChatPreview
            id={chatRoom.id}
            key={chatRoom.id}
            name={chatRoom.chatMessages[0].user.name}
            message={chatRoom.chatMessages[0].message}
            avatar={chatRoom.chatMessages[0].user.avatar}
          />
        ))}
      </section>
    </Layout>
  );
};

export default Chat;
