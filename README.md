## FoodGift
### Smart Donation Management Platform for Resource Redistribution
---

## About the Project

FoodGift is a location-aware donation platform that simplifies the process of donating surplus food, clothes, books and toys etc. to NGOs. Instead of requiring donors to manually search for organizations or make multiple phone calls, the platform automatically identifies NGOs operating within a configurable radius of the donor's location and makes the donation request available only to those organizations.

- Manages the complete donation lifecycle—from donor registration and donation creation to NGO acceptance, OTP-based pickup verification, and successful donation completion.

- Every donation request has a configurable expiry time. If a donation is not accepted, picked up, or cancelled before the expiry time, a delayed background job automatically marks it as expired using **BullMQ** and **Redis**, eliminating the need for manual cleanup or scheduled cron jobs.

- Uses **location-based NGO matching** by converting donor addresses into geographical coordinates and notifying only NGOs operating within the configured service radius.

- Supports secure cloud-based image management through **Cloudinary**, allowing donors to upload donation images efficiently.

- Implements **role-based authentication** with separate donor and NGO accounts, protected routes, and secure password hashing using **bcrypt**.

- Includes **OTP-based pickup verification**, ensuring that donations are marked as picked up only after successful verification, making the donation process more secure and reliable.

- Provides an **in-app notification system** that informs NGOs informed about OTP send by the Donor.

---

## Why FoodGift Stands Out

### 📍 Smart Location-Based NGO Matching

Instead of displaying every donation request to every NGO, FoodGift uses geographical coordinates to identify NGOs operating within the donor's selected radius. This ensures that only organizations capable of collecting the donation receive the request, reducing unnecessary notifications and improving pickup efficiency.

### ⏳ Automated Donation Expiry Using Background Jobs

Every donation request has a predefined expiry time. Rather than periodically scanning the database using cron jobs, FoodGift schedules delayed background jobs using **BullMQ** and **Redis**. Once the expiry time is reached, the donation is automatically marked as expired, making the system more scalable and efficient.

### 🔐 OTP-Based Pickup Verification

To ensure that donations are handed over only to the NGO that accepted the request, FoodGift introduces an OTP-based verification mechanism. After an NGO accepts a donation, the donor can generate a time-limited OTP, which is verified before marking the donation as successfully picked up. This prevents accidental or unauthorized completion of requests.

### 🔔 In-App Notification System

NGOs get the generated OTP directly within the application through a notification system. 

---
## End-to-End System Workflow

The following workflow illustrates how a donation moves through the FoodGift platform from creation to successful pickup.

```text
                         ┌─────────────────────────────┐
                         │       Donor Registers       │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │      Login to System        │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │   Create Donation Request   │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │   Upload Donation Image to Cloudinary   │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │ Convert Address → Latitude & Longitude  │
                    │      using OpenCage Geocoding API       │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │   Find NGOs within Configured Radius    │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │   Nearby NGOs Receive Donation Request  │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │      NGO Accepts Donation Request       │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
          ┌─────────────────────────────────────────────────────────────┐
          │ Request Status → Accepted                                   │
          │                                                             │
          │ • Donor sees "Accepted"                                     │
          │ • Request removed from all other NGOs                       │
          │ • Accepted request remains visible only to selected NGO     │
          └─────────────────┬───────────────────────────────────────────┘
                            │
                            ▼
             ┌─────────────────────────────────────┐
             │      Donor Generates Pickup OTP     │
             └─────────────────┬───────────────────┘
                               │
                               ▼
             ┌─────────────────────────────────────┐
             │    NGO Receives OTP Notification    │
             └─────────────────┬───────────────────┘
                               │
                               ▼
             ┌─────────────────────────────────────┐
             │     NGO Arrives at Pickup Location  │
             └─────────────────┬───────────────────┘
                               │
                               ▼
             ┌─────────────────────────────────────┐
             │    Donor Shares OTP with NGO        │
             └─────────────────┬───────────────────┘
                               │
                               ▼
             ┌─────────────────────────────────────┐
             │ OTP Verification (Valid for 10 min) │
             └─────────────────┬───────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
              OTP Verified        OTP Expired
                     │                   │
                     ▼                   ▼
      Donation Marked Picked Up    Generate New OTP
                     │
                     ▼
          Donation Successfully Completed
```

---
## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React.js** | Building the user interface |
| **Vite** | Fast development server & build tool |
| **Tailwind CSS** | Responsive UI styling |
| **React Router** | Client-side routing |
| **Axios** | HTTP communication with backend |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API development |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **BullMQ** | Background job processing |
| **Redis (Upstash)** | Queue storage for BullMQ |
| **Multer** | File uploads |
| **Cloudinary** | Cloud image storage |
| **OpenCage API** | Address geocoding |

### Development & Deployment

| Technology | Purpose |
|------------|---------|
| **Git** | Version control |
| **GitHub** | Source code hosting |
| **Render** | Backend & frontend deployment |
| **MongoDB Atlas** | Cloud database |
| **Upstash Redis** | Managed Redis service |
| **Cloudinary** | Media storage |

---

## Getting Started

Follow these steps to run the project locally.

### Clone the Repository

```bash
git clone https://github.com/Satyamgupta002/FoodGift.git
cd FoodGift
```
### Install Dependencies

```bash
cd backend
npm install
cd ..
cd frontend
npm install
```
### Environment Variables Setup

Create a `.env` file inside the `backend` directory and fill in environment variables mentioned in .env.example file.

### Start the application
```bash
cd FoodGift
cd backend
npm run dev
```
---
## Planned Enhancements

- **Real-Time Chat:** Enable one-to-one communication between donors and NGOs after a donation request is accepted to simplify coordination during pickup.

- **Socket.IO Based Real-Time Updates:** Implement WebSockets to instantly synchronize donation requests, notifications, and status updates.

- **Message Delivery Status:** Introduce single-tick and double-tick indicators to show whether chat messages have been delivered and received.
---
