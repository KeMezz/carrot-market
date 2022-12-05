import { NextPage } from "next";
import Layout from "../../components/layout";

const ChatDetail: NextPage = () => {
  return (
    <Layout canGoBack title="Steve Jobs">
      <div className="px-4 py-10 space-y-4">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full" />
          <div className="w-1/2 text-sm text-gray-700 p-2 border rounded-md border-gray-300">
            <p>Hi how much are you selling them for?</p>
          </div>
        </div>
        <div className="flex flex-row-reverse items-start space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-gray-400 rounded-full" />
          <div className="w-1/2 text-sm text-gray-700 p-2 border rounded-md border-gray-300">
            <p>I want ￦20,000</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full" />
          <div className="w-1/2 text-sm text-gray-700 p-2 border rounded-md border-gray-300">
            <p>미쳤어</p>
          </div>
        </div>
        <div className="fixed w-[92vw] max-w-lg mx-auto bottom-4 inset-x-0">
          <div className="flex relative items-center">
            <input
              type="text"
              className="shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-400 focus:outline-none focus:border-orange-400 pr-12"
            />
            <div className="absolute inset-y-0 flex py-2 pr-1.5 right-0">
              <button className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-400 rounded-full px-3 text-sm text-white hover:bg-orange-500 cursor-pointer">
                &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatDetail;
