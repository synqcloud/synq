import { ServiceBase } from "./base-service";

interface LibraryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
}

export interface LibraryDetails {
  id: string;
  user_id: string;
  isInstalled: boolean;
  content_sets: [
    {
      id: string;
      name: string;
      isInstalled: boolean;
    },
  ];
  quantity: number;
}

export class LibraryService extends ServiceBase {
  static async getLibraryItems(): Promise<LibraryItem[]> {
    const userId = await this.getCurrentUserId();

    return this.execute(
      async () => {
        const client = await this.getClient();
        const { data, error } = await client
          .from("library")
          .select("*")
          .eq("user_id", userId);

        return data as LibraryItem[];
      },
      {
        service: "LibraryService",
        method: "getLibraryItems",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Installs a collection from the library into the user's inventory.
   * Notes: It will call an edge function or trigger.dev job. Depending on how much it takes to run the query, if the collection is large it could lead to timeout.
   * @returns An api response object with a sucess indicator
   */
  static async installLibraryToUser(name: string): Promise<void> {
    throw new Error("Not implemented");
  }

  /**
   * Removes a library from the user inventory.
   * The user can select either to remove all related data (transactions & stock) or keep it.
   */
  static async removeLibraryToUser(removeData: boolean): Promise<void> {
    throw new Error("Not implemented");
  }

  static async getLibraryDetails(id: string): Promise<LibraryDetails> {
    throw new Error("Not implemented");
  }
}
