import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAll() {
  console.log('=== Starting Smart Campus Integration Test ===');
  
  // 1. Test Login
  console.log('\nTesting POST /api/auth/login...');
  let token = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@campus.edu',
      password: 'password123'
    });
    console.log('✅ Login successful!');
    console.log('User info returned:', loginRes.data.user);
    token = loginRes.data.token;
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test Get Me
  console.log('\nTesting GET /api/auth/me...');
  try {
    const meRes = await axios.get(`${BASE_URL}/auth/me`, { headers });
    console.log('✅ Profile loaded successfully:', meRes.data);
  } catch (error: any) {
    console.error('❌ Profile loading failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 3. Test Timetable
  console.log('\nTesting GET /api/timetable...');
  try {
    const timetableRes = await axios.get(`${BASE_URL}/timetable`, { headers });
    console.log(`✅ Timetable fetched successfully: ${timetableRes.data.length} classes found.`);
    if (timetableRes.data.length > 0) {
      console.log('Sample class:', timetableRes.data[0]);
    }
  } catch (error: any) {
    console.error('❌ Timetable fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 4. Test Tasks
  console.log('\nTesting GET /api/tasks...');
  try {
    const tasksRes = await axios.get(`${BASE_URL}/tasks`, { headers });
    console.log(`✅ Tasks fetched successfully: ${tasksRes.data.length} tasks found.`);
    if (tasksRes.data.length > 0) {
      console.log('Sample task:', tasksRes.data[0]);
    }
  } catch (error: any) {
    console.error('❌ Tasks fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 5. Test Attendance Stats
  console.log('\nTesting GET /api/attendance/stats...');
  try {
    const attendanceStatsRes = await axios.get(`${BASE_URL}/attendance/stats`, { headers });
    console.log('✅ Attendance stats fetched successfully!');
    console.log('Overall Percentage:', attendanceStatsRes.data.overallPercentage);
    console.log(`Summary classes length: ${attendanceStatsRes.data.summary.length}`);
  } catch (error: any) {
    console.error('❌ Attendance stats fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 6. Test Attendance Logs
  console.log('\nTesting GET /api/attendance/logs...');
  try {
    const attendanceLogsRes = await axios.get(`${BASE_URL}/attendance/logs`, { headers });
    console.log(`✅ Attendance logs fetched successfully: ${attendanceLogsRes.data.length} logs found.`);
  } catch (error: any) {
    console.error('❌ Attendance logs fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 7. Test Notices
  console.log('\nTesting GET /api/notices...');
  try {
    const noticesRes = await axios.get(`${BASE_URL}/notices`, { headers });
    console.log(`✅ Notices fetched: ${noticesRes.data.length} notices found.`);
    if (noticesRes.data.length > 0) {
      console.log('Sample notice:', noticesRes.data[0]);
    }
  } catch (error: any) {
    console.error('❌ Notices fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 8. Test Notes List
  console.log('\nTesting GET /api/notes...');
  try {
    const notesRes = await axios.get(`${BASE_URL}/notes`, { headers });
    console.log(`✅ Notes fetched: ${notesRes.data.length} notes found.`);
  } catch (error: any) {
    console.error('❌ Notes fetch failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 9. Test Note Create, Update, Delete
  console.log('\nTesting Note CRUD...');
  try {
    // Create Note
    const createRes = await axios.post(
      `${BASE_URL}/notes`,
      {
        title: 'Temp Note for Testing',
        content: 'This is a temporary integration test note content.',
        tags: ['Test', 'Temp'],
        color: '#bfdbfe'
      },
      { headers }
    );
    const newNote = createRes.data;
    console.log('✅ Note created successfully:', newNote);

    // Delete Note
    const noteId = newNote._id || newNote.id;
    const deleteRes = await axios.delete(`${BASE_URL}/notes/${noteId}`, { headers });
    console.log('✅ Note deleted successfully:', deleteRes.data);
  } catch (error: any) {
    console.error('❌ Note CRUD failed:', error.response?.data || error.message);
    process.exit(1);
  }

  // 10. Test Register
  console.log('\nTesting POST /api/auth/register...');
  try {
    const tempEmail = `temp_student_${Date.now()}@campus.edu`;
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Temp Test Student',
      email: tempEmail,
      password: 'password123',
      role: 'student',
      avatar: 'avatar2'
    });
    console.log('✅ Registration successful!');
    console.log('New registered user:', registerRes.data.user);

    // Test log in with the new credentials
    const loginTempRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: tempEmail,
      password: 'password123'
    });
    console.log('✅ Login with new registered user successful!');
  } catch (error: any) {
    console.error('❌ Registration test failed:', error.response?.data || error.message);
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('=============================================');
}

testAll();
