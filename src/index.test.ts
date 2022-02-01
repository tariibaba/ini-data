import { parse } from './index';

describe('Parser', () => {
  it('works', () => {
    const data = `
key1 = value1
[section1]
key2 = value2
[section2.inner1.inner2]

key3 = value3
`;
    const obj = parse(data);
    const expected = {
      key1: 'value1',
      section1: { key2: 'value2' },
      section2: {
        inner1: {
          inner2: {
            key3: 'value3',
          },
        },
      },
    };
    expect(obj).toEqual(expected);
  });
});
