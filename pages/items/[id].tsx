import { NextPage } from "next";
import GridProduct from "../../components/gridProduct";
import Layout from "../../components/layout";
import Profile from "../../components/profile";
import SubmitBtn from "../../components/submitBtn";

const ItemDetail: NextPage = () => {
  return (
    <Layout canGoBack title="Galaxy S50">
      <section className="p-4 ">
        <div className="w-full h-96 bg-slate-300 rounded-md" />
        <Profile />
        <div className="flex flex-col gap-4 py-4 my-4">
          <h2 className="text-3xl font-bold">Galaxy S50</h2>
          <h3 className="text-xl">$140</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores
            esse minima eligendi blanditiis. Mollitia vitae voluptatibus
            exercitationem, a minus fugiat impedit error deleniti dolore. Facere
            ducimus eum ratione facilis in ipsa nisi placeat nemo nesciunt
            expedita neque quos assumenda perferendis aliquam cumque vel, sit
            minima id aspernatur magnam. Error, nihil.
          </p>
          <div className="flex items-center gap-4">
            <SubmitBtn title="Talk to seller" />
            <div className="flex justify-center w-8 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-semibold">Similar items</h3>
          <div className="grid grid-cols-2 py-4 gap-4">
            {Array.from({ length: 5 }, (_, i) => i).map((i) => (
              <GridProduct key={i} title="Galaxy S60" price={6} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ItemDetail;
