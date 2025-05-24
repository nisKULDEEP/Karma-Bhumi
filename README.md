# 🌟 KarmaBhumi B2B Teams Project Management SaaS  

## 📌 Project Overview  

Welcome to **KarmaBhumi**, a powerful and scalable multi-tenancy project management system built with **Node.js**, **MongoDB**, and **React**. Designed for real-world B2B needs, this project delivers features like Google Sign-In, workspace management, project tracking, task collaboration, role-based permissions, and more. Perfect for developers aiming to create SaaS-based team collaboration platforms.  

---

## 🌟 Key Features  

- 🔐 **Authentication** (Google Sign-In, Email, Password)  
- 🏢 **Create & Manage Multiple Workspaces**  
- 📊 **Projects & Epics Management**  
- ✅ **Tasks** (CRUD, Status, Priority, Assignee)  
- 👥 **Roles & Permissions** (Owner, Admin, Member)  
- ✉️ **Invite Members to Workspaces**  
- 🔍 **Filters & Search** (Status, Priority, AssignedTo)  
- 📈 **Analytics Dashboard**  
- 📅 **Pagination & Load More**  
- 🔒 **Cookie Session Management**  
- 🚪 **Logout & Session Termination**  
- 🌱 **Seeding** for Test Data  
- 💾 **Mongoose Transactions** for Robust Data Integrity  
- 🌐 **Built with MERN Stack** (Node.js, MongoDB, React, TypeScript)  

---

## 🚀 Tools & Technologies  

This project leverages the latest tools and frameworks for modern development:  

- **Node.js**: Scalable backend architecture  
- **React.js**: Dynamic frontend framework  
- **MongoDB & Mongoose**: Flexible and scalable database solutions  
- **Google OAuth**: Seamless Google Sign-In integration  
- **TypeScript**: For a type-safe codebase  
- **TailwindCSS & Shadcn UI**: Beautiful, responsive design  
- **Vite.js**: Lightning-fast frontend development  

---

## 🔄 Getting Started  

### 1. Watch the Video  
Follow along step-by-step by watching the full guide on YouTube.  

### 2. Set Up Environment Variables  

Create a `.env` file in the root of your project and configure these variables:  

```plaintext  
PORT=8000
NODE_ENV=development
MONGO_URI="mongodb+srv://<username>:<password>@<>.mongodb.net/teamsync_db"  

SESSION_SECRET="session_secret_key"

GOOGLE_CLIENT_ID=<your-google-client-id>  
GOOGLE_CLIENT_SECRET=<your-google-client-secret>  
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback
```  

### 3. Run the Application  

Install dependencies and start the development server:  

```bash  
npm install  
npm run dev  
```  

Access the backend at `http://localhost:8000`.  

---

## 🌐 Deploying KarmaBhumi  

### 1. Add Environment Variables  
Add the `.env` variables to your hosting platform (e.g., Vercel).  

### 2. Deploy  
Deploy your app using your preferred method to make it live.  

---

## 📚 Comprehensive Guide  

**🚀 Deepen Your Understanding!**  
We’ve developed an all-encompassing guide for this project that explains:  

- The architecture and design principles behind KarmaBhumi  
- Step-by-step breakdowns of each feature  
- Advanced techniques for implementing seeding, Mongoose transactions, and performance optimizations  
- Insights into multi-tenancy and role-based permission models  
- Best practices for building scalable SaaS applications  

This guide ensures you gain a thorough understanding of every concept and feature in KarmaBhumi, empowering you to build similar systems or expand upon this project.  

**💡 Ready to learn more?** Check out the full guide now—**[link in the description!](#)**  

---

### 📺 Like, Share & Subscribe  

Don’t miss out! **[Subscribe to the Channel](https://tinyurl.com/subcribe-to-techwithEmma)** for more amazing content and exciting projects.  

Now, let’s dive into the demo of **KarmaBhumi**! 🚀

# Guidelines - 
1. No direct use of axios in components, Always put your apis inside src/lib/api folder and export it by index.ts. (Create file if not exist for your type of apis)
2. All types will be put in appropriate file under src/type folder (Create file if not exist for your type of types)
3. Whever giving types in client, go through the backend code and reverify the types through schemas and code.
4. All the files name should be in camelCases. 
5. Don't do string comparision, Always use enums/types.