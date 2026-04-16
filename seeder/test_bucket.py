import firebase_admin
from firebase_admin import credentials, storage
import os

key_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)

try:
    print("Listing all buckets in project...")
    # This uses the underlying google-cloud-storage client
    client = storage.bucket().client
    buckets = list(client.list_buckets())
    if not buckets:
        print("No buckets found in this project.")
    for b in buckets:
        print(f"FOUND BUCKET: {b.name}")
except Exception as e:
    print(f"ERROR: {e}")
