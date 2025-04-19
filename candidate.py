import streamlit as st
import cohere
import firebase_admin
from firebase_admin import credentials, firestore
import sounddevice as sd
import numpy as np
import tempfile
import wave
import subprocess

# =====================================
# ✅ Prevent Firebase Duplicate Error
# =====================================
if not firebase_admin._apps:
    cred = credentials.Certificate(r"codewHari.py/candidate-questionnaire-cf5eb-firebase-adminsdk-fbsvc-b9a07fb07f.json")
    firebase_admin.initialize_app(cred)

# Initialize Firestore Database
db = firestore.client()

# Initialize Cohere API
co = cohere.Client("lKVIZVpT7eR2zBWCIKd8COlPP11XBF5HEppuhPuE")

# =====================================
# ✅ Streamlit UI
# =====================================
st.title("🎙️ AI Mock Interview - Candidate Page")
st.write("👉 Please submit your profile before starting the interview.")

# =====================================
# ✅ Candidate Profile Form
# =====================================
with st.form("candidate_profile_form"):
    name = st.text_input("Name")
    education = st.text_input("Education")
    job_role = st.text_input("Job Role")
    skills = st.text_area("Skills (comma separated)")
    work_experience = st.text_area("Work Experience")
    
    # Submit Button
    submitted = st.form_submit_button("✅ Submit Profile")
    if submitted:
        # ✅ Save data to Firebase Firestore
        data = {
            "name": name,
            "education": education,
            "job_role": job_role,
            "skills": skills,
            "work_experience": work_experience
        }
        db.collection("candidates").add(data)

        # ✅ Success Message
        st.success("✅ Profile Submitted Successfully!")

        # =====================================
        # ✅ Generate Question Using Cohere
        # =====================================
        prompt = f"""
        I am conducting a job interview for the role of '{job_role}'.
        The candidate has the following profile:
        - Name: {name}
        - Education: {education}
        - Job Role: {job_role}
        - Skills: {skills}
        - Work Experience: {work_experience}
        
        Please generate the first interview question specifically tailored to the candidate's profile.
        """
        response = co.generate(
            model='command',
            prompt=prompt,
            max_tokens=200
        )
        question = response.generations[0].text

        # ✅ Display The Question
        st.write("🤖 AI Generated Interview Question:")
        st.write(f"**Q: {question}**")


        # =====================================
        # ✅ Start Microphone Recording (Speech Input)
        # =====================================
        st.write("🎙️ Please answer the question using your microphone.")

        if st.button("🎤 Start Recording"):
            st.warning("Recording... Speak now!")
            
            # Record the audio from mic
            duration = 10  # 10 seconds max recording
            sample_rate = 44100
            channels = 1

            # Record audio using sounddevice
            audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=channels, dtype=np.int16)
            sd.wait()

            # Save audio to a temporary WAV file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav_file:
                with wave.open(temp_wav_file.name, 'wb') as wf:
                    wf.setnchannels(channels)
                    wf.setsampwidth(2)
                    wf.setframerate(sample_rate)
                    wf.writeframes(audio_data.tobytes())

                st.success("✅ Recording Finished!")

            # =====================================
            # ✅ Convert Speech To Text Using Whisper (Ollama)
            # =====================================
            st.write("📝 Converting Speech To Text...")

            # Run Whisper locally using Ollama
            command = f'ollama run whisper {temp_wav_file.name}'
            result = subprocess.run(command, shell=True, capture_output=True, text=True)

            # Extract transcription text from output
            transcript = result.stdout.strip()

            # ✅ Display Transcription
            st.write("📝 Candidate's Answer:")
            st.write(transcript)

            # =====================================
            # ✅ Generate Follow-up Question Using Cohere
            # =====================================
            st.write("🤔 Generating Follow-up Question...")

            follow_up_prompt = f"""
            I am an AI interviewer conducting a job interview.
            The candidate answered: '{transcript}'
            Based on their answer, generate a highly relevant follow-up question that:
            - Is clear and professional.
            - Relates to the candidate's past work experience or technical skills.
            - Can assess their problem-solving or leadership skills.
            """
            follow_up_response = co.generate(
                model='command',
                prompt=follow_up_prompt,
                max_tokens=200
            )

            follow_up_question = follow_up_response.generations[0].text
            st.write("🤖 AI Follow-up Question:")
            st.write(f"**Q: {follow_up_question}**")
