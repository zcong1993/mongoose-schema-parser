# mongoose-schema-parser

[![NPM version](https://img.shields.io/npm/v/@zcong/mongoose-schema-parser.svg?style=flat)](https://npmjs.com/package/@zcong/mongoose-schema-parser) [![NPM downloads](https://img.shields.io/npm/dm/@zcong/mongoose-schema-parser.svg?style=flat)](https://npmjs.com/package/@zcong/mongoose-schema-parser) [![CircleCI](https://circleci.com/gh/zcong1993/mongoose-schema-parser/tree/master.svg?style=shield)](https://circleci.com/gh/zcong1993/mongoose-schema-parser/tree/master) [![codecov](https://codecov.io/gh/zcong1993/mongoose-schema-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/zcong1993/mongoose-schema-parser)

> simple mongoose schema parser

## Install

```bash
$ yarn add @zcong/mongoose-schema-parser
```

## Usage

```ts
import { parseSchema } from '@zcong/mongoose-schema-parser'

const testSchema = new Schema({
  id: ObjectId,
  name: String,
  age: {
    type: Number
  }
})

console.log(parseSchema(testSchema))
// {
//   id: {
//     type: {
//       type: TypeEnum.ObjectId,
//       isArray: false
//     }
//   },
//   name: {
//     type: {
//       type: TypeEnum.String,
//       isArray: false
//     }
//   },
//   age: {
//     type: {
//       type: TypeEnum.Number,
//       isArray: false
//     },
//     details: {}
//   }
// }
```

## License

MIT &copy; zcong1993
