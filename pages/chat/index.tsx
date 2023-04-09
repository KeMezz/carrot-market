import { NextPage } from "next";
import ChatPreview from "@components/molecule/chat-preview";
import Layout from "@components/template/layout";

const Chat: NextPage = () => {
  return (
    <Layout title="채팅">
      <section className="divide-y">
        {Array.from({ length: 15 }, (_, i) => i).map((i) => (
          <ChatPreview key={i} />
        ))}
      </section>
    </Layout>
  );
};

export default Chat;
