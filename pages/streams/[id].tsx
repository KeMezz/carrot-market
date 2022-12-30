import ChatInput from "../../components/molecule/chatInput";
import ReceivedBubble from "../../components/molecule/receivedBubble";
import SendBubble from "../../components/molecule/sendBubble";
import Layout from "../../components/template/layout";

const StreamDetail = () => {
  return (
    <Layout canGoBack>
      <section className="p-4">
        <div className="mb-8">
          <div className="w-full bg-slate-300 rounded-md shadow-sm aspect-video" />
          <h1 className="text-2xl font-semibold mt-4">Let us try potatos</h1>
        </div>
        <div className="flex flex-col gap-4 w-full overflow-y-scroll h-[50vh] py-2">
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
          <ReceivedBubble message="How much are you selling them for?" />
          <SendBubble message="I want ₩20,000." />
        </div>
      </section>
      <ChatInput />
    </Layout>
  );
};

export default StreamDetail;
