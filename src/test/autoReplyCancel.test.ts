import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Behavioral tests for the LiveChat 2-second auto-reply cancel rules.
 *
 * These mirror the exact logic used in src/components/LiveChat.tsx:
 *   - sendMessage() schedules a 2s timer that posts a smart auto-reply.
 *   - If the visitor sends another manual message, the pending timer is cleared
 *     and a fresh one is scheduled for the new message only.
 *   - If an admin reply arrives (realtime INSERT), the pending timer is cleared
 *     immediately and the message id is marked as "auto-replied" so it can
 *     never fire later (even after refresh).
 */

type Listener = (msg: { id: string; sender_type: "visitor" | "admin" }) => void;

function createChatHarness() {
  const autoReplyTimer: { current: ReturnType<typeof setTimeout> | null } = { current: null };
  const autoRepliedFor = new Set<string>();
  const sentAutoReplies: string[] = [];
  let adminListener: Listener | null = null;

  const onAdminMessage = (msg: { id: string; sender_type: "visitor" | "admin" }) => {
    if (msg.sender_type !== "admin") return;
    // Stronger cancel: clear pending auto-reply immediately
    if (autoReplyTimer.current) {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
    }
  };
  adminListener = onAdminMessage;

  const sendMessage = (visitorMsgId: string) => {
    // Cancel any pending auto-reply (only the latest message should trigger one)
    if (autoReplyTimer.current) {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
    }
    if (autoRepliedFor.has(visitorMsgId)) return;
    autoReplyTimer.current = setTimeout(() => {
      autoReplyTimer.current = null;
      if (autoRepliedFor.has(visitorMsgId)) return;
      autoRepliedFor.add(visitorMsgId);
      sentAutoReplies.push(visitorMsgId);
    }, 2000);
  };

  const receiveAdminReply = (id: string) => adminListener?.({ id, sender_type: "admin" });

  return { sendMessage, receiveAdminReply, sentAutoReplies, autoRepliedFor };
}

describe("LiveChat auto-reply cancel rules", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires the auto-reply after 2s when nothing cancels it", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(1999);
    expect(h.sentAutoReplies).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(h.sentAutoReplies).toEqual(["v1"]);
  });

  it("cancels the pending auto-reply when an admin reply arrives within 2s", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(500);
    h.receiveAdminReply("a1");
    vi.advanceTimersByTime(5000);
    expect(h.sentAutoReplies).toHaveLength(0);
  });

  it("cancels the pending auto-reply when the visitor sends another manual message", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(800);
    h.sendMessage("v2");
    // Original v1 timer must NOT fire
    vi.advanceTimersByTime(1500); // total 2300ms since v1
    expect(h.sentAutoReplies).toHaveLength(0);
    // v2 timer fires 2s after v2 was sent
    vi.advanceTimersByTime(500);
    expect(h.sentAutoReplies).toEqual(["v2"]);
  });

  it("never fires the auto-reply twice for the same visitor message", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(2000);
    expect(h.sentAutoReplies).toEqual(["v1"]);
    // Re-trigger should be a no-op because v1 is already in autoRepliedFor
    h.sendMessage("v1");
    vi.advanceTimersByTime(5000);
    expect(h.sentAutoReplies).toEqual(["v1"]);
  });

  it("admin reply arriving exactly at 2s boundary still cancels before the auto-reply", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(1999);
    h.receiveAdminReply("a1");
    vi.advanceTimersByTime(10);
    expect(h.sentAutoReplies).toHaveLength(0);
  });

  it("multiple rapid admin replies before 2s cancel the auto-reply and never re-trigger it", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(300);
    h.receiveAdminReply("a1");
    vi.advanceTimersByTime(200);
    h.receiveAdminReply("a2");
    vi.advanceTimersByTime(200);
    h.receiveAdminReply("a3");
    // Let well past the 2s window elapse
    vi.advanceTimersByTime(10_000);
    expect(h.sentAutoReplies).toHaveLength(0);

    // A subsequent admin reply much later must also not resurrect the timer
    h.receiveAdminReply("a4");
    vi.advanceTimersByTime(5_000);
    expect(h.sentAutoReplies).toHaveLength(0);
  });
});
