import Api from "./api.js"
import setupEventHandlers from "./eventHandler.js"

const api = new Api();

const contentContainer = document.querySelector('.content');
let imageContainer = document.getElementById('original-image');
let thumbnailList = document.getElementById('thumbnail-list');
const favoriteButton = document.getElementById('favorite-button');
const headerTopic = document.getElementById('header-topic');

let currentDirectory = '';
let currentImageIndex = -1;
let currentImages = [];

function leaveDirectory() {
    updateConfig(currentDirectory, currentImageIndex);
    imageContainer.innerHTML = ''; // 清空 original-image 容器
}

async function moveToDirectory(directory) {
    await leaveDirectory();
    currentDirectory = directory;
    updateHeader(currentDirectory, true);
    fetchAndUpdateSideBar(currentDirectory);
    showImages();
}

async function loadImages(directory, regenThumbnail = false) {
    currentImages = await api.fetchImages(directory, regenThumbnail);
}

async function showImages() {
    await renderContentForImages();
    await loadImages(currentDirectory);
    renderThumbnails(currentImages);
    currentImageIndex = await loadIndex(currentDirectory);
    debugLog(`currentImageIndex: ${currentImageIndex}, currentImages.length: ${currentImages.length}`);
    if (currentImageIndex > -1 && currentImages.length > 0) {
        showOriginalImage(currentImages[currentImageIndex].path);
        debugLog(`Displayed image at index ${currentImageIndex}`);
    }
}

function renderContentForImages() {
    contentContainer.innerHTML = `
        <div class="thumbnails">
            <div id="thumbnail-list">
                <!-- Image thumbnails will be populated here -->
            </div>
        </div>
        <div class="original-image" id="original-image">
            <!-- Original image will be displayed here -->
        </div>
    `;
    // 重新獲取 imageContainer 和 thumbnailList 的引用
    imageContainer = document.getElementById('original-image');
    thumbnailList = document.getElementById('thumbnail-list');
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

async function showFavoriteFolders() {
    updateHeader('Favorite Folders', false);

    contentContainer.innerHTML = '';
    const data = await api.fetchFavoriteFolderList();
    const favoriteList = document.createElement('ul');
    favoriteList.id = 'favorite-list';

    data.folderList.forEach(folder => {
        const button = document.createElement('button');
        button.textContent = folder;
        button.addEventListener('click', () => {
            moveToDirectory(folder);
        });
        const listItem = document.createElement('li');
        listItem.appendChild(button);
        favoriteList.appendChild(listItem);
    });

    contentContainer.appendChild(favoriteList);
}

function fetchAndUpdateSideBar(directory = '/data') {
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
                            fetchAndUpdateSideBar(directory); // 重新整理 sidebar
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
            fetchAndUpdateSideBar(directory); // 重新整理 sidebar
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
            fetchAndUpdateSideBar(directory); // 重新整理 sidebar
        })
        .catch(error => console.error('Error renaming folder:', error));
}

function updateConfig(directory, index) {
    if (index == -1 || currentImages.length == 0) {
        return ;
    }
    const config = { index };
    api.updateConfig(directory, config);
}

function loadIndex(directory) {
    return api.fetchConfig(directory)
        .then(config => {
            if (config.data && config.data.index !== undefined) {
                return config.data.index;
            }
            return -1;
        })
        .catch(error => console.error('Error loading config:', error));
}

function updateHeader(topic, showFavorButton) {
    headerTopic.textContent = topic;

    if (!showFavorButton) {
        favoriteButton.classList.add("hidden");
    } else {
        favoriteButton.classList.remove("hidden");
        api.fetchFolderFavoriteState(currentDirectory)
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
}

function debugLog(message) {
    // const logDiv = document.getElementById("debug-log");
    // if (logDiv) {
    //     logDiv.innerHTML += `<p>${message}</p>`;
    // }
    console.log(message);
}

document.addEventListener('DOMContentLoaded', () => {
    moveToDirectory('/data');
});

setupEventHandlers({
    getCurrentDirectory: () => currentDirectory,
    moveToDirectory,
    leaveDirectory,
    showFavoriteFolders
});
