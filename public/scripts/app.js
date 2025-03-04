const imageContainer = document.getElementById('original-image');
const thumbnailList = document.getElementById('thumbnail-list');
const backButton = document.getElementById('back-button');
const rootButton = document.getElementById('root-button');
const clearImageButton = document.getElementById('clear-image-button');
const favoriteButton = document.getElementById('favorite-button');

let currentDirectory = '';
let currentImageIndex = -1;
let currentImages = [];

async function moveToDirectory(directory) {
    updateConfig(currentDirectory, currentImageIndex);
    currentDirectory = directory;
    updateHeader(currentDirectory);
    fetchAndDisplayFolders(currentDirectory);
    await fetchImages(currentDirectory);
    currentImageIndex = await loadConfig(currentDirectory);
    debugLog(`currentImageIndex: ${currentImageIndex}, currentImages.length: ${currentImages.length}`);
    if (currentImageIndex > -1 && currentImages.length > 0) {
        showOriginalImage(currentImages[currentImageIndex].path);
        debugLog(`Displayed image at index ${currentImageIndex}`);
    }
}

backButton.addEventListener('click', () => {
    const parts = currentDirectory.split('/');
    parts.pop(); // 移除最後一個部分
    moveToDirectory(parts.join('/'));
});

rootButton.addEventListener('click', () => {
    moveToDirectory('/data');
});

clearImageButton.addEventListener('click', () => {
    imageContainer.innerHTML = ''; // 清空 original-image 容器
    fetchImages(currentDirectory, true);
});

favoriteButton.addEventListener('click', () => {
    const isFavorited = favoriteButton.classList.toggle('favorited');
    favoriteButton.textContent = isFavorited ? '★' : '☆';

    fetch(`/api/favorites`, {
        method: isFavorited ? 'POST' : 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: currentDirectory })
    });
});

document.getElementById("toggleSidebar").addEventListener("click", function () {
    let sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");
});

function fetchImages(directory, regenThumbnail = false) {
    return fetch(`/api/images?directory=${encodeURIComponent(directory)}&regenThumbnail=${encodeURIComponent(regenThumbnail)}`)
        .then(response => response.json())
        .then(data => {
            currentImages = data; // 存儲當前目錄的圖片列表
            renderThumbnails(data);
        })
        .catch(error => console.error('Error fetching images:', error));
}

function renderThumbnails(images) {
    const thumbnailList = document.getElementById('thumbnail-list');
    thumbnailList.innerHTML = '';

    images.forEach((image, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = image.thumbnail;
        imgElement.alt = image.name;
        imgElement.className = 'thumbnails'; // 添加 CSS 類名
        imgElement.addEventListener('click', () => {
            currentImageIndex = index;
            showOriginalImage(image.path);
        });
        thumbnailList.appendChild(imgElement);
    });

    if (images.length === 0) {
        const message = document.createElement('div');
        message.textContent = 'No thumbnails available';
        thumbnailList.appendChild(message);
    }
}

function showOriginalImage(imagePath) {
    const originalImage = document.createElement('img');
    originalImage.src = imagePath;
    originalImage.alt = 'Original Image';
    originalImage.className = 'original-image'; // 添加 CSS 類名
    imageContainer.innerHTML = ''; // 清空容器
    imageContainer.appendChild(originalImage); // 添加新圖片
    // 添加點擊事件處理器

    originalImage.addEventListener('click', (event) => {
        const rect = originalImage.getBoundingClientRect();
        const clickX = event.clientX - rect.left;

        if (clickX < rect.width / 2) {
            // 點擊左側，顯示前一張圖片
            showPreviousImage();
        } else {
            // 點擊右側，顯示下一張圖片
            showNextImage();
        }
    });
}

function showPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        showOriginalImage(currentImages[currentImageIndex].path);
    }
}

function showNextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        showOriginalImage(currentImages[currentImageIndex].path);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    moveToDirectory('/data');
});

function fetchAndDisplayFolders(directory = '/data') {
    imageContainer.innerHTML = ''; // 清空 original-image 容器
    fetch(`/api/folders?directory=${encodeURIComponent(directory)}`)
        .then(response => response.json())
        .then(data => {
            const { folders, archives } = data;
            const folderList = document.getElementById('folder-list');
            folderList.innerHTML = ''; // Clear the current list

            // 顯示文件夾
            folders.forEach(folder => {
                const button = document.createElement('button');
                button.textContent = folder;
                button.addEventListener('click', () => {
                    moveToDirectory(`${directory}/${folder}`);
                });
                folderList.appendChild(button);

                const menuButton = document.createElement('button');
                menuButton.textContent = '⋮'; // 或者使用圖標
                menuButton.className = 'menu-button';
                menuButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // 阻止事件冒泡
                    showContextMenu(event, folder, directory);
                });

                const container = document.createElement('div');
                container.className = 'button-container';
                container.appendChild(button);
                container.appendChild(menuButton);

                folderList.appendChild(container);  
            });

            // 添加分隔線
            if (archives.length > 0) {
                const separator = document.createElement('hr');
                folderList.appendChild(separator);
            }

            // 顯示壓縮檔案
            archives.forEach(archive => {
                const button = document.createElement('button');
                button.textContent = archive;
                button.style.backgroundColor = '#FFD700'; // 設置不同顏色
                button.addEventListener('click', () => {
                    const archivePath = `${directory}/${archive}`;
                    const folderName = archive.replace(/\.[^/.]+$/, ""); // 去掉擴展名
                    const targetDirectory = `${directory}/${folderName}`;
                    fetch(`/api/unzip?archive=${encodeURIComponent(archivePath)}&target=${encodeURIComponent(targetDirectory)}`, { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw new Error('Failed to unzip archive');
                            }
                        })
                        .then(() => {
                            fetchAndDisplayFolders(directory); // 重新整理 sidebar
                        })
                        .catch(error => console.error('Error unzipping archive:', error));
                });

                const menuButton = document.createElement('button');
                menuButton.textContent = '⋮'; // 或者使用圖標
                menuButton.className = 'menu-button';
                menuButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // 阻止事件冒泡
                    // showContextMenu(event, archive, directory);
                });

                const container = document.createElement('div');
                container.className = 'button-container';
                container.appendChild(button);
                container.appendChild(menuButton);

                folderList.appendChild(container);
            });
            currentDirectory = directory;
        })
        .catch(error => console.error('Error fetching folders:', error));
}

function showContextMenu(event, name, directory) {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;

    debugLog(`Context menu position: top=${event.clientY}, left=${event.clientX}`);

    const compressOption = document.createElement('button');
    compressOption.textContent = 'Compress and Delete';
    compressOption.className = 'button';
    compressOption.addEventListener('click', () => {
        compressAndDelete(name, directory);
        document.body.removeChild(contextMenu);
    });

    const renameOption = document.createElement('button');
    renameOption.textContent = 'Rename';
    renameOption.className = 'button';
    renameOption.addEventListener('click', () => {
        showRenamePrompt(name, directory);
        document.body.removeChild(contextMenu);
    });

    contextMenu.appendChild(compressOption);
    contextMenu.appendChild(renameOption);
    document.body.appendChild(contextMenu);

    document.addEventListener('click', () => {
        if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu);
        }
    }, { once: true });
}

function compressAndDelete(name, directory) {
    const folderPath = `${directory}/${name}`;
    const archivePath = `${directory}/${name}.zip`;
    fetch(`/api/compress?folder=${encodeURIComponent(folderPath)}&archive=${encodeURIComponent(archivePath)}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to compress and delete folder');
            }
        })
        .then(() => {
            fetchAndDisplayFolders(directory); // 重新整理 sidebar
        })
        .catch(error => console.error('Error compressing and deleting folder:', error));
}

function showRenamePrompt(name, directory) {
    const newName = prompt('Enter new name:', name);
    if (newName && newName !== name) {
        renameFolder(name, newName, directory);
    }
}

function renameFolder(oldName, newName, directory) {
    const oldPath = `${directory}/${oldName}`;
    const newPath = `${directory}/${newName}`;
    fetch(`/api/rename?oldPath=${encodeURIComponent(oldPath)}&newPath=${encodeURIComponent(newPath)}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to rename folder');
            }
        })
        .then(() => {
            fetchAndDisplayFolders(directory); // 重新整理 sidebar
        })
        .catch(error => console.error('Error renaming folder:', error));
}

function updateConfig(directory, index) {
    if (index == -1 || currentImages.length == 0) {
        return ;
    }
    const config = { index };
    fetch(`/api/config/update?directory=${encodeURIComponent(directory)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config) // 確保這裡傳遞的是 JSON 字符串
    })
    .catch(error => console.error('Error updating config:', error));
}

function loadConfig(directory) {
    // 讀取配置文件並顯示對應的圖片
    return fetch(`/api/config?directory=${encodeURIComponent(directory)}`)
        .then(response => response.json())
        .then(config => {
            debugLog(`Check config: ${JSON.stringify(config)}`);
            if (config.data && config.data.index !== undefined) {
                return config.data.index;
            }
            return -1;
        })
        .catch(error => console.error('Error fetching config:', error));
}

function updateHeader(directory) {
    const folderName = document.getElementById('folder-name');
    folderName.textContent = directory;

    // Check if the current folder is already favorited
    fetch(`/api/favorites?folder=${encodeURIComponent(directory)}`)
        .then(response => response.json())
        .then(data => {
            if (data.isFavorited) {
                console.log("Favorited dir");
                favoriteButton.classList.add('favorited');
                favoriteButton.textContent = '★';
            } else {
                console.log("Not Favorited dir");
                favoriteButton.classList.remove('favorited');
                favoriteButton.textContent = '☆';
            }
        });
}

function debugLog(message) {
    console.log(message);
}