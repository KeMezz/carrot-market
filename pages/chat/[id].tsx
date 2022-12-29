import { NextPage } from "next";
import ReceivedBubble from "../../components/molecule/receivedBubble";
import SendBubble from "../../components/molecule/sendBubble";
import Layout from "../../components/template/layout";

const ChatDetail: NextPage = () => {
  return (
    <Layout canGoBack title="Steve Jobs">
      <section className="p-4 my-8 flex flex-col gap-4">
        <ReceivedBubble message="Hi, how much are you selling them for?" />
        <SendBubble message="I want ₩20,000." />
        <ReceivedBubble message="미쳤어" />
      </section>
    </Layout>
  );
};

export default ChatDetail;
