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
      <div className="bg-white overflow-hidden rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-blue-500 p-6 pb-14">
          <h1 className="text-white text-2xl font-bold">Profile</h1>
        </div>
        <div className="rounded-2xl p-6 relative -top-5 bg-white">
          <div className="flex justify-between items-end relative">
            <h3>Orders</h3>
            <p>340</p>
          </div>
          <div className="h-24 w-24 bg-red-400 rounded-full absolute" />
          <div>
            <h3>Spent</h3>
            <p>$2,310</p>
          </div>
        </div>
        <div>
          <h2>Tony Molloy</h2>
          <p>New York, USA</p>
        </div>
      </div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
    </section>
  );
};

export default Home;
