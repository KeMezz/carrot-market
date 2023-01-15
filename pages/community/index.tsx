import { NextPage } from "next";
import FloatingBtn from "../../components/atom/floating-btn";
import CommunityPost from "../../components/molecule/community-post";
import Layout from "../../components/template/layout";

const Community: NextPage = () => {
  const newPost = () => {};
  return (
    <Layout title="동네생활">
      <section>
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <CommunityPost key={i} />
        ))}
      </section>
      <FloatingBtn
        onClick={newPost}
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
    </Layout>
  );
};

export default Community;
