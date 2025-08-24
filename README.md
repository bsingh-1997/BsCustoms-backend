BS Customs – Automobile Modification E-Store



BS Customs is a full-stack automobile modification parts e-store, built with the MERN stack and deployed live on Vercel. It provides a 
seamless shopping experience with secure authentication, order management, payments, and an admin dashboard – making it a complete e-commerce 
platform.

Live Demo: https://bs-customs-frontend.vercel.app/
 
✨ Features
🔐 Authentication & Security

User signup, login, and logout flow.

Forgot password via email link (powered by Nodemailer).

Passwords protected with bcrypt hashing.

JWT tokens for secure sessions and backend verification.



🛒 User Features

Browse auto-mod parts with product details: image, name, description, price, stock number.

Mobile-first responsive design – works on phones, tablets, laptops & desktops.

Add to cart with dynamic updates.

Save personal details & addresses for faster checkout.

Profile management – update details & reset password.

Order history panel with full order status tracking.

Place orders via:

💵 Cash on Delivery (COD)

💳 Razorpay (test mode integrated).

Email confirmation on successful order placement & status updates.



🛠️ Admin Features

JWT-secured Admin Panel (exclusive access).

Full CRUD operations on products:

Manage product image (via Cloudinary), name, description, price, stock number.

Manage all customer orders:

Update status (Pending, Confirmed, Cancelled).

Trigger automatic email notifications via Nodemailer.

User’s order history updates in real-time.

Working Admin Dashboard with analytics (orders for today,this week , this month etc etc) with 4 types of graphs and charts.



🧰 Tech Stack

Frontend: React.js, CSS
Backend: Node.js, Express.js
Database: MongoDB (Mongoose ODM)
Services:

☁️ Cloudinary (product image storage – 1 image per product in free tier)

✉️ Nodemailer (email services)

🔑 JWT + bcrypt (authentication & password security)

💳 Razorpay (test payments)




🚀 Roadmap

 Add multiple images per product (paid Cloudinary).

 Introduce product reviews & ratings.(dummy for now)

 Assigning a real domain to it.


📧 Contact

📩 barindersingh1997@gmail.com
