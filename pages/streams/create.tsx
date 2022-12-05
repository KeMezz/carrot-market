import { NextPage } from "next";
import Layout from "../../components/layout";

const Create: NextPage = () => {
  return (
    <Layout canGoBack>
      <div className="px-4 py-16 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <div className="shadow-sm rounded-md relative flex items-center">
            <input
              id="name"
              type="text"
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <div className="shadow-sm rounded-md relative flex items-center">
            <div className="absolute left-0 pl-3 flex items-center justify-center pointer-events-none">
              <span className="text-gray-500 text-sm">$</span>
            </div>
            <input
              id="price"
              type="text"
              placeholder="0.00"
              className="pl-7 appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400"
            />
            <div className="absolute right-0 pointer-events-none pr-3 flex items-center">
              <span className="text-gray-500">USD</span>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <div>
            <textarea
              rows={4}
              className="mt-1 shadow-sm w-full focus:ring-orange-400 focus:border-orange-400 rounded-md border-gray-300 resize-none"
            />
          </div>
        </div>
        <button className="w-full bg-orange-400 hover:bg-orange-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 focus:outline-none mt-4">
          Go live
        </button>
      </div>
    </Layout>
  );
};

export default Create;
