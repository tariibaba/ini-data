type State = 'default' | 'key' | 'nested-key' | 'equal' | 'comment' | 'value' | 'section-start' | 'nested-section' | 'section';
type TokenType = 'string' | 'equal' | 'sb-open' | 'sb-close' | 'new-line' | 'semicolon' | 'period' | 'eof';
type Token = { type: TokenType, lexeme: string };

export function parse(text: string) {
  let i = 0;
  function getNextToken(): Token {
    if (i === text.length) return { type: 'eof', lexeme: '' }
    let ch = text[i];
    if (isWhiteSpace(ch)) {
      while (i < text.length && isWhiteSpace(text[i])) i++;
      ch = text[i];
    }
    let val = '';
    let token!: Token;
    if (isCharacter(ch)) {
      while (i < text.length && isCharacter(text[i])) {
        val += text[i];
        i++;
      }
      i--;
      token = { type: 'string', lexeme: val };
    } else if (ch === '=') {
      token = { type: 'equal', lexeme: ch };
    } else if (ch === ';') {
      token = { type: 'semicolon', lexeme: ch }
    } else if (ch === '[') {
      token = { type: 'sb-open', lexeme: ch };
    } else if (ch === ']') {
      token = { type: 'sb-close', lexeme: ch };
    } else if (ch === '\r') {
      if (i + 1 < text.length && text[i + 1] === '\n') {
        i++;
        token = { type: 'new-line', lexeme: '\r\n' }
      }
      else token = { type: 'new-line', lexeme: '\r' }
    } else if (ch === '\n') {
      token = { type: 'new-line', lexeme: ch }
    } else if (ch === '.') {
      token = { type: 'period', lexeme: ch };
    }
    i++;
    return token;
  }


  let state: State = 'default';
  let key: string = '';
  let value: string = '';
  type DictObject = { [key: string]: string | DictObject };
  let obj: DictObject = {};
  let section = '';

  let token!: Token;
  do {
    token = getNextToken();
    switch (state as State) {
      case 'default':
        switch (token.type) {
          case 'string':
            state = 'key';
            key = token.lexeme;
            break;
          case 'sb-open':
            state = 'section-start';
            break;
          default:
            break;
        }
        break;
      case 'section-start':
        switch (token.type) {
          case 'string':
            state = 'section';
            section = token.lexeme;
            break;
          default:
            break;
        }
        break;
      case 'nested-section':
        switch (token.type) {
          case 'string':
            state = 'section';
            section += token.lexeme;
            break;
          default:
            break;
        }
        break;
      case 'section':
        switch (token.type) {
          case 'sb-close':
            state = 'default';
            break;
          case 'period':
            state = 'nested-section';
            section += token.lexeme;
            break;
          default:
            break;
        }
        break;
      case 'key':
        switch (token.type) {
          case 'equal':
            state = 'equal';
            break;
          case 'period':
            state = 'nested-key';
            key += token.lexeme;
            break;
        }
        break;
      case 'nested-key':
        switch (token.type) {
          case 'string':
            state = 'key';
            key += token.lexeme;
            break;
          default:
            break;
        }
      case 'equal':
        switch (token.type) {
          case 'string':
            state = 'value';
            value = token.lexeme;
            break;
        }
        break;
      case 'value':
        switch (token.type) {
          case 'new-line':
            state = 'default';
            break;
          case 'semicolon':
            state = 'comment';
            break;
          default:
            break;
        }
        if (token.type === 'new-line' || token.type === 'semicolon' || token.type === 'eof') {
          if (section !== '') {
            if (obj[section] === undefined) {
              obj[section] = {};
            }
            (obj[section] as DictObject)[key] = value;
          } else obj[key] = value;
          key = '';
          value = '';
        }
        break;
      case 'comment':
        switch (token.type) {
          case 'string':
            break;
          case 'new-line':
            state = 'default';
            break;
          default:
            break;
        }
      default:
        break;
    }
  } while (token.type !== 'eof');

  return obj;
}

function isCharacter(ch: string): boolean {
  return Boolean(ch.match(/[a-z0-9-_:\\]{1}/i));
}

function isWhiteSpace(ch: string): boolean {
  return ch === ' ' || ch === '\t';
}
