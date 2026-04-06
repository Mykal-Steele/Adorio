import { getSocialBoardData } from "@/lib/queries";
import Social from "@/views/Social";

export default async function SocialPage() {
  const data = await getSocialBoardData();
  return <Social data={data} />;
}
