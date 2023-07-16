import Layout from "@components/template/layout";
import { NextPage, NextPageContext } from "next";
import client from "@libs/server/client";
import { Product } from "@prisma/client";
import Image from "next/image";
import ProductCard from "@components/molecule/product-card";

interface ProductWithCount extends Product {
  _count: {
    chatRooms: number;
    records: number;
  };
}

interface UserProfileProps {
  profile: {
    avatar: string;
    name: string;
    createdAt: string;
    products: ProductWithCount[];
  };
}

const UserProfile: NextPage<UserProfileProps> = ({ profile }) => {
  console.log(profile);
  return (
    <Layout canGoBack title={`${profile.name} 님의 프로필`}>
      <div className="flex flex-col p-8 justify-center items-center">
        {profile.avatar ? (
          <Image
            width={140}
            height={140}
            priority
            className="rounded-md bg-slate-300"
            src={`https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${profile.avatar}/avatar`}
            alt="avatar"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-slate-300" />
        )}
        <h1 className="mt-6 text-xl font-semibold">{profile.name}</h1>
        <p className="pt-2">
          {new Date(profile.createdAt).toLocaleDateString("ko", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })}
          에 가입
        </p>
      </div>
      <section>
        {profile.products.map((product) => (
          <ProductCard
            title={product.name}
            price={product.price}
            id={product.id}
            image={product.image}
            comment={product._count.chatRooms}
            heart={product._count.records}
            key={product.id}
          />
        ))}
      </section>
    </Layout>
  );
};

export const getServerSideProps = async function ({ query }: NextPageContext) {
  const profile = await client.user.findUnique({
    where: {
      id: Number(query.userId),
    },
    select: {
      avatar: true,
      products: {
        include: {
          _count: {
            select: {
              chatRooms: true,
              records: {
                where: {
                  kind: "favs",
                },
              },
            },
          },
        },
      },
      name: true,
      createdAt: true,
    },
  });
  return {
    props: { profile: JSON.parse(JSON.stringify(profile)) },
  };
};

export default UserProfile;
