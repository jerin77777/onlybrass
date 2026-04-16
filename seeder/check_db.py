import os
from supabase import create_client, Client
from dotenv import load_dotenv

ADMIN_ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "admin", ".env"))
load_dotenv(ADMIN_ENV_PATH)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table(name):
    print(f"\n--- {name} ---")
    res = supabase.table(name).select("*").execute()
    for row in res.data:
        print(f"ID: {row['id']} | Name: {row.get('name')} | ImageURL: {row.get('image_url')}")

check_table("categories")
check_table("products")
