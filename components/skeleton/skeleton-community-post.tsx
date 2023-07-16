const SkCommunityPost = () => {
  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="h-6 w-20 bg-slate-300 rounded-xl animate-pulse" />
      <div className="h-6 w-full bg-slate-300 rounded-xl animate-pulse" />
      <div className="mt-4 flex justify-between text-xs text-gray-500 pb-4 border-b">
        <div className="h-4 w-12 bg-slate-300 rounded-xl animate-pulse" />
        <div className="h-4 w-24 bg-slate-300 rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-6 border-b pb-3">
        <div className="h-6 w-24 bg-slate-300 rounded-xl animate-pulse" />
        <div className="h-6 w-24 bg-slate-300 rounded-xl animate-pulse" />
      </div>
    </section>
  );
};

export default SkCommunityPost;
