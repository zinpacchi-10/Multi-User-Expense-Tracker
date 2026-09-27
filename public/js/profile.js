document.getElementById('avatarInput').addEventListener('change', async e => {
  const formData = new FormData();
  formData.append('avatar', e.target.files[0]);

  const res = await fetch('/api/auth/avatar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData,
  });
  const data = await res.json();
  document.getElementById('avatarImg').src = data.avatar_url;
});
