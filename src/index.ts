type State =
  | 'default'
  | 'key'
  | 'nested-key'
  | 'equal'
  | 'comment'
  | 'value'
  | 'section-start'
  | 'nested-section'
  | 'section';
type TokenType =
  | 'string'
  | 'equal'
  | 'sb-open'
  | 'sb-close'
  | 'new-line'
  | 'semicolon'
  | 'period'
  | 'eof';
type Token = { type: TokenType; lexeme: string };
type DictObject = { [key: string]: string | DictObject };

class Parser {
  private text!: string;
  private pos: number = 0;

  getNextToken(): Token {
    if (this.pos === this.text.length) return { type: 'eof', lexeme: '' };
    let ch = this.text[this.pos];
    if (isWhiteSpace(ch)) {
      while (this.pos < this.text.length && isWhiteSpace(this.text[this.pos]))
        this.pos++;
      ch = this.text[this.pos];
    }
    let val = '';
    let token!: Token;
    if (isCharacter(ch)) {
      while (this.pos < this.text.length && isCharacter(this.text[this.pos])) {
        val += this.text[this.pos];
        this.pos++;
      }
      this.pos--;
      token = { type: 'string', lexeme: val };
    } else if (ch === '=') {
      token = { type: 'equal', lexeme: ch };
    } else if (ch === ';') {
      token = { type: 'semicolon', lexeme: ch };
    } else if (ch === '[') {
      token = { type: 'sb-open', lexeme: ch };
    } else if (ch === ']') {
      token = { type: 'sb-close', lexeme: ch };
    } else if (ch === '\r') {
      if (this.pos + 1 < this.text.length && this.text[this.pos + 1] === '\n') {
        this.pos++;
        token = { type: 'new-line', lexeme: '\r\n' };
      } else token = { type: 'new-line', lexeme: '\r' };
    } else if (ch === '\n') {
      token = { type: 'new-line', lexeme: ch };
    } else if (ch === '.') {
      token = { type: 'period', lexeme: ch };
    }
    this.pos++;
    return token;
  }

  parse(text: string): DictObject {
    this.text = text;
    let state: State = 'default';
    let key: string = '';
    let value: string = '';
    let obj: DictObject = {};
    let section = '';

    let token!: Token;
    do {
      token = this.getNextToken();
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
            case 'semicolon':
              state = 'comment';
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
          if (
            token.type === 'new-line' ||
            token.type === 'semicolon' ||
            token.type === 'eof'
          ) {
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

    const newObj: DictObject = {};
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        const sectionParts = key.split('.');
        let tempObj: DictObject = newObj;
        let i;
        for (i = 0; i < sectionParts.length - 1; i++) {
          if (!tempObj[sectionParts[i]]) tempObj[sectionParts[i]] = {};
          tempObj = tempObj[sectionParts[i]] as DictObject;
        }
        tempObj[sectionParts[i]] = obj[key];
      } else newObj[key] = obj[key];
    });

    return newObj;
  }

  stringify(obj: any): string {
    const encode = (sectionName: string, data: any) => {
      let subSections: [string?] = [];
      let str = '';
      if (sectionName) str += '\n[' + sectionName + ']\n';
      for (let key in data) {
        if (typeof data[key] === 'object') {
          subSections.push(key);
        } else str += key + ' = ' + data[key] + '\n';
      }
      for (let subSection of subSections) {
        str += encode(
          ((sectionName && sectionName + '.') || '') + subSection,
          data[subSection!]
        );
      }
      return str;
    };
    return encode('', obj);
  }
}

function isCharacter(ch: string): boolean {
  return Boolean(ch.match(/[a-z0-9-_:\\]{1}/i));
}

function isWhiteSpace(ch: string): boolean {
  return ch === ' ' || ch === '\t';
}

export function parse(text: string) {
  return new Parser().parse(text);
}

export function stringify(value: any) {
  return new Parser().stringify(value);
}
