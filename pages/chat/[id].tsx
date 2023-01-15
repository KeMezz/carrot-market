import { NextPage } from "next";
import ChatInput from "../../components/molecule/chat-input";
import LeftBubble from "../../components/atom/left-bubble";
import Layout from "../../components/template/layout";
import RightBubble from "../../components/atom/right-bubble";

const ChatDetail: NextPage = () => {
  return (
    <Layout canGoBack title="Steve Jobs">
      <section className="p-4 my-8 flex flex-col gap-4">
        <LeftBubble message="Hi, how much are you selling them for?" />
        <RightBubble message="I want ₩20,000." />
        <LeftBubble message="미쳤어" />
      </section>
      <ChatInput />
    </Layout>
  );
};

export default ChatDetail;
