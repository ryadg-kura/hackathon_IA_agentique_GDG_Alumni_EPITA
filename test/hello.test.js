const hello = require('../src/index');

test('should return Hello World!', () => {
    expect(hello()).toBe('Hello World!');
});