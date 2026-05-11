const axios = require('axios');

const testFetch = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/footer-links');
    console.log('Public API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error.response?.status, error.response?.data);
  }
};

testFetch();
