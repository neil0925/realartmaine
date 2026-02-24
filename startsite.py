import subprocess
import webbrowser
import os
import sys
import tkinter as tk
from tkinter import messagebox

# ---------------- CONFIG ----------------

SITE_DIR = r"C:\Users\Dalton\OneDrive\Documents\GitHub\realartmaine" 
SERVER_PORT = 3000
SERVER_URL = f"http://127.0.0.1:{SERVER_PORT}/"

server_process = None

# ---------------- SERVER LOGIC ----------------

def start_server():
    global server_process

    if server_process is not None:
        return

    if not os.path.isdir(SITE_DIR):
        messagebox.showerror("Error", f"Folder not found:\n{SITE_DIR}")
        return

    cmd = [sys.executable, "-m", "http.server", str(SERVER_PORT)]

    popen_kwargs = {"cwd": SITE_DIR}
    if os.name == "nt":
        popen_kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

    try:
        server_process = subprocess.Popen(cmd, **popen_kwargs)
    except Exception as e:
        messagebox.showerror("Error", f"Failed to start server:\n{e}")
        return

    status_label.config(text="🟢 Server running", fg="green")
    root.after(1000, open_browser)

def open_browser():
    webbrowser.open(SERVER_URL)

def stop_server():
    global server_process
    if server_process:
        server_process.terminate()
        server_process = None
        status_label.config(text="🔴 Server stopped", fg="red")

def on_close():
    stop_server()
    root.destroy()

# ---------------- GUI ----------------

root = tk.Tk()
root.title("Local Website Server")
root.geometry("360x180")
root.resizable(False, False)

title = tk.Label(
    root,
    text="Local Website Server",
    font=("Segoe UI", 14, "bold")
)
title.pack(pady=10)

status_label = tk.Label(
    root,
    text="🔴 Server stopped",
    fg="red"
)
status_label.pack(pady=10)

btn_frame = tk.Frame(root)
btn_frame.pack(pady=10)

start_btn = tk.Button(
    btn_frame,
    text="Start Server",
    width=15,
    command=start_server
)
start_btn.grid(row=0, column=0, padx=5)

stop_btn = tk.Button(
    btn_frame,
    text="Stop Server",
    width=15,
    command=stop_server
)
stop_btn.grid(row=0, column=1, padx=5)

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()