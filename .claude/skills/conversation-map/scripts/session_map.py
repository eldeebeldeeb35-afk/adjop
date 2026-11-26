"""Turn a Claude Code session transcript (.jsonl) into a short, ordered map.

    python session_map.py                       # newest session on this machine
    python session_map.py path/to/session.jsonl --out map.md
    python session_map.py --list                # list sessions, newest first

For each user request: what was asked, which tools ran (counts), files written or
edited, commands run (their descriptions), and the first lines of the final reply.
Ends with a Mermaid flowchart of the requests. Typically 20-50x smaller than the
transcript, so read this instead of scrolling back through the conversation.
"""
import argparse
import collections
import glob
import json
import os
import sys

ap = argparse.ArgumentParser()
ap.add_argument("transcript", nargs="?")
ap.add_argument("--out")
ap.add_argument("--list", action="store_true")
ap.add_argument("--chars", type=int, default=400, help="max chars kept per request/reply")
a = ap.parse_args()

files = sorted(glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")), key=os.path.getmtime, reverse=True)
if a.list:
    for f in files:
        print(f"{os.path.getsize(f)//1024:6d} KB  {f}")
    sys.exit()
path = a.transcript or (files[0] if files else None)
if not path:
    sys.exit("no transcript found")


def cut(s, n):
    s = " ".join(str(s).split())
    return s if len(s) <= n else s[:n] + " …"


turns = []
cur = None
for line in open(path, encoding="utf-8"):
    try:
        d = json.loads(line)
    except ValueError:
        continue
    t = d.get("type")
    if t not in ("user", "assistant"):
        continue
    content = d.get("message", {}).get("content")
    if t == "user":
        if isinstance(content, str) or (isinstance(content, list) and any(c.get("type") == "text" for c in content)):
            text = content if isinstance(content, str) else " ".join(c.get("text", "") for c in content if c.get("type") == "text")
            if text.strip().startswith("<") and "system-reminder" in text[:200]:
                continue
            cur = {"ask": text, "tools": collections.Counter(), "files": [], "cmds": [], "reply": "", "time": d.get("timestamp", "")}
            turns.append(cur)
        continue
    if cur is None or not isinstance(content, list):
        continue
    for c in content:
        if c.get("type") == "text" and c.get("text", "").strip():
            cur["reply"] = c["text"]
        elif c.get("type") == "tool_use":
            name, inp = c.get("name", ""), c.get("input", {}) or {}
            cur["tools"][name] += 1
            fp = inp.get("file_path")
            if name in ("Write", "Edit", "NotebookEdit") and fp and fp not in cur["files"]:
                cur["files"].append(fp)
            if name == "Bash" and inp.get("description"):
                cur["cmds"].append(inp["description"])

out = [f"# خريطة المحادثة\n", f"المصدر: `{path}` — {len(turns)} طلب\n"]
for i, t in enumerate(turns, 1):
    out.append(f"## {i}. {cut(t['ask'], 80)}")
    out.append(f"- **الطلب**: {cut(t['ask'], a.chars)}")
    if t["tools"]:
        out.append("- **الأدوات**: " + ", ".join(f"{k}×{v}" for k, v in t["tools"].most_common()))
    if t["files"]:
        out.append("- **ملفات اتكتبت/اتعدلت**: " + ", ".join(f"`{f}`" for f in t["files"]))
    if t["cmds"]:
        out.append("- **أوامر**: " + "؛ ".join(cut(c, 60) for c in t["cmds"][:12]) + (" …" if len(t["cmds"]) > 12 else ""))
    if t["reply"]:
        out.append(f"- **الرد الأخير**: {cut(t['reply'], a.chars)}")
    out.append("")
out.append("## الخريطة\n```mermaid\nflowchart TD")
for i, t in enumerate(turns, 1):
    label = cut(t["ask"], 40).replace('"', "'")
    out.append(f'  T{i}["{i}. {label}"]' + (f" --> T{i+1}" if i < len(turns) else ""))
out.append("```")
text = "\n".join(out)
if a.out:
    open(a.out, "w", encoding="utf-8").write(text)
    print(f"{a.out}  ({len(text)//1024} KB from {os.path.getsize(path)//1024} KB)")
else:
    print(text)
