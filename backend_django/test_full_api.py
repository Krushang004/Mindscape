#!/usr/bin/env python
"""
Comprehensive test script for Mental Health Tracker API
"""
import requests
import json
from datetime import datetime, date

BASE_URL = "http://127.0.0.1:8000"

def test_basic_endpoints():
    """Test basic read-only endpoints"""
    print("🔍 Testing Basic API Endpoints...")
    print("=" * 60)
    
    # Test moods
    try:
        response = requests.get(f"{BASE_URL}/api/moods/")
        if response.status_code == 200:
            moods = response.json()
            print(f"✅ Moods API: {len(moods['results'])} moods loaded")
            for mood in moods['results']:
                print(f"   - {mood['emoji']} {mood['name']} ({mood['color']})")
        else:
            print(f"❌ Moods API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Moods API error: {e}")
    
    print()
    
    # Test activities
    try:
        response = requests.get(f"{BASE_URL}/api/activities/")
        if response.status_code == 200:
            activities = response.json()
            print(f"✅ Activities API: {len(activities['results'])} activities loaded")
            
            # Group by category
            categories = {}
            for activity in activities['results']:
                cat = activity['category']
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(activity['name'])
            
            for category, acts in categories.items():
                print(f"   📁 {category.title()}: {len(acts)} activities")
                for act in acts[:3]:  # Show first 3
                    print(f"      - {act}")
                if len(acts) > 3:
                    print(f"      ... and {len(acts) - 3} more")
        else:
            print(f"❌ Activities API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Activities API error: {e}")
    
    print()
    
    # Test activities by category
    try:
        response = requests.get(f"{BASE_URL}/api/activities/by_category/?category=exercise")
        if response.status_code == 200:
            exercise_activities = response.json()
            print(f"✅ Exercise Activities: {len(exercise_activities)} found")
            for act in exercise_activities:
                print(f"   - {act['icon']} {act['name']}")
        else:
            print(f"❌ Exercise activities filter failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Exercise activities filter error: {e}")
    
    print()

def test_admin_interface():
    """Test admin interface accessibility"""
    print("🔐 Testing Admin Interface...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        if response.status_code == 200:
            print("✅ Admin interface accessible")
            print("   📍 URL: http://127.0.0.1:8000/admin/")
            print("   👤 Username: admin")
            print("   🔑 Password: [set during setup]")
        else:
            print(f"❌ Admin interface: {response.status_code}")
    except Exception as e:
        print(f"❌ Admin interface error: {e}")
    
    print()

def test_google_auth():
    """Test Google authentication endpoint"""
    print("🔑 Testing Google Authentication...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/auth/google")
        if response.status_code == 405:  # Method not allowed (expected for GET)
            print("✅ Google auth endpoint accessible (GET not allowed as expected)")
            print("   📍 Endpoint: POST /auth/google")
        else:
            print(f"⚠️  Google auth endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Google auth endpoint error: {e}")
    
    print()

def test_api_structure():
    """Test API structure and pagination"""
    print("🏗️  Testing API Structure...")
    print("=" * 60)
    
    # Test pagination
    try:
        response = requests.get(f"{BASE_URL}/api/activities/")
        if response.status_code == 200:
            data = response.json()
            if 'count' in data and 'next' in data and 'previous' in data:
                print("✅ Pagination structure correct")
                print(f"   📊 Total count: {data['count']}")
                print(f"   📄 Page size: {len(data['results'])}")
                print(f"   🔗 Next page: {'Yes' if data['next'] else 'No'}")
            else:
                print("⚠️  Pagination structure incomplete")
        else:
            print(f"❌ API structure test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API structure test error: {e}")
    
    print()

def test_cors_headers():
    """Test CORS headers"""
    print("🌐 Testing CORS Configuration...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/moods/")
        if response.status_code == 200:
            cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
            if cors_headers:
                print("✅ CORS headers present")
                print(f"   🌍 Access-Control-Allow-Origin: {cors_headers}")
            else:
                print("⚠️  CORS headers not found")
        else:
            print(f"❌ CORS test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ CORS test error: {e}")
    
    print()

def main():
    """Run all tests"""
    print("🧠 Mental Health Tracker - Full API Test Suite")
    print("=" * 60)
    print(f"📍 Testing server at: {BASE_URL}")
    print(f"⏰ Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    test_basic_endpoints()
    test_admin_interface()
    test_google_auth()
    test_api_structure()
    test_cors_headers()
    
    print("=" * 60)
    print("🎉 Full API test completed!")
    print()
    print("📋 Next Steps:")
    print("   1. Visit http://127.0.0.1:8000/admin/ to manage data")
    print("   2. Test API endpoints in your frontend app")
    print("   3. Set up environment variables for production")
    print("   4. Implement user authentication flow")

if __name__ == "__main__":
    main()
