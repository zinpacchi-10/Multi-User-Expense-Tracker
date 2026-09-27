document.getElementById('avatarInput').addEventListener('change', async e => {
  const formData = new FormData();
  formData.append('avatar', e.target.files[0]);

  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Avatar upload failed');
      return;
    }

    document.getElementById('avatarImg').src =
      'http://127.0.0.1:5000' + data.avatar_url;
  } catch (err) {
    console.error(err);
    alert('Something went wrong uploading avatar');
  }
});
