"""Asks the backend to email subscribers about the published rebalances. Standard library only.

Needs BACKEND_URL and CRON_SECRET. Waits while the backend is still redeploying, then calls until nothing is left.
Exit code 1 means some emails may not have gone out: the next scheduled run tries them again.
"""
import json, os, sys, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
WAIT_SECONDS = 25 * 60  # for the redeploy, and for a sleeping free server to wake


def call(url, key, body):
    req = urllib.request.Request(url, data=body, method="POST", headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            return res.status, json.load(res)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.load(e)
        except ValueError:
            return e.code, {}
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        return 0, {"error": str(e)}


def alert(base, key, run_url):
    """The run failed: ask the backend to email the admins. A sleeping server gets a few tries."""
    body = json.dumps({"failedRun": run_url}).encode()
    for attempt in range(6):
        status, reply = call(f"{base}/api/rebalance-notify", key, body)
        if status == 200:
            print(f"admins alerted: {reply.get('alerted')}")
            return
        print(f"alert not sent yet ({status} {reply.get('error', '')})")
        if status in (400, 401, 503):
            break
        time.sleep(30)
    sys.exit("Could not send the failure alert.")


def main():
    base, key = os.environ.get("BACKEND_URL", "").strip().rstrip("/"), os.environ.get("CRON_SECRET", "").strip()
    if not base.startswith("https://") or not key:
        sys.exit("Set the BACKEND_URL variable (https) and the CRON_SECRET secret in the repository settings.")
    if "--failed" in sys.argv:
        return alert(base, key, os.environ.get("RUN_URL", ""))
    results = json.load(open(os.path.join(HERE, "out", "results.json"), encoding="utf8"))
    body = json.dumps({"signals": {slug: r["schedule"]["lastSignal"] for slug, r in results.items()}}).encode()

    deadline, sent, unconfirmed = time.time() + WAIT_SECONDS, 0, 0
    while True:
        status, reply = call(f"{base}/api/rebalance-notify", key, body)
        if status == 200:
            sent += reply["sent"]
            unsure = reply.get("unconfirmed", 0)
            unconfirmed += unsure
            print(f"sent {reply['sent']}, failed {reply['failed']}, unconfirmed {unsure}, remaining {reply['remaining']}")
            if reply["limitReached"]:
                sys.exit(f"Daily email limit reached after {sent}. The rest will be tried on the next run.")
            if reply["failed"]:
                sys.exit(f"{reply['failed']} emails failed. They will be tried again on the next run.")
            if reply["remaining"] == 0 or reply["sent"] + unsure == 0:
                if unconfirmed:
                    sys.exit(f"{sent} emails sent. For {unconfirmed} more, the mail service did not confirm. They are NOT sent again, "
                             "so nobody gets a repeat: check the Brevo log to see whether they arrived.")
                print(f"done: {sent} emails sent")
                return
        elif status in (400, 401, 503):
            sys.exit(f"The backend refused: {status} {reply.get('error', '')}")
        else:  # 404 or 409: the new version is not live yet. 0 or 5xx: waking up or restarting.
            print(f"waiting for the backend ({status} {reply.get('error', '')})")
        if time.time() > deadline:
            sys.exit(f"Gave up waiting for the backend. Emails sent so far: {sent}.")
        time.sleep(30 if status != 200 else 2)


if __name__ == "__main__":
    main()
