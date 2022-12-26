import ProductIcon from "./productIcon";

const Product = () => {
  return (
    <article className="flex p-4 gap-4">
      <div className="bg-slate-400 rounded-lg w-24 h-24" />
      <section className="flex flex-col justify-center">
        <h3 className="font-bold">iPhone 14 Pro Max</h3>
        <p className="text-xs text-slate-500">Black</p>
        <h2 className="mt-2 font-semibold">$999</h2>
      </section>
      <section className="flex gap-4 mt-auto ml-auto">
        <ProductIcon
          count={1}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
        <ProductIcon
          count={1}
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </section>
    </article>
  );
};

export default Product;
