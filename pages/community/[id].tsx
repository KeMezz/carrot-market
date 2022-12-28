import { NextPage } from "next";
import CommunityCategory from "../../components/atom/communityCategory";
import CommunityQuestion from "../../components/atom/communityQuestion";
import ReactionBtn from "../../components/atom/reactionBtn";
import SubmitBtn from "../../components/atom/submitBtn";
import Textarea from "../../components/atom/textarea";
import Profile from "../../components/molecule/profile";
import Layout from "../../components/template/layout";

const CommunityDetail: NextPage = () => {
  return (
    <Layout canGoBack>
      <section className="flex flex-col p-4 gap-4">
        <CommunityCategory category="동네질문" />
        <Profile />
        <CommunityQuestion question="What is the best mandu restaurant?" />
        <div className="flex gap-6 border-t border-b py-3">
          <ReactionBtn
            title="궁금해요"
            count={1}
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <ReactionBtn
            title="답변"
            count={1}
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-300 w-14 h-12 rounded-full" />
          <div className="flex flex-col gap-1 w-fit">
            <h3 className="text-sm">Steve Jobs</h3>
            <p className="text-xs text-gray-400">2시간 전</p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque
              repellendus harum odit alias itaque? Vitae, sapiente unde dolor
              natus ea eveniet perferendis nihil praesentium aliquam officiis
              cumque. Illo modi eos eligendi laboriosam earum, molestiae tenetur
              officia magnam repudiandae molestias sit facere voluptates
              quisquam maxime deleniti cum! Amet iste necessitatibus molestiae.
            </p>
          </div>
        </div>
        <Textarea id="answer" placeholder="Answer the question!" />
        <SubmitBtn title="Reply" />
      </section>
    </Layout>
  );
};

export default CommunityDetail;
