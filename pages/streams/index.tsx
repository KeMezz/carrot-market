import { useRouter } from "next/router";
import FloatingBtn from "../../components/atom/floatingBtn";
import StreamPreview from "../../components/molecule/streamPreview";
import Layout from "../../components/template/layout";

const Streams = () => {
  const { push } = useRouter();
  const goLive = () => {
    push("/streams/upload");
  };
  return (
    <Layout title="라이브">
      <section className="flex flex-col divide-y">
        {[
          Array.from({ length: 10 }, (_, i) => i).map((i) => (
            <StreamPreview key={i} title="Let's try potatos" />
          )),
        ]}
      </section>
      <FloatingBtn onClick={goLive} />
    </Layout>
  );
};

export default Streams;
