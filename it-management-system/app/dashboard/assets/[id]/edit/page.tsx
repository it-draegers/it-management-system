import { notFound, redirect } from "next/navigation";
import { getAsset, updateAsset } from "@/lib/actions/assets";
import { AssetForm } from "@/components/asset-form"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAsset(id);

  if ("error" in result) {
    notFound();
  }

  const { asset } = result;

  async function handleSubmit(data: Parameters<typeof updateAsset>[1]) {
    "use server";
    const res = await updateAsset(id, data);
    if ("error" in res) {
      return;
    }
    redirect(`/dashboard/assets/${id}`);
  }

  async function handleCancel() {
    "use server";

    redirect(`/dashboard/assets/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/assets/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to asset</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Asset</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {asset.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            asset={asset}
            loading={false}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
