import { FirstKeyPipe } from "./first-key.pipe";

describe('FirstPipePipe', () => {
  it('create an instance', () => {
    const pipe = new FirstKeyPipe();
    expect(pipe).toBeTruthy();
  });
});
