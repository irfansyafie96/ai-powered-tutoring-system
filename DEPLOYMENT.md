# Deployment Guide for Ai-Powered Tutoring System on Azure

## Prerequisites

1. **PostgreSQL Database**: Set up a PostgreSQL database (you can use Render's PostgreSQL service)
2. **DeepSeek API Key**: Get your API key from [DeepSeek](https://platform.deepseek.com/)
3. **GitHub Repository**: Ensure your code is pushed to GitHub

## Step 1: Set up PostgreSQL Database (Render or Azure)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., `studysphere-db`)
4. Select "Free" plan
5. Choose a region close to your users
6. Click "Create Database"
7. Note down the connection details (you'll need them for environment variables)

## Step 2: Deploy Backend Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

   - **Name**: `studysphere-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Add Environment Variables:

   ```
   NODE_ENV=production
   DB_USER=<your_db_user>
   DB_PASS=<your_db_password>
   DB_NAME=<your_db_name>
   DB_HOST=<your_db_host>
   JWT_SECRET=<your_jwt_secret>
   DEEPSEEK_API_KEY=<your_deepseek_api_key>
   ```

5. Click "Create Web Service"

## Step 3: Deploy Frontend Service

1. In Render Dashboard, click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:

   - **Name**: `studysphere-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Plan**: Free

4. Add Environment Variable:

   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com
   ```

5. Click "Create Static Site"

## Step 4: Update Frontend Configuration

After your backend is deployed, update the frontend environment:

1. Go to your frontend service settings
2. Update the `REACT_APP_API_URL` environment variable with your actual backend URL
3. Redeploy the frontend service

## Step 5: Database Setup

1. Connect to your PostgreSQL database
2. Run the following SQL commands to create the required tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    subject VARCHAR(200),
    topic VARCHAR(200),
    file_hash VARCHAR(128) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz scores table
CREATE TABLE quiz_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    quiz_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved notes table (for library feature)
CREATE TABLE saved_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, note_id)
);
```

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Test user registration and login
3. Test file upload and summarization
4. Test quiz generation
5. Test all other features

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your backend CORS configuration allows your frontend domain
2. **Database Connection**: Verify all database environment variables are correct
3. **File Uploads**: Check that the uploads directory exists and has proper permissions
4. **API Timeouts**: The backend is configured with 5-minute timeouts for large file processing

### Environment Variables Checklist:

Backend:

- [ ] `NODE_ENV=production`
- [ ] `DB_USER` (from Render PostgreSQL)
- [ ] `DB_PASS` (from Render PostgreSQL)
- [ ] `DB_NAME` (from Render PostgreSQL)
- [ ] `DB_HOST` (from Render PostgreSQL)
- [ ] `JWT_SECRET` (generate a secure random string)
- [ ] `DEEPSEEK_API_KEY` (from DeepSeek platform)

Frontend:

- [ ] `REACT_APP_API_URL` (your backend service URL)

## Security Considerations

1. **JWT Secret**: Use a strong, random string for JWT_SECRET
2. **Database Password**: Use the secure password provided by Render
3. **API Keys**: Keep your DeepSeek API key secure and never commit it to version control
4. **CORS**: Configure CORS to only allow your frontend domain in production

## Performance Optimization

1. **File Size Limits**: The system is configured to handle files up to 10MB
2. **Processing Time**: Large files may take 1-2 minutes to process
3. **Caching**: Summary caching is implemented to improve performance for duplicate files

## Monitoring

1. Check Render logs for any errors
2. Monitor database connections and performance
3. Track API usage and response times
4. Monitor file upload success rates
