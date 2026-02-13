import requests
import sys
import json
from datetime import datetime, timedelta

class PharmacyAPITester:
    def __init__(self, base_url="https://fazilka-pharmacy.preview.emergentagent.com"):
        self.base_url = base_url
        self.owner_token = None
        self.staff_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.supplier_id = None
        self.medicine_id = None
        self.sale_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_owner_login(self):
        """Test owner login"""
        success, response = self.run_test(
            "Owner Login",
            "POST",
            "auth/login",
            200,
            data={"email": "owner@gkmedicos.com", "password": "owner123"}
        )
        if success and 'token' in response:
            self.owner_token = response['token']
            print(f"   Owner token obtained: {self.owner_token[:20]}...")
            return True
        return False

    def test_staff_login(self):
        """Test staff login"""
        success, response = self.run_test(
            "Staff Login",
            "POST",
            "auth/login",
            200,
            data={"email": "staff@gkmedicos.com", "password": "staff123"}
        )
        if success and 'token' in response:
            self.staff_token = response['token']
            print(f"   Staff token obtained: {self.staff_token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )

    def test_auth_me_owner(self):
        """Test /auth/me endpoint with owner token"""
        return self.run_test(
            "Auth Me (Owner)",
            "GET",
            "auth/me",
            200,
            token=self.owner_token
        )

    def test_auth_me_staff(self):
        """Test /auth/me endpoint with staff token"""
        return self.run_test(
            "Auth Me (Staff)",
            "GET",
            "auth/me",
            200,
            token=self.staff_token
        )

    def test_get_suppliers(self):
        """Test get suppliers (owner only)"""
        success, response = self.run_test(
            "Get Suppliers",
            "GET",
            "supplier",
            200,
            token=self.owner_token
        )
        if success and response and len(response) > 0:
            self.supplier_id = response[0]['_id']
            print(f"   Found supplier ID: {self.supplier_id}")
        return success

    def test_add_supplier(self):
        """Test add new supplier (owner only)"""
        supplier_data = {
            "name": "Test Supplier Ltd",
            "phone": "9876543210",
            "email": "test@supplier.com",
            "address": "Test Address, Test City"
        }
        success, response = self.run_test(
            "Add Supplier",
            "POST",
            "supplier",
            201,
            data=supplier_data,
            token=self.owner_token
        )
        if success and 'supplier' in response:
            self.supplier_id = response['supplier']['_id']
            print(f"   Created supplier ID: {self.supplier_id}")
        return success

    def test_get_medicines(self):
        """Test get medicines"""
        return self.run_test(
            "Get Medicines",
            "GET",
            "medicine",
            200,
            token=self.owner_token
        )

    def test_add_medicine(self):
        """Test add medicine (owner only)"""
        if not self.supplier_id:
            print("❌ Cannot test add medicine - no supplier ID available")
            return False
            
        medicine_data = {
            "name": "Test Medicine",
            "category": "Tablet",
            "batchNumber": "TEST001",
            "expiryDate": (datetime.now() + timedelta(days=365)).isoformat(),
            "quantity": 100,
            "purchasePrice": 10.0,
            "sellingPrice": 15.0,
            "supplierId": self.supplier_id,
            "lowStockThreshold": 10
        }
        success, response = self.run_test(
            "Add Medicine",
            "POST",
            "medicine",
            201,
            data=medicine_data,
            token=self.owner_token
        )
        if success and 'medicine' in response:
            self.medicine_id = response['medicine']['_id']
            print(f"   Created medicine ID: {self.medicine_id}")
        return success

    def test_search_medicines(self):
        """Test search medicines"""
        return self.run_test(
            "Search Medicines",
            "GET",
            "medicine?search=Test",
            200,
            token=self.owner_token
        )

    def test_low_stock_medicines(self):
        """Test low stock medicines"""
        return self.run_test(
            "Low Stock Medicines",
            "GET",
            "medicine/low-stock",
            200,
            token=self.owner_token
        )

    def test_expiry_alert_medicines(self):
        """Test expiry alert medicines"""
        return self.run_test(
            "Expiry Alert Medicines",
            "GET",
            "medicine/expiry-alert",
            200,
            token=self.owner_token
        )

    def test_create_sale(self):
        """Test create sale"""
        if not self.medicine_id:
            print("❌ Cannot test create sale - no medicine ID available")
            return False
            
        sale_data = {
            "medicines": [{
                "medicineId": self.medicine_id,
                "quantity": 2,
                "priceAtSale": 15.0
            }],
            "totalAmount": 30.0,
            "discount": 0,
            "paymentMode": "cash"
        }
        success, response = self.run_test(
            "Create Sale",
            "POST",
            "sales",
            201,
            data=sale_data,
            token=self.owner_token
        )
        if success and 'sale' in response:
            self.sale_id = response['sale']['_id']
            print(f"   Created sale ID: {self.sale_id}")
        return success

    def test_get_sales_owner(self):
        """Test get sales (owner)"""
        return self.run_test(
            "Get Sales (Owner)",
            "GET",
            "sales",
            200,
            token=self.owner_token
        )

    def test_get_sales_staff(self):
        """Test get sales (staff - limited)"""
        return self.run_test(
            "Get Sales (Staff)",
            "GET",
            "sales",
            200,
            token=self.staff_token
        )

    def test_daily_sales(self):
        """Test daily sales stats (owner only)"""
        return self.run_test(
            "Daily Sales Stats",
            "GET",
            "sales/daily",
            200,
            token=self.owner_token
        )

    def test_monthly_sales(self):
        """Test monthly sales stats (owner only)"""
        return self.run_test(
            "Monthly Sales Stats",
            "GET",
            "sales/monthly",
            200,
            token=self.owner_token
        )

    def test_staff_access_denied(self):
        """Test staff access to owner-only endpoints"""
        success1, _ = self.run_test(
            "Staff Access to Add Medicine (Should Fail)",
            "POST",
            "medicine",
            403,
            data={"name": "Test"},
            token=self.staff_token
        )
        
        success2, _ = self.run_test(
            "Staff Access to Daily Sales (Should Fail)",
            "GET",
            "sales/daily",
            403,
            token=self.staff_token
        )
        
        return success1 and success2

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        return self.run_test(
            "Unauthorized Access",
            "GET",
            "medicine",
            401
        )

    def test_reports_endpoints(self):
        """Test reports endpoints (owner only)"""
        success1, _ = self.run_test(
            "Top Selling Report",
            "GET",
            "reports/top-selling",
            200,
            token=self.owner_token
        )
        
        success2, _ = self.run_test(
            "Monthly Summary Report",
            "GET",
            "reports/monthly-summary",
            200,
            token=self.owner_token
        )
        
        return success1 and success2

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete test medicine
        if self.medicine_id:
            self.run_test(
                "Delete Test Medicine",
                "DELETE",
                f"medicine/{self.medicine_id}",
                200,
                token=self.owner_token
            )
        
        # Delete test supplier
        if self.supplier_id:
            self.run_test(
                "Delete Test Supplier",
                "DELETE",
                f"supplier/{self.supplier_id}",
                200,
                token=self.owner_token
            )

def main():
    print("🏥 Starting G.K. Medicos Pharmacy API Tests")
    print("=" * 50)
    
    tester = PharmacyAPITester()
    
    # Test sequence
    tests = [
        # Basic API health
        tester.test_api_health,
        
        # Authentication tests
        tester.test_owner_login,
        tester.test_staff_login,
        tester.test_invalid_login,
        tester.test_auth_me_owner,
        tester.test_auth_me_staff,
        
        # Supplier tests
        tester.test_get_suppliers,
        tester.test_add_supplier,
        
        # Medicine tests
        tester.test_get_medicines,
        tester.test_add_medicine,
        tester.test_search_medicines,
        tester.test_low_stock_medicines,
        tester.test_expiry_alert_medicines,
        
        # Sales tests
        tester.test_create_sale,
        tester.test_get_sales_owner,
        tester.test_get_sales_staff,
        tester.test_daily_sales,
        tester.test_monthly_sales,
        
        # Authorization tests
        tester.test_staff_access_denied,
        tester.test_unauthorized_access,
        
        # Reports tests
        tester.test_reports_endpoints,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Cleanup
    tester.cleanup_test_data()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("✅ Backend API tests mostly successful!")
        return 0
    else:
        print("❌ Backend API tests have significant failures!")
        return 1

if __name__ == "__main__":
    sys.exit(main())