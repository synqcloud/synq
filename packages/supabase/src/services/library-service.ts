import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

type CoreLibrary = Database["public"]["Tables"]["core_libraries"]["Row"];
export type LibraryItemsWithStatus = CoreLibrary & {
  user_library_access: any;
};

export class LibraryService extends ServiceBase {
  /**
   * Installs a collection from the library into the user's inventory.
   * Notes: It will call an edge function or trigger.dev job. Depending on how much it takes to run the query, if the collection is large it could lead to timeout.
   * @returns An api response object with a sucess indicator
   */
  static async getLibraryItems(
    context: "server" | "client" = "server",
  ): Promise<any[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("core_libraries")
          .select(
            `
            id,
            name,
            slug,
            description,
            image_url,
            status,
            user_library_access!left (
              core_library_id
            )
            `,
          )
          .eq("user_library_access.user_id", userId)
          .order("name");

        if (error) throw error;

        return data ?? [];
      },
      {
        service: "LibraryService",
        method: "getLibraryItems",
        userId: userId || undefined,
      },
    );
  }

  static async installLibraryToUser(
    context: "server" | "client" = "client",
    coreLibraryId: string,
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { error } = await client.from("user_library_access").insert({
          user_id: userId,
          core_library_id: coreLibraryId,
        });

        if (error) {
          throw error;
        }

        return true;
      },
      {
        service: "LibraryService",
        method: "grantUserAccessToLibrary",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Removes a library from the user inventory.
   * The user can select either to remove all related data (transactions & stock) or keep it.
   */
  static async removeLibraryToUser(
    context: "server" | "client" = "client",
    coreLibraryId: string,
    eraseRelatedData: boolean,
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { error } = await client
          .from("user_library_access")
          .delete()
          .eq("user_id", userId)
          .eq("core_library_id", coreLibraryId);

        if (error) {
          return false;
        }

        return true;
      },
      {
        service: "LibraryService",
        method: "removeUserAccessToLibrary",
        userId: userId || undefined,
      },
    );
  }

  static async getUserLibraries(
    context: "server" | "client" = "client",
  ): Promise<string[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: libraryIds, error } = await client
          .from("user_library_access")
          .select("core_library_id")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        return libraryIds.map(({ core_library_id }) => core_library_id);
      },
      {
        service: "LibraryService",
        method: "getUserAccess",
        userId: userId || undefined,
      },
    );
  }
}
