import ItemEditPage from "@/features/inventory/components/item-edit-page-content";

export default async function Page(props: {
  params: Promise<{ itemId: string }>;
}) {
  const params = await props.params;

  // Mock data for development
  const mockItem = {
    id: params.itemId,
    name: "Charizard VMAX",
    image_url:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=600&fit=crop",
    rarity: "rare",
    collection_id: "mock-collection-1",
    stock: [
      {
        id: "stock-1",
        condition: "mint",
        grade: "9.5",
        quantity: 2,
        cogs: 45.0,
        certification_id: "PSA-123456",
        note: "Opened from booster pack",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "stock-2",
        condition: "near_mint",
        quantity: 1,
        cogs: 42.5,
        note: "Traded from friend",
        created_at: "2024-01-10T14:20:00Z",
      },
    ],
  };

  const mockSubCollections = [
    { id: "mock-collection-1", name: "Pokemon TCG" },
    { id: "mock-collection-2", name: "Magic: The Gathering" },
  ];

  const mockCollectionRarities = [
    { name: "common", color: "#E5E7EB" },
    { name: "uncommon", color: "#A7F3D0" },
    { name: "rare", color: "#FCD34D" },
    { name: "mythic", color: "#F472B6" },
    { name: "special", color: "#8B5CF6" },
  ];

  return (
    <ItemEditPage
      item={mockItem}
      collectionId="mock-collection-1"
      subCollections={mockSubCollections}
      isImportedCollection={false}
      collectionRarities={mockCollectionRarities}
    />
  );
}
