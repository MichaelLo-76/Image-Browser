const imageContainer = document.getElementById('original-image');
const thumbnailList = document.getElementById('thumbnail-list');
const backButton = document.getElementById('back-button');
const rootButton = document.getElementById('root-button');
const clearImageButton = document.getElementById('clear-image-button');

let currentDirectory = '';
let currentImageIndex = -1;
let currentImages = [];

backButton.addEventListener('click', () => {
    const parts = currentDirectory.split('/');
    parts.pop(); // 移除最後一個部分
    currentDirectory = parts.join('/');
    fetchAndDisplayFolders(currentDirectory);
    fetchImages(currentDirectory);
});

rootButton.addEventListener('click', () => {
    currentDirectory = '/data';
    fetchAndDisplayFolders(currentDirectory);
    fetchImages(currentDirectory);
});

clearImageButton.addEventListener('click', () => {
    imageContainer.innerHTML = ''; // 清空 original-image 容器
    fetchImages(currentDirectory, true);
});

document.getElementById("toggleSidebar").addEventListener("click", function () {
    let sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");
});

function fetchImages(directory, regenThumbnail = false) {
    fetch(`/api/images?directory=${encodeURIComponent(directory)}&regenThumbnail=${encodeURIComponent(regenThumbnail)}`)
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
        imgElement.onclick = () => showOriginalImage(image.path, index);
        thumbnailList.appendChild(imgElement);
    });

    if (images.length === 0) {
        const message = document.createElement('div');
        message.textContent = 'No thumbnails available';
        thumbnailList.appendChild(message);
    }
}

function showOriginalImage(imagePath, index) {
    currentImageIndex = index; // 更新當前顯示的圖片索引
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
        showOriginalImage(currentImages[currentImageIndex].path, currentImageIndex);
    }
}

function showNextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        showOriginalImage(currentImages[currentImageIndex].path, currentImageIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFolders();
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
                    fetchAndDisplayFolders(`${directory}/${folder}`);
                    fetchImages(`${directory}/${folder}`);
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

    console.log(`Context menu position: top=${event.clientY}, left=${event.clientX}`);

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