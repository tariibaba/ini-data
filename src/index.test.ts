import { parse, stringify } from './index';

describe('module', () => {
  it('parses INI data to JavaScript object', () => {
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

  it('converts JavaScript object to INI data', () => {
    const obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          g: {
            h: 5
          }
        },
        f: 4
      },
      e: 3
    }
    const str = stringify(obj);
    const expected = 
`e = 3

[a]
b = 1
f = 4

[a.c]
d = 2

[a.c.g]
h = 5
`;
    expect(str).toBe(expected)
  });
});
