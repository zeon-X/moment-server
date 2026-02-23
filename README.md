# Mini Social Feed API

A backend API for a mini social feed application, built with Node.js, Express, and Prisma ORM.

## Overview

This project provides a RESTful API for a social feed platform, supporting user authentication, posting, commenting, notifications, and more. Push notifications for Android background state are enabled using Firebase Cloud Messaging (FCM). Designed for extensibility and easy integration.

## Features

- User authentication (signup, login, JWT)
- User profiles and community members
- Create, like, and comment on posts
- Notifications for user activity (including push notifications for Android background state via FCM)
- Pagination for feeds
- OpenAPI documentation

## Setup

1. Clone the repository

   ```sh
   git clone https://github.com/zeon-X/moment-server
   cd moment-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` following the `.env.example`.
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

Interactive docs available at:

> http://localhost:3008/api/docs/#/

## Folder Structure

```
.
├── README.md
├── docs
│   └── openapi.yaml
├── package.json
├── prisma
│   ├── migrations
│   │   ├── 20260221171452_production_schema
│   │   │   └── migration.sql
│   │   ├── 20260221202347_add_notifications
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── prisma.config.ts
└── src
    ├── app.js
    ├── config
    │   ├── env.js
    │   ├── firebase-service-account.json
    │   ├── firebase.js
    │   └── prisma.js
    ├── generated
    │   └── prisma
    │       ├── browser.ts
    │       ├── client.ts
    │       ├── commonInputTypes.ts
    │       ├── enums.ts
    │       ├── internal
    │       │   ├── class.ts
    │       │   ├── prismaNamespace.ts
    │       │   └── prismaNamespaceBrowser.ts
    │       ├── libquery_engine-darwin-arm64.dylib.node
    │       ├── models
    │       │   ├── Comment.ts
    │       │   ├── Like.ts
    │       │   ├── Post.ts
    │       │   └── User.ts
    │       └── models.ts
    ├── middlewares
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── validate.middleware.js
    ├── modules
    │   ├── auth
    │   │   ├── auth.controller.js
    │   │   ├── auth.route.js
    │   │   ├── auth.schema.js
    │   │   └── auth.service.js
    │   ├── notification
    │   │   ├── notification.controller.js
    │   │   ├── notification.route.js
    │   │   └── notification.service.js
    │   ├── post
    │   │   ├── post.controller.js
    │   │   ├── post.route.js
    │   │   ├── post.schema.js
    │   │   └── post.service.js
    │   └── user
    │       ├── user.controller.js
    │       ├── user.route.js
    │       └── user.service.js
    ├── server.js
    └── utils
        ├── ApiError.js
        ├── asyncHandler.js
        ├── generateToken.js
        └── hashPassword.js

19 directories, 48 files
```

## Future Improvements

- Add unit and integration tests
- Enhance notification system (push, email)
- Add admin and moderation features
- Improve error handling and logging
- Add social features (follow, messaging)
- Optimize performance and scalability

## License

MIT
