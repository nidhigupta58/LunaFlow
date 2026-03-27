# LunaFlow - Period & Cycle Tracker

LunaFlow is a comprehensive, full-stack period and cycle tracking application. It provides real-time insights into your cycle, including period predictions, ovulation windows, and safe days, all presented in a beautiful, organic aesthetic.

## Project Setup (Development)

To get started with development, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory based on `.env.example`. You will need to provide:
    - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
    - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
    - `APP_URL`: The base URL of your development environment.

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Production Setup

For production deployment, follow these steps:

1.  **Build the Application**:
    ```bash
    npm run build
    ```
    This command compiles the frontend assets and places them in the `dist/` directory.

2.  **Start the Production Server**:
    ```bash
    npm start
    ```
    The server will serve the static files from the `dist/` directory and handle API requests.

## Google OAuth Configuration

To enable Google Calendar integration, you must configure your Google Cloud Console:

1.  **Create Credentials**: Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an OAuth 2.0 Client ID.
2.  **Authorized Redirect URIs**: Add the following callback URLs to your application settings:
    - **Development URL**: `https://ais-dev-in7wdqvtk7t5rleskkaf4b-636053895605.asia-east1.run.app/auth/callback`
    - **Shared/Deployed URL**: `https://ais-pre-in7wdqvtk7t5rleskkaf4b-636053895605.asia-east1.run.app/auth/callback`
3.  **Save Credentials**: Once you have saved your Client ID and Client Secret in your environment variables, the application will be able to securely authenticate users and sync events with their Google Calendar.

## Features

- **Cycle Tracking**: Log your periods and track your cycle history.
- **Dynamic Predictions**: Visualize your ovulation window and safe days with varying color intensities.
- **AI Insights**: Receive personalized health recommendations based on your cycle phase.
- **Google Calendar Sync**: Automatically add your cycle events to your Google Calendar.
- **Profile Management**: Update your health stats and cycle preferences at any time.
