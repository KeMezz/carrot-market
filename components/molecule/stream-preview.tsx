import { NextPage } from "next";

interface StreamPreviewProps {
  title: string;
}

const StreamPreview: NextPage<StreamPreviewProps> = ({ title }) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="w-full bg-slate-300 rounded-md shadow-sm aspect-video" />
      <h2 className="font-medium text-lg">{title}</h2>
    </div>
  );
};

export default StreamPreview;
