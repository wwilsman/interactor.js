import expect from 'expect';
import { when, always } from 'interactor.js';

describe('Interactor utils - when', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 0;
    test = (num) => when(() => {
      expect(total).toBe(num);
    }, 50);
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('returns a thennable function', () => {
    expect(test(0)).toBeInstanceOf(Function);
    expect(test(0)).toHaveProperty('then', expect.any(Function));
    expect(test(0)()).toBeInstanceOf(Promise);
    expect(test(0).then(() => {})).toBeInstanceOf(Promise);
  });

  it('resolves when the assertion passes within the timeout', async () => {
    timeout = setTimeout(() => total = 5, 30);

    let start = Date.now();
    await expect(test(5)).resolves.toBeDefined();

    let elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(30);
    expect(elapsed).toBeLessThan(50);
  });

  it('rejects when the assertion does not pass within the timeout', async () => {
    let start = Date.now();
    await expect(test(5)).rejects.toThrow('expect(received).toBe(expected)');
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('rejects if the assertion passes, but just after the timeout', async function() {
    // this test can be flakey because there is a very narrow window of
    // failure we are testing for when the error occurs (<10ms)
    this.retries(2);

    let start = Date.now();
    timeout = setTimeout(() => total = 5, 50);

    await expect(test(5)).rejects
      .toThrow('convergent assertion was successful, but exceeded the 50ms timeout');
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('rejects with an error when using an async function', async () => {
    await expect(when(async () => {})).rejects.toThrow(/async/);
  });

  it('rejects with an error when returning a promise', async () => {
    await expect(when(() => Promise.resolve())).rejects.toThrow(/promise/);
  });

  it('resolves with a stats object', async () => {
    test = (num) => when(() => total === 5 && total * 100);
    timeout = setTimeout(() => total = 5, 30);

    let start = Date.now();
    let stats = await test(5);
    let end = Date.now();

    expect(stats.start).toBeGreaterThanOrEqual(start);
    expect(stats.end).toBeGreaterThanOrEqual(end);
    expect(stats.elapsed).toBeGreaterThanOrEqual(30);
    expect(stats.elapsed).toBeLessThan(2000);
    expect(stats.runs).toBe(4);
    expect(stats.runs).toBeLessThan(200);
    expect(stats.always).toBe(false);
    expect(stats.timeout).toBe(2000);
    expect(stats.value).toBe(500);
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => when(() => total >= num, 50);
    });

    it('rejects if `false` was continually returned', () => {
      return expect(test(10)).rejects.toThrow('convergent assertion returned `false`');
    });

    it('resolves when `false` is not returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).resolves.toBeDefined();
    });
  });

  describe('with a slight latency', () => {
    // exploits `while` to block the current event loop
    let latency = (ms) => {
      let start = Date.now();
      let end = start;

      while (end < start + ms) {
        end = Date.now();
      }
    };

    it('rejects as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        // 5-10ms latencies start causing an increasing amount of
        // flakiness, anything higher fails more often than not
        when(() => !!latency(20), 50)
      ).rejects.toThrow();

      // 10ms loop interval + 20ms latency = ~+30ms final latency
      let elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(elapsed).toBeLessThan(80);
    });
  });

  describe('with a mocked date object', () => {
    beforeEach(() => {
      global.Date = {
        now: () => 0,
        _og: global.Date
      };
    });

    afterEach(() => {
      global.Date = global.Date._og;
    });

    it('resolves when the assertion passes', async () => {
      await expect(test(0)).resolves.toBeDefined();
    });
  });
});

describe('Interactor utils - always', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 5;
    test = (num) => always(() => {
      expect(total).toBe(num);
    }, 50);
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('returns a thennable function', () => {
    expect(test(5)).toBeInstanceOf(Function);
    expect(test(5)).toHaveProperty('then', expect.any(Function));
    expect(test(5)()).toBeInstanceOf(Promise);
    expect(test(5).then(() => {})).toBeInstanceOf(Promise);
  });

  it('resolves if the assertion does not fail throughout the timeout', async () => {
    let start = Date.now();
    await expect(test(5)).resolves.toBeDefined();
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('rejects when the assertion fails within the timeout', async () => {
    timeout = setTimeout(() => total = 0, 30);

    let start = Date.now();
    await expect(test(5)).rejects.toThrow();
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('rejects with an error when using an async function', async () => {
    await expect(always(async () => {})).rejects.toThrow(/async/);
  });

  it('rejects with an error when returning a promise', async () => {
    await expect(always(() => Promise.resolve())).rejects.toThrow(/promise/);
  });

  it('resolves with a stats object', async () => {
    let start = Date.now();
    let stats = await test(5);
    let end = Date.now();

    expect(stats.start).toBeGreaterThanOrEqual(start);
    expect(stats.end).toBeGreaterThanOrEqual(end);
    expect(stats.elapsed).toBeGreaterThanOrEqual(50);
    expect(stats.runs).toBeLessThanOrEqual(6);
    expect(stats.always).toBe(true);
    expect(stats.timeout).toBe(50);
    expect(stats.value).toBeUndefined();
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => always(() => total < num, 50);
    });

    it('resolves if `false` was never returned', () => {
      return expect(test(10)).resolves.toBeDefined();
    });

    it('rejects when `false` is returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).rejects.toThrow('convergent assertion returned `false`');
    });
  });

  describe('with a slight latency', () => {
    // exploits `while` to block the current event loop
    let latency = (ms) => {
      let start = Date.now();
      let end = start;

      while (end < start + ms) {
        end = Date.now();
      }
    };

    it('resolves as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        always(() => latency(20), 50, true)
      ).resolves.toBeDefined();

      expect(Date.now() - start).toBeGreaterThanOrEqual(50, 80);
    });
  });

  describe('with a mocked date object', () => {
    beforeEach(() => {
      global.Date = {
        now: () => 0,
        _og: global.Date
      };
    });

    afterEach(() => {
      global.Date = global.Date._og;
    });

    it('resolves when the assertion passes', async () => {
      await expect(test(5)).resolves.toBeDefined();
    });
  });
});
