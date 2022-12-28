import { NextPage } from "next";
import ReactionBtn from "../../components/atom/reactionBtn";
import CommunityPost from "../../components/molecule/communityPost";
import Layout from "../../components/template/layout";

const Community: NextPage = () => {
  return (
    <Layout title="동네생활">
      <section>
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <CommunityPost key={i} />
        ))}
      </section>
    </Layout>
  );
};

export default Community;
