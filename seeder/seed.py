import os
import json
import mimetypes
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Config ---
ADMIN_ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "admin", ".env"))
load_dotenv(ADMIN_ENV_PATH)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCAL_ASSET_BASE = os.path.join(PROJECT_ROOT, "client", "public")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in admin/.env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Placeholders ---
PLACEHOLDERS = {
    "categories": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    "products": "https://images.unsplash.com/photo-1621259182978-f09e5e2ca091?auto=format&fit=crop&w=800&q=80"
}

# --- Helpers ---
def upload_to_storage(local_rel_path: str, remote_folder: str) -> str | None:
    # Normalize the path for Windows/Unix compatibility
    clean_rel_path = local_rel_path.lstrip('/').replace('/', os.sep)
    local_path = os.path.join(LOCAL_ASSET_BASE, clean_rel_path)
    
    if not os.path.exists(local_path):
        print(f"  [INFO] Local file not found: {local_path}. Using placeholder.")
        return PLACEHOLDERS.get(remote_folder, PLACEHOLDERS["products"])

    try:
        filename = os.path.basename(local_path)
        remote_path = f"{remote_folder}/{int(datetime.now().timestamp())}_{filename}"
        
        # Get content type
        content_type, _ = mimetypes.guess_type(local_path)
        content_type = content_type or "application/octet-stream"

        with open(local_path, 'rb') as f:
            supabase.storage.from_("images").upload(
                path=remote_path,
                file=f,
                file_options={"content-type": content_type}
            )
        
        # Get public URL
        res = supabase.storage.from_("images").get_public_url(remote_path)
        return res
    except Exception as e:
        print(f"  [ERROR] Upload failed for {local_rel_path}: {e}")
        return PLACEHOLDERS.get(remote_folder, PLACEHOLDERS["products"])

# --- Data ---
CATEGORIES = [
    {"name": "Knobs",        "image_url": "/assets/oro_knob.png"},
    {"name": "Handles",      "image_url": "/assets/pisa_handle.png"},
    {"name": "Draw Knobs",   "image_url": "/assets/bundle/maverick_knob.png"},
    {"name": "New Arrivals", "image_url": "/assets/bundle/story_2.png"},
    {"name": "Collections",  "image_url": "/assets/bundle/story_1.png"},
]

SUB_CATEGORIES = [
    {"name": "Pull Handles", "category_name": "Handles"},
    {"name": "T-Bar Handles","category_name": "Handles"},
    {"name": "Cabinet Knobs","category_name": "Knobs"},
    {"name": "Door Knobs",   "category_name": "Knobs"},
    {"name": "Standard",     "category_name": "Collections"},
    {"name": "Artisan",      "category_name": "Collections"},
]

PRODUCTS = [
    {
        "name": "Oro Handle and Knob",
        "series": "COLLECTIONS",
        "category_name": "Knobs",
        "sub_category_name": "Cabinet Knobs",
        "description": "Gold ribbed circular knobs designed for high-end minimalist cabinetry.",
        "price": "₹ 1,099.00",
        "image_url": "/assets/oro_knob.png",
        "is_top_seller": True,
        "variants": [{"name": "Size", "values": ["28mm", "32mm"]}]
    },
    {
        "name": "Alhambra Knob",
        "series": "COLLECTIONS",
        "category_name": "Knobs",
        "sub_category_name": "Cabinet Knobs",
        "description": "Clover-shaped shell white knobs with a distinct gold rim.",
        "price": "₹ 799.00",
        "image_url": "/assets/alhambra_knob.png",
        "is_top_seller": True,
        "variants": [{"name": "Size", "values": ["27mm", "30mm"]}]
    },
    {
         "name": "Aethelred Handle",
         "series": "ARTISAN SIGNATURE SERIES",
         "category_name": "Collections",
         "sub_category_name": "Artisan",
         "description": "A masterclass in tactile contrast. Hand-forged solid brass meets the ethereal luminescence of responsibly sourced Mother of Pearl.",
         "price": "₹ 1,499.00 - ₹ 2,999.00",
         "image_url": "/assets/bundle/aethelred_main.png",
         "is_top_seller": False,
         "variants": [{"name": "Finish", "values": ["ANTIQUE BRASS", "SATIN NICKEL"]}]
    },
    {
         "name": "Pisa Handle",
         "series": "COLLECTIONS",
         "category_name": "Handles",
         "sub_category_name": "Pull Handles",
         "description": "Textured luxury brass handle.",
         "price": "₹ 899.00",
         "image_url": "/assets/pisa_handle.png",
         "is_top_seller": True,
         "variants": []
    }
]

def main():
    print("--- ONLYBRASS Supabase Seeder ---")
    
    # 1. Categories
    print("\nSeeding Categories...")
    cat_id_map = {}
    for cat in CATEGORIES:
        image_url = upload_to_storage(cat["image_url"], "categories")
        if image_url:
            cat["image_url"] = image_url
        
        res = supabase.table("categories").insert(cat).execute()
        if res.data:
            cat_id_map[cat["name"]] = res.data[0]["id"]
            print(f"  [OK] Seeded {cat['name']}")

    # 2. Sub-Categories
    print("\nSeeding Sub-Categories...")
    for sc in SUB_CATEGORIES:
        parent_id = cat_id_map.get(sc.pop("category_name"))
        if parent_id:
            sc["category_id"] = parent_id
            supabase.table("sub_categories").insert(sc).execute()
            print(f"  [OK] Seeded {sc['name']}")

    # 3. Products
    print("\nSeeding Products...")
    for prod in PRODUCTS:
        image_url = upload_to_storage(prod["image_url"], "products")
        if image_url:
            prod["image_url"] = image_url
        
        supabase.table("products").insert(prod).execute()
        print(f"  [OK] Seeded {prod['name']}")

    print("\nSeeding complete.")

if __name__ == "__main__":
    main()
