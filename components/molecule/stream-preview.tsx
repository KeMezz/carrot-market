import { NextPage } from "next";
import Link from "next/link";

interface StreamPreviewProps {
  id: number;
  title: string;
}

const StreamPreview: NextPage<StreamPreviewProps> = ({ id, title }) => {
  return (
    <Link href={`/streams/${id}`}>
      <div className="flex flex-col gap-2 p-4">
        <div className="w-full bg-slate-300 rounded-md shadow-sm aspect-video" />
        <h2 className="font-medium text-lg">{title}</h2>
      </div>
    </Link>
  );
};

export default StreamPreview;
