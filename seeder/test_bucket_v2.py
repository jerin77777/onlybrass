from google.cloud import storage
import os
import json

key_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
with open(key_path) as f:
    key_data = json.load(f)
    project_id = key_data["project_id"]

client = storage.Client.from_service_account_json(key_path)

print(f"Listing buckets for project: {project_id}")
try:
    buckets = list(client.list_buckets())
    if not buckets:
        print("No buckets found.")
    for b in buckets:
        print(f"FOUND BUCKET: {b.name}")
except Exception as e:
    print(f"ERROR: {e}")
