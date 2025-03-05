import Api from "./api.js"

export default function setupEventHandlers({
    getCurrentDirectory,
    moveToDirectory,
    leaveDirectory,
    showFavoriteFolders
}) {
    document.getElementById('back-button').addEventListener('click', () => {
        const parts = getCurrentDirectory().split('/');
        parts.pop(); // 移除最後一個部分
        moveToDirectory(parts.join('/'));
    });

    document.getElementById('root-button').addEventListener('click', () => {
        moveToDirectory('/data');
    });

    document.getElementById('test-function-button').addEventListener('click', () => {
    });
    
    document.getElementById('show-favorite-button').addEventListener('click', () => {
        leaveDirectory();
        showFavoriteFolders();
    });
   
    const favoriteButton = document.getElementById('favorite-button');
    favoriteButton.addEventListener('click', () => {
        const isFavorited = favoriteButton.classList.toggle('favorited');
        favoriteButton.textContent = isFavorited ? '★' : '☆';

        const api = new Api();
        if (isFavorited) {
            api.setFavoriteFolder(getCurrentDirectory());
        } else {
            api.unsetFavoriteFolder(getCurrentDirectory());
        }
    });

    document.getElementById("toggleSidebar").addEventListener("click", function () {
        let sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("hidden");
    });
}