import { getSocialBoardData } from "@/lib/queries";
import Social from "@/views/Social";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SocialPage() {
  const data = await getSocialBoardData();
  return <Social data={data} />;
}
