const SkProductCard = () => {
  return (
    <article className="flex p-4 gap-4 rounded-md">
      <div className="bg-slate-300 rounded-lg w-24 h-24 animate-pulse flex-shrink-0" />
      <div className="flex flex-col justify-between w-full">
        <section className="flex flex-col justify-center mt-5 gap-2 animate-pulse rounded-md">
          <div className="w-48 h-5 bg-slate-300 animate-pulse rounded-md" />
          <div className="w-20 h-4 bg-slate-300 animate-pulse rounded-md" />
        </section>
        <section className="flex gap-2 mt-auto ml-auto">
          <div className="w-8 h-4 bg-slate-300 animate-pulse rounded-md" />
          <div className="w-8 h-4 bg-slate-300 animate-pulse rounded-md" />
        </section>
      </div>
    </article>
  );
};

export default SkProductCard;
