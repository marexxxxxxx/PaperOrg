import test from 'node:test';
import assert from 'node:assert';
import { MockAIProvider } from './aiProvider.js';

test('MockAIProvider.sendPrompt', async (t) => {
  await t.test('returns valid AIPromptResponse structure', async () => {
    const provider = new MockAIProvider();
    const agentId = 'agent-123';
    const task = 'Do something useful';

    const startTime = Date.now();
    const response = await provider.sendPrompt(agentId, task);
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    assert.strictEqual(response.success, true);

    assert.ok(typeof response.response === 'string');
    assert.ok(response.response.includes(`Agent ${agentId}: "${task}"`));

    assert.ok(typeof response.duration === 'number');
    assert.ok(response.duration >= 500 && response.duration <= 2500);
    // Ensure the elapsed time roughly matches the simulated duration (+ small margin for execution)
    assert.ok(elapsed >= response.duration);

    assert.ok(typeof response.tokenCount === 'number');
    assert.ok(response.tokenCount! >= 20 && response.tokenCount! <= 120);
  });
});
