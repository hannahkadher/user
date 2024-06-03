# NestJS REST API Application

This is a simple REST application built using the NestJS framework. The application implements a NodeJS server API that communicates with an external API (https://reqres.in/) and provides endpoints for managing users and their avatars.

## Prerequisites

- Node.js v12.x or higher
- npm v6.x or higher
- MongoDB v4.4 or higher
- RabbitMQ v3.7 or higher

## Installation

1. Install dependencies:
yarn install

2. Configure environment variables:
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
RABBITMQ_URL=your-rabbitmq-url

3. Start the MongoDB and RabbitMQ servers if they are not already running.

## Running the Application
1. Start the application:
yarn start
The server will start on http://localhost:3000.

2. You can access the API endpoints using a tool like Postman or curl.


