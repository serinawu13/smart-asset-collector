#!/usr/bin/env python3
"""
Script to seed luxury items via the Admin API
Usage: python seed_via_api.py [--file items.json] [--url http://localhost:8000]
"""
import requests
import json
import argparse
import sys


def seed_items_from_file(file_path: str, api_url: str):
    """
    Seed luxury items from a JSON file via the Admin API
    """
    try:
        # Load items from file
        print(f"📖 Loading items from {file_path}...")
        with open(file_path, 'r') as f:
            items = json.load(f)
        
        print(f"✅ Loaded {len(items)} items")
        
        # Send request to API
        endpoint = f"{api_url}/api/v1/admin/items/seed"
        print(f"🚀 Sending request to {endpoint}...")
        
        response = requests.post(
            endpoint,
            json=items,
            headers={'Content-Type': 'application/json'}
        )
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"   Message: {result['message']}")
            print(f"   Inserted IDs: {', '.join(result['insertedIds'][:3])}...")
            return True
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except FileNotFoundError:
        print(f"❌ Error: File '{file_path}' not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in file - {e}")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to API at {api_url}")
        print("   Make sure the backend server is running!")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def create_single_item(item_data: dict, api_url: str):
    """
    Create a single luxury item via the Admin API
    """
    try:
        endpoint = f"{api_url}/api/v1/admin/items"
        print(f"🚀 Creating item: {item_data['brand']} {item_data['model']}...")
        
        response = requests.post(
            endpoint,
            json=item_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Created item with ID: {result['id']}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Seed luxury items via the Admin API'
    )
    parser.add_argument(
        '--file',
        default='seed_items_example.json',
        help='Path to JSON file with items (default: seed_items_example.json)'
    )
    parser.add_argument(
        '--url',
        default='http://localhost:8000',
        help='API base URL (default: http://localhost:8000)'
    )
    parser.add_argument(
        '--single',
        action='store_true',
        help='Create a single test item instead of loading from file'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🏆 Luxury Items API Seeding Tool")
    print("=" * 60)
    
    if args.single:
        # Create a single test item
        test_item = {
            "brand": "Rolex",
            "model": "GMT-Master II 126710BLRO",
            "category": "Watch",
            "material": "Oystersteel",
            "size": "40mm",
            "color": "Blue/Red",
            "currentMarketValue": 18500,
            "retailPrice": 10700,
            "trend": "up",
            "trendPercentage": 2.8,
            "mentions30Days": 15200,
            "imageUrl": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&q=80"
        }
        success = create_single_item(test_item, args.url)
    else:
        # Seed from file
        success = seed_items_from_file(args.file, args.url)
    
    print("=" * 60)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
