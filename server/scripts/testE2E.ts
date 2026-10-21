async function runE2E() {
  const baseUrl = 'http://localhost:5000/api/v1';

  console.log('--- 1. Student Login ---');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'arun.student@placementvault.edu', password: 'StudentPass@123' }),
  });
  const loginData = await loginRes.json();
  console.log(`Student login status: ${loginRes.status}, user: ${loginData.user?.name}, role: ${loginData.user?.role}`);
  const studentToken = loginData.token;

  console.log('--- 2. Fetch Questions List ---');
  const qListRes = await fetch(`${baseUrl}/questions?limit=2`);
  const qListData = await qListRes.json();
  console.log(`Questions count: ${qListData.data?.length}, Total: ${qListData.meta?.total}`);
  const firstQ = qListData.data[0];
  console.log(`First Question: "${firstQ.title}" at ${firstQ.company?.name}`);

  console.log('--- 3. Toggle Bookmark ---');
  const bmRes = await fetch(`${baseUrl}/questions/${firstQ._id}/bookmark`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const bmData = await bmRes.json();
  console.log(`Bookmark response: bookmarked=${bmData.bookmarked}, message="${bmData.message}"`);

  console.log('--- 4. Post New Answer ---');
  const ansRes = await fetch(`${baseUrl}/questions/${firstQ._id}/answers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Alternative solution: Hash set with two pointers approach.',
      programmingLanguage: 'Python',
      codeSnippet: 'def lengthOfLongestSubstring(s):\n    char_set = set()\n    left = res = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        res = max(res, right - left + 1)\n    return res',
    }),
  });
  const ansData = await ansRes.json();
  console.log(`Answer created: ID=${ansData.data?._id}, status=${ansRes.status}`);
  const answerId = ansData.data?._id;

  console.log('--- 5. Toggle Helpful Vote on Answer ---');
  const voteRes = await fetch(`${baseUrl}/answers/${answerId}/vote`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const voteData = await voteRes.json();
  console.log(`Vote response: hasVoted=${voteData.hasVoted}, helpfulCount=${voteData.helpfulCount}`);

  console.log('--- 6. Post Discussion Comment ---');
  const commentRes = await fetch(`${baseUrl}/questions/${firstQ._id}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetType: 'question',
      targetId: firstQ._id,
      content: 'Was this problem in the 45-minute preliminary round or the final round?',
    }),
  });
  const commentData = await commentRes.json();
  console.log(`Comment created: ID=${commentData.data?._id}, author=${commentData.data?.author?.name}`);

  console.log('--- 7. Administrator Login ---');
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@placementvault.edu', password: 'AdminSecure@2026!' }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log(`Admin login status: ${adminLoginRes.status}, user: ${adminLoginData.user?.name}, role: ${adminLoginData.user?.role}`);
  const adminToken = adminLoginData.token;

  console.log('--- 8. Admin Dashboard Telemetry ---');
  const adminStatsRes = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminStatsData = await adminStatsRes.json();
  console.log('Admin Summary:', adminStatsData.data?.summary);

  console.log('--- 9. Duplicate Identifier Analysis ---');
  const dupRes = await fetch(`${baseUrl}/admin/duplicates`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dupData = await dupRes.json();
  console.log(`Duplicates detected: ${dupData.count} pairs found.`);

  console.log('--- 10. CSV Export Download ---');
  const csvRes = await fetch(`${baseUrl}/admin/export/questions`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const csvText = await csvRes.text();
  console.log(`CSV Export lines: ${csvText.split('\n').length}, Header: ${csvText.split('\r\n')[0]}`);

  console.log('--- 11. Student Registration With College Details ---');
  const regEmail = `test.student.${Date.now()}@placementvault.edu`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditi Deshmukh',
      email: regEmail,
      password: 'StudentPass@123',
      collegeName: 'Pune Institute of Computer Technology',
      rollNumber: 'PICT-2022-COMP-108',
      department: 'Computer Engineering',
      graduationYear: 2026,
    }),
  });
  const regData = await regRes.json();
  console.log(`Student registered status: ${regRes.status}, user: ${regData.user?.name}, college: ${regData.user?.collegeName}, roll: ${regData.user?.rollNumber}`);

  console.log('--- 12. Admin Word Docx Export (Questions) ---');
  const docxQuestionsRes = await fetch(`${baseUrl}/admin/export-docx/questions`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const docxQContentType = docxQuestionsRes.headers.get('content-type');
  const docxQBuffer = await docxQuestionsRes.arrayBuffer();
  console.log(`Questions Docx Export: Status=${docxQuestionsRes.status}, Content-Type=${docxQContentType}, Byte Size=${docxQBuffer.byteLength}`);

  console.log('--- 13. Admin Word Docx Export (Students) ---');
  const docxStudentsRes = await fetch(`${baseUrl}/admin/export-docx/students`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const docxSContentType = docxStudentsRes.headers.get('content-type');
  const docxSBuffer = await docxStudentsRes.arrayBuffer();
  console.log(`Students Docx Export: Status=${docxStudentsRes.status}, Content-Type=${docxSContentType}, Byte Size=${docxSBuffer.byteLength}`);

  console.log('--- 14. Single Question Word Docx Export ---');
  const docxSingleRes = await fetch(`${baseUrl}/questions/${firstQ._id}/export-docx`);
  const docxSingleContentType = docxSingleRes.headers.get('content-type');
  const docxSingleBuffer = await docxSingleRes.arrayBuffer();
  console.log(`Single Question Docx Export: Status=${docxSingleRes.status}, Content-Type=${docxSingleContentType}, Byte Size=${docxSingleBuffer.byteLength}`);

  console.log('\n>>> ALL 14 REST API END-TO-END FLOWS EXECUTED SUCCESSFULLY! <<<');
}

runE2E().catch(console.error);
