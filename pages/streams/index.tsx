import FloatingBtn from "@components/atom/floating-btn";
import StreamPreview from "@components/molecule/stream-preview";
import Layout from "@components/template/layout";
import { Stream } from "@prisma/client";
import Link from "next/link";
import useSWR from "swr";

interface StreamsResponse {
  success: boolean;
  streams: Stream[];
}

const Streams = () => {
  const { data } = useSWR<StreamsResponse>(`/api/streams`);
  return (
    <Layout title="라이브">
      <section className="flex flex-col divide-y">
        {[
          data?.streams.map((stream) => (
            <StreamPreview key={stream.id} id={stream.id} title={stream.name} />
          )),
        ]}
      </section>
      <Link href="/streams/upload">
        <FloatingBtn d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </Link>
    </Layout>
  );
};

export default Streams;
