// .env.local isn't loaded under jest, so give the client a base URL to build on.
jest.mock('../../constants/digitalCoach', () => ({
  ...jest.requireActual('../../constants/digitalCoach'),
  BASE_URL: 'https://test.local',
}));

import { analyze } from '../../utils/digitalCoachClient';
import { DigitalCoachError } from '../../types/digitalCoach';

// Minimal fake XMLHttpRequest so we can drive analyze()'s upload path without a
// real network. analyze() must use XHR (not Expo's winter fetch) because the
// winter fetch rejects React Native's { uri, name, type } file part with
// "Unsupported FormDataPart implementation".
class FakeXHR {
  static last: FakeXHR | null = null;
  method = '';
  url = '';
  timeout = 0;
  status = 0;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  sentBody: unknown = null;

  constructor() {
    FakeXHR.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader() {}
  send(body: unknown) {
    this.sentBody = body;
  }
  // Test helpers
  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(body);
    this.onload?.();
  }
}

const RealXHR = global.XMLHttpRequest;
beforeEach(() => {
  (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXHR;
});
afterEach(() => {
  (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = RealXHR;
});

const sampleResponse = {
  session_id: 'abc',
  exercise: 'Push-up',
  exercise_slug: 'push_up',
  video_duration_seconds: 10,
  rep_count: 8,
  hold_seconds: null,
  analysis: { score: 80, remarks: [], tips: [] },
  meta: { analyzed_frames: 100, sample_fps: 10, pose_detected_ratio: 0.95, warnings: [] },
};

describe('analyze', () => {
  it('POSTs multipart form data and resolves the analysis on 2xx', async () => {
    const promise = analyze('Push-up', 'file:///clip.mp4');
    FakeXHR.last!.respond(200, sampleResponse);
    await expect(promise).resolves.toEqual(sampleResponse);
    expect(FakeXHR.last!.method).toBe('POST');
    expect(FakeXHR.last!.sentBody).toBeInstanceOf(FormData);
  });

  it('maps a non-2xx response to a typed DigitalCoachError', async () => {
    const promise = analyze('Push-up', 'file:///clip.mp4');
    FakeXHR.last!.respond(422, { detail: 'No pose detected — keep your full body visible.' });
    await expect(promise).rejects.toBeInstanceOf(DigitalCoachError);
    await expect(promise).rejects.toMatchObject({ kind: 'pose_not_detected' });
  });

  it('rejects with a timeout error when the request times out', async () => {
    const promise = analyze('Push-up', 'file:///clip.mp4');
    FakeXHR.last!.ontimeout?.();
    await expect(promise).rejects.toMatchObject({ kind: 'timeout' });
  });
});
