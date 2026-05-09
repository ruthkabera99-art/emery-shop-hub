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

  it("still triggers the auto-reply after 2s when no admin replies or manual visitor messages arrive", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    // No admin replies and no new visitor messages — timer runs uninterrupted
    vi.advanceTimersByTime(1999);
    expect(h.sentAutoReplies).toHaveLength(0);
    // Cross the 2-second boundary
    vi.advanceTimersByTime(1);
    expect(h.sentAutoReplies).toEqual(["v1"]);
    // Ensure it never fires again for the same message
    vi.advanceTimersByTime(10_000);
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

  it("visitor manual message within 2s cancels the pending auto-reply even if multiple admin replies also arrive", () => {
    const h = createChatHarness();
    h.sendMessage("v1");
    vi.advanceTimersByTime(300);
    // Multiple admin replies arrive (each cancels pending timer)
    h.receiveAdminReply("a1");
    vi.advanceTimersByTime(150);
    h.receiveAdminReply("a2");
    vi.advanceTimersByTime(150);
    // Visitor sends a new manual message before v1's 2s window would have elapsed
    h.sendMessage("v2");
    // Another admin reply arrives before v2's 2s window
    vi.advanceTimersByTime(400);
    h.receiveAdminReply("a3");
    // Let well past both windows elapse
    vi.advanceTimersByTime(10_000);
    // Neither v1 nor v2 should ever produce an auto-reply
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

/**
 * Harness mirroring the timestamp-aware cancel rule used in LiveChat.tsx:
 * polling delivers admin messages with `created_at`. The pending auto-reply
 * timer is cancelled ONLY if the admin message was created AFTER the timer
 * was scheduled (autoReplyStartedAt). Older admin messages (e.g. the auto-
 * greeting that was inserted before the visitor's first message but only
 * surfaced later via polling) must NOT cancel the timer.
 */
function createTimestampAwareHarness() {
  const autoReplyTimer: { current: ReturnType<typeof setTimeout> | null } = { current: null };
  let autoReplyStartedAt = 0;
  const sentAutoReplies: string[] = [];
  const seenIds = new Set<string>();

  const sendMessage = (visitorMsgId: string) => {
    if (autoReplyTimer.current) {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
    }
    autoReplyStartedAt = Date.now();
    autoReplyTimer.current = setTimeout(() => {
      autoReplyTimer.current = null;
      sentAutoReplies.push(visitorMsgId);
    }, 2000);
  };

  // Simulates polling delivering an admin message with a real created_at
  const pollAdminMessage = (id: string, createdAtMs: number) => {
    if (seenIds.has(id)) return;
    seenIds.add(id);
    if (autoReplyTimer.current && createdAtMs > autoReplyStartedAt) {
      clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = null;
    }
  };

  return { sendMessage, pollAdminMessage, sentAutoReplies };
}

describe("LiveChat auto-reply: late auto-greeting via polling", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("auto-reply still fires exactly 2s after the visitor's first message even when the admin auto-greeting arrives late via polling", () => {
    const h = createTimestampAwareHarness();

    // T=0: conversation created, server inserts the auto-greeting (admin msg)
    // BEFORE the visitor sends their first message.
    vi.setSystemTime(new Date(0));
    const greetingCreatedAtMs = Date.now(); // 0

    // T=3000ms: visitor finally types and sends their first message.
    vi.advanceTimersByTime(3000);
    h.sendMessage("v1"); // schedules timer with autoReplyStartedAt = 3000

    // T=3500ms: polling tick finally surfaces the OLD auto-greeting.
    vi.advanceTimersByTime(500);
    h.pollAdminMessage("greeting", greetingCreatedAtMs); // created_at (0) < startedAt (3000)

    // The late greeting must NOT cancel the timer.
    // Auto-reply should fire exactly 2s after sendMessage (T=5000ms).
    vi.advanceTimersByTime(1499); // total 1999ms since send
    expect(h.sentAutoReplies).toHaveLength(0);
    vi.advanceTimersByTime(1); // total 2000ms since send
    expect(h.sentAutoReplies).toEqual(["v1"]);
  });

  it("a real admin reply (created after the timer started) still cancels even when an older greeting also surfaces", () => {
    const h = createTimestampAwareHarness();

    vi.setSystemTime(new Date(0));
    const greetingCreatedAtMs = Date.now();

    vi.advanceTimersByTime(3000);
    h.sendMessage("v1");

    // Late greeting surfaces (must be ignored)
    vi.advanceTimersByTime(200);
    h.pollAdminMessage("greeting", greetingCreatedAtMs);

    // Real admin reply created AFTER timer started
    vi.advanceTimersByTime(300);
    h.pollAdminMessage("real", Date.now()); // created_at = 3500 > startedAt 3000

    vi.advanceTimersByTime(5000);
    expect(h.sentAutoReplies).toHaveLength(0);
  });
});
