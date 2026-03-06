import { FilesPageClient } from "@/components/files/files-page-client";
import { getAllFolders, getFileItems } from "@/lib/actions/files";


type SearchParams = Promise<{
  folder?: string;
}>;

export default async function FilesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentFolder = params.folder || "root";

  const [itemsResult, allFolders] = await Promise.all([
    getFileItems(currentFolder),
    getAllFolders(),
  ]);

  return (
    <div className="p-6">
      <FilesPageClient
        key={currentFolder}
        initialItems={itemsResult.items}
        breadcrumbs={itemsResult.breadcrumbs}
        currentFolder={currentFolder}
        allFolders={allFolders}
      />
    </div>
  );
}