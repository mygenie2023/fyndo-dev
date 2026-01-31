# FYNDO - Complete Testing Guide

This guide will help you test the full functionality of the FYNDO application for all three user types: Farmers, Associates, and Admin.

## Getting Started

The application is currently running at `http://localhost:5000`

## Test Account Creation

Since this uses in-memory storage, you'll need to create test accounts through the normal registration flow.

---

## 1. FARMER WORKFLOW

### Step 1: Register as a Farmer

1. Navigate to the app homepage
2. Click "Get Started" or go to `/login`
3. Enter a 10-digit phone number (e.g., `9876543210`)
4. Click "Send OTP"
5. Enter any 6-digit OTP (e.g., `123456`) - OTP verification is simulated
6. On the Profile Setup page:
   - **Step 1:** Enter your name (e.g., "Ramesh Patel")
   - **Step 2:** Select "Farmer" as user type
   - **Step 3:** Allow location access or manually select a location on the map
7. Click "Complete Setup"

You'll be redirected to the Jobs page as a Farmer.

### Step 2: Post a Job

**Option A: From Jobs Page**
1. Click the floating "+" button (bottom right)

**Option B: From Dashboard**
1. Navigate to Dashboard tab (bottom navigation)
2. Click "Post New Job"

**Job Posting Flow:**
1. **Service Type:** Select a service (e.g., "Ploughing", "Harvesting")
2. **Schedule:** 
   - Select date
   - Enter time (e.g., "08:00 AM")
   - Set duration (1-30 days)
3. **Team:**
   - Number of workers needed (1-50)
   - Skill level required (Beginner/Intermediate/Expert)
4. **Budget:** Enter budget amount (₹)
5. **Review:** Check all details
6. Click "Post Job"

Success! You'll see a green success indicator and your job will appear in the jobs list.

### Step 3: View and Manage Jobs

1. Go to "Jobs" tab to see all your active jobs
2. Click on any job to view details
3. In Job Details, you can:
   - **Edit:** Click edit icon to modify job details
   - **View Interested Associates:** See who expressed interest
   - **Shortlist Associates:** Select associates up to the number needed
   - **Cancel Job:** Remove the job posting
   - **Mark Complete:** Finish the job and rate associates

### Step 4: Shortlist Associates

1. Open a job with interested associates
2. Scroll to "Interested Associates" section
3. Click "Shortlist" on associates you want to hire
4. You can only shortlist up to the number of workers needed

### Step 5: Complete a Job and Rate Associates

1. Open a completed job or one you want to mark complete
2. Click "Mark as Completed"
3. If you shortlisted associates:
   - A rating dialog appears
   - Rate each associate (1-5 stars)
   - Write optional review text
   - Add optional job comment
   - Click "Submit Ratings"
4. If no associates were shortlisted:
   - Job is marked complete immediately

---

## 2. ASSOCIATE WORKFLOW

### Step 1: Register as an Associate

1. Navigate to the app homepage
2. Click "Get Started" or go to `/login`
3. Enter a different 10-digit phone number (e.g., `9876543211`)
4. Click "Send OTP"
5. Enter any 6-digit OTP
6. On the Profile Setup page:
   - **Step 1:** Enter your name (e.g., "Suresh Kumar")
   - **Step 2:** Select "Associate" as user type
   - **Step 3:** Allow location access (important for job discovery!)
7. Click "Complete Setup"

### Step 2: Select Your Skills

1. After registration, you'll see the Skill Selection screen
2. Choose your agricultural skills (select multiple):
   - Ploughing
   - Sowing
   - Harvesting
   - Irrigation
   - Weeding
   - Fertilizing
   - Pesticide Application
   - General Farm Work
   - Livestock Care
   - Machinery Operation
3. Click "Continue with X skills"

### Step 3: Discover Jobs

1. Go to the "Jobs" tab
2. You'll see three tabs:
   - **Available:** Jobs within 20km matching your skills
   - **Shortlisted:** Jobs where farmers shortlisted you
   - **Completed:** Your completed work history

### Step 4: Express Interest in Jobs

1. Browse available jobs
2. Click "Express Interest" on jobs you want
3. Job moves to your interest list
4. Wait for farmer to shortlist you

### Step 5: View Shortlisted Jobs

1. Click the "Shortlisted" tab
2. See jobs where farmers selected you
3. View job details and farmer contact information

### Step 6: Update Your Profile

1. Go to "Profile" tab (bottom navigation)
2. Click on your profile card
3. Edit:
   - **Name**
   - **Skills:** Add or remove skills
   - **Skill Level:** Beginner/Intermediate/Expert
   - **Hourly Rate:** ₹50 - ₹500
4. Click "Save Changes"

### Step 7: Manage Skills from Profile

1. From Profile page, scroll to "Manage Skills"
2. Click to edit skills
3. Add or remove skills
4. Update skill level and hourly rate
5. Save changes

---

## 3. ADMIN WORKFLOW

### Step 1: Access Admin Panel

1. Navigate to `/admin`
2. You'll see the admin login page
3. Enter credentials:
   - **Username:** `admin`
   - **Password:** `$MartApp2025`
4. Click "Login"

### Step 2: Manage Jobs

1. Click "Jobs" tab in admin dashboard
2. You'll see all jobs in the system
3. Search jobs by service type or location
4. Click any job to:
   - View full job details
   - See farmer information
   - View all interested associates
   - Edit job fields (service type, budget, dates, etc.)
   - Update job status (Active/Cancelled/Completed)
   - View and moderate reviews
   - Delete inappropriate reviews
   - Shortlist associates

### Step 3: Manage Users

1. Click "Users" tab in admin dashboard
2. You'll see all users (farmers and associates)
3. Search users by name or phone number
4. Click any user to:
   - View user profile and details
   - See user's job history
   - View skills and ratings (for associates)
   - See posted jobs (for farmers)

### Step 4: Moderate Reviews

1. From Admin Dashboard → Jobs
2. Click on a completed job
3. Scroll to "Reviews" section
4. Click "Delete" on any inappropriate review
5. Associate's average rating automatically recalculates

### Step 5: Logout

1. Click "Logout" button in admin dashboard header
2. You'll be redirected to admin login page

---

## Key Features to Test

### Location-Based Job Discovery

- **Associates** only see jobs within 20km radius
- Make sure to allow location access when testing
- If location is denied, associates see a message to enable it

### Multi-Language Support

- Click the language switcher (top right on most pages)
- Switch between English, Kannada, and Hindi
- Verify all text translates correctly

### Job Status Flow

Jobs progress through these statuses:
1. **Open** → Just posted, accepting interest
2. **Assigned** → Associates shortlisted
3. **Completed** → Job finished with ratings
4. **Cancelled** → Job cancelled by farmer

### Rating System

- Associates get ratings when farmers complete jobs
- Average rating is calculated automatically
- Ratings appear on associate profiles
- When admin deletes a review, rating recalculates

### Dashboard Metrics

**Farmer Dashboard shows:**
- Active jobs count
- Total spent (placeholder)
- Average rating given (placeholder)
- Pending jobs count

**Associate Dashboard shows:**
- Total earnings (placeholder)
- Jobs completed count
- Average rating received
- Shortlisted jobs count

---

## Testing Checklist

### Authentication & Profile
- [ ] Register new farmer account
- [ ] Register new associate account  
- [ ] Complete profile setup with location
- [ ] Update profile via EditProfile page
- [ ] Logout and login again

### Farmer Features
- [ ] Post a new job
- [ ] View job in jobs list
- [ ] Edit an existing job
- [ ] View interested associates
- [ ] Shortlist associates (up to limit)
- [ ] Cancel a job
- [ ] Mark job as completed
- [ ] Rate associates after completion

### Associate Features
- [ ] Select skills during onboarding
- [ ] Browse available jobs (within 20km)
- [ ] Express interest in a job
- [ ] Remove interest from a job
- [ ] View shortlisted jobs
- [ ] View completed jobs
- [ ] Update skills from profile
- [ ] Change hourly rate

### Admin Features
- [ ] Login to admin panel
- [ ] View all jobs
- [ ] Search jobs
- [ ] Edit job details
- [ ] Update job status
- [ ] View all users
- [ ] Search users
- [ ] View user details with job history
- [ ] Delete inappropriate review
- [ ] Verify rating recalculation after delete
- [ ] Logout from admin panel

### UI/UX
- [ ] Test bottom navigation (Jobs, Dashboard, Notifications, Profile)
- [ ] Switch languages (EN/KN/HI)
- [ ] Test mobile responsive design
- [ ] Verify glassmorphic UI elements
- [ ] Check loading states
- [ ] Verify error handling

---

## Tips for Testing

1. **Create Multiple Accounts:** Test interactions between farmers and associates
2. **Use Different Locations:** Test the 20km radius job filtering for associates
3. **Test Edge Cases:** 
   - Try posting job with no associates nearby
   - Express interest then remove it
   - Shortlist then un-shortlist
4. **Verify Data Persistence:** Note that data is in-memory and will reset on server restart
5. **Check Notifications:** Currently showing placeholder notifications
6. **Test Workflows End-to-End:** Complete full job lifecycle from posting to rating

---

## Common Test Scenarios

### Scenario 1: Complete Job Lifecycle

1. **Farmer** posts a job for "Ploughing" needing 2 workers
2. **Associate 1** with "Ploughing" skill expresses interest
3. **Associate 2** with "Ploughing" skill expresses interest  
4. **Farmer** shortlists both associates
5. **Farmer** marks job as completed
6. **Farmer** rates both associates (4 and 5 stars)
7. **Associates** see updated ratings on their profiles

### Scenario 2: Job Editing and Cancellation

1. **Farmer** posts a job
2. **Associate** expresses interest
3. **Farmer** edits job to change budget and date
4. **Associate** interest is maintained
5. **Farmer** decides to cancel job
6. Job status changes to "Cancelled"

### Scenario 3: Admin Moderation

1. **Farmer** completes job and leaves an inappropriate review
2. **Admin** logs in and views the job
3. **Admin** deletes the inappropriate review
4. **Associate's** rating automatically recalculates
5. Verification: Check associate profile for updated rating

---

## Known Limitations

1. **In-Memory Storage:** All data resets when server restarts
2. **OTP Verification:** Accepts any 6-digit code (simulated)
3. **Payment Processing:** Not integrated (Stripe planned)
4. **Real-time Notifications:** Currently showing static placeholders
5. **Location Services:** Uses browser geolocation + OpenStreetMap for reverse geocoding

---

## Support

For issues or questions about testing:
- Check browser console for errors
- Verify location permissions are enabled
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check that the development server is running on port 5000

---

**Happy Testing! 🚜**
