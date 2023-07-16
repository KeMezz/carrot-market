import { NextPage } from "next";
import ChatPreview from "@components/molecule/chat-preview";
import Layout from "@components/template/layout";
import useSWR from "swr";
import SkChatPreview from "@components/skeleton/skeleton-chat-preview";

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
        <section className="flex min-h-[calc(100vh-152px)]">
          <div className="flex flex-col gap-4 justify-center items-center text-gray-400 m-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <p>새로운 중고 매물을 찾아서 대화를 시작해봐요</p>
          </div>
        </section>
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
