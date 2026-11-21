import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api"
OUT = sys.argv[2] if len(sys.argv) > 2 else "src/lib/demo-data.json"


def get(path):
    with urllib.request.urlopen(BASE + path) as response:
        return json.load(response)


items = []
page = 1
while True:
    result = get(f"/products?page={page}&page_size=48&sort=newest")
    items += result["items"]
    if page >= result["pages"]:
        break
    page += 1

data = {
    "config": get("/config"),
    "categories": get("/categories"),
    "brands": get("/brands"),
    "products": [get(f"/products/{product['slug']}") for product in items],
    "newestOrder": [product["id"] for product in items],
}

with open(OUT, "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, separators=(",", ":"))

print(len(data["products"]), "products written to", OUT)