import Pagination from "@components/molecule/pagination";
import StreamPreview from "@components/molecule/stream-preview";
import Layout from "@components/template/layout";
import { Stream } from "@prisma/client";
import { useRouter } from "next/router";
import useSWR from "swr";

interface StreamsResponse {
  success: boolean;
  streams: Stream[];
  totalCount: number;
}

const Streams = () => {
  const router = useRouter();
  const { data } = useSWR<StreamsResponse>(
    `/api/streams?page=${router.query.page ?? 1}`
  );
  const fibFn = () => {
    router.push("/streams/upload");
  };
  return (
    <Layout title="라이브" showFib fibFn={fibFn} fibIcon="record">
      <section className="flex flex-col divide-y">
        {[
          data?.streams.map((stream) => (
            <StreamPreview key={stream.id} id={stream.id} title={stream.name} />
          )),
        ]}
        <Pagination
          page={Number(router.query.page)}
          totalCount={data?.totalCount!}
        />
      </section>
    </Layout>
  );
};

export default Streams;
