const SkChatPreview = () => {
  return (
    <div className="flex p-4 gap-4 items-center w-full">
      <div className="w-12 h-12 rounded-full bg-slate-300 animate-pulse shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <div className="w-24 h-5 bg-slate-300 animate-pulse rounded-lg" />
        <div className="w-full h-4 bg-slate-300 animate-pulse rounded-lg" />
      </div>
    </div>
  );
};

export default SkChatPreview;
