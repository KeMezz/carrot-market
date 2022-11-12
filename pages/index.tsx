import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <section className="bg-slate-400 py-10 px-8 flex flex-col space-y-10 items-center min-h-screen">
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
          <button className="mt-5 mx-auto bg-blue-500 p-3 text-white rounded-xl w-2/3 self-center text-center hover:bg-teal-500 hover:text-black active:bg-yellow-500 focus:bg-red-500 transition-colors">
            Checkout
          </button>
        </div>
      </div>
      <div className="bg-white overflow-hidden rounded-2xl shadow-xl max-w-2xl w-full group">
        <div className="bg-blue-500 p-6 pb-14">
          <h1 className="text-white text-2xl font-bold">Profile</h1>
        </div>
        <div className="rounded-2xl p-6 pb-0 relative -top-5 bg-white">
          <div className="flex justify-between items-end relative">
            <h3 className="font-bold">Orders</h3>
            <p>340</p>
          </div>
          <div className="h-24 w-24 bg-gray-400 rounded-full absolute -top-8 left-1/2 -translate-x-1/2 group-hover:bg-red-300 transition-colors" />
          <div className="flex justify-between items-end">
            <h3 className="font-bold">Spent</h3>
            <p>$2,310</p>
          </div>
        </div>
        <div className="text-center pb-6">
          <h2 className="font-bold text-xl">Tony Molloy</h2>
          <p>New York, USA</p>
        </div>
      </div>
      <div className="bg-white p-6 pt-10 rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-5">
          <button>⬅️</button>
          <div className="space-x-3">
            <button>⭐️4.9</button>
            <button className="shadow-xl p-2 rounded-md">❤️</button>
          </div>
        </div>
        <div className="bg-zinc-400 h-72" />
        <div className="mt-3 mb-5">
          <div className="mb-3">
            <h2 className="font-medium">Swoon Lounge</h2>
            <p className="text-xs text-gray-500">Chair</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-x-4">
              <button className="w-5 h-5 rounded-full bg-yellow-500 focus:ring-2 ring-offset-2 ring-yellow-500 transition" />
              <button className="w-5 h-5 rounded-full bg-indigo-500 focus:ring-2 ring-offset-2 ring-indigo-500 transition" />
              <button className="w-5 h-5 rounded-full bg-teal-500 focus:ring-2 ring-offset-2 ring-teal-500 transition" />
            </div>
            <div className="flex items-center space-x-5">
              <button className="p-1.5 bg-blue-200 flex justify-center items-center aspect-square w-8 h-8 text-gray-700 rounded-lg">
                -
              </button>
              <span>1</span>
              <button className="p-1.5 bg-blue-200 flex justify-center items-center aspect-square w-8 h-8 text-gray-700 rounded-lg">
                +
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <h1 className="font-medium text-2xl">$450</h1>
            <button className="bg-blue-500 text-center text-white rounded-lg py-2 px-10">
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full"></div>
    </section>
  );
};

export default Home;
