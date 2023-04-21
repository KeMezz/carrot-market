import { NextPage } from "next";
import ChatInput from "@components/molecule/chat-input";
import Layout from "@components/template/layout";
import Bubble from "@components/atom/bubble";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useRouter } from "next/router";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";
import useUser from "@libs/client/useUser";

interface SendMessageResponse {
  success: boolean;
  error?: any;
}

interface ChatMessagesResponse {
  success: boolean;
  messages: {
    id: number;
    message: string;
    user: {
      id: number;
      avatar: string;
    };
  }[];
  chatRoom: {
    product: {
      id: number;
      name: string;
      user: {
        id: number;
        name: string;
      };
    };
  };
}

interface ChatForm {
  message: string;
}

const ChatDetail: NextPage = () => {
  const { user } = useUser();
  const { register, handleSubmit, reset } = useForm<ChatForm>();
  const router = useRouter();
  const { data: chatMessagesData, mutate } = useSWR<ChatMessagesResponse>(
    router.query.id ? `/api/chats/${router.query.id}` : null,
    {
      refreshInterval: 1000,
    }
  );

  const [sendMessage, { loading, data }] = useMutation<SendMessageResponse>(
    `/api/chats/${router.query.id}`
  );
  const onValid = ({ message }: ChatForm) => {
    if (loading) return;
    reset();
    sendMessage({ message });
  };
  useEffect(() => {
    if (data && data.success) {
      mutate();
    }
  }, [data, mutate]);

  return (
    <Layout
      canGoBack
      title={`${chatMessagesData?.chatRoom.product.name ?? ""} 채팅`}
    >
      <section className="p-4 my-8 flex flex-col gap-4">
        {chatMessagesData?.messages.map((message) => (
          <Bubble
            reversed={user?.id === message.user.id}
            avatar={message.user.avatar}
            key={message.id}
            message={message.message}
          />
        ))}
      </section>
      <form onSubmit={handleSubmit(onValid)}>
        <ChatInput register={register("message")} />
      </form>
    </Layout>
  );
};

export default ChatDetail;
