import os
import mimetypes
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Config ---
ADMIN_ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "admin", ".env"))
load_dotenv(ADMIN_ENV_PATH)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in admin/.env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Placeholders ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCAL_ASSET_BASE = os.path.join(os.path.dirname(__file__), "images")

LOCAL_OVERRIDES = {
    "Knobs": "knob_premium.png",
    "Handles": "handle_premium.png",
    "Draw Knobs": "draw_knob_premium.png",
    "New Arrivals": "new_arrivals_premium.png",
    "Collections": "collections_premium.png"
}

SITE_SETTINGS = [
    {"key": "homepage_collage_image", "value": "https://owyphcjcrtczrvqtuziz.supabase.co/storage/v1/object/public/images/site/1777456479_web_collage.png"},
    {"key": "homepage_story_title", "value": "Our Story"},
    {"key": "homepage_story_description", "value": "OnlyBrass was born from a passion for timeless craftsmanship. We believe that hardware is the jewelry of the home—the final, defining touch that turns a house into a sanctuary of style. Every piece in our collection is a testament to the enduring beauty of solid brass, hand-finished to perfection for those who appreciate the finer details of living."},
    {"key": "homepage_story_image", "value": "https://owyphcjcrtczrvqtuziz.supabase.co/storage/v1/object/public/images/site/1777456483_story_image.png"},
    {"key": "homepage_mailing_title", "value": "Contact Us"},
    {"key": "homepage_mailing_description", "value": "Have a question or looking for a bespoke consultation? We'd love to hear from you."},
    {"key": "contact_email", "value": "hello@onlybrass.com"},
    {"key": "mailing_address", "value": "123 Brass Avenue, Design District, New Delhi, India 110001"}
]



def upload_to_storage(local_rel_path: str, remote_folder: str) -> str | None:
    # Normalize the path
    clean_rel_path = local_rel_path.lstrip('/').replace('/', os.sep)
    local_path = os.path.join(LOCAL_ASSET_BASE, clean_rel_path)
    
    if not os.path.exists(local_path):
        print(f"  [WARNING] Local file not found: {local_path}.")
        return None

    try:
        filename = os.path.basename(local_path)
        remote_path = f"{remote_folder}/{int(datetime.now().timestamp())}_{filename}"
        
        content_type, _ = mimetypes.guess_type(local_path)
        content_type = content_type or "application/octet-stream"

        with open(local_path, 'rb') as f:
            supabase.storage.from_("images").upload(
                path=remote_path,
                file=f,
                file_options={"content-type": content_type}
            )
        
        res = supabase.storage.from_("images").get_public_url(remote_path)
        return res
    except Exception as e:
        print(f"  [ERROR] Upload failed for {local_rel_path}: {e}")
        return None

def clear_storage():
    print("Clearing storage bucket 'images'...")
    try:
        # Clear specific folders we use
        for folder in ["categories", "products"]:
            res = supabase.storage.from_("images").list(folder)
            if res:
                files_to_remove = [f"{folder}/{f['name']}" for f in res]
                if files_to_remove:
                    supabase.storage.from_("images").remove(files_to_remove)
                    print(f"  [OK] Cleared folder: {folder}")
    except Exception as e:
        print(f"  [WARNING] Storage cleanup failed: {e}")

def main():
    print("--- ONLYBRASS Relational Seeder ---")

    # 1. Clear existing data and storage
    clear_storage()
    print("Clearing old database records...")
    # Explicitly clear in order to avoid dependency/orphan issues
    supabase.table("product_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("products").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("sub_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    # 2. Seed Categories and Sub-Categories
    print("Seeding Categories...")
    categories_to_seed = ["Knobs", "Handles", "Draw Knobs", "New Arrivals", "Collections"]
    cat_defs = []
    
    for name in categories_to_seed:
        img_url = None
        if name in LOCAL_OVERRIDES:
            print(f"  Uploading premium local asset for Category: {name}...")
            img_url = upload_to_storage(LOCAL_OVERRIDES[name], "categories")
        
        cat_defs.append({"name": name, "image_url": img_url})

    res_cats = supabase.table("categories").insert(cat_defs).execute()
    categories = res_cats.data

    if not categories:
        print("Failed to seed categories.")
        return

    # Seed 2 Sub-Categories for each Category
    print("Seeding Sub-Categories...")
    all_sub_cats = []
    for cat in categories:
        all_sub_cats.append({"name": f"Classic {cat['name']}", "category_id": cat["id"]})
        all_sub_cats.append({"name": f"Modern {cat['name']}", "category_id": cat["id"]})
    
    res_subs = supabase.table("sub_categories").insert(all_sub_cats).execute()
    sub_categories = res_subs.data

    # 3. Seed 2 products for each category
    # Define some specific product images for variety
    # IMPORTANT: We ensure NO crossover with category images (knob_premium, handle_premium, etc.)
    product_pool = {
        "Knobs": ["maverick_knob.png", "story_3.png"],
        "Handles": ["cleo_handle.png", "mirabella_handle.png", "urbane_handle.png", "empire_handle.png", "sydney_handle.png"],
        "Draw Knobs": ["story_1.png", "story_2.png"],
        "New Arrivals": ["story_2.png", "story_3.png"],
        "Collections": ["story_3.png", "story_1.png"]
    }

    for cat in categories:
        cat_name = cat["name"]
        print(f"\nSeeding products for '{cat_name}'...")

        # Resolve category image
        cat_img_url = None
        if cat_name in LOCAL_OVERRIDES:
            cat_img_url = upload_to_storage(LOCAL_OVERRIDES[cat_name], "categories")

        # Get sub-categories for this category
        cat_subs = [s for s in sub_categories if s["category_id"] == cat["id"]]
        sub_classic = cat_subs[0]
        sub_modern = cat_subs[1]

        # --- Product A: Standard Variants ---
        pool = product_pool.get(cat_name, [])
        img_a = pool[0] if len(pool) > 0 else "story_1.png" # Fallback to a generic story image instead of category image
        
        images_a = []
        if cat_name == "Handles":
            # Handles Product A gets 3 images
            urls = [
                upload_to_storage("cleo_handle.png", "products"),
                upload_to_storage("story_1.png", "products"),
                upload_to_storage("story_2.png", "products")
            ]
            images_a = [u for u in urls if u]
        else:
            url = upload_to_storage(img_a, "products")
            images_a = [url] if url else []

        prod_a = {
            "name": f"Minimalist {cat_name} Bolt",
            "series": "URBAN SERIES",
            "category_id": cat["id"],
            "sub_category_id": sub_classic["id"],
            "description": f"Sleek and functional {cat_name.lower()} from our Urban Series.",
            "is_top_seller": True,
            "base_price": 599,
            "images": images_a
        }
        res_a = supabase.table("products").insert(prod_a).execute()
        if res_a.data:
            id_a = res_a.data[0]["id"]
            variants_a = [
                {"product_id": id_a, "group_name": "Size", "group_type": "standard", "value": "Small"},
                {"product_id": id_a, "group_name": "Size", "group_type": "standard", "value": "Large", "price": 799}
            ]
            supabase.table("product_variants").insert(variants_a).execute()
            print(f"  [OK] Seeded '{prod_a['name']}' with {len(images_a)} images.")

        # --- Product B: Color Variants ---
        img_b = pool[1] if len(pool) > 1 else "story_2.png" # Fallback to a generic story image
        
        images_b = []
        if cat_name == "Knobs":
            # Knobs Product B gets 2 images
            urls = [
                upload_to_storage("maverick_knob.png", "products"),
                upload_to_storage("story_3.png", "products")
            ]
            images_b = [u for u in urls if u]
        else:
            url = upload_to_storage(img_b, "products")
            images_b = [url] if url else []

        prod_b = {
            "name": f"Elegant {cat_name} Finish",
            "series": "ROYAL COLLECTION",
            "category_id": cat["id"],
            "sub_category_id": sub_modern["id"],
            "description": f"Premium {cat_name.lower()} featuring artisan hand-applied finishes.",
            "is_top_seller": False,
            "base_price": 1099,
            "images": images_b
        }
        res_b = supabase.table("products").insert(prod_b).execute()
        if res_b.data:
            id_b = res_b.data[0]["id"]
            variants_b = [
                {"product_id": id_b, "group_name": "Finish", "group_type": "color", "value": "#D4AF37", "price": 1299, "images": images_b[:1]},
                {"product_id": id_b, "group_name": "Finish", "group_type": "color", "value": "#808080"}
            ]
            supabase.table("product_variants").insert(variants_b).execute()
            print(f"  [OK] Seeded '{prod_b['name']}' with {len(images_b)} images.")

    # 4. Seed Site Settings
    print("\nSeeding Site Settings...")
    for setting in SITE_SETTINGS:
        supabase.table("site_settings").upsert(setting).execute()
        print(f"  [OK] Seeded setting: {setting['key']}")

    print("\nRelational seeding complete.")

if __name__ == "__main__":
    main()
