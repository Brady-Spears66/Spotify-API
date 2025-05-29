from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initializing local environment variables
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
