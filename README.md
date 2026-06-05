# 🚀 FastJob Pilote (Application Tracker)

FastJob Pilote is a 100% free, open-source tool built directly into **Google Sheets**, designed to automate and efficiently track your job, internship, or apprenticeship applications. 

No more forgotten follow-ups or tedious tracking: this tool turns a simple spreadsheet into a true personal CRM that is seamlessly integrated with your Gmail inbox.

## ✨ Key Features

* **✉️ Automated & Personalized Emails**: Use tags (`{nom}`, `{entreprise}`, etc.) to generate custom, tailored emails.
* **🔁 Smart Follow-ups**: The tool automatically sends follow-ups at D+7 and D+14 **directly within the same Gmail thread**, bringing your initial message to the top of the recruiter's inbox naturally.
* **🛑 Reply Detection**: The script scans your inbox. If it detects a reply from the recruiter, it instantly halts any scheduled follow-ups.
* **📊 Built-in Dashboard**: Track your statistics (Response rate, sent applications, daily follow-ups) directly from a sidebar in Google Sheets.
* **📎 Multiple Attachments**: Automatically send your CV and Cover Letter hosted on Google Drive.

---

## 🛠️ Installation (Step-by-Step)

You don't need any programming skills to install this tool.

### 1. Prepare the Spreadsheet
1. Create a new, blank [Google Sheets](https://sheets.new/).
2. In the top menu, click on **Extensions > Apps Script**.
3. A new tab will open: this is the Google code editor.

### 2. Copy the Source Code
In the Apps Script editor, you need to create multiple files to match the project's architecture. Click on the **"+" (Add a file)** icon on the left to create:

**"Script" files (.gs):**
* `Config` (Copy the content of `config.gs` here)
* `SheetManager` (Copy the content of `sheetmanager.gs` here)
* `EmailManager` (Copy the content of `emailmanager.gs` here)
* `AutomationManager` (Copy the content of `automationmanager.gs` here)
* `Code` (Copy the content of `code.gs` here)

**"HTML" files (.html):**
* `Dashboard` (Copy the content of `dashboard.html` here)
* `SettingsPanel` (Copy the content of `settingspanel.html` here)

💾 Click on the **Save** icon (the floppy disk) at the top of the screen.

### 3. Initialize the Tool
1. Go back to your Google Sheets tab and **refresh the page** (F5).
2. After a few seconds, a new menu will appear at the top: **📧 Alternance Tracker**.
3. Click on **📧 Alternance Tracker > 📋 Initialiser / Réinitialiser la feuille** (Initialize / Reset sheet).
4. *Security note:* Google will display a warning stating the app isn't verified (since you just created it). Click on **Advanced** and then on **Go to [Your Project Name] (unsafe)** to grant the script access to your Gmail and Google Drive.

The blue table layout is now generated, and the tool is ready to be configured!

---

## ⚙️ Configuration & Templates

1. In your Google Sheets, click on **📧 Alternance Tracker > ⚙️ Paramètres & Modèles** (Settings & Templates).
2. Fill in your personal information (Name, phone number, signature).
3. **Important for the signature photo:** Host your photo on a site like [ImgBB](https://imgbb.com/) and paste the *Direct Link* of the image.
4. Draft your email templates (Initial, Follow-up 1, Follow-up 2) using the blue buttons to insert your variables (`{nom}`, `{entreprise}`...). Do **not** use the Enter key to create a line break; simply use `<br><br>`.
5. Click on **Save**.

---

## 🚀 Daily Usage Guide

### 1. Add a Candidate and Attachments
* Fill out a row in the spreadsheet with the recruiter's information.
* In the **Dossier Drive** (Drive Folder) column, paste the link(s) to your files (CV, Cover Letter) hosted on Google Drive. *Warning: These files must be set to "Anyone with the link can view".* If you have multiple files, separate the links with a single space.
* Set the status to **"À envoyer"** (To be sent).

### 2. Send the First Wave
The tool does not send the initial contact email automatically.
* Open the menu **📧 Alternance Tracker > 📊 Tableau de bord** (Dashboard).
* Click on the blue button **📤 Envoyer candidatures en attente** (Send pending applications).
* The script dispatches the emails, calculates the dates for future follow-ups, and changes the status to "Envoyé" (Sent).

### 3. The Autopilot (Hands-off!)
To enable automatic follow-ups:
* In the Dashboard, scroll to the bottom and click on **Activer l'automatisation quotidienne** (Enable daily automation).
* From now on, **every day at 9:00 AM**, the script will:
    1. Scan the Gmail threads of sent applications. If a reply is found, it changes the row to green ("Réponse reçue" / Reply received) and cancels future follow-ups.
    2. Send Follow-up 1 or Follow-up 2 emails if the scheduled date has been reached for candidates who haven't replied.

### 🛑 How to manually stop a follow-up?
If you want to halt the process for a specific recruiter (e.g., if they called you by phone), simply change their status manually in the Google Sheet to **"Réponse reçue"** (Reply received) or **"Refus"** (Declined). The script will ignore this row from then on.

---

## 👨‍💻 Author

Created by **Mielpops** *Tool developed to optimize and automate recruitment tracking in an ethical and organized manner.*
