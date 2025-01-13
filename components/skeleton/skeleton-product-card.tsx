const SkProductCard = () => {
  return (
    <article className="flex p-4 gap-4 rounded-md">
      <div className="bg-slate-300 rounded-lg w-24 h-24 animate-pulse flex-shrink-0" />
      <section className="flex flex-col justify-center gap-2 animate-pulse rounded-md">
        <div className="w-24 h-6 bg-slate-300 animate-pulse rounded-md" />
        <div className="w-52 h-4 bg-slate-300 animate-pulse rounded-md" />
        <div className="w-56 h-4 bg-slate-300 rounded-md" />
      </section>
      <section className="flex gap-2 mt-auto ml-auto">
        <div className="w-8 h-4 bg-slate-300 animate-pulse rounded-md" />
        <div className="w-8 h-4 bg-slate-300 animate-pulse rounded-md" />
      </section>
    </article>
  );
};

export default SkProductCard;
