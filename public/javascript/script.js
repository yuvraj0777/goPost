// Select the search input and post items
const searchInput = document.getElementById('search');
const posts = document.querySelectorAll('.post');

searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase();

    posts.forEach(post => {
        const content = post.getAttribute('data-title');

        if (content.includes(query)) {
            post.classList.remove('hidden');
        } else {
            post.classList.add('hidden');
        }
    });
});


