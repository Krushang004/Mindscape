#!/usr/bin/env python
"""
Simple test script to verify Django API endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api_endpoints():
    """Test the main API endpoints"""
    
    print("Testing Mental Health Tracker API...")
    print("=" * 50)
    
    # Test moods endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/moods/")
        if response.status_code == 200:
            moods = response.json()
            print(f"✅ Moods API: {len(moods['results'])} moods found")
            for mood in moods['results'][:3]:  # Show first 3
                print(f"   - {mood['emoji']} {mood['name']}: {mood['description']}")
        else:
            print(f"❌ Moods API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Moods API error: {e}")
    
    print()
    
    # Test activities endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/activities/")
        if response.status_code == 200:
            activities = response.json()
            print(f"✅ Activities API: {len(activities['results'])} activities found")
            print(f"   Categories: {set(act['category'] for act in activities['results'])}")
        else:
            print(f"❌ Activities API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Activities API error: {e}")
    
    print()
    
    # Test admin endpoint
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        if response.status_code == 200:
            print("✅ Admin interface accessible")
        else:
            print(f"❌ Admin interface: {response.status_code}")
    except Exception as e:
        print(f"❌ Admin interface error: {e}")
    
    print()
    print("=" * 50)
    print("API test completed!")

if __name__ == "__main__":
    test_api_endpoints()
