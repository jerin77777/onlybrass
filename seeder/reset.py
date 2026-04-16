import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load keys from admin/.env for convenience
ADMIN_ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "admin", ".env"))
load_dotenv(ADMIN_ENV_PATH)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in admin/.env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def delete_all(table_name: str):
    print(f"Clearing table '{table_name}'...")
    try:
        # PostgreSQL trick: delete all where id is not null
        # Note: In production you'd use a more targeted truncate or handle RLS.
        # For development, this works if RLS policies allow.
        response = supabase.table(table_name).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"  [OK] Cleared {table_name}")
    except Exception as e:
        print(f"  [ERROR] Failed to clear {table_name}: {e}")

def main():
    print("--- ONLYBRASS Supabase Reset Tool ---")
    # confirm = input("This will delete ALL data in Supabase tables. Proceed? (y/n): ")
    # if confirm.lower() != 'y':
    #     print("Reset cancelled.")
    #     return

    delete_all("products")
    delete_all("sub_categories")
    delete_all("categories")
    
    print("\nDatabase reset complete.")

if __name__ == "__main__":
    main()
