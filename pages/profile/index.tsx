import { NextPage } from "next";
import StarRating from "@components/atom/star-rating";
import Profile from "@components/molecule/profile";
import ProfileBtn from "@components/atom/profile-button";
import Layout from "@components/template/layout";

const MyKarrot: NextPage = () => {
  return (
    <Layout title="나의 캐럿">
      <section>
        <div className="p-4">
          <Profile />
        </div>
        <div className="flex justify-around p-4">
          <ProfileBtn
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            title="판매내역"
          />
          <ProfileBtn
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            title="구매내역"
          />
          <ProfileBtn
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            title="관심목록"
          />
        </div>
        <div className="flex flex-col gap-4 p-4 mt-8">
          <div className="flex gap-4 items-center">
            <div className="bg-slate-400 w-14 h-14 rounded-full" />
            <div>
              <h3 className="font-medium">니꼬</h3>
              <StarRating rate={4} />
            </div>
          </div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni nemo
            amet, voluptatibus in ipsa ea, labore dolorem fuga ducimus
            dignissimos hic, eius laborum impedit ipsam. Natus, soluta! Dolorem
            amet alias aut molestias suscipit ducimus ipsum sequi, nesciunt, rem
            id labore, iste repudiandae animi odio nihil praesentium enim
            tempora nobis inventore!
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default MyKarrot;
