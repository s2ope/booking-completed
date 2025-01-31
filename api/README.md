# BookingApp Backend

This repository contains the backend of the **BookingApp** application, built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

- Node.js (v16 or above)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   > git clone <repository-url>
2. Navigate to the project directory:
   > cd bookingapp-backend
3. Install dependencies:
   - Using npm:
     > npm install
   - Using yarn:
     > yarn install

### Environment Variables

Create a `.env` file and add the following from .env.example

## Scripts

- Start the server:
  - npm:
    > npm start
  - yarn:
    > yarn start

## Folder Structure

bookingapp-backend/ ├── models/ # MongoDB models ├── routes/ # API routes ├── controllers/ # Request handlers ├── public/ # Static files ├── .env # Environment variables ├── index.js # Entry point └── package.json # Project metadata

## Features

- User authentication with JWT
- Email notifications via Nodemailer
- MongoDB integration
