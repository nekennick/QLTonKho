// Script test để kiểm tra personal access
console.log('=== Test Personal Access ===');

// Test URL parameters
const urlParams = new URLSearchParams(window.location.search);
const manv = urlParams.get('manv');
const chucVu = urlParams.get('ChucVu');

console.log('URL Parameters:');
console.log('manv:', manv);
console.log('ChucVu:', chucVu);

// Test localStorage
console.log('\nLocalStorage:');
console.log('tempUserData:', localStorage.getItem('tempUserData'));
console.log('authToken:', localStorage.getItem('authToken'));
console.log('userData:', localStorage.getItem('userData'));

// Test authUtils
if (typeof window !== 'undefined') {
  // Import authUtils nếu có thể
  console.log('\nAuthUtils Test:');
  console.log('isUserFromUrlParams:', localStorage.getItem('tempUserData') !== null);
  
  // Parse tempUserData nếu có
  const tempUserData = localStorage.getItem('tempUserData');
  if (tempUserData) {
    try {
      const parsed = JSON.parse(tempUserData);
      console.log('Parsed tempUserData:', parsed);
    } catch (e) {
      console.error('Error parsing tempUserData:', e);
    }
  }
}

console.log('\n=== End Test ==='); 