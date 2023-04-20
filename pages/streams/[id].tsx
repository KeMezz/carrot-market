import ChatInput from "@components/molecule/chat-input";
import Layout from "@components/template/layout";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Stream } from "@prisma/client";
import Bubble from "@components/atom/bubble";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";

interface StreamWithMessage extends Stream {
  streamMessages: {
    message: string;
    user: {
      id: number;
      avatar?: string | null;
    };
  }[];
}

interface StreamResponse {
  success: boolean;
  stream: StreamWithMessage;
}

interface StreamMessageForm {
  message: string;
}

const StreamDetail = () => {
  const { user } = useUser();
  const router = useRouter();
  const { data: streamData, mutate } = useSWR<StreamResponse>(
    router.query.id ? `/api/streams/${router.query.id}` : null,
    {
      refreshInterval: 1000,
    }
  );
  const [sendMessage, { loading: sendMsgLoading }] = useMutation(
    `/api/streams/${router.query.id}/message`
  );
  const { register, handleSubmit, reset } = useForm<StreamMessageForm>();
  const onValid = (form: StreamMessageForm) => {
    if (sendMsgLoading) return;
    reset();
    mutate(
      (prev) =>
        prev && {
          ...prev,
          stream: {
            ...prev.stream,
            messages: [
              ...prev.stream.streamMessages,
              {
                message: form.message,
                user: { id: user!.id, avatar: user?.avatar },
              },
            ],
          },
        },
      false
    );
    sendMessage(form);
  };

  return (
    <Layout canGoBack>
      <section className="p-4">
        <div className="flex flex-col gap-3 pb-4 mb-4">
          <div className="w-full bg-slate-300 rounded-md shadow-sm aspect-video" />
          <h1 className="text-2xl font-semibold mt-4">
            {streamData?.stream?.name}
          </h1>
          <h3 className="text-lg font-medium">${streamData?.stream?.price}</h3>
          <p>{streamData?.stream?.description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full overflow-y-scroll h-[50vh] p-4 mb-16 border rounded-md">
          <h2 className="text-xl font-semibold pb-4">Chats</h2>
          {streamData?.stream.streamMessages.map((message, index) => (
            <Bubble
              key={index}
              message={message.message}
              reversed={user?.id === message.user.id}
            />
          ))}
        </div>
      </section>
      <form onSubmit={handleSubmit(onValid)}>
        <ChatInput register={register("message")} />
      </form>
    </Layout>
  );
};

export default StreamDetail;
