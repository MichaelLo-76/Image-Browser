# File System Browser

This project is a web application that serves as a file system browser, allowing users to navigate through folders and view images. The application is structured with a left sidebar for folder navigation, a top right section for displaying image thumbnails, and a bottom right section for showing the original image when a thumbnail is clicked.

## Project Structure

```
file-system-browser
├── public
│   ├── index.html        # HTML structure of the web application
│   ├── styles.css        # CSS styles for the application
│   └── scripts
│       └── app.js        # Client-side JavaScript functionality
├── src
│   ├── server.js         # Entry point of the server application
│   ├── routes
│   │   └── index.js      # Defines the routes for the application
│   └── controllers
│       └── fileController.js # Handles file system operations
├── package.json          # npm configuration file
├── .gitignore            # Specifies files to ignore by Git
├── Dockerfile            # Docker configuration file
├── docker-compose.yml    # Docker Compose configuration file
└── README.md             # Documentation for the project
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd file-system-browser
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the application:**
   ```sh
   npm start
   ```

4. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

## Using Docker

To run the application using Docker, follow these steps:

1. **Build and start the Docker container:**
   ```sh
   docker-compose up --build
   ```

2. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

## Features

- Navigate through folders in the left sidebar.
- View image thumbnails in the top right section.
- Display the original image in the bottom right section upon clicking a thumbnail.
- Click on the menu button (⋮) next to a folder or archive to show a context menu with options:
  - **Compress and Delete**: Compress the folder and delete it.
  - **Rename**: Rename the folder.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.