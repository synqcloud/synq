import ItemEditPage from "@/features/inventory/components/item-edit-page-content";
import { InventoryService } from "@synq/supabase/services";

export default async function Page(props: {
  params: Promise<{ itemId: string }>;
}) {
  const params = await props.params;

  console.log(params);

  const cardData = await InventoryService.getSingleCardDetails(
    "server",
    params.itemId,
  );

  return (
    <ItemEditPage
      item={cardData}
      // collectionId="mock-collection-1"
      // subCollections={mockSubCollections}
      // isImportedCollection={false}
      // collectionRarities={mockCollectionRarities}
    />
  );
}
