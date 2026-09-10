import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "180" }, { size: "192" }, { size: "512" }, { size: "maskable" }];
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size } = await context.params;
  if (!["180", "192", "512", "maskable"].includes(size))
    return new Response("Not found", { status: 404 });
  if (size === "maskable") return new ImageResponse(
    <div style={{ display: "flex", width: 512, height: 512, background: "#172b3a", alignItems: "center", justifyContent: "center" }}><BrandMark size={340} /></div>,
    { width: 512, height: 512 },
  );
  const pixels = Number(size);
  return new ImageResponse(<BrandMark size={pixels} />, {
    width: pixels,
    height: pixels,
  });
}
