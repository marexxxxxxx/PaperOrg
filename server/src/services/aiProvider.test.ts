import test from 'node:test';
import assert from 'node:assert';
import { MockAIProvider } from './aiProvider.ts';

test('MockAIProvider.suggestDelegation', async (t) => {
  await t.test('returns up to 3 agents sorted by score descending', async () => {
    const provider = new MockAIProvider();
    const availableAgents = ['agent1', 'agent2', 'agent3', 'agent4', 'agent5'];

    const result = await provider.suggestDelegation('some task', availableAgents);

    assert.ok(result.length <= 3, 'Result should be constrained to length 3');

    // Check if the results are sorted by score descending
    for (let i = 0; i < result.length - 1; i++) {
      assert.ok(result[i].score >= result[i+1].score, 'Scores should be sorted descending');
    }

    // Verify properties
    for (const agent of result) {
      assert.ok(availableAgents.includes(agent.agentId), 'Returned agent should be from available agents');
      assert.strictEqual(typeof agent.score, 'number', 'Score should be a number');
      assert.strictEqual(typeof agent.reason, 'string', 'Reason should be a string');
    }
  });

  await t.test('handles less than 3 available agents', async () => {
    const provider = new MockAIProvider();
    const availableAgents = ['agent1', 'agent2'];

    const result = await provider.suggestDelegation('some task', availableAgents);

    assert.strictEqual(result.length, 2, 'Result length should match available agents if less than 3');

    // Check if the results are sorted by score descending
    for (let i = 0; i < result.length - 1; i++) {
      assert.ok(result[i].score >= result[i+1].score, 'Scores should be sorted descending');
    }
  });

  await t.test('handles empty available agents', async () => {
    const provider = new MockAIProvider();

    const result = await provider.suggestDelegation('some task', []);

    assert.strictEqual(result.length, 0, 'Result should be empty if no available agents');
  });
});
