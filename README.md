# 🛡️ GUARD Reporting Platform

GUARD (Gather, Understand, Address, Report, Defend) is a reporting platform designed to collect information about incidents related to bullying, discrimination, harassment, or any other concerning behaviors experienced by 2SLGBTQIA+ individuals within Ontario's publicly funded Catholic and public school boards.

## Project Structure

This project is built with:
- **Backend**: Django REST Framework
- **Frontend**: React.js

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd guard_reporting_project/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd guard_reporting_project/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Features

- Multi-step reporting workflow
- Auto-save functionality
- Unique response ID generation for resuming reports
- Form validation on both client and server
- Modern, accessible UI
- Secure data storage

## License

[Add license information here] 