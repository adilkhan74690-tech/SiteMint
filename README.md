# SiteMint

SiteMint is a multi-tenant SaaS website builder developed as part of the **ReadyNest Internship Program**. The platform allows business owners to create, customize, and publish their own professional business websites without writing code.

Instead of building websites manually, business owners can simply choose a template, enter their business details, customize the content, and publish their website through an easy-to-use dashboard.

The project focuses on solving a real-world problem by providing small businesses with an affordable and user-friendly website management platform.

---

# 🚀 Live Demo

https://sitemint-t6b7.onrender.com

---

# 🔑 Demo Credentials

## Business Owner

**Email:** adilkhan@gmail.com

**Password:** 12345678

## Super Admin

**Email:** test@gmail.com

**Password:** Test@123

> These accounts are provided only for project evaluation.

---

# 📖 Project Background

This project was assigned during the ReadyNest Internship Program with the objective of developing a complete SaaS-based Website Builder capable of serving multiple businesses through a single platform.

The primary challenge was to create a scalable system where each business owner receives an independent dashboard, manages their own website, and publishes it without affecting other businesses on the platform.

The application follows a multi-tenant architecture where every business has its own isolated data, templates, customers, bookings and website.

---

# 🎯 Project Objectives

- Develop a SaaS Website Builder
- Implement Multi-Tenant Architecture
- Create Role-Based Authentication
- Design Business Owner Dashboard
- Develop Super Admin Panel
- Allow Website Publishing
- Support Responsive Website Templates
- Integrate Cloudinary for Media Storage
- Integrate Railway MySQL Database
- Deploy the complete application on Render

---

# ✨ Features

## Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Role-Based Access Control

---

## Business Owner Dashboard

Business owners can:

- Create Websites
- Manage Business Details
- Publish Website
- Manage Staff
- Manage Services
- Manage Customers
- View Analytics
- Manage Payments
- Upload Business Logo
- Customize Website

---

## Super Admin

The Super Admin can:

- View All Businesses
- Manage Registered Owners
- View Published Websites
- Monitor Platform Usage
- Manage Users
- Access Platform Analytics

---

## Website Builder

- Business Onboarding
- Template Selection
- Website Preview
- Website Publishing
- Mobile Responsive Templates

---

## Active Templates

Currently supported templates:

- 🏋️ Gym / Fitness
- 💇 Salon
- 🍽 Restaurant
- 👕 Clothing Store

---

## Media Upload

- Cloudinary Integration
- Business Logo Upload
- Gallery Images

---

## Payment

- Razorpay Integration
- Subscription Ready

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

## Backend

- Node.js
- Express.js
- JWT Authentication
- Multer

## Database

- MySQL
- Railway

## Media Storage

- Cloudinary

## Payments

- Razorpay

## Deployment

- Render

---

# 📂 Project Structure

```
SiteMint
│
├── client
├── server
├── src
├── public
├── routes
├── controllers
├── middleware
├── database
├── components
├── utils
└── assets
```

---

# ⚙ Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project

```bash
cd SiteMint
```

Install dependencies

```bash
npm install
```

Create a `.env` file using `.env.example`.

Run the development server

```bash
npm run dev
```

---

# 🔐 Environment Variables

```
DB_HOST=

DB_PORT=

DB_NAME=

DB_USER=

DB_PASSWORD=

JWT_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

---

# 📌 Current Scope

The current version supports four business categories.

Every business owner can:

- Register/Login
- Create a Business
- Choose a Template
- Publish a Website
- Manage Business Information
- Manage Staff & Services
- View Dashboard

The platform also includes a Super Admin Dashboard for managing all businesses.

---

# 🚀 Future Improvements

- Custom Domain Support
- Dynamic CMS
- SEO Optimization
- Advanced Analytics
- AI Content Suggestions
- Email Notifications
- More Business Templates
- Theme Marketplace
- Multi-language Support

---

# 👨‍💻 Author

**Mohammad Adil Khan**

B.Tech Computer Science Engineering

CGC University, Mohali

ReadyNest Internship Project

---

# 📄 License

This project was developed for educational purposes as part of the ReadyNest Internship Program.
