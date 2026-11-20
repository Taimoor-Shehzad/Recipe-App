# Recipe App

A full-stack recipe discovery application for Android, iOS, and web. Browse meals by category, search recipes, view ingredients and cooking instructions, save favorites to a personal collection, and sign in with Clerk authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

## Features

- Clerk-powered sign-in and account creation
- Browse popular and category-based recipes
- Search meals by name or ingredients
- View recipe details, preparation time, servings, ingredients, and step-by-step instructions
- Save or remove recipes from a personal favorites collection
- Persistent favorites stored in a Neon PostgreSQL database
- Android, iOS, and web support through Expo
- NativeWind and Tailwind CSS styling
- Scheduled backend keep-alive job for production hosting
- REST API health check endpoint

## Tech Stack

### Mobile application

| Technology | Purpose |
| --- | --- |
| Expo SDK 58 | Cross-platform application runtime |
| React Native 0.88 | Native UI framework |
| Expo Router | File-based navigation |
| TypeScript | Application type safety |
| Clerk Expo | Authentication |
| NativeWind | React Native utility styling |
| Tailwind CSS | Styling configuration |
| TheMealDB | Recipe discovery and search data |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express 5 | REST API server |
| Drizzle ORM | PostgreSQL schema and queries |
| Neon Serverless | Hosted PostgreSQL database |
| Node Cron | Scheduled server tasks |
| dotenv | Environment configuration |

## Repository Structure

```text
Recipe-App/
├── App/
│   └── Recipe-App/          # Expo mobile and web application
│       ├── src/app/         # Expo Router screens and layouts
│       ├── components/      # Shared UI components
│       ├── constants/       # App constants and theme values
│       ├── hooks/           # Reusable React hooks
│       ├── services/        # External API integrations
│       └── assets/          # Icons and application images
└── Backend/
    └── src/
        ├── config/          # Environment, database, and cron configuration
        ├── db/              # Drizzle schema and migrations
        └── server.js        # Express server and REST routes
```

## Prerequisites

Install the following tools:

- Node.js 18 or later
- npm
- A Clerk application
- A Neon PostgreSQL database
- An Expo-compatible Android/iOS device or emulator
- Xcode for iOS development on macOS or Android Studio for Android development

## Environment Variables

Create a `.env` file inside `Backend/`:

```dotenv
PORT=5001
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
NODE_ENV=development
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Defaults to `5001`. |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string. |
| `NODE_ENV` | No | Set to `production` to enable the keep-alive cron job. |

Configure your Clerk publishable key in the mobile application using the Clerk Expo provider setup. If you use environment-based configuration, expose the key as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and follow Clerk's environment variable conventions.

Never commit real database credentials or authentication keys.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Taimoor-Shehzad/Recipe-App.git
cd Recipe-App
```

### 2. Start the backend

```bash
cd Backend
npm install
npm run dev
```

The API starts on `http://localhost:5001` by default.

For a normal production-style process:

```bash
npm start
```

### 3. Start the Expo application

Open a second terminal:

```bash
cd App/Recipe-App
npm install
npm start
```

Then select one of Expo's available run targets:

```bash
npm run android
npm run ios
npm run web
```

An Expo development build or simulator is required for native authentication and secure storage behavior.

## Backend API

Base URL: `http://localhost:5001`

### Health check

```http
GET /api/health
```

Successful response:

```json
{
  "success": true
}
```

### Add a favorite

```http
POST /api/favourites
Content-Type: application/json
```

```json
{
  "userId": "clerk-user-id",
  "recipeId": 52772,
  "title": "Teriyaki Chicken Casserole",
  "image": "https://example.com/recipe.jpg",
  "cookTime": "45",
  "servings": "4"
}
```

Successful response: `201 Created`

### Get a user's favorites

```http
GET /api/favourites/:userId
```

### Remove a favorite

```http
DELETE /api/favourites/:userId/:recipeId
```

The favorites table stores the recipe ID, title, image, cook time, servings, user ID, and creation timestamp.

## Database Setup

The project uses Drizzle ORM with PostgreSQL. The schema is defined in:

```text
Backend/src/db/schema.js
```

Drizzle configuration is available in:

```text
Backend/drizzle.config.js
```

Run migrations after connecting the database:

```bash
cd Backend
npx drizzle-kit migrate
```

Use `npx drizzle-kit studio` to open Drizzle Studio for inspecting and managing database records.

## Mobile Screens

- **Sign in / sign up** — Clerk authentication screens
- **Recipes** — browse and explore meals
- **Search** — find recipes
- **Favorites** — view and remove saved meals
- **Recipe details** — view a complete recipe

## Development Scripts

### Mobile app

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Run the web build |
| `npm run lint` | Run Expo ESLint |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start with Nodemon |
| `npm start` | Start the server with Node |

## Testing

The repository does not currently include an automated test suite. Before submitting changes, run:

```bash
cd App/Recipe-App
npm run lint
```

Also manually verify authentication, meal search, recipe details, and favorite synchronization.

## Security and Configuration Notes

- Never expose database credentials or Clerk secrets in source files.
- Keep the backend's Neon connection string in `Backend/.env`.
- Restrict API and database access when deploying.
- Validate all client-provided values before extending the API.
- Add authentication middleware to favorite routes before exposing the API publicly.

## Deployment

### Backend

Deploy `Backend/` to a Node-compatible hosting provider and configure:

- `DATABASE_URL`
- `PORT` if required by the provider
- `NODE_ENV=production`

When `NODE_ENV` is `production`, the backend starts a cron keep-alive job to request `/api/health` periodically.

### Mobile app

Configure the application and signing credentials in `App/Recipe-App/app.json`, then build with EAS:

```bash
cd App/Recipe-App
npx eas-cli build --platform android
npx eas-cli build --platform ios
```

A valid EAS project configuration and app signing credentials are required for store builds.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a descriptive feature branch.
3. Make focused, tested changes.
4. Run linting where applicable.
5. Open a pull request describing the change and validation performed.

## License

This project includes an MIT license in `App/Recipe-App/LICENSE`.

## Author

Created and maintained by [Taimoor-Shehzad](https://github.com/Taimoor-Shehzad).
