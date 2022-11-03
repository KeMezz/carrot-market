import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <section className="bg-slate-400 py-20 px-10 flex flex-col space-y-10 items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="font-semibold text-3xl">Select Item</h1>
        <div className="flex justify-between my-2">
          <span className="text-gray-500">Grey Chair</span>
          <span className="font-semibold">$19</span>
        </div>
        <div className="flex justify-between my-2 ">
          <span className="text-gray-500">Tooly Table</span>
          <span className="font-semibold">$21</span>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t-2 border-dashed">
          <span>Total</span>
          <span className="font-semibold">$40</span>
        </div>
        <div className="flex justify-center">
          <button className="mt-5 mx-auto bg-blue-500 p-3 text-white rounded-xl w-2/3 self-center text-center">
            Checkout
          </button>
        </div>
      </div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
    </section>
  );
};

export default Home;
