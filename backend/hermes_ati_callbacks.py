"""
Isolated Hermes Agent callback handler for AITopIndex moderation buttons.
Triggered from gateway/platforms/telegram.py when callback_data starts with "ati:".
Does NOT touch BakuTopIndex or other bots.
"""
import os
import json
import html
import asyncio
import urllib.request
import urllib.error


ATI_MODERATION_URL = os.getenv("ATI_MODERATION_URL", "http://127.0.0.1:4395/internal/moderation")
ATI_INTERNAL_SECRET = os.getenv("ATI_INTERNAL_SECRET", "")


async def _safe_answer(query, text: str | None = None, show_alert: bool = False) -> None:
    try:
        await query.answer(text=text, show_alert=show_alert)
    except Exception:
        pass


async def _post_moderation_async(payload: dict) -> tuple[int, dict]:
    return await asyncio.to_thread(_post_moderation, payload)


def _post_moderation(payload: dict) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ATI_MODERATION_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Internal-Secret": ATI_INTERNAL_SECRET,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"ok": False, "error": raw}


async def handle_ati_callback(query, bot, caller_id: str, parse_mode_html) -> None:
    data = getattr(query, "data", "") or ""
    parts = data.split(":", 2)
    if len(parts) != 3:
        await _safe_answer(query, text="Некорректный формат кнопки", show_alert=True)
        return

    _, action, target_uid = parts

    if action not in ("sub_approve", "sub_reject", "lead_work", "lead_spam"):
        await _safe_answer(query, text="Неизвестное действие", show_alert=True)
        return

    await _safe_answer(query, text="Обрабатываю...")

    status, res = await _post_moderation_async({
        "action": action,
        "targetId": target_uid,
        "adminUserId": caller_id,
    })

    if not res.get("ok"):
        err_msg = res.get("error") or f"HTTP {status}"
        await _safe_answer(query, text=f"❌ {err_msg[:180]}", show_alert=True)
        return

    suffix_map = {
        "sub_approve": "✅ Одобрено и опубликовано",
        "sub_reject": "❌ Отклонено",
        "lead_work": "✅ Взято в работу",
        "lead_spam": "🗑 Отмечено как спам",
    }
    status_line = suffix_map[action]

    orig_text = getattr(query.message, "text", None) or getattr(query.message, "caption", None) or ""
    # Strip any previous status line if retried
    clean_lines = [
        ln for ln in orig_text.splitlines()
        if ln.strip() not in suffix_map.values()
    ]
    new_text = "\n".join(clean_lines).rstrip() + f"\n\n{status_line}"

    try:
        await query.edit_message_text(
            text=html.escape(new_text),
            parse_mode=parse_mode_html,
            disable_web_page_preview=True,
            reply_markup=None,
        )
    except Exception:
        try:
            await query.edit_message_reply_markup(reply_markup=None)
        except Exception:
            pass
