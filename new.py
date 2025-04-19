
import streamlit as st
import firebase_admin
from firebase_admin import credentials, auth
import time
import webbrowser
import os

# Set up page configuration
st.set_page_config(
    page_title="AI Mock Interview System",
    page_icon="",
    layout="wide",
)

# Inject custom CSS for improved UI
st.markdown(
    """
    <style>
    /* Global styles */
    .main {
        # background-color: #f7f7f7;
        padding: 2rem;
    }
    
    /* Navigation bar */
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
        margin-bottom: 2rem;
    }
    .navbar-brand {
        font-size: 1.8rem;
        font-weight: bold;
        color: white;
    }
    .navbar-links {
        display: flex;
        gap: 1rem;
    }
    
    body {
        background-image: url("bg_img.jpg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
    
    /* Feature cards */
    .features-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin: 3rem 0;
    }
    .feature-card {
        background-color: rgb(77 78 84 / 44%);
        color:white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0,0,0,0.1);
        flex: 1;
        min-width: 250px;
    }
    .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #4CAF50;
    }
    .feature-title {
        font-size: 1.4rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    /* Auth container */
    .auth-container {
        max-width: 500px;
        margin: 0 auto;
        background-color: #0e1117;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    /* Form elements */
    .stButton button {
        background-color: #125df8 ;
        color: white;
        border: none;
        padding: 0.7em 1.2em;
        border-radius: 5px;
        font-size: 1em;
        width: 100%;
        margin-top: 1rem;
    }
    .stTextInput>div>div>input {
        border-radius: 5px;
        padding: 0.7em;
    }
    
    /* Footer */
    .footer {
        margin-top: 4rem;
        border-top: 1px solid #eee;
        padding: 2rem 0;
        display: flex;
        justify-content: space-between;
    }
    .footer-section {
        flex: 1;
        padding: 0 1rem;
    }
    
    /* Headings */
    h1, h2, h3 {
        color: #333;
    }
    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    h2 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
    }
    
    /* Animations */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade {
        animation: fadeIn 0.5s ease-in-out;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(r"C:\Users\ROSHAN\Downloads\finalhari.py\finalhari.py\codewHari.py\mock-20306-firebase-adminsdk-fbsvc-e03a8e8956.json")
        firebase_admin.initialize_app(cred)
    except Exception as e:
        st.error(f"Error initializing Firebase: {e}")

# Page state management
if 'page' not in st.session_state:
    st.session_state.page = "landing"

# Navigation bar function
def navbar():
    # Display the logo part of the navbar
    st.markdown(
        """
        <div class="navbar">
            <div class="navbar-brand">AI Mock Interview</div>
            <div class="navbar-links"></div>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    # Handle navbar button clicks with Streamlit's own components
    col1, col2, col3 = st.columns([6, 1, 1])
    with col2:
        if st.button("Login", key="nav_login"):
            st.session_state.page = "auth"
            st.session_state.auth_mode = "login"
            # Use st.rerun() instead of st.experimental_rerun()
            st.rerun()
    with col3:
        if st.button("Sign Up", key="nav_signup"):
            st.session_state.page = "auth"
            st.session_state.auth_mode = "signup"
            # Use st.rerun() instead of st.experimental_rerun()
            st.rerun()

# Landing page content
def show_landing_page():
    # Navbar
    navbar()
    
    # Hero section
    st.markdown("<h1 class='animate-fade'>Prepare for Your Dream Job with AI-Powered Mock Interviews</h1>", unsafe_allow_html=True)
    st.markdown("<p class='animate-fade' style='font-size: 1.2rem; margin-bottom: 2rem;'>Practice interviews with our intelligent AI system that provides real-time feedback and personalized coaching.</p>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("Get Started", key="hero_cta"):
            st.session_state.page = "auth"
            st.session_state.auth_mode = "signup"
            # Use st.rerun() instead of st.experimental_rerun()
            st.rerun()
    
    # Features section
    st.markdown("<h2 style='text-align: center; margin-top: 3rem;'>Key Features</h2>", unsafe_allow_html=True)
    
    st.markdown(
        """
        <div class="features-container">
            <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <div class="feature-title">Realistic Interviews</div>
                <p>Experience industry-specific interview questions tailored to your career goals.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Detailed Analysis</div>
                <p>Get comprehensive feedback on your performance with actionable improvement tips.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">⏱️</div>
                <div class="feature-title">On-Demand Practice</div>
                <p>Practice anytime, anywhere without scheduling constraints.</p>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    # Testimonials (optional)
    st.markdown("<h2 style='text-align: center; margin-top: 3rem;'>What Users Say</h2>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(
            """
            <div class="feature-card">
                <p style="font-style: italic;">"This platform helped me prepare for my technical interviews and land my dream job at a top tech company."</p>
                <p style="font-weight: bold;">- Sarah K., Software Engineer</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with col2:
        st.markdown(
            """
            <div class="feature-card">
                <p style="font-style: italic;">"The personalized feedback helped me identify my weaknesses and significantly improve my interview performance."</p>
                <p style="font-weight: bold;">- Michael T., Business Analyst</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    
    # Footer
    st.markdown(
        """
        <div class="footer">
            <div class="footer-section">
                <h3>About Us</h3>
                <p>AI Mock Interview System is an innovative platform designed to help job seekers practice and improve their interview skills using artificial intelligence.</p>
            </div>
            <div class="footer-section">
                <h3>Contact Us</h3>
                <p>Email: support@aimockinterview.com</p>
                <p>Phone: +1 (123) 456-7890</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 1rem; color: #666;">
            <p>© 2025 AI Mock Interview System. All rights reserved.</p>
        </div>
        """,
        unsafe_allow_html=True
    )

# Authentication page
def show_auth_page():
    # Simple navigation
    if st.button("← Back to Home"):
        st.session_state.page = "landing"
        # Use st.rerun() instead of st.experimental_rerun()
        st.rerun()
    
    st.markdown("<div class='auth-container'>", unsafe_allow_html=True)
    
    # Authentication header
    if hasattr(st.session_state, 'auth_mode') and st.session_state.auth_mode == "signup":
        st.markdown("<h2 style='text-align: center;'>Create an Account</h2>", unsafe_allow_html=True)
    else:
        st.markdown("<h2 style='text-align: center;'>Welcome Back</h2>", unsafe_allow_html=True)
    
    # User type selection
    option = st.radio("Select your role:", ("Candidate", "Expert"), index=0)
    
    # Authentication mode selection
    if hasattr(st.session_state, 'auth_mode') and st.session_state.auth_mode == "signup":
        action = "Sign Up"
    else:
        action = st.radio("Action:", ("Login", "Sign Up"), index=0)
    
    # Form fields
    email = st.text_input("Email", placeholder="Enter your email")
    password = st.text_input("Password", type="password", placeholder="Enter your password")
    
    # Form submission
    if action == "Sign Up":
        if st.button("Register", key="register_btn"):
            try:
                user = auth.create_user(email=email, password=password)
                st.success("User registered successfully! Please login.")
                # Switch to login mode after successful registration
                st.session_state.auth_mode = "login"
                time.sleep(2)
                # Use st.rerun() instead of st.experimental_rerun()
                st.rerun()
            except Exception as e:
                st.error(f"Error: {e}")
    else:  # Login
        if option == "Candidate":
            if st.button("Login as Candidate", key="candidate_login"):
                try:
                    user = auth.get_user_by_email(email)
                    st.success("Login Successful! Redirecting to interview platform...")
                    time.sleep(2)
                    # Redirect candidate to React app
                    REACT_APP_URL = "http://localhost:5173"  # Change to deployed URL if hosted
                    webbrowser.open(REACT_APP_URL)
                except Exception as e:
                    st.error(f"Login Failed: {e}")
        else:  # Recruiter
            if st.button("Login as Expert", key="recruiter_login"):
                try:
                    user = auth.get_user_by_email(email)
                    if user.email == email:
                        st.success("Expert Login Successful! Redirecting...")
                        time.sleep(2)
                        os.system("streamlit run app.py")
                    else:
                        st.error("Invalid credentials")
                except Exception as e:
                    st.error(f"Login Failed: {e}")
    
    st.markdown("</div>", unsafe_allow_html=True)

# Main app logic
if st.session_state.page == "landing":
    show_landing_page()
elif st.session_state.page == "auth":
    show_auth_page()
