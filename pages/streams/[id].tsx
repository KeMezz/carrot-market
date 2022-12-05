import { NextPage } from "next";
import Layout from "../../components/layout";

const StreamDetail: NextPage = () => {
  return (
    <Layout canGoBack>
      <main className="py-2 px-4 space-y-6">
        <div className="pt-4">
          <div className="w-full bg-slate-300 rounded-md shadow-sm aspect-video" />
          <h3 className="text-gray-800 text-2xl mt-4 font-semibold">
            Let's try potatos
          </h3>
          <section className="py-10 pb-16 h-[50vh] px-4 overflow-y-scroll space-y-4">
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
                <p>Hi how much are you selling them for?</p>
              </div>
            </div>
            <div className="flex flex-row-reverse items-start space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
              <div className="w-1/2 text-sm text-gray-700 p-2 border rounded-md border-gray-300">
                <p>I want ￦20,000</p>
              </div>
            </div>
          </section>
        </div>
        <div className="fixed w-[92vw] mx-auto max-w-md bottom-4 inset-x-0">
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
      </main>
    </Layout>
  );
};

export default StreamDetail;
