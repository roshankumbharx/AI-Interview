import streamlit as st
import firebase_admin
from firebase_admin import credentials, auth
import time
import webbrowser
import os  # For opening URLs

# Set up page configuration
st.set_page_config(
    page_title="AI Mock Interview System",
    page_icon="🤖",
    layout="centered",
)

# Inject custom CSS for improved UI
st.markdown(
    """
    <style>
    .main {
        background-color: #f7f7f7;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .stButton button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 0.5em 1em;
        border-radius: 5px;
        font-size: 1em;
    }
    .stTextInput>div>div>input {
        border-radius: 5px;
    }
    </style>
    """,
    unsafe_allow_html=True
)

with st.container():
    st.title("🤖 AI Mock Interview System")

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(r"C:\Users\ROSHAN\Downloads\finalhari.py\finalhari.py\codewHari.py\mock-20306-firebase-adminsdk-fbsvc-e03a8e8956.json")
    firebase_admin.initialize_app(cred)

# Page Routing
if 'page' not in st.session_state:
    st.session_state.page = "login"

# Login Button and UI container
with st.container():
    if 'login_clicked' not in st.session_state:
        st.session_state.login_clicked = False

    if st.button("Login"):
        st.session_state.login_clicked = True

if st.session_state.login_clicked:
    with st.container():
        option = st.radio("Select your role:", ("Candidate", "Recruiter"), index=0)

    if option == "Candidate":
        with st.container():
            action = st.radio("Action:", ("Login", "Sign Up"), index=0)

            email = st.text_input("Email", placeholder="Enter your email")
            password = st.text_input("Password", type="password", placeholder="Enter your password")

        if action == "Sign Up":
            if st.button("Register", key="candidate_register"):
                try:
                    user = auth.create_user(email=email, password=password)
                    st.success("User registered successfully! Please login.")
                except Exception as e:
                    st.error(f"Error: {e}")

        elif action == "Login":
            if st.button("Login", key="candidate_login"):
                try:
                    user = auth.get_user_by_email(email)
                    st.success("Login Successful! Redirecting to interview platform...")
                    time.sleep(2)
                    # Redirect candidate to React app
                    REACT_APP_URL = "http://localhost:5173"  # Change to deployed URL if hosted
                    webbrowser.open(REACT_APP_URL)
                except Exception as e:
                    st.error(f"Login Failed: {e}")

    elif option == "Recruiter":
        with st.container():
            email = st.text_input("Email", placeholder="Enter your email", key="recruiter_email")
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="recruiter_password")

        if st.button("Login", key="recruiter_login"):
            try:
                user = auth.get_user_by_email(email)
                if user.email == email:
                    st.success("Recruiter Login Successful! Redirecting...")
                    time.sleep(2)
                    os.system("streamlit run app.py")
                else:
                    st.error("Invalid credentials")
            except Exception as e:
                st.error(f"Login Failed: {e}")
