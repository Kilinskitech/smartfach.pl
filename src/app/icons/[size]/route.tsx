import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "180" }, { size: "192" }, { size: "512" }];
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size } = await context.params;
  if (!["180", "192", "512"].includes(size))
    return new Response("Not found", { status: 404 });
  const pixels = Number(size);
  return new ImageResponse(<BrandMark size={pixels} />, {
    width: pixels,
    height: pixels,
  });
}
