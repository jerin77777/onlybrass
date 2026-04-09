"""
ONLYBRASS Firestore Seeder
Requires: pip install firebase-admin
Place your serviceAccountKey.json in the project root before running.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# --- Init ---
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Ensure serviceAccountKey.json is present.")
    exit(1)

db = firestore.client()

# --- Categories ---
CATEGORIES = [
    {"id": "artisan-series", "name": "The Artisan Series", "slug": "artisan-series"},
    {"id": "collections",    "name": "Standard Collections", "slug": "collections"},
    {"id": "bespoke",        "name": "Bespoke Service", "slug": "bespoke"},
]

# --- Products ---
PRODUCTS = [
    # Top Sellers (Home Page)
    {
        "id": "oro-handle",
        "name": "Oro Handle and Knob",
        "series": "COLLECTIONS",
        "category": "collections",
        "description": "Gold ribbed circular knobs designed for high-end minimalist cabinetry.",
        "price": "₹ 1,099.00",
        "imageUrl": "/assets/oro_knob.png",
        "options": ["28mm / Gold / Brass", "32mm / Gold / Brass"],
        "isTopSeller": True,
        "createdAt": datetime.utcnow(),
    },
    {
        "id": "alhambra-knob",
        "name": "Alhambra Knob",
        "series": "COLLECTIONS",
        "category": "collections",
        "description": "Clover-shaped shell white knobs with a distinct gold rim.",
        "price": "₹ 799.00",
        "imageUrl": "/assets/alhambra_knob.png",
        "options": ["27mm / Shell White / Acrylic", "30mm / Shell White / Acrylic"],
        "isTopSeller": True,
        "createdAt": datetime.utcnow(),
    },
    {
        "id": "regal-knob",
        "name": "Regal Gold Knob",
        "series": "COLLECTIONS",
        "category": "collections",
        "description": "Small round minimalist gold knobs for a subtle luxury accent.",
        "price": "₹ 499.00",
        "imageUrl": "/assets/regal_knob.png",
        "options": ["20mm / Gold / Brass", "25mm / Gold / Brass"],
        "isTopSeller": True,
        "createdAt": datetime.utcnow(),
    },
    {
        "id": "pisa-handle",
        "name": "Pisa Handle and Knob",
        "series": "COLLECTIONS",
        "category": "collections",
        "description": "Textured cylindrical gold handles for modern wooden cabinets.",
        "price": "₹ 699.00",
        "imageUrl": "/assets/pisa_handle.png",
        "options": ["25mm / Gold / Brass", "30mm / Gold / Brass"],
        "isTopSeller": True,
        "createdAt": datetime.utcnow(),
    },
    # Catalog / Bundle (Catalog Page)
    {
        "id": "urbane-handle",
        "name": "Urbane Bar Handle",
        "series": "COLLECTIONS",
        "brand": "ONLYBRASS",
        "category": "collections",
        "priceRange": "₹ 849.00 - ₹ 1,399.00",
        "imageUrl": "/assets/bundle/urbane_handle.png",
        "swatches": [
            {"name": "Black", "color": "#000000"},
            {"name": "Brass", "color": "#b3885d"}
        ],
        "isTopSeller": False,
        "createdAt": datetime.utcnow(),
    },
    {
        "id": "empire-handle",
        "name": "Empire Handle and Knob",
        "series": "COLLECTIONS",
        "brand": "MANTARA",
        "category": "collections",
        "priceRange": "₹ 499.00 - ₹ 799.00",
        "imageUrl": "/assets/bundle/empire_handle.png",
        "swatches": [
            {"name": "White", "color": "#ffffff"},
            {"name": "Brass", "color": "#b3885d"}
        ],
        "isTopSeller": False,
        "createdAt": datetime.utcnow(),
    },
    # Artisan / PDP Featured (Detail Page)
    {
        "id": "aethelred-handle",
        "name": "Aethelred Handle",
        "series": "ARTISAN SIGNATURE SERIES",
        "category": "artisan-series",
        "description": "A masterclass in tactile contrast. Hand-forged solid brass meets the ethereal luminescence of responsibly sourced Mother of Pearl.",
        "price": "₹ 1,499.00 - ₹ 2,999.00",
        "imageUrl": "/assets/bundle/aethelred_main.png",
        "finishes": [
            {"id": "brass", "name": "ANTIQUE BRASS", "color": "#b3885d"},
            {"id": "nickel", "name": "SATIN NICKEL", "color": "#c0c0c0"}
        ],
        "specifications": {
            "MATERIAL": "Solid Brass / MOP Inlay",
            "DIMENSIONS": "L 165mm x H 22mm x P 55mm",
            "WEIGHT": "0.85 kg / Unit",
            "MOUNTING": "Concealed Screws"
        },
        "guarantee": "LIFETIME STRUCTURAL GUARANTEE",
        "isTopSeller": False,
        "createdAt": datetime.utcnow(),
    }
]

def seed_collection(collection_name: str, docs: list, id_field: str | None = None):
    col_ref = db.collection(collection_name)
    for item in docs:
        item_to_save = item.copy()
        doc_id = item_to_save.pop(id_field) if id_field and id_field in item_to_save else None
        if doc_id:
            col_ref.document(doc_id).set(item_to_save)
        else:
            col_ref.add(item_to_save)
    print(f"  ✓ Seeded {len(docs)} documents into '{collection_name}'")

def main():
    print("ONLYBRASS Seeder: Preparing to update Firestore...")
    # NOTE: These lines are commented out as per user instruction to "do not run the script"
    # seed_collection("categories", CATEGORIES, id_field="id")
    # seed_collection("products",   PRODUCTS, id_field="id")
    print("Seed data prepared in script. Run this script manually when serviceAccountKey.json is ready.")

if __name__ == "__main__":
    main()
