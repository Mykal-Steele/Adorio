import { Suspense } from "react";
import { getSocialBoardData } from "@/lib/queries";
import Social from "@/views/Social";
import SocialLoading from "./loading";

export const revalidate = 30;

async function SocialData() {
  const data = await getSocialBoardData();
  return <Social data={data} />;
}

export default function SocialPage() {
  return (
    <Suspense fallback={<SocialLoading />}>
      <SocialData />
    </Suspense>
  );
}
