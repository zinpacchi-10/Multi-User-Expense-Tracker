async function loadCategories() {
    try {
        const categories = await apiRequest('/categories');
        
        // Fill Add Expense dropdown
        const categorySelect = document.getElementById('category');
        const filterSelect = document.getElementById('filter-category');
        
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        filterSelect.innerHTML = '<option value="">All Categories</option>';

        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            filterSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

        // Fill Category List
        const list = document.getElementById('category-list');
        list.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${cat.name}</span>
                <button class="delete-btn" onclick="deleteCategory(${cat.id})">Delete</button>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}
//add Category
document.getElementById('add-category-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-category').value.trim();

    if (!name) {
        alert('Category name is required');
        return;
    }

    if (name.length < 2) {
        alert('Category name must be at least 2 characters');
        return;
    }

    try {
        await apiRequest('/categories', 'POST', { name });
        document.getElementById('new-category').value = '';
        loadCategories();
        alert('Category added successfully!');
    } catch (err) {
        alert(err.message || 'Failed to add category');
    }
});

// Delete Category
async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;

    try {
        await apiRequest(`/categories/${id}`, 'DELETE');
        loadCategories();
    } catch (err) {
        alert(err.message);
    }
}