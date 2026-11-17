import os
import paramiko

HOST = os.environ.get("CONTABO_HOST", "109.199.96.102")
USER = os.environ.get("CONTABO_USER", "deploy")
KEY_PATH = os.environ.get("CONTABO_SSH_KEY", os.path.expanduser("~/.ssh/id_ed25519_aitopindex"))
GH_TOKEN = os.environ.get("GH_TOKEN", "")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")

def run_ssh():
    if not GH_TOKEN or not VERCEL_TOKEN:
        raise RuntimeError("Set GH_TOKEN and VERCEL_TOKEN environment variables before running.")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {HOST} as {USER} using SSH key...")
    ssh.connect(HOST, username=USER, key_filename=KEY_PATH, timeout=30)
    print("Connected successfully.")

    def exec_cmd(cmd, desc=""):
        print(f"\n--- {desc} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        if out:
            print(out.strip())
        if err:
            print(err.strip())
        return stdout.channel.recv_exit_status(), out, err

    exec_cmd("cd /root/aitopindex && git pull origin main && npm install", "Sync & Install")
    ssh.close()

if __name__ == "__main__":
    run_ssh()
