import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSocialBoardData } from "@/lib/queries";
import Social from "@/views/Social";
import SocialLoading from "./loading";

export const revalidate = 30;

async function SocialData() {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    session = null;
  }

  const data = await getSocialBoardData(
    session?.user?.id ?? null,
    session?.user?.name ?? null,
  );

  return <Social data={data} />;
}

export default function SocialPage() {
  return (
    <Suspense fallback={<SocialLoading />}>
      <SocialData />
    </Suspense>
  );
}
