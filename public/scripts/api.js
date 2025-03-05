export default class Api {
    constructor() {}
    
/* Favorite Folder Related Api */
    fetchFavoriteFolderList() {
        return fetch('/api/favorites/list')
            .then(response => response.json())
            .catch(error => console.error('Error fetchFavoriteFolderList:', error));
    }

    setFavoriteFolder(directory) {
        return fetch(`/api/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder: directory })
        })
        .catch(error => console.error('Error setFavoriteFolder:', error));
    }

    unsetFavoriteFolder(directory) {
        return fetch(`/api/favorites`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder: directory })
        })
        .catch(error => console.error('Error unsetFavoriteFolder:', error));
    }

    fetchFolderFavoriteState(directory) {
        return fetch(`/api/favorites?folder=${encodeURIComponent(directory)}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetchFolderFavoriteState:', error));
    }

/* Image Related Api */
    fetchImages(directory, regenThumbnail) {
        return fetch(`/api/images?directory=${encodeURIComponent(directory)}&regenThumbnail=${encodeURIComponent(regenThumbnail)}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetchImages:', error));
    }

/* Folder/Archive Related Api */
    fetchFoldersAndArchives(directory) {
        return fetch(`/api/folders?directory=${encodeURIComponent(directory)}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetchFoldersAndArchives:', error));
    }
    
    unzipArchive(archivePath, targetDirectory) {
        return fetch(`/api/unzip?archive=${encodeURIComponent(archivePath)}&target=${encodeURIComponent(targetDirectory)}`, { 
            method: 'POST'
        })
        .catch(error => console.error('Error unzipArchive:', error));
    }

    compressFolder(folderPath, archivePath) {
        return fetch(`/api/compress?folder=${encodeURIComponent(folderPath)}&archive=${encodeURIComponent(archivePath)}`, {
            method: 'POST'
        })
        .catch(error => console.error('Error compressFolder:', error));
    }

    renameFolder(oldPath, newPath) {
        return fetch(`/api/rename?oldPath=${encodeURIComponent(oldPath)}&newPath=${encodeURIComponent(newPath)}`, {
            method: 'POST'
        })
        .catch(error => console.error('Error renameFolder:', error));
    }
    

/* Config Related Api */
    fetchConfig(directory) {
        return fetch(`/api/config?directory=${encodeURIComponent(directory)}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetchConfig:', error));
    }
    
    updateConfig(directory, config) {
        return fetch(`/api/config/update?directory=${encodeURIComponent(directory)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        })
        .catch(error => console.error('Error updateConfig:', error));
    }
}
