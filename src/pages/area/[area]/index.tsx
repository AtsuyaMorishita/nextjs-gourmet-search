import FixedButton from "@/components/FixedButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LayoutMain } from "@/components/LayoutMain";
import { LayoutWrap } from "@/components/LayoutWrap";
import { Meta } from "@/components/Meta";
import { Pagination } from "@/components/Pagination";
import { ShopItem } from "@/components/ShopItem";
import { Sidebar } from "@/components/Sidebar";
import { TextArea } from "@/components/TextArea";
import { PLACE, REVALIDATE_TIME } from "@/data/data";
import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type HomeType = {
  area: string | undefined;
};

export default function Home({ area }: HomeType) {
  const [searchNum, setSearchNum] = useState(null);
  const [shopData, setShopData] = useState([]);
  const [genreName, setGenreName] = useState("全てのジャンル");
  const [totalPages, setTotalPages] = useState(1);
  const [loadAreaText, setLoadAreaText] = useState("お店を探しています・・・");
  const [isPagination, setIsPagination] = useState(true);

  const router = useRouter();
  const { query, asPath } = router;
  const currentPage = query.page || 1;
  const urlWithoutQuery = asPath.split("?")[0];

  //sp サイドメニューの表示切り替え
  const [sideIn, setSideIn] = useState<string | null>(null);
  const sideNavIn = () => {
    if (!sideIn) {
      setSideIn("left-[0]");
    } else {
      setSideIn(null);
    }
  };

  const firstGetShop = async () => {
    setIsPagination(true);
    setShopData([]);
    setSearchNum(null);
    try {
      const res = await axios.get("/api/getShopLists", {
        params: {
          place: area,
          startNum: currentPage,
        },
      });
      setGenreName("全てのジャンル");
      setShopData(res.data.shop);
      setTotalPages(Math.ceil(res.data.results_available / 10));
      await setSearchNum(res.data.results_available);
      if (!res.data.results_available) {
        setLoadAreaText("条件に一致するお店が見つかりませんでした。");
      } else {
        setLoadAreaText("お店を探しています・・・");
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    firstGetShop();
    setSideIn(null);
  }, [router.query]);

  //エリア名を取得
  const areaData = PLACE.find((data) => {
    return data.KEY === area;
  });
  const areaName = areaData?.NAME;

  return (
    <>
      <Meta title={`${areaName}`} />

      <Header onClick={firstGetShop} />

      <LayoutWrap>
        <Sidebar
          area={area}
          resolvedUrl={`/area/${area}/genre`}
          setSearchNum={setSearchNum}
          setShopData={setShopData}
          sideIn={sideIn}
          setSideIn={setSideIn}
          setGenreName={setGenreName}
          setIsPagination={setIsPagination}
        />
        <LayoutMain>
          {/* リードエリア */}
          <TextArea
            searchNum={searchNum}
            genreName={genreName}
            area={area}
            loadAreaText={loadAreaText}
          />

          {/* 店舗リスト */}
          <ul>
            {shopData.map((shop: any) => (
              <ShopItem key={shop.id} shop={shop} />
            ))}
          </ul>

          {/* ページネーション */}
          {shopData.length && isPagination ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              path={urlWithoutQuery}
            />
          ) : (
            ""
          )}
        </LayoutMain>
      </LayoutWrap>

      <Footer />

      <FixedButton onClick={sideNavIn} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const area = context.params?.area;

  return {
    props: {
      area,
    },
    revalidate: REVALIDATE_TIME,
  };
};