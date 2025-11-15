# Love Planet Web

Welcome to the Love Planet Web project! This web application creates an interactive 3D universe where users can explore celestial objects and upload their own images to enhance the experience.

## Project Structure

The project is organized as follows:

```
love-planet-web
├── public
│   ├── index.html        # Main HTML document for the web application
│   ├── styles.css        # CSS styles for the web application
│   └── assets
│       ├── images        # Directory for storing image files
│       └── audio         # Directory for storing audio files
├── src
│   ├── main.js           # Entry point for the JavaScript code
│   ├── scene.js          # Logic for creating and managing the 3D scene
│   ├── ui.js             # Manages user interface elements
│   ├── photo
│   │   ├── uploader.js    # Functions for uploading images
│   │   └── gallery.js      # Manages the display of uploaded images
│   └── utils
│       └── loader.js      # Utility functions for loading assets
├── package.json           # Configuration file for npm
├── .gitignore             # Specifies files to be ignored by Git
└── README.md              # Documentation for the project
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd love-planet-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Features

- Interactive 3D universe created using Three.js.
- Ability to upload images and display them in a gallery format.
- Audio playback to enhance the user experience.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.